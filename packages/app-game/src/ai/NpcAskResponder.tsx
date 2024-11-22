import { ILanguageModelContext } from "@siocode/base";
import { IAITask } from "./AITask";
import { INonPlayerCharacter, IWorldItem, IWorldNode } from "../context/World.context";
import { shuffleArray } from "../utils/shuffleArray";
import { aiDisplayNpc } from "./display";

export interface IAskRequest {
    npc: INonPlayerCharacter;
    message: string;
}

export interface IAskResponse {
    type: 'positive' | 'negative';
    mentions: Array<{ type: 'location' | 'npc' | 'item'; id: number; }>;
    message: string;
}

const SYSTEM_PROMPT = `You must act like the character that is described by the user. They are asking your character a simple question, and you must answer based on your knowledge to the answer. On the first line, say 'My response is: POSITIVE|NEGATIVE'. Reply POSITIVE, if your character has relevant knowledge. Reply NEGATIVE, if your character does not know anything of the player's interests. On the second line, you must list all locations, items or characters you reference from your knowledge. Use their ids, and format this line as 'I mention: location|npc|item::ID', separate each entry by commas. On the third and final line, write 'I answer: ' and the answer that your character speaks out loud. Pay close attention to character traits, and give a realistic answer. We are in a medieval and fantasy world. Before your answer lines, write 'I will now respond to this situation.'.`;

