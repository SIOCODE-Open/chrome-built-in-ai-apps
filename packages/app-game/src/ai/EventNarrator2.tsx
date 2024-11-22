import { ILanguageModelContext } from "@siocode/base";
import { eventToJsonData } from "../components/feed/GameEvent";
import { IGameEvent } from "../context/History.context";
import { IAITask } from "./AITask";
import { shuffleArray } from "../utils/shuffleArray";

const EXAMPLES = [
    {
        events: [
            { "location": { "id": 2050, "name": "Cozy Quarters", "temperature": "warm", "humidity": "normal", "type": "room", "room": { "roomType": "bedroom" }, "npcCount": 0, "itemCount": 3 }, "eventHappening": "wake-up", "eventNotes": "You wake up in a dark room. You can't remember how you got here. In fact, you can't event remember who you are." }
        ],
        response: `You open your eyes to find yourself in a cramped, dimly lit room. The walls are bare, save for a single barred window that offers a glimpse of a storm raging outside. You're disoriented, with no recollection of who you are or how you got there. Panic begins to set in.`
    },
    {
        events: [
            { "location": { "id": 2050, "name": "Cozy Quarters", "temperature": "warm", "humidity": "normal", "type": "room", "room": { "roomType": "bedroom" }, "npcCount": 0, "itemCount": 3 }, "eventHappening": "action-look-around", "eventNotes": "You decide to take a look around, looking for details about your surroundings." },
            { "from": { "id": 2050, "name": "Cozy Quarters", "temperature": "warm", "humidity": "normal", "type": "room", "room": { "roomType": "bedroom" } }, "to": { "id": 1075, "name": "The Tavern's Hearth", "temperature": "warm", "humidity": "normal", "type": "building", "building": { "buildingType": "tavern" } }, "eventHappening": "discover-path", "eventNotes": "You discover a new path." },
            { "item": { "id": 7494, "name": "Oak Wood Locker", "type": "household", "tier": "common" }, "eventHappening": "discover-item", "eventNotes": "You discover a new item." },
            { "item": { "id": 7497, "name": "Simple Wooden Chest", "type": "household", "tier": "common" }, "eventHappening": "discover-item", "eventNotes": "You discover a new item." },
            { "item": { "id": 7499, "name": "Sturdy Bedstead", "type": "household", "tier": "common" }, "eventHappening": "discover-item", "eventNotes": "You discover a new item." }
        ],
        response: `You look around in the room, and find a door - it leads to a tavern. You also notice a sturdy bedstead, a simple wooden chest, and an oak wood locker.`
    },
    {
        events: [
            { "from": { "id": 2050, "name": "Cozy Quarters", "temperature": "warm", "humidity": "normal", "type": "room", "room": { "roomType": "bedroom" } }, "to": { "id": 1075, "name": "The Tavern's Hearth", "temperature": "warm", "humidity": "normal", "type": "building", "building": { "buildingType": "tavern" } }, "eventHappening": "action-move", "eventNotes": "You decide to move to a different location." },
            { "location": { "id": 1075, "name": "The Tavern's Hearth", "temperature": "warm", "humidity": "normal", "type": "building", "building": { "buildingType": "tavern" }, "npcCount": 3, "itemCount": 5 }, "eventHappening": "arrive", "eventNotes": "You arrive at a new location." }
        ],
        response: `You decide to leave the confines of your cozy quarters. The air outside smells faintly of woodsmoke and ale. You stumble out the bedroom door, ready to explore whatever awaits you down the hallway. You emerge into the small tavern known as The Tavern's Hearth, its doors swinging open to welcome you in with a warm embrace.`
    },
    {
        events: [
            { "location": { "id": 1075, "name": "The Tavern's Hearth", "temperature": "warm", "humidity": "normal", "type": "building", "building": { "buildingType": "tavern" }, "npcCount": 3, "itemCount": 5 }, "eventHappening": "action-look-around", "eventNotes": "You decide to take a look around, looking for details about your surroundings." },
            { "from": { "id": 1075, "name": "The Tavern's Hearth", "temperature": "warm", "humidity": "normal", "type": "building", "building": { "buildingType": "tavern" } }, "to": { "id": 514, "name": "Main Street", "temperature": "mild", "humidity": "humid", "type": "street", "street": { "streetType": "village-street" } }, "eventHappening": "discover-path", "eventNotes": "You discover a new path." },
            { "from": { "id": 1075, "name": "The Tavern's Hearth", "temperature": "warm", "humidity": "normal", "type": "building", "building": { "buildingType": "tavern" } }, "to": { "id": 2048, "name": "Tavern Bedroom", "temperature": "warm", "humidity": "normal", "type": "room", "room": { "roomType": "bedroom" } }, "eventHappening": "discover-path", "eventNotes": "You discover a new path." },
            { "from": { "id": 1075, "name": "The Tavern's Hearth", "temperature": "warm", "humidity": "normal", "type": "building", "building": { "buildingType": "tavern" } }, "to": { "id": 2049, "name": "Tavern Bedroom", "temperature": "warm", "humidity": "normal", "type": "room", "room": { "roomType": "bedroom" } }, "eventHappening": "discover-path", "eventNotes": "You discover a new path." },
            { "from": { "id": 1075, "name": "The Tavern's Hearth", "temperature": "warm", "humidity": "normal", "type": "building", "building": { "buildingType": "tavern" } }, "to": { "id": 2050, "name": "Cozy Quarters", "temperature": "warm", "humidity": "normal", "type": "room", "room": { "roomType": "bedroom" } }, "eventHappening": "discover-path", "eventNotes": "You discover a new path." },
            { "from": { "id": 1075, "name": "The Tavern's Hearth", "temperature": "warm", "humidity": "normal", "type": "building", "building": { "buildingType": "tavern" } }, "to": { "id": 2051, "name": "Lively Tavern Kitchen", "temperature": "warm", "humidity": "normal", "type": "room", "room": { "roomType": "kitchen" } }, "eventHappening": "discover-path", "eventNotes": "You discover a new path." },
            { "from": { "id": 1075, "name": "The Tavern's Hearth", "temperature": "warm", "humidity": "normal", "type": "building", "building": { "buildingType": "tavern" } }, "to": { "id": 2052, "name": "Damp Storage", "temperature": "cold", "humidity": "humid", "type": "room", "room": { "roomType": "storage" } }, "eventHappening": "discover-path", "eventNotes": "You discover a new path." },
            { "item": { "id": 3823, "name": "Roast Venison and Root Veggies", "type": "food", "tier": "common" }, "eventHappening": "discover-item", "eventNotes": "You discover a new item." },
            { "item": { "id": 3824, "name": "Mead", "type": "drink", "tier": "common" }, "eventHappening": "discover-item", "eventNotes": "You discover a new item." },
            { "item": { "id": 3825, "name": "Zephyr's Breath", "type": "drink", "tier": "common" }, "eventHappening": "discover-item", "eventNotes": "You discover a new item." },
            { "item": { "id": 3826, "name": "Spatula", "type": "household", "tier": "common" }, "eventHappening": "discover-item", "eventNotes": "You discover a new item." },
            { "item": { "id": 3827, "name": "Wooden Pot", "type": "household", "tier": "common" }, "eventHappening": "discover-item", "eventNotes": "You discover a new item." },
            { "npc": { "id": 743, "name": "Thora Gunnarsdottir", "race": "human" }, "eventHappening": "discover-npc", "eventNotes": "You discover a new NPC." },
            { "npc": { "id": 744, "name": "Vuk of Borisov", "race": "human" }, "eventHappening": "discover-npc", "eventNotes": "You discover a new NPC." },
            { "npc": { "id": 745, "name": "Oleg of Alexandrov", "race": "human" }, "eventHappening": "discover-npc", "eventNotes": "You discover a new NPC." },
        ],
        response: `You take in the warm tavern scene: savory venison, a mug of mead, and paths leading to cozy rooms and a chilly storage. Thora, Vuk, and Oleg stand by, sharing laughs and stories, as you grip a drink of Zephyr's Breath. It's a good night to stay.`
    },
];

