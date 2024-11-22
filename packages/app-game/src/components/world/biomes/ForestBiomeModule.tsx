import { IWorldNode } from "../../../context/World.context";
import { IBiomeModule } from "../api/BiomeModule";
import { INodeFactory } from "../api/NodeFactory";
import { IEdgeFactory } from "../api/EdgeFactory";
import { DISTANCES } from "../constants";
import { shuffleArray } from "../../../utils/shuffleArray";
import { IModuleHost } from "../api/ModuleHost";
import { IItemFactory } from "../api/ItemFactory";
import { INpcFactory } from "../api/NpcFactory";
import { WORLD_ITEM_TYPE, WORLD_WEAPON_TYPE, WORLD_WEARABLE_TYPE, WorldItemType } from "../../../model/world.enums";

// Constants for forest generation
const NUM_FOREST_NODES = 20;
const NUM_MIN_FOREST_EDGES = 1;
const NUM_RND_FOREST_EDGES = 3;

// Constants for village generation
const NUM_MIN_VILLAGES = 2;
const NUM_RND_VILLAGES = 8;
const NUM_MIN_VILLAGE_STREETS = 2;
const NUM_RND_VILLAGE_STREETS = 4;

// Constants for building generation
const NUM_MIN_BUILDINGS = 1;
const NUM_RND_BUILDINGS = 3;

// Constants for room generation
const NUM_MIN_ROOMS = 1;
const NUM_RND_ROOMS = 2;

// Building configurations
const BUILDING_TYPES = [
    {
        type: "House",
        label: "house",
        level: "house",
        roomLabel: "house-room",
        minRooms: NUM_MIN_ROOMS,
        rndRooms: NUM_RND_ROOMS,
        probability: 0.7, // 70% chance to include
    },
    {
        type: "Tavern",
        label: "tavern",
        level: "tavern",
        roomLabel: "tavern-room",
        minRooms: NUM_MIN_ROOMS,
        rndRooms: NUM_RND_ROOMS,
        probability: 0.5,
    },
    {
        type: "Town Hall",
        label: "town-hall",
        level: "town-hall",
        roomLabel: "hall-room",
        minRooms: 1,
        rndRooms: 2,
        probability: 0.3,
    },
    {
        type: "Blacksmith",
        label: "blacksmith",
        level: "blacksmith",
        roomLabel: "smithy-room",
        minRooms: 1,
        rndRooms: 1,
        probability: 0.4,
    },
    {
        type: "Square",
        label: "square",
        level: "square",
        roomLabel: null,
        minRooms: 0,
        rndRooms: 0,
        probability: 0.5,
    },
];

export const FOREST_BIOME_MODULE: IBiomeModule = {
    name: "Forest",
    async generate(
        host: IModuleHost,
        biomeIndex: number
    ) {

        const { nodeFactory, edgeFactory, itemFactory, npcFactory } = host;

        // Generate forest nodes
        let forestNodes = generateForestNodes(nodeFactory);

        // Connect forest nodes
        connectForestNodes(forestNodes, edgeFactory);

        // Ensure all forest nodes are connected
        ensureForestConnectivity(forestNodes, edgeFactory);

        // Shuffle forest nodes for randomness
        forestNodes = shuffleArray(forestNodes);

        // Generate villages
        const villages = generateVillages(
            nodeFactory,
            edgeFactory,
            itemFactory,
            npcFactory,
            forestNodes,
            biomeIndex
        );

        // Return the first forest node as the entry point
        return forestNodes[0];
    },
};

// Helper function to generate forest nodes
function generateForestNodes(nodeFactory: INodeFactory): Array<IWorldNode> {
    const forestNodes: Array<IWorldNode> = [];

    for (let i = 0; i < NUM_FOREST_NODES; i++) {
        const forestNode = nodeFactory.node("Forest", {
            level: "wilderness",
            temperature: "mild",
            humidity: "humid",
        });

        forestNode.labels = [
            "wilderness",
            "forest",
            `forest:${i}`,
            `biome:${i}`,
        ];

        forestNodes.push(forestNode);
    }

    return forestNodes;
}