const EXAMPLES = [
    {
        npcDisplay: `Name: Zdislav Stefanovic
Location: The Crooked Tankard
Humidity: normal (Balanced moisture, typical humidity levels.)
Temperature: mild (Pleasantly temperate, neither hot nor cold.)
Race: Human - The most common race, known for versatility and adaptability.
Background: Merchant - A skilled trader who has spent years traveling between towns and cities. They are shrewd and observant, always on the lookout for a good deal or potential profit. They are well-versed in negotiation and have a silver tongue.
Personality Traits:
* Disciplined - Strictly follows routines and rules, has strong self-control.
* Brave - Faces danger with courage and resolve.
* Diligent - Hardworking and attentive, puts in effort to complete tasks.
Knowledge:
* Knows about location The Crooked Tankard (id 1914, distance 0) [building, mild, normal] with 0 enemies and 2 friendlies, 4 items
* Knows about location Blacksmith's Den (id 1915, distance 10) [building, hot, dry] with 0 enemies and 0 friendlies, 13 items
* Knows about item Roasted Wild Boar Leg (id 12508, distance 0) [Food, Common], which is at The Crooked Tankard (1914) [building, mild, normal]
* Knows about location Willow Cottage (id 1913, distance 10) [building, mild, dry] with 0 enemies and 0 friendlies, 0 items
* Knows about Zdislav Stefanovic (id 1751, distance 0) [human, friendly], who is in The Crooked Tankard (1914) [building, mild, normal]`,
        userQuestion: `hey there, do you know of any hot locations?`,
        answer: {
            type: 'positive',
            mentions: [
                { type: 'location', id: 1915 }
            ],
            message: `Well, if you like getting your hands dirty, the Blacksmith's Den is closeby. There's also a bunch of materials there. Is this what you are looking for?`
        }
    },
    {
        npcDisplay: `Name: Thora Oddvarsson
Location: The Crooked Tankard
Humidity: normal (Balanced moisture, typical humidity levels.)
Temperature: mild (Pleasantly temperate, neither hot nor cold.)
Race: Human - The most common race, known for versatility and adaptability.
Background: Merchant - A skilled trader who has spent years traveling between towns and cities. They are shrewd and observant, always on the lookout for a good deal or potential profit. They are well-versed in negotiation and have a silver tongue.
Personality Traits:
* Adventurous - Thrives on excitement and seeks out thrilling experiences.
* Optimistic - Tends to see the bright side, expects positive outcomes.
* Brave - Faces danger with courage and resolve.
Knowledge:
* Knows about location The Crooked Tankard (id 1848, distance 0) [building, mild, normal] with 0 enemies and 3 friendlies, 2 items
* Knows about location The Crooked Tankard Inn (id 1849, distance 10) [building, warm, humid] with 0 enemies and 6 friendlies, 4 items
* Knows about Sven von Trygvesen (id 1851, distance 0) [human, friendly], who is in The Crooked Tankard (1848) [building, mild, normal]
* Knows about location Sunstone Cottage (id 1847, distance 10) [building, warm, normal] with 0 enemies and 1 friendlies, 0 items
* Knows about item Roasted Chicken & Wild Rice Bowl (id 11164, distance 0) [Food, Common], which is at The Crooked Tankard (1848) [building, mild, normal]`,
        userQuestion: `do you know of any rare items?`,
        answer: {
            type: 'negative',
            mentions: [],
            message: `I'm sorry, I don't know of any rare items. Maybe you could set out on a journey, and find some!`
        }
    },
    {
        npcDisplay: `Name: Ithilion Rinadiel
Location: The Crooked Tankard
Humidity: normal (Balanced moisture, typical humidity levels.)
Temperature: mild (Pleasantly temperate, neither hot nor cold.)
Race: Human - The most common race, known for versatility and adaptability.
Background: Peasant - Born and raised in a rural village, they have spent most of their life toiling in the fields. Their hands are calloused, and they know the value of hard work. They have little, but they appreciate the simple things in life.
Personality Traits:
* Apathetic - Lacks interest or enthusiasm, indifferent to most situations.
* Cowardly - Easily frightened and avoids risky situations.
* Pessimistic - Focuses on the negative, expects the worst to happen.
Knowledge:
* Knows about Kristina Yelagin (id 1218, distance 0) [human, friendly], who is in The Crooked Tankard (1489) [building, mild, normal]
* Knows about item Elderberry Wine (id 9242, distance 0) [Drink, Common], which is at The Crooked Tankard (1489) [building, mild, normal]
* Knows about location The Crooked Tankard (id 1489, distance 0) [building, mild, normal] with 0 enemies and 5 friendlies, 4 items
* Knows about item Mortar and Pestle (id 9243, distance 0) [Household, Common], which is at The Crooked Tankard (1489) [building, mild, normal]
* Knows about Svala von Vidkunson (id 1223, distance 20) [human, friendly], who is in Sunlit Cottage (1497) [building, warm, dry]`,
        userQuestion: `Hey there, do you know of any good loot?`,
        answer: {
            type: 'negative',
            mentions: [],
            message: `I just don't care too much about anything, so leave me alone.`
        }
    },
    {
        npcDisplay: `Name: Grim Gunnarsdottir
Location: The Crooked Tankard
Humidity: normal (Balanced moisture, typical humidity levels.)
Temperature: mild (Pleasantly temperate, neither hot nor cold.)
Race: Human - The most common race, known for versatility and adaptability.
Background: Peasant - Born and raised in a rural village, they have spent most of their life toiling in the fields. Their hands are calloused, and they know the value of hard work. They have little, but they appreciate the simple things in life.
Personality Traits:
* Apathetic - Lacks interest or enthusiasm, indifferent to most situations.
* Arrogant - Overly proud and self-important, often looks down on others.
* Indifferent - Detached, often unbothered by the needs or feelings of others.
Knowledge:
* Knows about Gavriil Nikolic (id 2087, distance 0) [human, friendly], who is in The Crooked Tankard (2607) [building, mild, normal]
* Knows about item Crusty Bread and Cheese (id 16042, distance 0) [Food, Common], which is at The Crooked Tankard (2607) [building, mild, normal]
* Knows about item Mead (id 16044, distance 0) [Drink, Common], which is at The Crooked Tankard (2607) [building, mild, normal]
* Knows about item Hearty Stew (id 16043, distance 0) [Food, Common], which is at The Crooked Tankard (2607) [building, mild, normal]
* Knows about item Water Skin (id 16045, distance 0) [Drink, Common], which is at The Crooked Tankard (2607) [building, mild, normal]`,
        userQuestion: `Would you please be so kind as to tell me about any interesting loot?`,
        answer: {
            type: 'positive',
            mentions: [
                {
                    type: 'item', id: 16042
                },
                {
                    type: 'item', id: 16044
                },
                {
                    type: 'item', id: 16045
                },
                {
                    type: 'item', id: 16043
                },
                {
                    type: 'location', id: 2607
                }
            ],
            message: `Alright, but then leave me alone! There a bunch of tasty foods around here, you should look for the Hearty Stew. Anything else I now nothing of. Now get to your business.`
        }
    },
    {
        npcDisplay: `Name: Egor Anatolyev
Location: The Crooked Tankard
Humidity: normal (Balanced moisture, typical humidity levels.)
Temperature: mild (Pleasantly temperate, neither hot nor cold.)
Race: Human - The most common race, known for versatility and adaptability.
Background: Innkeeper - Owns and runs a bustling tavern, greeting travelers with a smile and a warm meal. They are social and good listeners, often hearing the latest gossip.
Personality Traits:
* Cheerful - Maintains a positive demeanor, spreading joy to those around.
* Humble - Modest and unassuming, does not boast about achievements.
* Brave - Faces danger with courage and resolve.
Knowledge:
* Knows about Egor Anatolyev (id 3143, distance 0) [human, friendly], who is in The Crooked Tankard (3051) [building, mild, normal]
* Knows about Brennan Harris (id 3138, distance 10) [human, friendly], who is in The Crooked Lane Tavern (3047) [building, mild, dry]
* Knows about item Wooden Cutting Board (id 20341, distance 0) [Household, Common], which is at The Crooked Tankard (3051) [building, mild, normal]
* Knows about Shanairra Finwe (id 3139, distance 10) [human, friendly], who is in Willow Cottage (3048) [building, mild, humid]
* Knows about Yelena Malygin (id 3137, distance 10) [human, friendly], who is in Willow Creek Cottage (3045) [building, warm, normal]`,
        userQuestion: `I am looking for new friends`,
        answer: {
            type: 'positive',
            mentions: [
                { type: 'npc', id: 3138 },
                { type: 'npc', id: 3139 },
                { type: 'npc', id: 3137 }
            ],
            message: `Well, I've got a few good folks here at the Crooked Tankard. There's Gavriil, a fellow who's always got a story to tell. Brennan's a bit of a joker, but he's got a good heart. Shanairra's a quiet one, but she's got a good head on her shoulders. And Yelena's a friendly face, always ready with a smile. If you're looking for someone to chat with, I'd recommend checking them out. They're all pretty interesting folks.`
        }
    }
]

