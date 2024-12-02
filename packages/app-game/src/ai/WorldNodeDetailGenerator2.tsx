import { ILanguageModelContext } from "@siocode/base";
import { IWorldNode } from "../context/World.context";
import { shuffleArray } from "../utils/shuffleArray";
import { InspirationKeywords } from "./InspirationKeywords";


const EXAMPLES = [
    // Rooms
    {
        type: "room",
        humidity: "humid",
        temperature: "mild",
        room: {
            roomType: "bedroom"
        },
        ancestor: {
            type: "building",
            building: {
                buildingType: "base"
            }
        },
        name: "Tavern Bedroom",
        proposedName: "Cozy Bedroom"
    },
    {
        type: "room",
        humidity: "dry",
        temperature: "warm",
        room: {
            roomType: "bedroom"
        },
        ancestor: {
            type: "building",
            building: {
                buildingType: "tavern"
            }
        },
        name: "Tavern Bedroom",
        proposedName: "Bedroom"
    },
    {
        type: "room",
        humidity: "normal",
        temperature: "mild",
        room: {
            roomType: "bedroom"
        },
        ancestor: {
            type: "building",
            building: {
                buildingType: "inn"
            },
            labels: ["tavern"]
        },
        name: "Tavern Bedroom",
        proposedName: "Tavern Bedroom"
    },
    {
        type: "room",
        humidity: "dry",
        temperature: "warm",
        room: {
            roomType: "kitchen"
        },
        ancestor: {
            type: "building",
            building: {
                buildingType: "house"
            }
        },
        name: "Kitchen",
        proposedName: "Somewhat Messy Kitchen"
    },
    {
        type: "room",
        humidity: "normal",
        temperature: "warm",
        room: {
            roomType: "kitchen"
        },
        ancestor: {
            type: "building",
            building: {
                buildingType: "house"
            }
        },
        name: "Kitchen",
        proposedName: "Comfortable Kitchen"
    },
    {
        type: "room",
        humidity: "dry",
        temperature: "hot",
        room: {
            roomType: "forge"
        },
        ancestor: {
            type: "building",
            building: {
                buildingType: "castle"
            },
            labels: ["castle"]
        },
        name: "Forge",
        proposedName: "Blazing Forge"
    },
    {
        type: "room",
        humidity: "humid",
        temperature: "cool",
        room: {
            roomType: "bathroom"
        },
        ancestor: {
            type: "building",
            building: {
                buildingType: "inn"
            },
            labels: ["inn"]
        },
        name: "Bathroom",
        proposedName: "Steamy Washroom"
    },
    {
        type: "room",
        humidity: "dry",
        temperature: "cold",
        room: {
            roomType: "cellar"
        },
        ancestor: {
            type: "building",
            building: {
                buildingType: "tavern"
            },
            labels: ["tavern"]
        },
        name: "Cellar",
        proposedName: "Chilled Wine Storage"
    },
    {
        type: "room",
        humidity: "normal",
        temperature: "mild",
        room: {
            roomType: "study"
        },
        ancestor: {
            type: "building",
            building: {
                buildingType: "manor"
            }
        },
        name: "Study",
        proposedName: "Silent Study"
    },
    {
        type: "room",
        humidity: "humid",
        temperature: "warm",
        room: {
            roomType: "dining room"
        },
        ancestor: {
            type: "building",
            building: {
                buildingType: "castle"
            }
        },
        name: "Dining Room",
        proposedName: "Grand Feast Hall"
    },
    // Wilderness
    {
        type: "wilderness",
        humidity: "dry",
        temperature: "hot",
        wilderness: {
            wildernessType: "desert"
        },
        ancestor: {
            type: "wilderness",
            wilderness: {
                wildernessType: "plain"
            }
        },
        name: "Desert",
        proposedName: "Scorched Sands"
    },
    {
        type: "wilderness",
        humidity: "humid",
        temperature: "cool",
        wilderness: {
            wildernessType: "swamp"
        },
        ancestor: {
            type: "wilderness",
            wilderness: {
                wildernessType: "forest"
            }
        },
        name: "Swamp",
        proposedName: "Dark Marshes"
    },
    {
        type: "wilderness",
        humidity: "normal",
        temperature: "cold",
        wilderness: {
            wildernessType: "tundra"
        },
        ancestor: {
            type: "wilderness",
            wilderness: {
                wildernessType: "mountain"
            }
        },
        name: "Tundra",
        proposedName: "Frozen Plateau"
    },
    {
        type: "wilderness",
        humidity: "humid",
        temperature: "warm",
        wilderness: {
            wildernessType: "jungle"
        },
        ancestor: {
            type: "wilderness",
            wilderness: {
                wildernessType: "rainforest"
            }
        },
        name: "Jungle",
        proposedName: "Verdant Depths"
    },
    {
        type: "wilderness",
        humidity: "dry",
        temperature: "warm",
        wilderness: {
            wildernessType: "savanna"
        },
        ancestor: {
            type: "wilderness",
            wilderness: {
                wildernessType: "plain"
            }
        },
        name: "Savanna",
        proposedName: "Golden Grasslands"
    },
    // Settlements
    {
        type: "settlement",
        humidity: "dry",
        temperature: "cold",
        settlement: {
            settlementType: "fort"
        },
        ancestor: {
            type: "wilderness",
            wilderness: {
                wildernessType: "mountain"
            }
        },
        name: "Fort",
        proposedName: "Winterwatch Keep"
    },
    {
        type: "settlement",
        humidity: "normal",
        temperature: "mild",
        settlement: {
            settlementType: "village"
        },
        ancestor: {
            type: "wilderness",
            wilderness: {
                wildernessType: "forest"
            }
        },
        name: "Village",
        proposedName: "Whispering Pines"
    },
    {
        type: "settlement",
        humidity: "humid",
        temperature: "warm",
        settlement: {
            settlementType: "port"
        },
        ancestor: {
            type: "wilderness",
            wilderness: {
                wildernessType: "coast"
            }
        },
        name: "Port",
        proposedName: "Bayview Harbor"
    },
    {
        type: "settlement",
        humidity: "dry",
        temperature: "hot",
        settlement: {
            settlementType: "city"
        },
        ancestor: {
            type: "wilderness",
            wilderness: {
                wildernessType: "desert"
            }
        },
        name: "City",
        proposedName: "Oasis City"
    },
    {
        type: "settlement",
        humidity: "normal",
        temperature: "cool",
        settlement: {
            settlementType: "village"
        },
        ancestor: {
            type: "wilderness",
            wilderness: {
                wildernessType: "plain"
            }
        },
        name: "Village",
        proposedName: "Frostfields"
    }
];


