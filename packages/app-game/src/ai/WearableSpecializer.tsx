import { ILanguageModelContext } from "@siocode/base";
import { IAITask } from "./AITask";
import { shuffleArray } from "../utils/shuffleArray";

const EXAMPLES = [
    // Positive Examples (Renaming Necessary)
    {
        name: "Garnet Pendant",
        desiredWearableType: "ring",
        response: "Garnet Ring"
    },
    {
        name: "Sapphire Blade",
        desiredWearableType: "necklace",
        response: "Sapphire Necklace"
    },
    {
        name: "Woolen Sash",
        desiredWearableType: "necklace",
        response: "Woolen Necklace"
    },
    {
        name: "Solar Talisman",
        desiredWearableType: "trinket",
        response: "Solar Trinket"
    },
    {
        name: "Bronze Charm",
        desiredWearableType: "ring",
        response: "Bronze Ring"
    },
    {
        name: "Ruby Anklet",
        desiredWearableType: "bracelet",
        response: "Ruby Bracelet"
    },
    {
        name: "Opal Diadem",
        desiredWearableType: "necklace",
        response: "Opal Necklace"
    },
    {
        name: "Jade Buckle",
        desiredWearableType: "belt",
        response: "Jade Belt"
    },
    {
        name: "Celestial Medallion",
        desiredWearableType: "trinket",
        response: "Celestial Trinket"
    },
    {
        name: "Ethereal Amulet",
        desiredWearableType: "necklace",
        response: "Ethereal Necklace"
    },
    {
        name: "Adamant Band",
        desiredWearableType: "bracelet",
        response: "Adamant Bracelet"
    },
    {
        name: "Topaz Choker",
        desiredWearableType: "bracelet",
        response: "Topaz Bracelet"
    },
    {
        name: "Amber Ornament",
        desiredWearableType: "necklace",
        response: "Amber Necklace"
    },
    {
        name: "Moonstone Earring",
        desiredWearableType: "ring",
        response: "Moonstone Ring"
    },
    {
        name: "Titanium Armor",
        desiredWearableType: "belt",
        response: "Titanium Belt"
    },
    {
        name: "Sunstone Brooch",
        desiredWearableType: "bracelet",
        response: "Sunstone Bracelet"
    },
    {
        name: "The Frozen's Lords Crossbow",
        desiredWearableType: "necklace",
        response: "The Frozen's Lords Pendant"
    },
    {
        name: "Dragonborn's Shield",
        desiredWearableType: "trinket",
        response: "Dragonborn's Trinket"
    },
    {
        name: "Flaming Poisoned Scroll of Hell and Devastation",
        desiredWearableType: "bracelet",
        response: "Flaming Poisoned Bracelet of Hell and Devastation"
    },

    // Negative Examples (No Renaming Necessary)
    {
        name: "Silver Ring",
        desiredWearableType: "ring",
        response: "Silver Ring"
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
        name: "Golden Necklace",
        desiredWearableType: "necklace",
        response: "Golden Necklace"
    },
    {
        name: "Iron Ring",
        desiredWearableType: "ring",
        response: "Iron Ring"
    },
    {
        name: "Amethyst Bracelet",
        desiredWearableType: "bracelet",
        response: "Amethyst Bracelet"
    },
    {
        name: "Diamond Necklace",
        desiredWearableType: "necklace",
        response: "Diamond Necklace"
    },
    {
        name: "Obsidian Belt",
        desiredWearableType: "belt",
        response: "Obsidian Belt"
    },
    {
        name: "Enchanted Trinket",
        desiredWearableType: "trinket",
        response: "Enchanted Trinket"
    },
    {
        name: "Ancient Necklace",
        desiredWearableType: "necklace",
        response: "Ancient Necklace"
    },
    {
        name: "Platinum Bracelet",
        desiredWearableType: "bracelet",
        response: "Platinum Bracelet"
    },
    {
        name: "Crystal Bracelet",
        desiredWearableType: "bracelet",
        response: "Crystal Bracelet"
    },
    {
        name: "Pearl Necklace",
        desiredWearableType: "necklace",
        response: "Pearl Necklace"
    },
    {
        name: "Copper Ring",
        desiredWearableType: "ring",
        response: "Copper Ring"
    },
    {
        name: "Silk Belt",
        desiredWearableType: "belt",
        response: "Silk Belt"
    }
];

const SYSTEM_PROMPT = `Your task is to adjust the wearable's name to match the desired wearable type. Keep the original name if it already fits the desired type, or modify it to reflect the new wearable type while retaining as much of the original name as appropriate. Always start your response with 'The new wearable name is:'. Be concise.`;

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

                const llm = await this.lm.create(inPrompt.messages, { temperature: 1, topK: 4 });

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
