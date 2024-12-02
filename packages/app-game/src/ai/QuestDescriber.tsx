import { ILanguageModelContext } from "@siocode/base";
import { IAITask } from "./AITask";
import { shuffleArray } from "../utils/shuffleArray";

const EXAMPLES = [
    {
        questDescription: `[You can easily survive and finish this quest.] Deliver item Item 63718: Handwritten Letter (Artifact) [Rare] to person Lia Kaelar at location Cobbled Alley (1295) [cool, wet] - Reward: 50 gold`,
        response: `I have this letter that I need delivered to Lia Kaelar in Cobbled Alley. It's not far from here, and it shouldn't be dangerous. Could you help me out?`
    },
    {
        questDescription: `[This quest is impossible to finish. You will die.] Deliver item Item 63725: Handwritten Letter (Artifact) [Rare] to person Vladlen of Fyodorov at location The Crooked Market (5387) [cool, normal] - Reward: Frozen Cleaver (Weapon) [Rare]`,
        response: `I have an important letter that needs to reach Vladlen of Fyodorov at The Crooked Market. The journey is perilous, and I cannot go myself. I know it's a dangerous task, but could you deliver it for me?`
    },
    {
        questDescription: `[This quest is moderately challenging.] Defeat the bandit leader at location Shadow Woods (2345) [dark, eerie]`,
        response: `The bandits in Shadow Woods have been terrorizing our village. Their leader must be stopped. It's a tough mission, but I believe you're up to the task. Will you help us?`
    },
    {
        questDescription: `[You can easily survive and finish this quest.] Collect 10 Healing Herbs at location Meadow Fields (6789) [sunny, breezy]`,
        response: `I'm in need of Healing Herbs to prepare remedies for the sick. Could you gather 10 of them from Meadow Fields? It's a peaceful place, and the task should be straightforward.`
    },
    {
        questDescription: `[This quest is extremely difficult.] Slay the Dragon at location Mount Doom (9999) [hot, volcanic] - Reward: Dragon Slayer's Armor (Armor) [Epic]`,
        response: `A fearsome dragon has taken residence in Mount Doom, causing havoc in nearby lands. Many have tried to slay it and failed. It's an enormous challenge, but the realm would be forever grateful if you succeed. Will you accept this quest?`
    },
    {
        questDescription: `[This quest has moderate difficulty.] Escort the merchant caravan to location Silver City (4567) [mild, bustling]`,
        response: `Our merchants need protection on their way to Silver City. The roads can be dangerous, with thieves lurking about. Would you escort the caravan and ensure its safe arrival?`
    },
    {
        questDescription: `[You can easily survive and finish this quest.] Help repair the broken bridge at location River Crossing (3210) [rainy, slippery] - Reward: 20 gold`,
        response: `The bridge at River Crossing is damaged and needs repairs. The villagers could use an extra pair of hands. It's simple work, and your assistance would be greatly appreciated. Can you lend a hand?`
    },
    {
        questDescription: `[This quest is impossible to finish. You will die.] Retrieve the Lost Artifact from location Abyssal Depths (8888) [dark, unknown] - Reward: 8142 gold, Amulet of the Ancients (Artifact) [Legendary]`,
        response: `Legends speak of a powerful artifact hidden in the Abyssal Depths. No one who's gone there has ever returned. It's an incredibly dangerous mission, but the artifact's power could change everything. Will you undertake this perilous journey?`
    },
    {
        questDescription: `[This quest has moderate difficulty.] Investigate the haunted mansion at location Whispering Hollow (5555) [foggy, unsettling]`,
        response: `Strange occurrences have been reported at the mansion in Whispering Hollow. The townsfolk are scared. Could you investigate and uncover what's happening there? It might be spooky, but we need to know.`
    },
    {
        questDescription: `[You can easily survive and finish this quest.] Deliver this package to person Anna Green at location Sunnyvale Farm (7777) [warm, cheerful] - Reward: 10 gold, Apple Pie (Food) [Common]`,
        response: `I have a package that needs to get to Anna Green at Sunnyvale Farm. It's a pleasant walk, and there shouldn't be any trouble. Would you mind delivering it for me?`
    }
];

// Function to select 4 random examples
function getRandomExamples(num: number) {
    return shuffleArray(EXAMPLES).slice(0, num);
}

const SYSTEM_PROMPT = `Your task is to create an NPC's request based on the given quest description. The NPC is asking the player to complete a quest. Use "I ask the following: " to start the NPC's request. Be sure to reflect the quest's difficulty in the tone of the request. Be concise and stay within a medieval fantasy setting.`;

export interface IQuestDescriberRequest {
    questDescription: string;
    history?: Array<{ questDescription: string; response: string }>;
}

export class QuestDescriber implements IAITask<IQuestDescriberRequest, string> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name(): string {
        return "QuestDescriber";
    }

    getPromptFor(input: IQuestDescriberRequest) {

        // Select 4 random examples
        const randomExamples = getRandomExamples(8);

        // Prepare example messages
        const exMsgs = randomExamples.map(
            e => ([
                { role: "user", content: e.questDescription },
                { role: "assistant", content: `I ask the following: ${e.response}` }
            ])
        ).flat();

        // Prepare history messages if any
        let pastMsgs = [];
        if (input.history && input.history.length > 0) {
            pastMsgs = input.history.slice(-2).map(
                e => ([
                    { role: "user", content: e.questDescription },
                    { role: "assistant", content: `I ask the following: ${e.response}` }
                ])
            ).flat();
        }

        // Combine all messages
        const allMsgs = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            ...exMsgs,
            ...pastMsgs
        ];

        // Next message to prompt
        const nextMessage = input.questDescription;

        return {
            messages: allMsgs,
            nextMessage: nextMessage
        };
    }

    async prompt(input: IQuestDescriberRequest): Promise<string> {

        let result: string = '';

        const inPrompt = this.getPromptFor(input);

        while (true) {

            try {

                const llm = await this.lm.create(inPrompt.messages, { temperature: 0.7, topK: 1 });

                let resultText = await llm.prompt(inPrompt.nextMessage);

                resultText = resultText.trim();

                if (resultText.startsWith("I ask the following:")) {
                    resultText = resultText.replace("I ask the following:", "").trim();
                }

                // Clean up the response
                resultText = resultText.replace(/^["'`]+|["'`]+$/g, '').trim();

                result = resultText;

                return result;

            } catch (err: any) {
                console.warn("[QuestDescriber]", "Error", err);
                // Optionally, handle retries or exit loop
                break;
            }

        }

        return result;
    }

}
