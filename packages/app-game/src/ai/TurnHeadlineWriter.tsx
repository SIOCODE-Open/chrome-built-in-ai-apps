import { ILanguageModelContext } from "@siocode/base";
import { IAITask } from "./AITask";
import { shuffleArray } from "../utils/shuffleArray";

const EXAMPLES = [
    {
        narration: `You make a hasty decision to leave the comfort of your dark room and seek warmer company at The Crooked Tankard tavern. As you push open the heavy oak doors, the familiar scent of ale, roasted meat, and woodsmoke hits your senses. A lively atmosphere of boisterous laughter, clinking tankards, and the strumming of guitars fills the air.`,
        response: `You arrive to <i>The Crooked Tankard</i>.`
    },
    {
        narration: `You find yourself standing before a burly man with kind eyes and a weathered face. He introduces himself as Brendan MacLeod, a local tavern owner. You engage in a friendly conversation, learning about the town's recent events and perhaps even striking up an acquaintance.`,
        response: `Now talking to <i>Brendan MacLeod</i>.`
    },
    {
        narration: `You engage in a lively trade with the friendly Moa Stigsen. He offers a delicious Roast Venison and Root Veggies, a delectable Apple Pie, and a refreshing Iced Water. In return, you offer him some of your finest goods. The trade concludes successfully as you shake hands and part ways, both feeling satisfied with the exchange.`,
        response: `Traded with <i>Moa Stigsen</i>.`
    },
    {
        narration: `You feel your parched throat quench as you gulp down the cool, clear waters. A pleasant satisfaction washes over your senses as the thirst in your throat vanishes into memory.`,
        response: `You <i>drank</i>.`
    },
    {
        narration: `You decide to equip the newly acquired Farmer's Knife, adding a sharp edge to the already familiar weight of your hand. It feels sturdy and ready for action, ready to face whatever challenges await you in the world beyond your doorstep.`,
        response: `Now holding <i>Farmer's Knife</i>.`
    }
];

const SYSTEM_PROMPT = `Your task is to extract a concise headline from the provided narration. The headline should be a brief summary of the main event or action in the narration, and should be formatted in HTML as appropriate. Always start your response with 'The headline is:'. Be concise and focus on the main point.`;

export interface ITurnHeadlineWriterRequest {
    narration: string;
    history?: Array<{ narration: string; response: string }>;
}

export class TurnHeadlineWriter implements IAITask<ITurnHeadlineWriterRequest, string> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name(): string {
        return "TurnHeadlineWriter";
    }

    getPromptFor(input: ITurnHeadlineWriterRequest) {

        // Shuffle and select examples
        const exMsgs = shuffleArray(EXAMPLES).slice(0, 3).map(
            e => ([
                { role: "user", content: e.narration },
                { role: "assistant", content: `The headline is: ${e.response}` }
            ])
        ).flat();

        // Prepare history messages if any
        let pastMsgs = [];
        if (input.history && input.history.length > 0) {
            pastMsgs = input.history.slice(-2).map(
                e => ([
                    { role: "user", content: e.narration },
                    { role: "assistant", content: `The headline is: ${e.response}` }
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
        const nextMessage = input.narration;

        return {
            messages: allMsgs,
            nextMessage: nextMessage
        };
    }

    async prompt(input: ITurnHeadlineWriterRequest): Promise<string> {

        let result: string = '';

        const inPrompt = this.getPromptFor(input);

        while (true) {

            try {

                const llm = await this.lm.create(inPrompt.messages, { temperature: 0.7, topK: 1 });

                let resultText = await llm.prompt(inPrompt.nextMessage);

                resultText = resultText.trim();

                if (resultText.startsWith("The headline is:")) {
                    resultText = resultText.replace("The headline is:", "").trim();
                }

                // Remove code blocks if any
                if (resultText.startsWith("```")) {
                    const ending = resultText.indexOf("```", 3);
                    resultText = resultText.substring(resultText.indexOf("\n"), ending).trim();
                }

                // Remove surrounding quotes or periods
                resultText = resultText.replace(/^["'`]+|["'`]+$/g, '').trim();
                resultText = resultText.replace(/\.$/, '').trim();

                result = resultText;

                return result;

            } catch (err: any) {
                console.warn("[TurnHeadlineWriter]", "Error", err);
                // Optionally, handle retries or exit loop
                break;
            }

        }

        return result;
    }

}