// Helper function to connect forest nodes
function connectForestNodes(
    forestNodes: Array<IWorldNode>,
    edgeFactory: IEdgeFactory
) {
    for (let i = 0; i < forestNodes.length; i++) {
        const forestNode = forestNodes[i];
        const numEdges =
            NUM_MIN_FOREST_EDGES +
            Math.floor(Math.random() * NUM_RND_FOREST_EDGES);
        for (let j = 0; j < numEdges; j++) {
            let targetNode =
                forestNodes[Math.floor(Math.random() * forestNodes.length)];
            while (
                targetNode.id === forestNode.id ||
                forestNode.outEdges.find((e) => e.to.id === targetNode.id)
            ) {
                targetNode =
                    forestNodes[Math.floor(Math.random() * forestNodes.length)];
            }
            connectNodes(edgeFactory, forestNode, targetNode, DISTANCES.medium);
        }
    }
}

// Helper function to ensure all forest nodes are connected
function ensureForestConnectivity(
    forestNodes: Array<IWorldNode>,
    edgeFactory: IEdgeFactory
) {
    while (true) {
        let visited = new Set<number>();
        let queue = [forestNodes[0]];
        while (queue.length > 0) {
            const node = queue.shift();
            if (visited.has(node.id)) {
                continue;
            }
            visited.add(node.id);
            for (const edge of node.outEdges) {
                if (!visited.has(edge.to.id)) {
                    queue.push(edge.to);
                }
            }
        }
        if (visited.size === forestNodes.length) {
            break;
        }
        const unvisitedNodes = forestNodes.filter((n) => !visited.has(n.id));
        const randomVisitedNodeId = Array.from(visited)[
            Math.floor(Math.random() * visited.size)
        ];
        const randomVisitedNode = forestNodes.find(
            (n) => n.id === randomVisitedNodeId
        );
        const randomUnvisitedNode =
            unvisitedNodes[
            Math.floor(Math.random() * unvisitedNodes.length)
            ];
        connectNodes(
            edgeFactory,
            randomVisitedNode,
            randomUnvisitedNode,
            DISTANCES.medium
        );
    }
}

// Helper function to generate villages
function generateVillages(
    nodeFactory: INodeFactory,
    edgeFactory: IEdgeFactory,
    itemFactory: IItemFactory,
    npcFactory: INpcFactory,
    forestNodes: Array<IWorldNode>,
    biomeIndex: number
) {
    const villages = [];
    const numVillages =
        NUM_MIN_VILLAGES + Math.floor(Math.random() * NUM_RND_VILLAGES);

    for (let i = 0; i < numVillages; i++) {
        const villageForestNode = forestNodes[i];
        const villageId = i;
        const streets = generateVillageStreets(
            nodeFactory,
            edgeFactory,
            itemFactory,
            npcFactory,
            villageForestNode,
            biomeIndex,
            villageId
        );
        villages.push({ villageId, streets });
    }

    return villages;
}

// Helper function to generate village streets
function generateVillageStreets(
    nodeFactory: INodeFactory,
    edgeFactory: IEdgeFactory,
    itemFactory: IItemFactory,
    npcFactory: INpcFactory,
    villageForestNode: IWorldNode,
    biomeIndex: number,
    villageId: number
) {
    const streetNodes: Array<IWorldNode> = [];
    const numStreets =
        NUM_MIN_VILLAGE_STREETS +
        Math.floor(Math.random() * NUM_RND_VILLAGE_STREETS);

    for (let j = 0; j < numStreets; j++) {
        const streetNode = nodeFactory.node("Village Street", {
            level: "street",
            temperature: "mild",
            humidity: "humid",
        });

        streetNode.labels = [
            "street",
            "village-street",
            `forest:${biomeIndex}`,
            `biome:${biomeIndex}`,
            `village:${villageId}`,
            `street:${j}`,
            `forest:${villageId}`,
            `forest:${biomeIndex}:village:${villageId}`,
        ];

        // Connect street to forest node
        if (j === 0 || Math.random() < 0.5) {
            connectNodes(
                edgeFactory,
                villageForestNode,
                streetNode,
                DISTANCES.medium
            );
        }

        streetNodes.push(streetNode);
    }

    // Connect streets to each other
    for (let j = 0; j < streetNodes.length; j++) {
        for (let k = j + 1; k < streetNodes.length; k++) {
            connectNodes(
                edgeFactory,
                streetNodes[j],
                streetNodes[k],
                DISTANCES.short
            );
        }
    }

    // Populate streets with buildings
    for (const streetNode of streetNodes) {
        generateBuildingsForStreet(
            nodeFactory,
            edgeFactory,
            itemFactory,
            npcFactory,
            streetNode,
            biomeIndex,
            villageId
        );
    }

    return streetNodes;
}

