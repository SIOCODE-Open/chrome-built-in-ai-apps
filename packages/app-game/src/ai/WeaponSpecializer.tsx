import { ILanguageModelContext } from "@siocode/base";
import { IAITask } from "./AITask";
import { shuffleArray } from "../utils/shuffleArray";

const EXAMPLES = [
    {
        name: "Silver Scythe",
        desiredWeaponType: "dagger",
        response: "Silver Scythe"
    },
    {
        name: "Silver Scythe",
        desiredWeaponType: "bow",
        response: "Silver Bow"
    },
    {
        name: "Stone Pickaxe",
        desiredWeaponType: "axe",
        response: "Stone Pickaxe"
    },
    {
        name: "Stone Pickaxe",
        desiredWeaponType: "sword",
        response: "Stone Sword"
    },
    {
        name: "Jade-Adorned Blade",
        desiredWeaponType: "sword",
        response: "Jade-Adorned Blade"
    },
    {
        name: "Jade-Adorned Blade",
        desiredWeaponType: "staff",
        response: "Jade-Adorned Staff"
    },
    {
        name: "Dragonfang Blade",
        desiredWeaponType: "crossbow",
        response: "Dragonfang Crossbow"
    },
    {
        name: "Dragonfang Blade",
        desiredWeaponType: "staff",
        response: "Dragonfang Staff"
    }
];

const SYSTEM_PROMPT = `Your task is to adjust the weapon's name to match the desired weapon type. Keep the original name if it already fits the desired type, or modify it to reflect the new weapon type while retaining as much of the original name as appropriate. Always start your response with 'The new weapon name is:'. Be concise.`;

export interface IWeaponSpecializerRequest {
    name: string;
    desiredWeaponType: string;
}

export class WeaponSpecializer implements IAITask<IWeaponSpecializerRequest, string> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name(): string {
        return "WeaponSpecializer";
    }

    getPromptFor(input: IWeaponSpecializerRequest) {

        // Prepare examples
        const exMsgs = EXAMPLES.map(
            e => ([
                { role: "user", content: `${e.name}\nChange weapon type to: ${e.desiredWeaponType}` },
                { role: "assistant", content: `The new weapon name is: ${e.response}` }
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

        const nextMessage = `${input.name}\nChange weapon type to: ${input.desiredWeaponType}`;

        return {
            messages: allMsgs,
            nextMessage: nextMessage
        };
    }

    async prompt(input: IWeaponSpecializerRequest): Promise<string> {

        let result: string = '';

        const inPrompt = this.getPromptFor(input);

        while (true) {

            try {

                const llm = await this.lm.create(inPrompt.messages, { temperature: 0.7, topK: 1 });

                let resultText = await llm.prompt(inPrompt.nextMessage);

                resultText = resultText.trim();

                if (resultText.startsWith("The new weapon name is:")) {
                    resultText = resultText.replace("The new weapon name is:", "").trim();
                }

                // Clean up the response
                resultText = resultText.replace(/^["'`]+|["'`]+$/g, '').trim();
                resultText = resultText.replace(/\.$/, '').trim();

                result = resultText;

                return result;

            } catch (err: any) {
                console.warn("[WeaponSpecializer]", "Error", err);
                // Optionally, handle retries or exit loop
                break;
            }

        }

        return result;
    }

}
