import { ILanguageModelContext } from "@siocode/base";
import { IWorldNode } from "../context/World.context";
import { shuffleArray } from "../utils/shuffleArray";
import { InspirationKeywords } from "./InspirationKeywords";

const randomRoomLabels = (buildingType: string, roomType: string) => {
    const forestIndex = Math.floor(Math.random() * 20);
    const villageIndex = Math.floor(Math.random() * 20);
    const streetIndex = Math.floor(Math.random() * 20);
    const tavernIndex = Math.floor(Math.random() * 20);
    const roomIndex = Math.floor(Math.random() * 20);
    return [
        "room",
        roomType,
        `forest:${forestIndex}`,
        `biome:${forestIndex}`,
        `village:${villageIndex}`,
        `street:${streetIndex}`,
        `${buildingType}:${tavernIndex}`,
        `room:${roomIndex}`,
        `forest:${forestIndex}:village:${villageIndex}:street:${streetIndex}:${buildingType}:${tavernIndex}`
    ];
}

const randomBuildingLabels = (buildingType: string) => {
    const forestIndex = Math.floor(Math.random() * 20);
    const villageIndex = Math.floor(Math.random() * 20);
    const streetIndex = Math.floor(Math.random() * 20);
    const tavernIndex = Math.floor(Math.random() * 20);
    return [
        buildingType,
        "building",
        `forest:${forestIndex}`,
        `biome:${forestIndex}`,
        `village:${villageIndex}`,
        `street:${streetIndex}`,
        `${buildingType}:${tavernIndex}`,
        `forest:${forestIndex}:village:${villageIndex}:street:${streetIndex}`
    ];
}

const randomStreetLabels = () => {
    const forestIndex = Math.floor(Math.random() * 20);
    const villageIndex = Math.floor(Math.random() * 20);
    const streetIndex = Math.floor(Math.random() * 20);
    return [
        "street",
        "village-street",
        `forest:${forestIndex}`,
        `biome:${forestIndex}`,
        `village:${villageIndex}`,
        `street:${streetIndex}`,
        `forest:${forestIndex}:village:${villageIndex}`
    ];
}

