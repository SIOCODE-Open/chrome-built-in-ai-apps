import { ILanguageModelContext } from "@siocode/base";
import { IAITask } from "./AITask";
import { INonPlayerCharacter, IWorldItem, IWorldNode } from "../context/World.context";
import { shuffleArray } from "../utils/shuffleArray";
import { aiDisplayNpc, aiDisplayTrade } from "./display";

export interface ITradeRequest {
    npc: INonPlayerCharacter;
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
    type: 'positive' | 'negative';
    message: string;
}

const SYSTEM_PROMPT = `You must act like the character that is described by the user. They are offering you a trade deal, and you must weigh it, and decide to accept it or not. Pay close attention to character traits, and give a realistic answer. Assume that 1 banana is 2 gold, 1 very good sword is 1000 gold, 1 house is 80000 gold, 1 legendary dragon is 9000000 gold. We are in a medieval and fantasy world. Before your answer lines, write 'I will now respond to this situation.'.`;

const EXAMPLES = [
    {
        userTrade: `Other party gives you 50 gold
Other party gives you Item 11232: Healing Potion (Potion) [Common]
You give the other party 20 gold
You give the other party Item 11321: Basic Wooden Shield (Armor) [Common]`,
        answer: {
            reflection: "I get some gold and a healing potion. I must give less gold and a basic shield. This is a balanced trade.",
            type: 'positive',
            message: `This trade seems fair.`
        }
    },
    {
        userTrade: `Other party gives you 0 gold
Other party gives you Item 8821: Torn Rags (Clothing) [Poor]
You give the other party 10 gold
You give the other party no items`,
        answer: {
            reflection: "I get a worthless item. I must give gold. This is an insultingly bad trade.",
            type: 'negative',
            message: `What a joke of a trade!`
        }
    },
    {
        userTrade: `Other party gives you 200 gold
Other party gives you Item 12543: Sapphire Ring (Jewelry) [Rare]
You give the other party 250 gold
You give the other party Item 12500: Golden Necklace (Jewelry) [Rare]`,
        answer: {
            reflection: "I get gold and a valuable item. I must give slightly more gold and another valuable item. This is a close-to-even trade.",
            type: 'neutral',
            message: `This seems reasonable, but I might negotiate further.`
        }
    },
    {
        userTrade: `Other party gives you 10 gold
Other party gives you Item 15432: Apple Pie (Food) [Common]
You give the other party no gold
You give the other party Item 15433: Fresh Apple (Food) [Common]`,
        answer: {
            reflection: "I get gold and a crafted food item. I must give a raw ingredient. This is a small, reasonable trade.",
            type: 'positive',
            message: `This trade works for me.`
        }
    },
    {
        userTrade: `Other party gives you 0 gold
Other party gives you no items
You give the other party 1000 gold
You give the other party Item 9999: Legendary Dragon Egg (Special) [Legendary]`,
        answer: {
            reflection: "I get nothing. I must give a large amount of gold and an extremely valuable item. This is absurd.",
            type: 'negative',
            message: `Absolutely not! This is outrageous.`
        }
    },
    {
        userTrade: `Other party gives you 100 gold
Other party gives you Item 23421: Iron Sword (Weapon) [Common]
You give the other party 120 gold
You give the other party Item 23420: Steel Dagger (Weapon) [Common]`,
        answer: {
            reflection: "I get some gold and a basic weapon. I must give slightly more gold and another basic weapon. This trade is slightly unfavorable for me.",
            type: 'neutral',
            message: `This is okay, but not ideal.`
        }
    },
    {
        userTrade: `Other party gives you 0 gold
Other party gives you Item 9981: Ancient Artifact (Special) [Legendary]
You give the other party 5000 gold
You give the other party no items`,
        answer: {
            reflection: "I get a unique legendary item. I must give a lot of gold. This trade is high value but fair for collectors.",
            type: 'positive',
            message: `I would accept this trade.`
        }
    },
    {
        userTrade: `Other party gives you 0 gold
Other party gives you Item 7321: Moldy Bread (Food) [Poor]
You give the other party 5 gold
You give the other party no items`,
        answer: {
            reflection: "I get a worthless item. I must give gold. This is a bad deal.",
            type: 'negative',
            message: `This trade is unacceptable.`
        }
    },
    {
        userTrade: `Other party gives you 20 gold
Other party gives you Item 30001: Magic Scroll of Fireball (Scroll) [Rare]
You give the other party 15 gold
You give the other party Item 30002: Lesser Healing Potion (Potion) [Common]`,
        answer: {
            reflection: "I get gold and a rare item. I must give less gold and a common item. This trade is favorable.",
            type: 'positive',
            message: `I like this trade!`
        }
    },
    {
        userTrade: `Other party gives you 0 gold
Other party gives you Item 91234: Bag of Rocks (Misc) [Poor]
You give the other party 50 gold
You give the other party no items`,
        answer: {
            reflection: "I get a worthless item. I must give a lot of gold. This trade is insulting.",
            type: 'negative',
            message: `What a waste of time!`
        }
    },
    {
        userTrade: `Other party gives you 500 gold
Other party gives you no items
You give the other party 0 gold
You give the other party Item 9990: Rare Book of Spells (Special) [Epic]`,
        answer: {
            reflection: "I get a significant amount of gold. I must give an epic item. This trade is reasonable for gold-focused players.",
            type: 'neutral',
            message: `I might consider this trade.`
        }
    },
    {
        userTrade: `Other party gives you 10 gold
Other party gives you Item 4412: Health Elixir (Potion) [Common]
You give the other party 15 gold
You give the other party no items`,
        answer: {
            reflection: "I get some gold and a potion. I must give slightly more gold. This is a reasonable trade.",
            type: 'neutral',
            message: `This trade is fine with me.`
        }
    },
    {
        userTrade: `Other party gives you 200 gold
Other party gives you Item 80001: Enchanted Amulet (Accessory) [Rare]
You give the other party 250 gold
You give the other party no items`,
        answer: {
            reflection: "I get some gold and a valuable item. I must give slightly more gold. This trade is slightly unfavorable for me but acceptable.",
            type: 'neutral',
            message: `I can accept this trade.`
        }
    },
    {
        userTrade: `Other party gives you 0 gold
Other party gives you Item 6789: Empty Water Bottle (Misc) [Poor]
You give the other party 2 gold
You give the other party no items`,
        answer: {
            reflection: "I get a near-worthless item. I must give gold. This trade is pointless.",
            type: 'negative',
            message: `Not worth my time.`
        }
    },
    {
        userTrade: `Other party gives you 300 gold
Other party gives you Item 112: Rare Sapphire (Gem) [Rare]
You give the other party 350 gold
You give the other party Item 113: Emerald Gem (Gem) [Rare]`,
        answer: {
            reflection: "I get gold and a rare item. I must give slightly more gold and another rare item. This trade is balanced.",
            type: 'neutral',
            message: `This trade is acceptable.`
        }
    },
    {
        userTrade: `Other party gives you 0 gold
Other party gives you Item 1001: Luxury Feast (Food) [Epic]
You give the other party 300 gold
You give the other party no items`,
        answer: {
            reflection: "I get an epic food item. I must give a lot of gold. This trade is fair for rare-food enthusiasts.",
            type: 'positive',
            message: `I accept this deal.`
        }
    },
    {
        userTrade: `Other party gives you 50 gold
Other party gives you no items
You give the other party 0 gold
You give the other party Item 2021: Broken Helmet (Armor) [Poor]`,
        answer: {
            reflection: "I get gold for a worthless item. This trade is highly favorable.",
            type: 'positive',
            message: `This trade is excellent for me!`
        }
    },
    {
        userTrade: `Other party gives you 1000 gold
Other party gives you Item 9901: Royal Crown (Special) [Legendary]
You give the other party 2000 gold
You give the other party Item 9902: Ancient King's Sword (Special) [Legendary]`,
        answer: {
            reflection: "I get gold and a legendary item. I must give more gold and another legendary item. This trade is balanced.",
            type: 'neutral',
            message: `This trade seems reasonable.`
        }
    },
    {
        userTrade: `Other party gives you 500 gold
Other party gives you Item 7777: Bag of Rare Herbs (Material) [Rare]
You give the other party 450 gold
You give the other party no items`,
        answer: {
            reflection: "I get gold and a rare material. I must give slightly less gold. This trade is favorable.",
            type: 'positive',
            message: `This is a great deal for me!`
        }
    },
    {
        userTrade: `Other party gives you 0 gold
Other party gives you Item 5555: Wooden Plank (Material) [Common]
You give the other party 50 gold
You give the other party no items`,
        answer: {
            reflection: "I get a common item. I must give a lot of gold. This trade is bad.",
            type: 'negative',
            message: `Not a fair deal at all!`
        }
    },
    {
        userTrade: `Other party gives you 100 gold
Other party gives you Item 3333: Golden Chalice (Misc) [Rare]
You give the other party 80 gold
You give the other party no items`,
        answer: {
            reflection: "I get gold and a rare item. I must give less gold. This trade is highly favorable.",
            type: 'positive',
            message: `I'm thrilled with this trade!`
        }
    }
];


