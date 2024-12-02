import { ILanguageModelContext } from "@siocode/base";
import { INonPlayerCharacter, IWorldItem } from "../context/World.context";
import { WORLD_NPC_TRADE_OPINION_DESCRIPTIONS, WORLD_NPC_TRADE_OPINION_DISPLAYS, WorldNpcTradeOpinion } from "../model/world.enums";
import { shuffleArray } from "../utils/shuffleArray";
import { IAITask } from "./AITask";
import { aiDisplayTrade } from "./display";

// Define the interface for the trade request and response
export interface ITradeRequest {
    npc: INonPlayerCharacter;
    tradeOpinion: WorldNpcTradeOpinion;
    offered: {
        gold: number;
        items: Array<IWorldItem>;
    };
    want: {
        gold: number;
        items: Array<IWorldItem>;
    };
}

export interface ITradeResponse {
    message: string;
}

// Define the system prompt
const SYSTEM_PROMPT = `You must act like the character described by the user. They are offering you a trade deal, and you must respond appropriately based on the trade evaluation. Pay close attention to character traits, and give a realistic answer. Include small mentions of items from the trade if necessary to justify your response. We are in a medieval and fantasy world. Always start your response with 'I respond with the following:'. Keep your response to one line.`;

// Define examples for each trade opinion, including multiple items and edge cases
const EXAMPLES = [
    // No-brainer examples
    {
        tradeOpinion: "no-brainer",
        tradeDisplay: `Other party gives you 500 gold
Other party gives you Item 2021: Broken Helmet (Armor) [Poor]
You give the other party no gold
You give the other party Item 11232: Healing Potion (Potion) [Common]`,
        response: `I respond with the following: Absolutely, this is an excellent deal for me!`
    },
    {
        tradeOpinion: "no-brainer",
        tradeDisplay: `Other party gives you 1000 gold
Other party gives you Items:
- Item 7777: Bag of Rare Herbs (Material) [Rare]
- Item 8888: Enchanted Scroll (Scroll) [Rare]
You give the other party 500 gold
You give the other party no items`,
        response: `I respond with the following: This offer is too good to pass up; I accept with pleasure!`
    },
    {
        tradeOpinion: "no-brainer",
        tradeDisplay: `Other party gives you no gold
Other party gives you Items:
- Item 9999: Legendary Dragon Egg (Special) [Legendary]
You give the other party 1000 gold
You give the other party no items`,
        response: `I respond with the following: Getting a Legendary Dragon Egg for this price? Absolutely, I accept!`
    },
    {
        tradeOpinion: "no-brainer",
        tradeDisplay: `Other party gives you 300 gold
Other party gives you no items
You give the other party 0 gold
You give the other party Items:
- Item 2021: Broken Helmet (Armor) [Poor]
- Item 2022: Rusty Sword (Weapon) [Poor]`,
        response: `I respond with the following: You're offering me gold for these old items? Deal!`
    },
    // Acceptable examples
    {
        tradeOpinion: "acceptable",
        tradeDisplay: `Other party gives you 200 gold
Other party gives you Item 12543: Sapphire Ring (Jewelry) [Rare]
You give the other party 250 gold
You give the other party Item 12500: Golden Necklace (Jewelry) [Rare]`,
        response: `I respond with the following: This seems fair to me; I agree to the trade.`
    },
    {
        tradeOpinion: "acceptable",
        tradeDisplay: `Other party gives you 50 gold
Other party gives you Items:
- Item 15432: Apple Pie (Food) [Common]
- Item 15433: Fresh Bread (Food) [Common]
You give the other party no gold
You give the other party Items:
- Item 15434: Fresh Apple (Food) [Common]
- Item 15435: Cheese Wheel (Food) [Common]`,
        response: `I respond with the following: Sounds reasonable; let's make the trade.`
    },
    {
        tradeOpinion: "acceptable",
        tradeDisplay: `Other party gives you 300 gold
Other party gives you Item 112: Rare Sapphire (Gem) [Rare]
You give the other party 350 gold
You give the other party Item 113: Emerald Gem (Gem) [Rare]`,
        response: `I respond with the following: An acceptable exchange; I accept.`
    },
    {
        tradeOpinion: "acceptable",
        tradeDisplay: `Other party gives you 1000 gold
Other party gives you no items
You give the other party 900 gold
You give the other party Item 9901: Royal Crown (Special) [Legendary]`,
        response: `I respond with the following: A fair deal; I agree to your terms.`
    },
    // Bad examples
    {
        tradeOpinion: "bad",
        tradeDisplay: `Other party gives you 0 gold
Other party gives you Item 9981: Ancient Artifact (Special) [Legendary]
You give the other party 5000 gold
You give the other party no items`,
        response: `I respond with the following: I'm afraid that's too costly for me; I must decline.`
    },
    {
        tradeOpinion: "bad",
        tradeDisplay: `Other party gives you 100 gold
Other party gives you Item 23421: Iron Sword (Weapon) [Common]
You give the other party 150 gold
You give the other party Item 23420: Steel Dagger (Weapon) [Common]`,
        response: `I respond with the following: This doesn't benefit me enough; I'll have to pass.`
    },
    {
        tradeOpinion: "bad",
        tradeDisplay: `Other party gives you 10 gold
Other party gives you Item 4412: Health Elixir (Potion) [Common]
You give the other party 15 gold
You give the other party no items`,
        response: `I respond with the following: I don't find this trade appealing; I must decline.`
    },
    {
        tradeOpinion: "bad",
        tradeDisplay: `Other party gives you 200 gold
Other party gives you Item 80001: Enchanted Amulet (Accessory) [Rare]
You give the other party 250 gold
You give the other party no items`,
        response: `I respond with the following: I think I'll pass on this offer.`
    },
    // Insulting examples
    {
        tradeOpinion: "insulting",
        tradeDisplay: `Other party gives you 0 gold
Other party gives you no items
You give the other party 1000 gold
You give the other party Items:
- Item 9999: Legendary Dragon Egg (Special) [Legendary]
- Item 10000: Ancient King's Sword (Weapon) [Legendary]`,
        response: `I respond with the following: This is an outrageous offer! Absolutely not!`
    },
    {
        tradeOpinion: "insulting",
        tradeDisplay: `Other party gives you 0 gold
Other party gives you Item 91234: Bag of Rocks (Misc) [Poor]
You give the other party 50 gold
You give the other party no items`,
        response: `I respond with the following: Are you mocking me with this trade? I refuse!`
    },
    {
        tradeOpinion: "insulting",
        tradeDisplay: `Other party gives you no gold
Other party gives you no items
You give the other party no gold
You give the other party no items`,
        response: `I respond with the following: You're offering me nothing for nothing? Don't waste my time!`
    },
    {
        tradeOpinion: "insulting",
        tradeDisplay: `Other party gives you 0 gold
Other party gives you Items:
- Item 5555: Wooden Plank (Material) [Common]
You give the other party 100 gold
You give the other party Items:
- Item 6666: Enchanted Gem (Gem) [Rare]
- Item 7777: Magic Scroll (Scroll) [Rare]`,
        response: `I respond with the following: This trade is insulting; I won't accept it!`
    },
    // Edge cases
    // Empty trade
    {
        tradeOpinion: "insulting",
        tradeDisplay: `Other party gives you no gold
Other party gives you no items
You give the other party no gold
You give the other party no items`,
        response: `I respond with the following: Offering nothing? Don't waste my time!`
    },
    // "Give me everything you got" trade
    {
        tradeOpinion: "insulting",
        tradeDisplay: `Other party gives you 0 gold
Other party gives you no items
You give the other party all your gold
You give the other party all your items`,
        response: `I respond with the following: You expect me to give you everything? Absolutely not!`
    },
    // Multiple items trade
    {
        tradeOpinion: "acceptable",
        tradeDisplay: `Other party gives you 200 gold
Other party gives you Items:
- Item 3001: Silver Ring (Jewelry) [Common]
- Item 3002: Gold Necklace (Jewelry) [Rare]
You give the other party 250 gold
You give the other party Items:
- Item 3003: Emerald Bracelet (Jewelry) [Rare]
- Item 3004: Ruby Earrings (Jewelry) [Rare]`,
        response: `I respond with the following: This exchange seems fair; I accept your offer.`
    },
    {
        tradeOpinion: "bad",
        tradeDisplay: `Other party gives you 100 gold
Other party gives you Items:
- Item 4001: Old Boot (Clothing) [Poor]
You give the other party 200 gold
You give the other party Items:
- Item 4002: Steel Armor (Armor) [Uncommon]`,
        response: `I respond with the following: This trade doesn't seem fair; I must decline.`
    }
];