const ROOM_EXAMPLES = [
    {
        labels: randomRoomLabels("tavern", "tavern-room"),
        inName: "Room",
        outName: "Dark Room"
    },
    {
        labels: randomRoomLabels("tavern", "tavern-room"),
        inName: "Room",
        outName: "Cosy Dark Room"
    },
    {
        labels: randomRoomLabels("tavern", "tavern-room"),
        inName: "Room",
        outName: "Warm Room"
    },
    {
        labels: randomRoomLabels("tavern", "tavern-room"),
        inName: "Room",
        outName: "Inn Room"
    },
    {
        labels: randomRoomLabels("tavern", "tavern-room"),
        inName: "Room",
        outName: "Dark Inn Room"
    },
    {
        labels: randomRoomLabels("tavern", "tavern-room"),
        inName: "Room",
        outName: "Warm Inn Room"
    },


    {
        labels: randomRoomLabels("house", "house-room"),
        inName: "Room",
        outName: "Dark Room"
    },
    {
        labels: randomRoomLabels("house", "house-room"),
        inName: "Room",
        outName: "Cosy Dark Room"
    },
    {
        labels: randomRoomLabels("house", "house-room"),
        inName: "Room",
        outName: "Warm Room"
    },
    {
        labels: randomRoomLabels("house", "house-room"),
        inName: "Room",
        outName: "Bedroom"
    },
    {
        labels: randomRoomLabels("house", "house-room"),
        inName: "Room",
        outName: "Dark Bedroom"
    },
    {
        labels: randomRoomLabels("house", "house-room"),
        inName: "Room",
        outName: "Warm Bedroom"
    },
    {
        labels: randomRoomLabels("house", "house-room"),
        inName: "Room",
        outName: "Kitchen"
    },
    {
        labels: randomRoomLabels("house", "house-room"),
        inName: "Room",
        outName: "Cosy Kitchen"
    },


    {
        labels: randomRoomLabels("town-hall", "hall-room"),
        inName: "Room",
        outName: "Secretary Office"
    },
    {
        labels: randomRoomLabels("town-hall", "hall-room"),
        inName: "Room",
        outName: "Meeting Hall"
    },
    {
        labels: randomRoomLabels("town-hall", "hall-room"),
        inName: "Room",
        outName: "Dark Meeting Hall"
    },
    {
        labels: randomRoomLabels("town-hall", "hall-room"),
        inName: "Room",
        outName: "Warm Meeting Hall"
    },
    {
        labels: randomRoomLabels("town-hall", "hall-room"),
        inName: "Room",
        outName: "Council Room"
    },
    {
        labels: randomRoomLabels("town-hall", "hall-room"),
        inName: "Room",
        outName: "Dark Council Room"
    },
    {
        labels: randomRoomLabels("town-hall", "hall-room"),
        inName: "Room",
        outName: "Warm Council Room"
    },
    {
        labels: randomRoomLabels("town-hall", "hall-room"),
        inName: "Room",
        outName: "Library"
    },
    {
        labels: randomRoomLabels("town-hall", "hall-room"),
        inName: "Room",
        outName: "Dark Library"
    },
    {
        labels: randomRoomLabels("town-hall", "hall-room"),
        inName: "Room",
        outName: "Warm Library"
    },


    {
        labels: randomRoomLabels("blacksmith", "smithy-room"),
        inName: "Room",
        outName: "Workshop"
    },
    {
        labels: randomRoomLabels("blacksmith", "smithy-room"),
        inName: "Room",
        outName: "Dark Workshop"
    },
    {
        labels: randomRoomLabels("blacksmith", "smithy-room"),
        inName: "Room",
        outName: "Warm Workshop"
    },
    {
        labels: randomRoomLabels("blacksmith", "smithy-room"),
        inName: "Room",
        outName: "Smithy"
    },
    {
        labels: randomRoomLabels("blacksmith", "smithy-room"),
        inName: "Room",
        outName: "Dark Smithy"
    },
    {
        labels: randomRoomLabels("blacksmith", "smithy-room"),
        inName: "Room",
        outName: "Warm Smithy"
    },
    {
        labels: randomRoomLabels("blacksmith", "smithy-room"),
        inName: "Room",
        outName: "Forge"
    },
    {
        labels: randomRoomLabels("blacksmith", "smithy-room"),
        inName: "Room",
        outName: "Dark Forge"
    },
    {
        labels: randomRoomLabels("blacksmith", "smithy-room"),
        inName: "Room",
        outName: "Warm Forge"
    }
];

