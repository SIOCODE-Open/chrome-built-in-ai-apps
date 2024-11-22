import { ILanguageModelContext } from "@siocode/base";
import { IAITask } from "./AITask";
import { WORLD_ITEM_TIER_DISPLAYS, WORLD_ITEM_TYPE_DISPLAYS, WORLD_NODE_HUMIDITY_DESCRIPTIONS, WORLD_NODE_TEMPERATURE_DESCRIPTIONS, WORLD_PLAYER_CLASS_DESCRIPTIONS, WORLD_PLAYER_HEALTH_DESCRIPTIONS, WORLD_PLAYER_HUNGER_DESCRIPTIONS, WORLD_PLAYER_SKILL_DESCRIPTIONS, WORLD_PLAYER_THIRST_DESCRIPTIONS } from "../model/world.enums";
import { IPlayerContext } from "../context/Player.context";
import { IWorldContext, IWorldItem } from "../context/World.context";
import { IGameEvent } from "../context/History.context";
import { aiDisplayEvent, aiDisplayGear, aiDisplayHealth, aiDisplayHunger, aiDisplayLocation, aiDisplayPlayer, aiDisplayThirst } from "./display";
import { shuffleArray } from "../utils/shuffleArray";
import { eventToJsonData } from "../components/feed/GameEvent";

export interface INarrateRequest {
    player: IPlayerContext;
    world: IWorldContext;
    history: Array<{ event: IGameEvent; response: string }>;
    event: IGameEvent;
}

export interface INarratedEvent {
    narration: string;
}

const EXAMPLES = [
    {
        eventData: { "location": { "id": 121, "name": "Cold Tavern Room", "temperature": "mild", "humidity": "dry" }, "eventHappening": "wake-up", "eventNotes": "You wake up in a dark room. You can't remember how you got here. In fact, you can't even remember who you are." },
        narration: `You blink awake in the darkness, cold stone against your cheek. The air smells faintly of stale ale and smoke. You try to recall how you got here — but nothing comes, not even your own name.`
    },
    {
        eventData: { "location": { "id": 119, "name": "The Whispering Well Tavern", "temperature": "mild", "humidity": "humid" }, "eventHappening": "arrive", "eventNotes": "You arrive at a new location." },
        narration: `You push through the heavy door, stepping into a dimly lit room where the moisture hangs like a thin veil. The low, murmuring voices barely mask the sound of unseen droplets hitting the stone floor.`
    },
    {
        eventData: { "item": { "id": 4820, "name": "Healing Potion", "type": "consumable", "tier": "common" }, "notes": "Picked up from Cosy Room", "eventHappening": "get-item", "eventNotes": "You get an item." },
        narration: `You find a small vial of liquid, the glass cool against your palm. The label reads 'Healing Potion'. You decide to keep it, just in case.`
    },
    {
        eventData: { "location": { "id": 134, "name": "Ancient Library", "temperature": "chilly", "humidity": "damp" }, "eventHappening": "explore", "eventNotes": "You decide to explore the library." },
        narration: `The smell of old parchment and dust fills the air. Shelves tower above you, stacked with crumbling tomes. Somewhere, a faint rustling echoes, as if the pages themselves whisper secrets.`
    },
    {
        eventData: { "character": { "id": 311, "name": "Mysterious Stranger", "disposition": "neutral" }, "eventHappening": "meet-character", "eventNotes": "You meet a new character." },
        narration: `A figure steps from the shadows, face obscured beneath a wide-brimmed hat. They nod in greeting but say nothing, their presence heavy with unspoken intent.`
    },
    {
        eventData: { "location": { "id": 217, "name": "Forgotten Caves", "temperature": "cold", "humidity": "wet" }, "eventHappening": "find-clue", "eventNotes": "You discover a strange marking on the cave wall." },
        narration: `You run your fingers over the rough stone, tracing the outline of an unfamiliar symbol etched into the wall. It feels cold, almost unnaturally so.`
    },
    {
        eventData: { "item": { "id": 4951, "name": "Silver Key", "type": "key", "tier": "uncommon" }, "notes": "Found under an old mat", "eventHappening": "get-item", "eventNotes": "You find a key." },
        narration: `You lift the frayed mat and see a small silver key glinting in the dim light. It feels heavy with promise and mystery.`
    },
    {
        eventData: { "character": { "id": 405, "name": "Old Beggar", "disposition": "friendly" }, "eventHappening": "conversation", "eventNotes": "You speak with the old beggar." },
        narration: `The old man's voice is rough, but there's a warmth behind it. He tells you stories of a time long past, when the city was alive with music and light.`
    },
    {
        eventData: { "location": { "id": 501, "name": "Mystic Forest", "temperature": "cool", "humidity": "foggy" }, "eventHappening": "enter-location", "eventNotes": "You enter a new area." },
        narration: `The forest is shrouded in mist, the trees towering like ancient sentinels. The silence is broken only by the soft rustle of leaves underfoot.`
    },
    {
        eventData: { "item": { "id": 6022, "name": "Ancient Amulet", "type": "artifact", "tier": "rare" }, "notes": "Found in a hidden compartment", "eventHappening": "get-item", "eventNotes": "You discover an ancient amulet." },
        narration: `The amulet feels warm in your hand, its surface etched with symbols you cannot decipher. It hums faintly, as if alive with an unseen power.`
    },
    {
        eventData: { "location": { "id": 299, "name": "The Broken Bridge", "temperature": "windy", "humidity": "damp" }, "eventHappening": "cross-bridge", "eventNotes": "You attempt to cross a damaged bridge." },
        narration: `The wind howls through the gaps in the broken planks. Each step feels precarious, the chasm below a dark reminder of the danger.`
    },
    {
        eventData: { "character": { "id": 215, "name": "Enigmatic Merchant", "disposition": "neutral" }, "eventHappening": "trade", "eventNotes": "You trade with a merchant." },
        narration: `The merchant's eyes glitter with interest as they inspect your items. "I have something you might like," they say, sliding a small box towards you.`
    },
    {
        eventData: { "item": { "id": 7830, "name": "Torch", "type": "tool", "tier": "common" }, "notes": "Picked up in the cave", "eventHappening": "get-item", "eventNotes": "You find a torch." },
        narration: `The torch sputters to life as you light it, casting flickering shadows across the walls. It provides a small but welcome comfort in the dark.`
    },
    {
        eventData: { "location": { "id": 405, "name": "Abandoned Village", "temperature": "cold", "humidity": "misty" }, "eventHappening": "investigate", "eventNotes": "You investigate the village." },
        narration: `The buildings stand silent, their windows like empty eyes. You feel a chill that has nothing to do with the cold, as if the village itself holds its breath.`
    },
    {
        eventData: { "character": { "id": 102, "name": "Lost Child", "disposition": "frightened" }, "eventHappening": "rescue", "eventNotes": "You find a lost child." },
        narration: `The child looks up at you, tears streaking their dirty cheeks. "I can't find my way home," they whisper, their small hand gripping yours tightly.`
    },
    {
        eventData: { "location": { "id": 610, "name": "Cursed Altar", "temperature": "warm", "humidity": "stale" }, "eventHappening": "perform-ritual", "eventNotes": "You decide to perform a ritual." },
        narration: `The candles flicker as you speak the incantation, your voice echoing in the stillness. The air feels heavy, as if the very stones are holding their breath.`
    },
    {
        eventData: { "item": { "id": 8954, "name": "Mystic Scroll", "type": "scroll", "tier": "legendary" }, "notes": "Found in a secret compartment", "eventHappening": "get-item", "eventNotes": "You discover a powerful scroll." },
        narration: `The scroll crackles as you unroll it, the ancient paper nearly crumbling under your touch. Strange symbols dance before your eyes, shifting and changing.`
    },
    {
        eventData: { "character": { "id": 502, "name": "Dark Sorcerer", "disposition": "hostile" }, "eventHappening": "battle", "eventNotes": "You engage in a battle." },
        narration: `The sorcerer raises their hands, shadows coiling around their fingers like smoke. "You should not have come here," they hiss, power crackling in the air.`
    },
    {
        eventData: { "location": { "id": 732, "name": "Crumbling Watchtower", "temperature": "cool", "humidity": "windy" }, "eventHappening": "climb", "eventNotes": "You climb the tower." },
        narration: `The stairs creak with each step, the wind whistling through the cracks in the stone. From the top, you can see the entire valley spread out below like a patchwork quilt.`
    },
    {
        eventData: { "item": { "id": 9512, "name": "Dragon's Fang Dagger", "type": "weapon", "tier": "epic" }, "notes": "Looted from the dragon's hoard", "eventHappening": "get-item", "eventNotes": "You acquire a powerful weapon." },
        narration: `The dagger gleams in the dim light, its blade curved like a fang. It feels perfectly balanced in your hand, a weapon forged for a single, deadly purpose.`
    }
];



