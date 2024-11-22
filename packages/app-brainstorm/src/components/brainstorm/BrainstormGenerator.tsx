import { ILanguageModelContext } from "@siocode/base";
import { IGeneratedIdea } from "../../context/Project.context";
import { BrainstormGeneratorPrompts, IBrainstormGeneratorPrompts } from "./prompts/BrainstormGeneratorPrompts";

export class BrainstormGenerator {

    private running: boolean = true;
    private lastGeneratedIdea: IGeneratedIdea | null = null;
    private prompts: IBrainstormGeneratorPrompts = new BrainstormGeneratorPrompts();

    constructor(
        private scratchPadContent: string,
        private languageModelContext: ILanguageModelContext,
        private callback: (newIdea: IGeneratedIdea) => void,
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
                    content: "Your task is to generate transformation ideas for the user input. Generate the title, and the prompt of the task. Generate simple tasks, that allow converting the user's notes into other meaningful code, text, data, or other type of textual artifact. You must respond with exactly two lines, the first one starting with exactly 'Title: ', and the second one starting with exactly 'Prompt: '."
                },
                ...inExamples.map(
                    ex => ([
                        { role: "user", content: ex.userMessage },
                        { role: "assistant", content: ex.assistantMessage }
                    ])
                ).flat(),
            ];
            const llm = await this.languageModelContext.create(inMsgs);

            console.log("[BrainstormGenerator]", "Prompting LLM with", inMsgs);

            const responseText = await llm.prompt(this.scratchPadContent.trim());

            const responseTextLines = responseText.split('\n');
            if (responseTextLines.length === 2 && responseTextLines[0].startsWith("Title: ") && responseTextLines[1].startsWith("Prompt: ")) {
                const title = responseTextLines[0].substring("Title: ".length);
                const prompt = responseTextLines[1].substring("Prompt: ".length);

                const newIdea = {
                    id: Date.now(),
                    title: title,
                    prompt: prompt,
                    userInput: this.scratchPadContent.trim(),
                };

                this.callback(newIdea);

                this.lastGeneratedIdea = newIdea;
            } else {
                console.warn("Invalid response text from language model:", responseText);
            }
        } catch (err: any) {
            console.warn("LLM error:", err);
        }

    }
}