export class NpcTradeResponder implements IAITask<ITradeRequest, ITradeResponse> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name() {
        return "NpcTradeResponder";
    }

    getPromptFor(input: ITradeRequest): { messages: Array<{ role: "system" | "user" | "assistant"; content: string; }>; nextMessage: string; } {

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            ...shuffleArray(EXAMPLES).slice(-8).map(
                (ex) => ([
                    { role: "user", content: `The player proposed the following trade:\n${ex.userTrade}` },
                    { role: "assistant", content: `I will now respond to this situation.\nMy reflection is: ${ex.answer.reflection}\nMy response is: ${ex.answer.type.toUpperCase()}\nI answer: ${ex.answer.message}` }
                ])
            ).flat()
        ] as any;

        return {
            messages,
            nextMessage: ("The player proposed the following trade:\n" + aiDisplayTrade(input.offered, input.want))
        }

    }

    async prompt(input: ITradeRequest): Promise<ITradeResponse> {
        const inPrompt = this.getPromptFor(input);

        while (true) {

            try {
                const llm = await this.lm.create(inPrompt.messages);
                let responseText = await llm.prompt(inPrompt.nextMessage);

                let responseLines = responseText.split('\n').map(l => l.trim());

                const invalidSyntaxMessage = {
                    type: 'negative',
                    message: `I'm sorry, my brain is a bit malfunctioning right now.`
                } as ITradeResponse;

                if (responseLines.length < 4) {
                    // return invalidSyntaxMessage;
                    continue;
                }

                if (!responseLines[0].startsWith('I will now respond to this situation.')) {
                    console.warn("[NpcTradeResponder] Invalid syntax: does not start with 'I will now respond to this situation.'");
                    // return invalidSyntaxMessage;
                    continue;
                }

                if (!responseLines[1].startsWith('My reflection is:')) {
                    console.warn("[NpcTradeResponder] Invalid syntax: does not start with 'My reflection is:'");
                    // return invalidSyntaxMessage;
                    continue;
                }

                console.log("[NpcTradeResponder] Reflection parsed:", inPrompt.nextMessage, responseLines);

                responseLines = responseLines.slice(2);

                if (!responseLines[0].startsWith('My response is:')) {
                    console.warn("[NpcTradeResponder] Invalid syntax: does not start with 'My response is:'");
                    // return invalidSyntaxMessage;
                    continue;
                }

                if (!responseLines[1].startsWith('I answer:')) {
                    console.warn("[NpcTradeResponder] Invalid syntax: does not start with 'I answer:'");
                    // return invalidSyntaxMessage;
                    continue;
                }

                let responseParsed = responseLines[0].substring('My response is:'.length).trim().toLowerCase();

                if (responseParsed.toLowerCase() === 'neutral') {
                    responseParsed = 'positive';
                }

                if (responseParsed !== 'positive' && responseParsed !== 'negative') {
                    console.warn("[NpcTradeResponder] Invalid syntax: response is not 'positive' or 'negative'");
                    // return invalidSyntaxMessage;
                    // continue;
                    responseParsed = 'negative';
                }

                const message = responseLines[1].substring('I answer:'.length).trim();

                console.log("[NpcTradeResponder] Response parsed:", responseParsed, message);

                return {
                    type: responseParsed as 'positive' | 'negative',
                    message
                };

            } catch (err) {
                console.warn("[NpcTradeResponder] Unhandled error", err);
                /* return {
                    type: 'negative',
                    mentions: [],
                    message: `I'm sorry, my brain just farted and I can't remember anything right now.`
                } */
                continue;
            }

        }
    }

}