const SYSTEM_PROMPT = `Generate a fitting and entertaining name for a place. The user will send you a JSON summary of the room. Make sure to stay in a medieval / fantasy setting. Be creative but realistic. You must start your response with 'I propose the following name: '.`;

function nodeToJsonData(node: IWorldNode) {
    return {
        type: node.type,
        humidity: node.humidity,
        temperature: node.temperature,
        building: node.building ? {
            buildingType: node.building.buildingType
        } : undefined,
        room: node.room ? {
            roomType: node.room.roomType
        } : undefined,
        street: node.street ? {
            streetType: node.street.streetType
        } : undefined,
        settlement: node.settlement ? {
            settlementType: node.settlement.settlementType
        } : undefined,
        wilderness: node.wilderness ? {
            wildernessType: node.wilderness.wildernessType
        } : undefined,
        ancestor: node.ancestor ? {
            type: node.ancestor.type,
            building: node.ancestor.building ? {
                buildingType: node.ancestor.building.buildingType
            } : undefined,
            room: node.ancestor.room ? {
                roomType: node.ancestor.room.roomType
            } : undefined,
            street: node.ancestor.street ? {
                streetType: node.ancestor.street.streetType
            } : undefined,
            settlement: node.ancestor.settlement ? {
                settlementType: node.ancestor.settlement.settlementType
            } : undefined,
            wilderness: node.ancestor.wilderness ? {
                wildernessType: node.ancestor.wilderness.wildernessType
            } : undefined,
            labels: (node.ancestor.labels && node.ancestor.labels.length > 0) ? node.ancestor.labels : undefined
        } : undefined,
        labels: (node.labels && node.labels.length > 0) ? node.labels : undefined
    }
}

export class WorldNodeDetailGenerator2 {
    constructor(
        private lm: ILanguageModelContext
    ) { }

    async generate(node: IWorldNode) {
        if (node.details) {
            console.log("[WorldNodeDetailGenerator2]", "Node already has details", node);
            return;
        }

        console.log("[WorldNodeDetailGenerator2]", "Generating details for node", node);
        node.details = {
            description: "TODO: Generate this node description as well."
        };

        while (true) {
            // Generate name

            const shuffled = shuffleArray(EXAMPLES);
            const randomExamples = shuffled;
            const inPrompt = [
                { role: "system", content: SYSTEM_PROMPT + "\n\n" + (new InspirationKeywords().format(5, ["fantasy", "medieval"])) },
                ...randomExamples.map(
                    ex => ([
                        { role: "user", content: JSON.stringify(nodeToJsonData(ex as any)) },
                        { role: "assistant", content: `I propose the following name: ${ex.proposedName}` }
                    ])
                ).flat()
            ];
            const llm = await this.lm.create(inPrompt as any, { temperature: 1.0, topK: 4 });
            const responseText = await llm.prompt(
                JSON.stringify(nodeToJsonData(node)),
            );
            console.log("[WorldNodeDetailGenerator2]", "Name response", node, responseText);
            let extractedName = responseText.trim();
            if (extractedName.startsWith("I propose the following name: ")) {
                extractedName = extractedName.replace("I propose the following name: ", "");
            } else {
                console.warn("[WorldNodeDetailGenerator2]", "Name response does not start with prefix", node, responseText);
            }

            if (extractedName.length > 0 && extractedName.length < 40) {
                node.name = extractedName;
                break;
            } else {
                console.warn("[WorldNodeDetailGenerator2]", "Extracted name is too long or too short", node, extractedName);
            }
        }
    }
}