const RESET_EXAMPLE = [
    {
        events: [
            { "eventHappening": "reset-game", "eventNotes": "You decide to reset the game. A new random world and character is generated, and every previous story element is discarded. You embark on a fully new adventure." }
        ],
        response: `You decide to start anew. The world around you fades away, and you find yourself in a new place, with a new identity. The adventure begins again. With no recollection of any memories, your adventure starts from the very beginning.`
    }
]

const SYSTEM_PROMPT = `Your task is to narrate the latest event in the game. Only focus on the LAST EVENT. Always start your response with 'The narration is:'. Make for an entertaining medieval fantasy story narration, that accurately but casually describes the latest happening in the story. Be concise, and focus on details explicitly in the context. Don't overnarrate, BE VERY SHORT and to-the-point, limit yourself to 1-2 sentences.`.trim();

export interface IEventNarrator2Request { events: Array<IGameEvent>, history: Array<{ events: Array<IGameEvent>; response: string }> };


export class EventNarrator2 implements IAITask<IEventNarrator2Request, string> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name(): string {
        return "EventNarrator2";
    }

    getPromptFor(input: IEventNarrator2Request) {

        const exMsgs = EXAMPLES.slice(2).map(
            e => ([
                { role: "user", content: `${e.events.map(ev => JSON.stringify(ev)).join("\n")}\nEND` },
                { role: "assistant", content: `The narration is: ${e.response}` }
            ])
        ).flat() as any;

        const rstMsg = [
            { role: "user", content: `${RESET_EXAMPLE[0].events.map(ev => JSON.stringify(ev)).join("\n")}\nEND` },
            { role: "assistant", content: `The narration is: ${RESET_EXAMPLE[0].response}` }
        ];

        let pastMsgs = input.history.map(
            e => ([
                { role: "user", content: `${e.events.filter(ev => ev.happening !== 'end-turn').map(eventToJsonData).map(d => JSON.stringify(d)).join("\n")}\nEND` },
                { role: "assistant", content: `The narration is: ${e.response}` }
            ])
        ).slice(-2).flat() as any;

        console.log("EventNarrator2", "pastMsgs", pastMsgs);

        const allMsgs = [...exMsgs, ...rstMsg, ...pastMsgs];

        return {
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                ...allMsgs
            ],
            nextMessage: input.events.map(e => eventToJsonData(e)).map(d => JSON.stringify(d)).join("\n")
        }
    }

    async prompt(input: IEventNarrator2Request): Promise<string> {
        let result: string = input.events.map(e => e.notes).join("\n");

        const inPrompt = this.getPromptFor(input);

        while (true) {

            try {

                const llm = await this.lm.create(inPrompt.messages, { temperature: 1.0, topK: 8 });

                let resultText = await llm.prompt(inPrompt.nextMessage);

                resultText = resultText.trim();

                if (resultText.startsWith("The narration is: ")) {
                    resultText = resultText.replace("The narration is: ", "").trim();
                }

                if (resultText.startsWith("```")) {
                    const ending = resultText.indexOf("```", 3);
                    resultText = resultText.substring(resultText.indexOf("\n"), ending).trim();
                }

                result = resultText;

                return result;

            } catch (err: any) {
                console.warn("[EventNarrator2]", "Error", err);
            }

        }
    }

}