const BUILDING_EXAMPLES = [
    // Taverns
    {
        labels: randomBuildingLabels("tavern"),
        inName: "Tavern",
        outName: "The Rusty Sword"
    },
    {
        labels: randomBuildingLabels("tavern"),
        inName: "Tavern",
        outName: "The Golden Goblet"
    },
    {
        labels: randomBuildingLabels("tavern"),
        inName: "Tavern",
        outName: "The Mighty Mug"
    },
    {
        labels: randomBuildingLabels("tavern"),
        inName: "Tavern",
        outName: "The Laughing Dragon"
    },
    {
        labels: randomBuildingLabels("tavern"),
        inName: "Tavern",
        outName: "The Tipsy Traveler"
    },
    {
        labels: randomBuildingLabels("tavern"),
        inName: "Tavern",
        outName: "The Siren's Song"
    },

    // Houses
    {
        labels: randomBuildingLabels("house"),
        inName: "House",
        outName: "Peasant House"
    },
    {
        labels: randomBuildingLabels("house"),
        inName: "House",
        outName: "Family House"
    },
    {
        labels: randomBuildingLabels("house"),
        inName: "House",
        outName: "Small Cottage"
    },
    {
        labels: randomBuildingLabels("house"),
        inName: "House",
        outName: "Hunter's Lodge"
    },
    {
        labels: randomBuildingLabels("house"),
        inName: "House",
        outName: "Riverside Cabin"
    },
    {
        labels: randomBuildingLabels("house"),
        inName: "House",
        outName: "Stone Villa"
    },

    // Town Halls
    {
        labels: randomBuildingLabels("town-hall"),
        inName: "Town Hall",
        outName: "The Mayor's Office"
    },
    {
        labels: randomBuildingLabels("town-hall"),
        inName: "Town Hall",
        outName: "The Council Chamber"
    },
    {
        labels: randomBuildingLabels("town-hall"),
        inName: "Town Hall",
        outName: "The Library"
    },
    {
        labels: randomBuildingLabels("town-hall"),
        inName: "Town Hall",
        outName: "City Hall"
    },
    {
        labels: randomBuildingLabels("town-hall"),
        inName: "Town Hall",
        outName: "The Civic Center"
    },
    {
        labels: randomBuildingLabels("town-hall"),
        inName: "Town Hall",
        outName: "Grand Assembly Hall"
    },

    // Blacksmiths
    {
        labels: randomBuildingLabels("blacksmith"),
        inName: "Blacksmith",
        outName: "Blacksmith Co. Workshop"
    },
    {
        labels: randomBuildingLabels("blacksmith"),
        inName: "Blacksmith",
        outName: "The Royal Forge"
    },
    {
        labels: randomBuildingLabels("blacksmith"),
        inName: "Blacksmith",
        outName: "Iron Anvil Ltd. Store"
    },
    {
        labels: randomBuildingLabels("blacksmith"),
        inName: "Blacksmith",
        outName: "The Smelting Pot"
    },
    {
        labels: randomBuildingLabels("blacksmith"),
        inName: "Blacksmith",
        outName: "The Hammer and Tongs"
    },
    {
        labels: randomBuildingLabels("blacksmith"),
        inName: "Blacksmith",
        outName: "Forge of Legends"
    },

    // Inns
    {
        labels: randomBuildingLabels("inn"),
        inName: "Inn",
        outName: "The Cozy Hearth"
    },
    {
        labels: randomBuildingLabels("inn"),
        inName: "Inn",
        outName: "The Wandering Minstrel"
    },
    {
        labels: randomBuildingLabels("inn"),
        inName: "Inn",
        outName: "The Restful Pillow"
    },
    {
        labels: randomBuildingLabels("inn"),
        inName: "Inn",
        outName: "The Traveler's Haven"
    },
    {
        labels: randomBuildingLabels("inn"),
        inName: "Inn",
        outName: "The Golden Rest"
    },
    {
        labels: randomBuildingLabels("inn"),
        inName: "Inn",
        outName: "The Whispering Willow"
    },

    // Shops
    {
        labels: randomBuildingLabels("shop"),
        inName: "Shop",
        outName: "General Goods Store"
    },
    {
        labels: randomBuildingLabels("shop"),
        inName: "Shop",
        outName: "The Alchemist's Supply"
    },
    {
        labels: randomBuildingLabels("shop"),
        inName: "Shop",
        outName: "The Merchant's Chest"
    },
    {
        labels: randomBuildingLabels("shop"),
        inName: "Shop",
        outName: "The Arcane Emporium"
    },
    {
        labels: randomBuildingLabels("shop"),
        inName: "Shop",
        outName: "The Silver Coin"
    },
    {
        labels: randomBuildingLabels("shop"),
        inName: "Shop",
        outName: "The Trader's Post"
    },

    // Temples
    {
        labels: randomBuildingLabels("temple"),
        inName: "Temple",
        outName: "Temple of Light"
    },
    {
        labels: randomBuildingLabels("temple"),
        inName: "Temple",
        outName: "Shrine of the Moon"
    },
    {
        labels: randomBuildingLabels("temple"),
        inName: "Temple",
        outName: "Sanctuary of the Fallen"
    },
    {
        labels: randomBuildingLabels("temple"),
        inName: "Temple",
        outName: "The Sacred Grove"
    },
    {
        labels: randomBuildingLabels("temple"),
        inName: "Temple",
        outName: "Hall of the Sun"
    },
    {
        labels: randomBuildingLabels("temple"),
        inName: "Temple",
        outName: "The Celestial Spire"
    }
];