// Helper function to generate buildings for a street
function generateBuildingsForStreet(
    nodeFactory: INodeFactory,
    edgeFactory: IEdgeFactory,
    itemFactory: IItemFactory,
    npcFactory: INpcFactory,
    streetNode: IWorldNode,
    biomeIndex: number,
    villageId: number
) {
    const streetLabel = streetNode.labels.find((l) => l.startsWith("street:"));
    const streetId = streetLabel.split(":")[1];

    for (const buildingType of BUILDING_TYPES) {
        if (Math.random() < buildingType.probability) {
            const numBuildings =
                NUM_MIN_BUILDINGS + Math.floor(Math.random() * NUM_RND_BUILDINGS);

            for (let i = 0; i < numBuildings; i++) {
                const buildingNode = nodeFactory.node(buildingType.type, {
                    level: buildingType.level,
                    temperature: "mild",
                    humidity: "humid",
                });

                buildingNode.labels = [
                    buildingType.label,
                    "building",
                    `forest:${biomeIndex}`,
                    `biome:${biomeIndex}`,
                    `village:${villageId}`,
                    `street:${streetId}`,
                    `${buildingType.label}:${i}`,
                    `forest:${biomeIndex}:village:${villageId}:street:${streetId}`,
                ];

                // Generate rooms if applicable
                if (buildingType.roomLabel) {
                    const numRooms =
                        buildingType.minRooms +
                        Math.floor(Math.random() * buildingType.rndRooms);
                    generateRooms(
                        nodeFactory,
                        edgeFactory,
                        itemFactory,
                        npcFactory,
                        buildingNode,
                        buildingType.roomLabel,
                        numRooms,
                        biomeIndex,
                        villageId,
                        streetId,
                        i
                    );
                }

                // Connect building to street
                connectNodes(
                    edgeFactory,
                    streetNode,
                    buildingNode,
                    DISTANCES.short
                );

                if (buildingType.label === "tavern") {
                    // Add 3 NPCs to the tavern
                    for (let j = 0; j < 3; j++) {
                        const npc = npcFactory.npc(
                            "Jon Snow",
                            "human",
                            buildingNode
                        );
                        npc.personality = {
                            traits: [
                                "brave",
                                "humble",
                                "undisciplined"
                            ],
                            background: "soldier"
                        };
                        npc.inventory = {
                            gold: 100,
                            items: []
                        };
                        npc.gear = {
                            weapon: itemFactory.item(
                                "Valyrian Steel Sword",
                                "weapon",
                                "legendary"
                            ),
                            armor: itemFactory.item(
                                "Chainmail",
                                "armor",
                                "rare"
                            ),
                            boots: itemFactory.item(
                                "Leather Boots",
                                "armor",
                                "common"
                            ),
                            helmet: itemFactory.item(
                                "Iron Helmet",
                                "armor",
                                "common"
                            ),
                            wearable: itemFactory.item(
                                "Cloak",
                                "wearable",
                                "common"
                            )
                        };
                        npc.gear.weapon.weapon = {
                            weaponType: "sword",
                            damage: 914
                        };
                        buildingNode.npcs.push(npc);
                    }
                }

                if (buildingType.label === "tavern" || buildingType.label === "house" || buildingType.label === "town-hall" || buildingType.label === "blacksmith") {

                    const nItems = Math.floor(Math.random() * 6);

                    for (let k = 0; k < nItems; k++) {

                        // Add a random item to the room
                        const item = generateRandomItem(itemFactory);
                        buildingNode.items.push(item);

                    }
                }
            }
        }
    }
}