// Define the NpcTradeResponder class
export class NpcTradeResponder2 implements IAITask<ITradeRequest, ITradeResponse> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name() {
        return "NpcTradeResponder";
    }

    getPromptFor(input: ITradeRequest): { messages: Array<{ role: "system" | "user" | "assistant"; content: string; }>; nextMessage: string; } {

        // Filter examples based on the trade opinion
        const relevantExamples = EXAMPLES.filter(ex => ex.tradeOpinion === input.tradeOpinion);

        // Shuffle and select up to 4 examples
        const examplesToUse = shuffleArray(relevantExamples).slice(0, 4);

        // Prepare messages using the relevant examples
        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            ...examplesToUse.map(
                (ex) => ([
                    {
                        role: "user", content: `Trade evaluation: ${WORLD_NPC_TRADE_OPINION_DISPLAYS[ex.tradeOpinion]} - ${WORLD_NPC_TRADE_OPINION_DESCRIPTIONS[ex.tradeOpinion]}
${ex.tradeDisplay}`
                    },
                    { role: "assistant", content: ex.response }
                ])
            ).flat()
        ] as any;

        // Construct the next message with trade details
        const tradeEvaluation = `Trade evaluation: ${WORLD_NPC_TRADE_OPINION_DISPLAYS[input.tradeOpinion]} - ${WORLD_NPC_TRADE_OPINION_DESCRIPTIONS[input.tradeOpinion]}`;

        const nextMessage = `${tradeEvaluation}
${aiDisplayTrade(input.offered, input.want)}`;

        return {
            messages,
            nextMessage
        };
    }

    async prompt(input: ITradeRequest): Promise<ITradeResponse> {

        const inPrompt = this.getPromptFor(input);

        while (true) {
            try {
                const llm = await this.lm.create(inPrompt.messages, { temperature: 1, topK: 8 });
                let responseText = await llm.prompt(inPrompt.nextMessage);

                responseText = responseText.trim();

                if (!responseText.startsWith('I respond with the following:')) {
                    console.warn("[NpcTradeResponder] Invalid syntax: does not start with 'I respond with the following:'");
                    continue;
                }

                // Extract the NPC's response
                const message = responseText.replace('I respond with the following:', '').trim();

                return {
                    message
                };

            } catch (err) {
                console.warn("[NpcTradeResponder] Unhandled error", err);
                continue;
            }
        }
    }
}