const STREET_EXAMPLES = [
    {
        labels: randomStreetLabels(),
        inName: "Village Street",
        outName: "Main Street"
    },
    {
        labels: randomStreetLabels(),
        inName: "Village Street",
        outName: "Harbor Street"
    },
    {
        labels: randomStreetLabels(),
        inName: "Village Street",
        outName: "Market Street"
    },
    {
        labels: randomStreetLabels(),
        inName: "Village Street",
        outName: "Farmer's Row"
    },
    {
        labels: randomStreetLabels(),
        inName: "Village Street",
        outName: "Fisherman's Lane"
    },
    {
        labels: randomStreetLabels(),
        inName: "Village Street",
        outName: "Hunter's Path"
    },
    {
        labels: randomStreetLabels(),
        inName: "Town Street",
        outName: "King's Way"
    },
    {
        labels: randomStreetLabels(),
        inName: "Town Street",
        outName: "Queen's Road"
    },
    {
        labels: randomStreetLabels(),
        inName: "Town Street",
        outName: "Noble Street"
    },
    {
        labels: randomStreetLabels(),
        inName: "City Street",
        outName: "Merchant's Row"
    },
    {
        labels: randomStreetLabels(),
        inName: "City Street",
        outName: "Craftsman's Lane"
    },
    {
        labels: randomStreetLabels(),
        inName: "City Street",
        outName: "Artisan's Alley"
    },
];

const ROOM_SYSTEM_PROMPT = `Generate a fitting and entertaining name for a room. The user will send you the current name, and labels of this room. Make sure to stay in a medieval / fantasy setting. Be creative but realistic. You must start your response with 'I propose the following name: '.`;
const BUILDING_SYSTEM_PROMPT = `Generate a fitting and entertaining name for a building. The user will send you the current name, and labels of this building. Make sure to stay in a medieval / fantasy setting. Be creative but realistic. You must start your response with 'I propose the following name: '.`;
const STREET_SYSTEM_PROMPT = `Generate a fitting and entertaining name for a street. The user will send you the current name, and labels of this street. Make sure to stay in a medieval / fantasy setting. Be creative but realistic. You must start your response with 'I propose the following name: '.`;

export class WorldNodeDetailGenerator {

    constructor(
        private lm: ILanguageModelContext,
    ) { }