// Helper function to generate rooms for a building
function generateRooms(
    nodeFactory: INodeFactory,
    edgeFactory: IEdgeFactory,
    itemFactory: IItemFactory,
    npcFactory: INpcFactory,
    buildingNode: IWorldNode,
    roomLabel: string,
    numRooms: number,
    biomeIndex: number,
    villageId: number,
    streetId: string,
    buildingId: number
) {
    for (let j = 0; j < numRooms; j++) {
        const roomNode = nodeFactory.node("Room", {
            level: "room",
            temperature: "mild",
            humidity: "dry",
        });

        roomNode.labels = [
            "room",
            roomLabel,
            `forest:${biomeIndex}`,
            `biome:${biomeIndex}`,
            `village:${villageId}`,
            `street:${streetId}`,
            `${buildingNode.labels[0]}:${buildingId}`,
            `room:${j}`,
            `forest:${biomeIndex}:village:${villageId}:street:${streetId}:${buildingNode.labels[0]}:${buildingId}`,
        ];

        // Connect room to building
        connectNodes(
            edgeFactory,
            buildingNode,
            roomNode,
            DISTANCES.veryShort
        );


        const nItems = Math.floor(Math.random() * 20) + 1;

        for (let k = 0; k < nItems; k++) {

            // Add a random item to the room
            const item = generateRandomItem(itemFactory);
            roomNode.items.push(item);

        }

    }
}

const RANDOM_ITEM_NAME_DATA = {
    weapon: {
        sword: ["Sword", "Broadsword", "Longsword", "Shortsword", "Blade"],
        axe: ["Axe", "Battleaxe", "Hatchet", "Tomahawk", "Cleaver"],
        knife: ["Knife", "Blade"],
        dagger: ["Dagger", "Stiletto"],
        bow: ["Bow", "Longbow", "Shortbow"],
        crossbow: ["Crossbow", "Arbalest"],
        staff: ["Staff", "Rod", "Scepter"],
    },
    armor: ["Armor", "Chainmail", "Plate Armor", "Leather Armor", "Cloth Armor", "Shirt", "Tunic", "Robe"],
    helmet: ["Helmet", "Iron Helmet", "Steel Helmet", "Leather Helmet", "Cloth Hat", "Cap", "Crown"],
    boots: ["Boots", "Leather Boots", "Steel Boots", "Cloth Shoes", "Sandals", "Slippers", "Armor Boots"],
    wearable: ["Wearable", "Cloak", "Necklace", "Ring", "Bracelet", "Amulet", "Earring"],
    household: ["Household Item", "A Commodity", "A Tool"],
    material: ["Raw Material", "Liquid Material", "Solid Material", "Gas Material", "Crafting Material", "Tool"],
    food: ["Food", "Drink", "Meal", "Snack", "Dessert", "Beverage", "Edible"],
    drink: ["Drink", "Beverage", "Liquid", "Alcohol", "Soda", "Juice", "Water"],
    consumable: ["Consumable", "Potion", "Elixir", "Drug", "Medicine", "Herb", "Spice"],
}