// Function to select N random examples
function getRandomExamples(n) {
    const shuffled = shuffleArray(EXAMPLES.slice());
    return shuffled.slice(0, n);
}


const SYSTEM_PROMPT = `Your task is to narrate the latest event in the game. Only focus on the LAST EVENT. Always start your response with 'The narration is:'. Make for an entertaining medieval fantasy story narration, that accurately but casually describes the latest happening in the story. Be concise, and focus on details explicitly in the context. Don't overnarrate, BE VERY SHORT and to-the-point, limit yourself to 1-2 sentences.`.trim();

export class EventNarrator implements IAITask<INarrateRequest, INarratedEvent> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name(): string {
        return "EventNarrator";
    }

    getPromptFor(input: INarrateRequest) {

        const D = input.event.details;
        const jsonData = JSON.stringify(eventToJsonData(input.event));
        const inMessage = `Event data: ${JSON.stringify(jsonData)}`;

        const exMsgs = shuffleArray(EXAMPLES).slice(0, 4).map(
            ex => ([
                { role: "user", content: `Event data: ${JSON.stringify(ex.eventData)}` },
                { role: "assistant", content: `The narration is: ${ex.narration}` }
            ])
        ).flat() as any;

        let pastMsg = input.history.map(
            e => ([
                { role: "user", content: `Event data: ${JSON.stringify(eventToJsonData(e.event))}` },
                { role: "assistant", content: `The narration is: ${e.response}` }
            ])
        ).slice(-3).flat() as any;

        const allMsgs = [...exMsgs, ...pastMsg];

        return {
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                ...allMsgs
            ],
            nextMessage: inMessage
        }
    }

    async prompt(input: INarrateRequest): Promise<INarratedEvent> {
        const result: INarratedEvent = {
            narration: input.event.notes
        };

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

                result.narration = resultText;

                return result;

            } catch (err: any) {
                console.warn("[EventNarrator]", "Error", err);
            }

        }
    }

}