export class NpcAskResponder implements IAITask<IAskRequest, IAskResponse> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name() {
        return "NpcAskResponder";
    }

    getPromptFor(input: IAskRequest): { messages: Array<{ role: "system" | "user" | "assistant"; content: string; }>; nextMessage: string; } {

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            ...shuffleArray(EXAMPLES).slice(-3).map(
                (ex) => ([
                    { role: "user", content: `${ex.npcDisplay}\n\nThe player asked the following: ${ex.userQuestion}` },
                    { role: "assistant", content: `I will now respond to this situation.\nMy response is: ${ex.answer.type.toUpperCase()}\nI mention: ${ex.answer.mentions.map(m => `${m.type}::${m.id}`).join(', ')}${ex.answer.mentions.length === 0 ? 'nothing' : ''}\nI answer: ${ex.answer.message}` }
                ])
            ).flat()
        ] as any;

        return {
            messages,
            nextMessage: (aiDisplayNpc(input.npc) + "\n\nThe player asked the following: " + input.message).trim()
        }

    }

    async prompt(input: IAskRequest): Promise<IAskResponse> {
        const inPrompt = this.getPromptFor(input);

        while (true) {

            try {
                const llm = await this.lm.create(inPrompt.messages);
                let responseText = await llm.prompt(inPrompt.nextMessage);

                let responseLines = responseText.split('\n').map(l => l.trim());

                const invalidSyntaxMessage = {
                    type: 'negative',
                    mentions: [],
                    message: `I'm sorry, my brain is a bit malfunctioning right now.`
                } as IAskResponse;

                if (responseLines.length < 4) {
                    // return invalidSyntaxMessage;
                    continue;
                }

                if (!responseLines[0].startsWith('I will now respond to this situation.')) {
                    console.warn("[NpcAskResponder] Invalid syntax: does not start with 'I will now respond to this situation.'");
                    // return invalidSyntaxMessage;
                    continue;
                }

                responseLines = responseLines.slice(1);

                if (!responseLines[0].startsWith('My response is:')) {
                    console.warn("[NpcAskResponder] Invalid syntax: does not start with 'My response is:'");
                    // return invalidSyntaxMessage;
                    continue;
                }

                if (!responseLines[1].startsWith('I mention:')) {
                    console.warn("[NpcAskResponder] Invalid syntax: does not start with 'I mention:'");
                    // return invalidSyntaxMessage;
                    continue;
                }

                if (!responseLines[2].startsWith('I answer:')) {
                    console.warn("[NpcAskResponder] Invalid syntax: does not start with 'I answer:'");
                    // return invalidSyntaxMessage;
                    continue;
                }

                const responseParsed = responseLines[0].substring('My response is:'.length).trim().toLowerCase();
                if (responseParsed !== 'positive' && responseParsed !== 'negative') {
                    console.warn("[NpcAskResponder] Invalid syntax: response is not 'positive' or 'negative'");
                    // return invalidSyntaxMessage;
                    continue;
                }

                const mentionsParsed = responseLines[1].substring('I mention:'.length).trim();
                const mentions = mentionsParsed === 'nothing' ? [] : mentionsParsed.split(',').filter(
                    m => m.indexOf('::') !== -1
                ).map(m => {
                    const [type, id] = m.split('::');
                    return { type: type.trim() as 'location' | 'npc' | 'item', id: parseInt(id.trim()) };
                });

                const message = responseLines[2].substring('I answer:'.length).trim();

                console.log("[NpcAskResponder] Response parsed:", responseParsed, mentions, message);

                return {
                    type: responseParsed as 'positive' | 'negative',
                    mentions,
                    message
                };

            } catch (err) {
                console.warn("[NpcAskResponder] Unhandled error", err);
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