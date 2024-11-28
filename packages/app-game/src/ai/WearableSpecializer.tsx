import { ILanguageModelContext } from "@siocode/base";
import { IAITask } from "./AITask";
import { shuffleArray } from "../utils/shuffleArray";

const EXAMPLES = [
    // Positive Examples (Renaming Necessary)
    {
        name: "Golden Necklace",
        desiredWearableType: "ring",
        response: "Golden Ring"
    },
    {
        name: "Emerald Bracelet",
        desiredWearableType: "belt",
        response: "Emerald Belt"
    },
    {
        name: "Sapphire Amulet",
        desiredWearableType: "necklace",
        response: "Sapphire Necklace"
    },
    {
        name: "Leather Belt",
        desiredWearableType: "necklace",
        response: "Leather Necklace"
    },
    {
        name: "Mystic Charm",
        desiredWearableType: "trinket",
        response: "Mystic Trinket"
    },
    // Negative Examples (No Renaming Necessary)
    {
        name: "Golden Necklace",
        desiredWearableType: "necklace",
        response: "Golden Necklace"
    },
    {
        name: "Emerald Bracelet",
        desiredWearableType: "bracelet",
        response: "Emerald Bracelet"
    },
    {
        name: "Leather Belt",
        desiredWearableType: "belt",
        response: "Leather Belt"
    },
    {
        name: "Mystic Trinket",
        desiredWearableType: "trinket",
        response: "Mystic Trinket"
    },
    {
        name: "Silver Ring",
        desiredWearableType: "ring",
        response: "Silver Ring"
    }
];

const SYSTEM_PROMPT = `Your task is to adjust the wearable's name to match the desired wearable type. Keep the original name if it already fits the desired type, or modify it to reflect the new wearable type while retaining as much of the original name as appropriate. The wearable types are: necklace, ring, bracelet, belt, trinket. Always start your response with 'The new wearable name is:'. Be concise.`;

export interface IWearableSpecializerRequest {
    name: string;
    desiredWearableType: string;
}

export class WearableSpecializer implements IAITask<IWearableSpecializerRequest, string> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name(): string {
        return "WearableSpecializer";
    }

    getPromptFor(input: IWearableSpecializerRequest) {

        // Prepare examples
        const exMsgs = EXAMPLES.map(
            e => ([
                { role: "user", content: `${e.name}\nChange wearable type to: ${e.desiredWearableType}` },
                { role: "assistant", content: `The new wearable name is: ${e.response}` }
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

        const nextMessage = `${input.name}\nChange wearable type to: ${input.desiredWearableType}`;

        return {
            messages: allMsgs,
            nextMessage: nextMessage
        };
    }

    async prompt(input: IWearableSpecializerRequest): Promise<string> {

        let result: string = '';

        const inPrompt = this.getPromptFor(input);

        while (true) {

            try {

                const llm = await this.lm.create(inPrompt.messages, { temperature: 0.7, topK: 1 });

                let resultText = await llm.prompt(inPrompt.nextMessage);

                resultText = resultText.trim();

                if (resultText.startsWith("The new wearable name is:")) {
                    resultText = resultText.replace("The new wearable name is:", "").trim();
                }

                // Clean up the response
                resultText = resultText.replace(/^["'`]+|["'`]+$/g, '').trim();
                resultText = resultText.replace(/\.$/, '').trim();

                result = resultText;

                return result;

            } catch (err: any) {
                console.warn("[WearableSpecializer]", "Error", err);
                // Optionally, handle retries or exit loop
                break;
            }

        }

        return result;
    }

}