function generateRandomItem(itemFactory: IItemFactory) {

    const mostCommonCategories: Array<WorldItemType> = [
        "household",
        "food",
        "drink"
    ];

    const rarerCategories: Array<WorldItemType> = [
        "consumable",
        "material"
    ];

    const isMostCommon = Math.random() < 0.75; // 75% chance to be most common

    let itemType = "household";

    if (isMostCommon) {
        itemType = mostCommonCategories[Math.floor(Math.random() * mostCommonCategories.length)];
    } else {
        const isRarer = Math.random() < 0.8; // 80% chance to be rarer
        if (isRarer) {
            itemType = rarerCategories[Math.floor(Math.random() * rarerCategories.length)];
        } else {
            itemType = WORLD_ITEM_TYPE[Math.floor(Math.random() * WORLD_ITEM_TYPE.length)];
            while (mostCommonCategories.includes(itemType as any) || rarerCategories.includes(itemType as any)) {
                itemType = WORLD_ITEM_TYPE[Math.floor(Math.random() * WORLD_ITEM_TYPE.length)];
            }
        }
    }

    if (itemType === "weapon") {
        const isLegendary = Math.random() < 0.001;
        const isEpic = Math.random() < 0.01;
        const isRare = Math.random() < 0.1;

        let weaponType = WORLD_WEAPON_TYPE[Math.floor(Math.random() * WORLD_WEAPON_TYPE.length)];

        let namePool = RANDOM_ITEM_NAME_DATA.weapon[weaponType];
        let name = namePool[Math.floor(Math.random() * namePool.length)];

        const weap = itemFactory.item(
            name,
            itemType,
            isLegendary ? "legendary" : isEpic ? "epic" : isRare ? "rare" : "common"
        );
        let dmgBase = 1;
        let dmgRnd = 100;
        if (isLegendary) {
            dmgBase = 100;
            dmgRnd = 500;
        } else if (isEpic) {
            dmgBase = 50;
            dmgRnd = 250;
        } else if (isRare) {
            dmgBase = 25;
            dmgRnd = 125;
        }
        weap.weapon = {
            weaponType: weaponType as any,
            damage: dmgBase + Math.floor(Math.random() * dmgRnd),
        };
        return weap;
    } else if (itemType === "armor" || itemType === "helmet" || itemType === "boots" || itemType === "wearable") {
        const isLegendary = Math.random() < 0.001;
        const isEpic = Math.random() < 0.01;
        const isRare = Math.random() < 0.1;

        let namePool = RANDOM_ITEM_NAME_DATA[itemType];
        let name = namePool[Math.floor(Math.random() * namePool.length)];

        let defBase = 1;
        let defRnd = 100;
        if (isLegendary) {
            defBase = 100;
            defRnd = 500;
        } else if (isEpic) {
            defBase = 50;
            defRnd = 250;
        } else if (isRare) {
            defBase = 25;
            defRnd = 125;
        }

        const arm = itemFactory.item(
            name,
            itemType,
            isLegendary ? "legendary" : isEpic ? "epic" : isRare ? "rare" : "common"
        );
        if (itemType === "armor") {
            arm.armor = {
                defense: defBase + Math.floor(Math.random() * defRnd),
            };
        } else if (itemType === "helmet") {
            arm.helmet = {
                defense: defBase + Math.floor(Math.random() * defRnd),
            };
        } else if (itemType === "boots") {
            arm.boots = {
                defense: defBase + Math.floor(Math.random() * defRnd),
            };
        } else if (itemType === "wearable") {
            arm.wearable = {
                wearableType: WORLD_WEARABLE_TYPE[Math.floor(Math.random() * WORLD_WEARABLE_TYPE.length)] as any,
                defense: defBase + Math.floor(Math.random() * defRnd),
            };
        }
        return arm;
    } else {
        let namePool = RANDOM_ITEM_NAME_DATA[itemType];
        let name = namePool[Math.floor(Math.random() * namePool.length)];
        return itemFactory.item(
            name,
            itemType as any,
            "common"
        );
    }

}

// Helper function to connect two nodes bidirectionally
function connectNodes(
    edgeFactory: IEdgeFactory,
    node1: IWorldNode,
    node2: IWorldNode,
    distance: number
) {
    const edge1 = edgeFactory.edge(node1, node2, distance);
    node1.outEdges.push(edge1);
    const edge2 = edgeFactory.edge(node2, node1, distance);
    node2.outEdges.push(edge2);
}
