import { ILanguageModelContext } from "@siocode/base";
import { IAITask } from "./AITask";
import { shuffleArray } from "../utils/shuffleArray";

const EXAMPLES = [
    {
        effectDescription: "When Attacking - The item heals you. - Value: 62",
        response: "Healing Bless"
    },
    {
        effectDescription: "When Defending - The item destroys an item of your enemy. - Value: undefined",
        response: "Counter-Bash"
    },
    {
        effectDescription: "When Attacking - The item deals damage to your enemy. - Value: 12",
        response: "Smite"
    },
    // Additional examples to cover a wide variety
    {
        effectDescription: "When Hit - The item reflects damage back to the attacker. - Value: 25",
        response: "Thorn Shield"
    },
    {
        effectDescription: "On Use - The item increases your speed temporarily. - Value: 30",
        response: "Swift Surge"
    },
    {
        effectDescription: "When Blocking - The item grants a temporary shield. - Value: 50",
        response: "Guardian Barrier"
    },
    {
        effectDescription: "On Kill - The item restores a portion of your health. - Value: 20",
        response: "Vampiric Touch"
    },
    {
        effectDescription: "When Attacking - The item reduces the enemy's armor. - Value: 15",
        response: "Armor Break"
    },
    {
        effectDescription: "On Critical Hit - The item stuns the enemy. - Value: undefined",
        response: "Stunning Strike"
    },
    {
        effectDescription: "On Use - The item reveals hidden enemies. - Value: undefined",
        response: "True Sight"
    }
];

const SYSTEM_PROMPT = `Your task is to generate a concise and fitting name for an item effect based on its description. The effect description includes the activation condition, the effect itself, and a value if applicable. Use 'I propose the following name:' to start your response. Be creative but keep the name concise and relevant.`;

export interface IEffectNamerRequest {
    effectDescription: string;
}

export class EffectNamer implements IAITask<IEffectNamerRequest, string> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name(): string {
        return "EffectNamer";
    }

    getPromptFor(input: IEffectNamerRequest) {

        // Prepare examples
        const exMsgs = EXAMPLES.map(
            e => ([
                { role: "user", content: e.effectDescription },
                { role: "assistant", content: `I propose the following name: ${e.response}` }
            ])
        ).flat();

        // Shuffle examples to prevent pattern learning
        const shuffledExMsgs = shuffleArray(exMsgs);

        // Prepare the prompt
        const allMsgs = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            ...shuffledExMsgs
        ] as any;

        const nextMessage = input.effectDescription;

        return {
            messages: allMsgs,
            nextMessage: nextMessage
        };
    }

    async prompt(input: IEffectNamerRequest): Promise<string> {

        let result: string = '';

        const inPrompt = this.getPromptFor(input);

        while (true) {

            try {

                const llm = await this.lm.create(inPrompt.messages, { temperature: 1, topK: 8 });

                let resultText = await llm.prompt(inPrompt.nextMessage);

                resultText = resultText.trim();

                if (resultText.startsWith("I propose the following name:")) {
                    resultText = resultText.replace("I propose the following name:", "").trim();
                }

                // Clean up the response
                resultText = resultText.replace(/^["'`]+|["'`]+$/g, '').trim();
                resultText = resultText.replace(/\.$/, '').trim();

                result = resultText;

                return result;

            } catch (err: any) {
                console.warn("[EffectNamer]", "Error", err);
                // Optionally, handle retries or exit loop
                break;
            }

        }

        return result;
    }

}
