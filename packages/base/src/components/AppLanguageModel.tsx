import { useRef } from "react";
import { ILanguageModelContext, ILanguageModelKind, LanguageModelProvider } from "../context/LanguageModel.context";
import { BehaviorSubject } from "rxjs";

export const CLOUD_ENDPOINT_URL = "https://chrome-builtin-ai-challenge-gemini-gateway-700248413310.europe-west4.run.app";

export interface IPromptMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface IPromptParameters {
    temperature: number;
    topK: number;
    stopSequence?: string;
    maxTokens?: number;
}

export interface IPromptRequest {
    messages: Array<IPromptMessage>;
    opts: IPromptParameters;
    nextMessage: string;
}

const KINDS: Array<ILanguageModelKind> = [
    {
        name: "Built-in",
        identifier: "builtin",
        isCloud: false
    },
    {
        name: "Gemini 1.5 Flash",
        identifier: "gemini-1.5-flash",
        isCloud: true
    },
    {
        name: "Gemini 1.5 Flash (8B)",
        identifier: "gemini-1.5-flash-8b",
        isCloud: true
    },
    {
        name: "Gemini 1.5 Pro",
        identifier: "gemini-1.5-pro",
        isCloud: true
    }
];

class GlobalScheduledBuiltinLanguageModel {

    private tickInterval: number = 10;
    private queue: Array<IPromptRequest & {
        resolve: (response: string) => void;
        reject: (error: any) => void;
    }> = [];
    private isGenerating: boolean = false;

    constructor() {
        this._onTick();
    }

    private async _processQueueObject(qo: any) {

        if (typeof globalThis.ai === 'undefined') {
            qo.reject('AI API is not available.');
        }

        const ai = globalThis.ai;

        if (typeof ai.languageModel === 'undefined') {
            qo.reject('AI Language Model is not available.');
        }

        var llm = null;

        const controller = new AbortController();
        try {
            llm = await ai.languageModel.create({
                initialPrompts: qo.messages,
                temperature: qo.opts ? qo.opts.temperature : 0.3,
                topK: qo.opts ? qo.opts.topK : 1,
                signal: controller.signal
            });

            if (!llm) {
                qo.reject('Failed to create Language Model.');
            }
        } catch (err: any) {
            qo.reject(`Failed to create Language Model: ${err}`);
        }

        try {
            console.log("[GlobalScheduledBuiltinLanguageModel]", "Prompting LLM (streaming) with", qo.messages.length, "messages");
            let result = '';
            let previousChunk = '';
            try {
                const stream = await llm.promptStreaming(qo.nextMessage);

                for await (const chunk of stream) {
                    const newChunk = chunk.startsWith(previousChunk)
                        ? chunk.slice(previousChunk.length) : chunk;
                    result += newChunk;
                    previousChunk = chunk;

                    const stopIndex = result.indexOf(qo.stopSequence);
                    if (stopIndex !== -1) {
                        result = result.substring(0, stopIndex);
                        console.log("[GlobalScheduledBuiltinLanguageModel]", "Stop sequence found, stopping stream");
                        controller.abort();
                        break;
                    }

                    const generatedTokens = await llm.countPromptTokens(result);
                    console.log("[GlobalScheduledBuiltinLanguageModel]", "Generated tokens:", generatedTokens);
                    if (qo.opts && qo.opts.maxTokens && generatedTokens >= qo.opts.maxTokens) {
                        console.log("[GlobalScheduledBuiltinLanguageModel]", "Max tokens reached, stopping stream");
                        let finalResult = "";
                        let finalResultTokens = 0;
                        for (const character of result) {
                            finalResult += character;
                            finalResultTokens = await llm.countPromptTokens(finalResult);
                            if (finalResultTokens >= qo.opts.maxTokens) {
                                break;
                            }
                        }
                        result = finalResult;
                        controller.abort();
                        break;
                    }
                }
            } catch (err: any) {
                // Stream was aborted, ignore
                console.info("[GlobalScheduledBuiltinLanguageModel]", "Stream was aborted", result);
            }
            const response = result.trim();
            await llm.destroy();
            qo.resolve(response);
            console.log(llm);
        } catch (err: any) {
            qo.reject(err);
        }

    }

    private async _onTick() {

        if (!this.isGenerating) {
            if (this.queue.length > 0) {
                const queueObject = this.queue.shift();
                if (queueObject) {
                    this.isGenerating = true;
                    console.log("[GlobalScheduledBuiltinLanguageModel]", "Processing next queue object, remaining", this.queue.length);
                    this._processQueueObject(queueObject)
                        .finally(() => {
                            this.isGenerating = false;
                        });
                }
            }
        }

        setTimeout(
            () => {
                this._onTick();
            },
            this.tickInterval
        );
    }

    async prompt(
        request: IPromptRequest
    ) {
        const { messages, opts, nextMessage } = request;
        const queueObject = {
            messages,
            nextMessage,
            opts,
            resolve: null,
            reject: null
        }
        const promptPromise = new Promise<string>((resolve, reject) => {
            queueObject.resolve = resolve;
            queueObject.reject = reject;
        });
        this.queue.push(queueObject);
        return await promptPromise;
    }

}

const globalScheduledBuiltinLanguageModel = new GlobalScheduledBuiltinLanguageModel();

export function AppLanguageModel(props: any) {

    const selectedKindRef = useRef(
        new BehaviorSubject<ILanguageModelKind>(
            localStorage.getItem("app.languageModel.selectedKind")
                ? KINDS.find(k => k.identifier === localStorage.getItem("app.languageModel.selectedKind")) || KINDS[0]
                : KINDS[0]
        )
    );

    const createBuiltinModel = async (
        messages: Array<IPromptMessage>,
        opts?: IPromptParameters
    ) => {
        return {
            prompt: async (nextMessage: string) => {
                return await globalScheduledBuiltinLanguageModel.prompt({
                    messages,
                    opts,
                    nextMessage
                });
            }
        }
    };

    const createCloudModel = async (
        kind: ILanguageModelKind,
        messages: Array<{
            role: "system" | "user" | "assistant";
            content: string;
        }>
    ) => {
        const cloudPassword = localStorage.getItem("cloud.password");
        if (!cloudPassword) {
            throw new Error("Cloud password is not set.");
        }

        return {
            prompt: async (nextMessage: string) => {
                const response = await fetch(
                    CLOUD_ENDPOINT_URL,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            password: cloudPassword,
                            model: kind.identifier,
                            messages: [
                                ...messages,
                                {
                                    role: "user",
                                    content: nextMessage
                                }
                            ]
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to prompt cloud model.");
                }
                return (await response.text()).trim();
            }
        }
    };

    const contextValue: ILanguageModelContext = {
        getAvailableKinds: () => KINDS,
        getSelectedKind: () => selectedKindRef.current.value,
        selectedKindChanged: selectedKindRef.current.asObservable(),
        setSelectedKind: (kind: ILanguageModelKind) => {
            selectedKindRef.current.next(kind);
            localStorage.setItem("app.languageModel.selectedKind", kind.identifier);
        },
        async create(messages, opts) {
            if (!selectedKindRef.current.value.isCloud) {
                return await createBuiltinModel(messages, opts);
            } else {
                return await createCloudModel(selectedKindRef.current.value, messages);
            }
        }
    };

    return <LanguageModelProvider value={contextValue}>
        {props.children}
    </LanguageModelProvider>;

}