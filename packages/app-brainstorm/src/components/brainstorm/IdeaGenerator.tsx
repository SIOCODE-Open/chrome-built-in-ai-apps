import { IGeneratedArtifact } from "../../context/Idea.context";
import { ILanguageModelContext } from "@siocode/base";
import { IGeneratedIdea } from "../../context/Project.context";
import { IdeaGeneratorPrompts, IIdeaGeneratorPrompts } from "./prompts/IdeaGeneratorPrompts";

const AUTO_STOP_AFTER_N = 1;

export class IdeaGenerator {

    private running: boolean = true;
    private successCount: number = 0;
    private prompts: IIdeaGeneratorPrompts = new IdeaGeneratorPrompts();

    constructor(
        private scratchPadContent: string,
        private idea: IGeneratedIdea,
        private languageModelContext: ILanguageModelContext,
        private callback: (newArtifact: IGeneratedArtifact) => void,
        private finishedCallback?: () => void
    ) {
    }

    stop() {
        this.running = false;
    }

    async start() {
        this.running = true;

        while (this.running) {
            await this._generateNext();

            if (this.successCount >= AUTO_STOP_AFTER_N) {
                this.stop();
            }
        }

        if (this.finishedCallback) {
            this.finishedCallback();
        }
    }

    private async _generateNext() {

        try {
            const inExamples = this.prompts.take(4);
            const inMsgs: Array<any> = [
                {
                    role: "system",
                    content: "Your task is to perform a transformation on the user input. You will be given the notes of the user, and the transformation task specifics. Do the transformation, and respond with nothing else, just the transformed content inside a code block. You must start your response with exactly 'Here is the completed transformation:'. You must only focus on the last message of the user, and transform only that and nothing else, don't care about previous messages of the user."
                },
                ...inExamples.map(
                    ex => ([
                        { role: "user", content: ex.userMessage },
                        { role: "assistant", content: ex.assistantMessage }
                    ])
                ).flat(),
            ];
            const llm = await this.languageModelContext.create(inMsgs);

            console.log("[IdeaGenerator]", "Prompting LLM with", inMsgs);

            const inPrompt = `Notes:

${this.scratchPadContent}

Task:

Title: ${this.idea.title}
Prompt: ${this.idea.prompt}`;

            let responseText = await llm.prompt(inPrompt);

            if (responseText.startsWith("Here is the completed transformation:")) {
                responseText = responseText.substring("Here is the completed transformation:".length).trim();
            }

            let codeBlock = responseText.trim();

            const codeBlockStarterCount = (codeBlock.match(/```/g) || []).length;

            if (codeBlockStarterCount > 2) {
                console.warn("More than one code block in LLM response:", responseText);
            } else {
                const codeBlockStartIndex = responseText.indexOf("```");

                if (codeBlockStartIndex === -1) {
                    console.warn("No code block in LLM response:", responseText);
                } else {

                    const codeBlockEndIndex = responseText.lastIndexOf("```");

                    if (codeBlockEndIndex === -1) {
                        console.warn("No closing code block in LLM response:", responseText);
                    } else {

                        const endOfLineOnCodeBlockStart = responseText.indexOf("\n", codeBlockStartIndex);

                        codeBlock = responseText.substring(endOfLineOnCodeBlockStart + 1, codeBlockEndIndex).trim();

                    }

                }

            }

            this.callback({
                id: Date.now(),
                text: codeBlock
            });

            this.successCount++;
        } catch (err: any) {
            console.warn("LLM error:", err);
        }

    }
}