    async generate(
        node: IWorldNode
    ): Promise<void> {
        if (node.details) {
            console.log("[WorldNodeDetailGenerator]", "Node already has details", node);
            return;
        }

        console.log("[WorldNodeDetailGenerator]", "Generating details for node", node);
        node.details = {
            description: "TODO: Generate this node description as well."
        };

        if (node.labels.includes("room") || node.type === "room") {

            while (true) {
                // Generate room name

                const shuffled = shuffleArray(ROOM_EXAMPLES);
                const randomExamples = shuffled;
                const inPrompt = [
                    { role: "system", content: ROOM_SYSTEM_PROMPT + "\n\n" + (new InspirationKeywords().format(5, ["fantasy", "medieval"])) },
                    ...randomExamples.map(
                        ex => ([
                            { role: "user", content: `Room name: ${ex.inName}\nRoom labels: ${ex.labels.join(', ')}` },
                            { role: "assistant", content: `I propose the following name: ${ex.outName}` }
                        ])
                    ).flat()
                ];
                const llm = await this.lm.create(inPrompt as any, { temperature: 1.0, topK: 4 });
                const responseText = await llm.prompt(`Room name: ${node.name}\nRoom labels: ${node.labels.join(', ')}`);
                console.log("[WorldNodeDetailGenerator]", "Room name response", node, responseText);
                let extractedName = responseText.trim();
                if (extractedName.startsWith("I propose the following name: ")) {
                    extractedName = extractedName.replace("I propose the following name: ", "");
                } else {
                    console.warn("[WorldNodeDetailGenerator]", "Room name response does not start with prefix", node, responseText);
                }

                if (extractedName.length > 0 && extractedName.length < 40) {
                    node.name = extractedName;
                    break;
                } else {
                    console.warn("[WorldNodeDetailGenerator]", "Extracted name is too long or too short", node, extractedName);
                }

            }

        } else if (node.labels.includes("building") || node.type === "building") {

            while (true) {
                // Generate building name

                const shuffled = shuffleArray(BUILDING_EXAMPLES);
                const randomExamples = shuffled;
                const inPrompt = [
                    { role: "system", content: BUILDING_SYSTEM_PROMPT + "\n\n" + (new InspirationKeywords().format(5, ["fantasy", "medieval"])) },
                    ...randomExamples.map(
                        ex => ([
                            { role: "user", content: `Building name: ${ex.inName}\nBuilding labels: ${ex.labels.join(', ')}` },
                            { role: "assistant", content: `I propose the following name: ${ex.outName}` }
                        ])
                    ).flat()
                ];
                const llm = await this.lm.create(inPrompt as any, { temperature: 1.0, topK: 4 });
                const responseText = await llm.prompt(`Building name: ${node.name}\nBuilding labels: ${node.labels.join(', ')}`);
                console.log("[WorldNodeDetailGenerator]", "Building name response", node, responseText);
                let extractedName = responseText.trim();
                if (extractedName.startsWith("I propose the following name: ")) {
                    extractedName = extractedName.replace("I propose the following name: ", "");
                } else {
                    console.warn("[WorldNodeDetailGenerator]", "Building name response does not start with prefix", node, responseText);
                }

                if (extractedName.length > 0 && extractedName.length < 40) {
                    node.name = extractedName;
                    break;
                } else {
                    console.warn("[WorldNodeDetailGenerator]", "Extracted name is too long or too short", node, extractedName);
                }
            }

        } else if (node.labels.includes("street") || node.type === "street") {

            while (true) {
                // Generate street name

                const shuffled = shuffleArray(STREET_EXAMPLES);
                const randomExamples = shuffled;
                const inPrompt = [
                    { role: "system", content: STREET_SYSTEM_PROMPT + "\n\n" + (new InspirationKeywords().format(5, ["fantasy", "medieval"])) },
                    ...randomExamples.map(
                        ex => ([
                            { role: "user", content: `Street name: ${ex.inName}\nStreet labels: ${ex.labels.join(', ')}` },
                            { role: "assistant", content: `I propose the following name: ${ex.outName}` }
                        ])
                    ).flat()
                ];
                const llm = await this.lm.create(inPrompt as any, { temperature: 1.0, topK: 4 });
                const responseText = await llm.prompt(`Street name: ${node.name}\nStreet labels: ${node.labels.join(', ')}`);
                console.log("[WorldNodeDetailGenerator]", "Street name response", node, responseText);
                let extractedName = responseText.trim();
                if (extractedName.startsWith("I propose the following name: ")) {
                    extractedName = extractedName.replace("I propose the following name: ", "");
                } else {
                    console.warn("[WorldNodeDetailGenerator]", "Street name response does not start with prefix", node, responseText);
                }

                if (extractedName.length > 0 && extractedName.length < 40) {
                    node.name = extractedName;
                    break;
                } else {
                    console.warn("[WorldNodeDetailGenerator]", "Extracted name is too long or too short", node, extractedName);
                }
            }

        }

    }

}