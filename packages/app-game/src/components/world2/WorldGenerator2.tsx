import { NameGenerator } from "../../ai/NameGenerator";
import { ICharacterGear, ICharacterHealth, INonPlayerCharacter, IQuest, IWorldEdge, IWorldItem, IWorldNode, WorldNodeLevel } from "../../context/World.context";
import { QuestDifficultyCalculator } from "../../model/QuestDifficultyCalculator";
import { WorldConsumableEffectType, WorldItemTier, WorldItemType, WorldNodeAreaType, WorldNodeBuildingType, WorldNodeHumidity, WorldNodeRoomType, WorldNodeSettlementType, WorldNodeStreetType, WorldNodeTemperature, WorldNodeWildernessType, WorldNpcBackground, WorldNpcPersonalityTrait, WorldNpcQuestDifficulty, WorldNpcQuestType, WorldNpcRace, WorldNpcStance, WorldPlayerHealth, WorldWeaponType, WorldWearableEffectActivation, WorldWearableEffectType, WorldWearableType } from "../../model/world.enums";
import { shuffleArray } from "../../utils/shuffleArray";
import { IEdgeFactory } from "../world/api/EdgeFactory";
import { IItemFactory } from "../world/api/ItemFactory";
import { INodeFactory } from "../world/api/NodeFactory";
import { INpcFactory } from "../world/api/NpcFactory";

export type NodePopulatorType =
    | "children"
    | "item"
    | "npc"
    | "quest";

type OneOfAttr<T> = T | Array<T> | { oneOf: Array<T> };
type MinMaxAttr = { min: number, max: number };

export interface INodeChildrenPopulator {
    id: string;
    populatorType: "children";
    type: OneOfAttr<WorldNodeAreaType>;
    name: OneOfAttr<string>;
    building?: {
        buildingType: OneOfAttr<WorldNodeBuildingType>;
    };
    room?: {
        roomType: OneOfAttr<WorldNodeRoomType>;
    };
    street?: {
        streetType: OneOfAttr<WorldNodeStreetType>;
    };
    settlement?: {
        settlementType: OneOfAttr<WorldNodeSettlementType>;
    };
    wilderness?: {
        wildernessType: OneOfAttr<WorldNodeWildernessType>;
    };
    temperature: "same" | OneOfAttr<WorldNodeTemperature>;
    humidity: "same" | OneOfAttr<WorldNodeHumidity>;
    distance: OneOfAttr<number> | MinMaxAttr;
    labels?: Array<string>;
}

export type INodeItemWearableEffectSpec = {
    name: OneOfAttr<string>;
    type: OneOfAttr<WorldWearableEffectType>;
    activation: OneOfAttr<WorldWearableEffectActivation>;
    value?: OneOfAttr<number> | MinMaxAttr;
    probability?: number;
}

export type INodeItemConsumableEffectSpec = {
    name: OneOfAttr<string>;
    type: OneOfAttr<WorldConsumableEffectType>;
    value?: OneOfAttr<number> | MinMaxAttr;
    probability?: number;
}

export interface INodeItemSpec {
    type: OneOfAttr<WorldItemType>;
    tier: OneOfAttr<WorldItemTier>;
    name: OneOfAttr<string>;
    noAi?: boolean;
    weapon?: {
        weaponType: OneOfAttr<WorldWeaponType>;
        damage: OneOfAttr<number> | MinMaxAttr;
        effects?: Array<INodeItemWearableEffectSpec>;
    };
    armor?: {
        defense: OneOfAttr<number> | MinMaxAttr;
        effects?: Array<INodeItemWearableEffectSpec>;
    };
    wearable?: {
        wearableType: WorldWearableType | Array<WorldWearableType>;
        defense: OneOfAttr<number> | MinMaxAttr;
        effects?: Array<INodeItemWearableEffectSpec>;
    };
    helmet?: {
        defense: OneOfAttr<number> | MinMaxAttr;
        effects?: Array<INodeItemWearableEffectSpec>;
    };
    boots?: {
        defense: OneOfAttr<number> | MinMaxAttr;
        effects?: Array<INodeItemWearableEffectSpec>;
    };
    consumable?: {
        effects: Array<INodeItemConsumableEffectSpec>;
    };
    static?: boolean;
    probability?: number;
    contains?: Array<INodeItemSpec>;
    lootable?: boolean;
    oneOf?: Array<INodeItemSpec> | Array<string>;
    labels?: Array<string>;
}

export interface INodeItemPopulator extends INodeItemSpec {
    id: string;
    populatorType: "item";
}

export interface INodeNpcPopulator {
    id: string;
    populatorType: "npc";
    name: OneOfAttr<string>;
    race: OneOfAttr<WorldNpcRace>;
    stance: OneOfAttr<WorldNpcStance>;
    health: {
        status: OneOfAttr<WorldPlayerHealth>;
        points: OneOfAttr<number> | MinMaxAttr;
        max: OneOfAttr<number> | MinMaxAttr;
    }
    inventory?: {
        gold?: OneOfAttr<number> | MinMaxAttr;
        items?: Array<INodeItemSpec> | Array<string>;
    };
    gear?: {
        armor?: INodeItemSpec | string | null;
        helmet?: INodeItemSpec | string | null;
        boots?: INodeItemSpec | string | null;
        weapon?: INodeItemSpec | string | null;
        wearable?: INodeItemSpec | string | null;
    };
    personality?: {
        traits: Array<WorldNpcPersonalityTrait>;
        background: OneOfAttr<WorldNpcBackground>;
    };
    labels?: Array<string>;
    quests?: Array<string>;
    oneOf?: Array<INodeNpcPopulator> | Array<string>;
}

export interface IQuestPopulator {
    id: string;
    populatorType: "quest";
    type: OneOfAttr<WorldNpcQuestType>;
    difficulty: OneOfAttr<WorldNpcQuestDifficulty>;
    deliver?: {
        item: OneOfAttr<string>;
    }
    reward?: {
        gold?: OneOfAttr<number> | MinMaxAttr;
        items?: Array<string>;
    }
}

export type INodePopulator = INodeChildrenPopulator
    | INodeItemPopulator
    | INodeNpcPopulator
    | IQuestPopulator;

export interface INodeRuleMatcher {
    hasType?: WorldNodeAreaType;
    hasLabel?: string;
    building?: {
        hasBuildingType: WorldNodeBuildingType;
    };
    room?: {
        hasRoomType: WorldNodeRoomType;
    };
    street?: {
        hasStreetType: WorldNodeStreetType;
    };
    settlement?: {
        hasSettlementType: WorldNodeSettlementType;
    };
    wilderness?: {
        hasWildernessType: WorldNodeWildernessType;
    };
    ancestor?: INodeRuleMatcher;
}

export interface INodePopulatorRule extends INodeRuleMatcher {
    id: string;
    apply: OneOfAttr<string>;
    count: MinMaxAttr;
    depth?: MinMaxAttr;
    probability?: number;
}

export interface IGeneratedWorldNode {
    node: IWorldNode;
    depth: number;
    generatedBy: INodePopulatorRule;
}

const TERMINAL_NODE_TYPES = [
    "wilderness"
];
const MAX_ROUNDS = 10;

function attributeChoice<T>(
    attr: OneOfAttr<T> | MinMaxAttr | T
): T {
    if (Array.isArray(attr)) {
        return attr[Math.floor(Math.random() * attr.length)];
    } else if (typeof attr === "object" && "oneOf" in attr && attr.oneOf) {
        return attr.oneOf[Math.floor(Math.random() * attr.oneOf.length)];
    } else if (typeof attr === "object" && "min" in attr && "max" in attr) {
        return ((attr.min as number) + Math.floor(Math.random() * ((attr.max as number) - (attr.min as number) + 1))) as any as T;
    }
    return attr as T;
}

const NPC_KNOWLEDGE_TYPES = ["item", "npc", "location"];








const findClosestMatchingNode = (startNode: IWorldNode, pred: (node: IWorldNode) => boolean) => {
    const visited = new Set<number>();
    const queue = [startNode];
    visited.add(startNode.id);

    while (queue.length > 0) {
        const node = queue.shift()!;
        if (pred(node)) {
            return node;
        }

        for (const edge of node.outEdges) {
            if (!visited.has(edge.to.id)) {
                queue.push(edge.to);
                visited.add(edge.to.id);
            }
        }
    }

    return null;
}

const allNpcsInVillage = (startNode: IWorldNode) => {
    const result: Array<INonPlayerCharacter> = [];
    const resultIds = new Set<number>();

    // First, we find the closest village node
    const closestVillage = findClosestMatchingNode(startNode, (node) => node.settlement?.settlementType === "village");

    // Visit everything from the closest village
    const queue = [closestVillage];
    const visited = new Set<number>([closestVillage.id]);

    while (queue.length > 0) {
        const node = queue.shift()!;

        for (const npc of node.npcs) {
            if (!resultIds.has(npc.id)) {
                result.push(npc);
                resultIds.add(npc.id);
            }
        }

        for (const edge of node.outEdges) {

            if (edge.to.type === "wilderness") {
                // Don't venture out of the village
                continue;
            }

            if (!visited.has(edge.to.id)) {
                queue.push(edge.to);
                visited.add(edge.to.id);
            }
        }
    }

    return result;
};

const allItemsInVillage = (startNode: IWorldNode) => {
    const result: Array<{ item: IWorldItem, location: IWorldNode }> = [];
    const resultIds = new Set<number>();

    // First, we find the closest village node
    const closestVillage = findClosestMatchingNode(startNode, (node) => node.settlement?.settlementType === "village");

    // Visit everything from the closest village
    const queue = [closestVillage];
    const visited = new Set<number>([closestVillage.id]);

    while (queue.length > 0) {
        const node = queue.shift()!;

        for (const item of node.items) {
            if (!resultIds.has(item.id)) {
                result.push({ item, location: node });
                resultIds.add(item.id);
            }
        }

        for (const edge of node.outEdges) {

            if (edge.to.type === "wilderness") {
                // Don't venture out of the village
                continue;
            }

            if (!visited.has(edge.to.id)) {
                queue.push(edge.to);
                visited.add(edge.to.id);
            }
        }
    }

    return result;
};

const allLocationsInVillage = (startNode: IWorldNode) => {
    const result: Array<IWorldNode> = [];
    const resultIds = new Set<number>();

    // First, we find the closest village node
    const closestVillage = findClosestMatchingNode(startNode, (node) => node.settlement?.settlementType === "village");

    // Visit everything from the closest village
    const queue = [closestVillage];
    const visited = new Set<number>([closestVillage.id]);

    while (queue.length > 0) {
        const node = queue.shift()!;

        if (!resultIds.has(node.id)) {
            result.push(node);
            resultIds.add(node.id);
        }

        for (const edge of node.outEdges) {

            if (edge.to.type === "wilderness") {
                // Don't venture out of the village
                continue;
            }

            if (!visited.has(edge.to.id)) {
                queue.push(edge.to);
                visited.add(edge.to.id);
            }
        }
    }

    return result;
};

const allNpcsInRadius = (startNode: IWorldNode, radius: number) => {
    const result: Array<INonPlayerCharacter> = [];
    const resultIds = new Set<number>();

    const queue = [{ node: startNode, distance: 0 }];
    const visited = new Set<number>([startNode.id]);

    while (queue.length > 0) {
        const { node, distance } = queue.shift()!;

        for (const npc of node.npcs) {
            if (!resultIds.has(npc.id)) {
                result.push(npc);
                resultIds.add(npc.id);
            }
        }

        for (const edge of node.outEdges) {

            if (distance + edge.distance > radius) {
                continue;
            }

            if (!visited.has(edge.to.id)) {
                queue.push({ node: edge.to, distance: distance + edge.distance });
                visited.add(edge.to.id);
            }
        }
    }

    return result;
};

const allItemsInRadius = (startNode: IWorldNode, radius: number) => {
    const result: Array<{ item: IWorldItem, location: IWorldNode }> = [];
    const resultIds = new Set<number>();

    const queue = [{ node: startNode, distance: 0 }];
    const visited = new Set<number>([startNode.id]);

    while (queue.length > 0) {
        const { node, distance } = queue.shift()!;

        for (const item of node.items) {
            if (!resultIds.has(item.id)) {
                result.push({ item, location: node });
                resultIds.add(item.id);
            }
        }

        for (const edge of node.outEdges) {

            if (distance + edge.distance > radius) {
                continue;
            }

            if (!visited.has(edge.to.id)) {
                queue.push({ node: edge.to, distance: distance + edge.distance });
                visited.add(edge.to.id);
            }
        }
    }

    return result;
};

const allLocationsInRadius = (startNode: IWorldNode, radius: number) => {
    const result: Array<IWorldNode> = [];
    const resultIds = new Set<number>();

    const queue = [{ node: startNode, distance: 0 }];
    const visited = new Set<number>([startNode.id]);

    while (queue.length > 0) {
        const { node, distance } = queue.shift()!;

        if (!resultIds.has(node.id)) {
            result.push(node);
            resultIds.add(node.id);
        }

        for (const edge of node.outEdges) {

            if (distance + edge.distance > radius) {
                continue;
            }

            if (!visited.has(edge.to.id)) {
                queue.push({ node: edge.to, distance: distance + edge.distance });
                visited.add(edge.to.id);
            }
        }
    }

    return result;
};

export class WorldGenerator2 implements INodeFactory, IEdgeFactory, IItemFactory, INpcFactory {

    private _rootNode: IWorldNode | null = null;
    private itemIdCounter: number = 0;
    private npcIdCounter: number = 0;
    private nodeIdCounter: number = 0;
    private edgeIdCounter: number = 0;
    private questIdCounter: number = 0;

    constructor(
        private populators: Array<INodePopulator>,
        private rules: Array<INodePopulatorRule>
    ) { }

    node(
        name: string,
        type: WorldNodeAreaType,
        details: {
            level?: WorldNodeLevel,
            temperature: WorldNodeTemperature,
            humidity: WorldNodeHumidity,
            building?: {
                buildingType: WorldNodeBuildingType;
            },
            room?: {
                roomType: WorldNodeRoomType
            },
            street?: {
                streetType: WorldNodeStreetType;
            },
            settlement?: {
                settlementType: WorldNodeSettlementType;
            },
            wilderness?: {
                wildernessType: WorldNodeWildernessType;
            },
        }
    ): IWorldNode {
        const newNode = {
            id: this.nodeIdCounter++,
            name: name,
            type: type,
            hierarchy: [],
            labels: [],
            level: details.level,
            temperature: details.temperature,
            humidity: details.humidity,
            outEdges: [],
            items: [],
            npcs: [],
            building: details.building,
            room: details.room,
            street: details.street,
            settlement: details.settlement,
            wilderness: details.wilderness,
        };
        return newNode;
    }

    edge(from: IWorldNode, to: IWorldNode, distance: number): IWorldEdge {
        const newEdge = {
            id: this.edgeIdCounter++,
            from: from,
            to: to,
            distance: distance,
            labels: [],
            discovered: true // FIXME ???
        };
        return newEdge;
    }

    item(name: string, type: WorldItemType, tier: WorldItemTier): IWorldItem {
        return {
            id: this.itemIdCounter++,
            name,
            type,
            tier,
            labels: [],
            contains: [],
            destroyed: false,
            static: false,
            lootable: true,
            tradeValue: tier === "garbage"
                ? 0
                : tier === "common"
                    ? (1 + Math.floor(10 * Math.random()))
                    : tier === "rare"
                        ? (10 + Math.floor(100 * Math.random()))
                        : tier === "epic"
                            ? (100 + Math.floor(1000 * Math.random()))
                            : tier === "legendary"
                                ? (1000 + Math.floor(10000 * Math.random()))
                                : 1
        };
    }

    npc(name: string, race: WorldNpcRace, location: IWorldNode): INonPlayerCharacter {
        return {
            id: this.npcIdCounter++,
            name,
            race,
            location,
            stance: "neutral",
            labels: [],
            health: {
                status: "healthy",
                points: 100,
                max: 100
            },
            inventory: {
                gold: 0,
                items: []
            },
            gear: {
                armor: null,
                helmet: null,
                boots: null,
                weapon: null,
                wearable: null
            },
            personality: {
                traits: [],
                background: "peasant"
            },
            knowledge: [],
            activeQuest: null,
            nextQuest: null,
            possibleQuests: [],
            itemValueOpinions: {},
        };
    }

    private randomItemInRadius(
        node: IWorldNode,
        maxRadius: number
    ) {

        let currentNode = node;
        for (let i = 0; i < maxRadius; i++) {
            const edges = currentNode.outEdges;
            if (edges.length === 0) {
                break;
            }
            const edge = edges[Math.floor(Math.random() * edges.length)];
            currentNode = edge.to;
        }

        return { item: currentNode.items[Math.floor(Math.random() * currentNode.items.length)], location: currentNode };

    }

    private randomNpcInRadius(
        node: IWorldNode,
        maxRadius: number
    ) {

        let currentNode = node;
        for (let i = 0; i < maxRadius; i++) {
            const edges = currentNode.outEdges;
            if (edges.length === 0) {
                break;
            }
            const edge = edges[Math.floor(Math.random() * edges.length)];
            currentNode = edge.to;
        }

        return currentNode.npcs[Math.floor(Math.random() * currentNode.npcs.length)];

    }

    private randomLocationInRadius(
        node: IWorldNode,
        maxRadius: number
    ) {

        let currentNode = node;
        for (let i = 0; i < maxRadius; i++) {
            const edges = currentNode.outEdges;
            if (edges.length === 0) {
                break;
            }
            const edge = edges[Math.floor(Math.random() * edges.length)];
            currentNode = edge.to;
        }

        return currentNode;

    }

    private distanceTo(
        from: IWorldNode,
        to: IWorldNode
    ) {
        const visited = new Set<number>();
        const queue = [{ node: from, distance: 0 }];
        visited.add(from.id);

        while (queue.length > 0) {
            const { node, distance } = queue.shift()!;
            if (node.id === to.id) {
                return distance;
            }

            for (const edge of node.outEdges) {
                if (!visited.has(edge.to.id)) {
                    queue.push({ node: edge.to, distance: distance + edge.distance });
                    visited.add(edge.to.id);
                }
            }
        }

        return Infinity;
    }

    private postProcessNode(node: IWorldNode) {

        const villageNpcs = allNpcsInVillage(node);
        const closebyItems = allItemsInRadius(node, 2)
            .filter(item => item.item.tier !== "common" && item.item.tier !== "garbage");
        const closebyLocations = allLocationsInRadius(node, 2);
        const allNpcsWithin50 = allNpcsInRadius(node, 50)
            .filter(npc => npc.stance === "friendly");
        const allNpcsWithin150 = allNpcsInRadius(node, 150)
            .filter(npc => npc.stance === "friendly");
        const allLocationsWithin150 = allLocationsInRadius(node, 150);

        for (const npc of node.npcs) {

            if (npc.stance !== "friendly") {
                continue;
            }

            npc.knowledge = [];

            // Generate knowledge for the NPC

            // New knowledge works like this:
            // Everyone has knowledge of every NPC within their village
            // Everyone has knowledge of items within a range of 10
            // Everyone has knowledge of locations within a range of 10
            // Everyone has knowledge of max. 10 random NPCs within a range of 50
            // Everyone has knowledge of max. 3 random NPCs within a range of 150
            // Everyone has knowledge of max. 10 random wilderness/building locations within a range of 150

            // Everyone has knowledge of the place they are in
            npc.knowledge.push({
                location: node,
                distance: 0
            });

            // Everyone has knowledge of 10% of the NPCs in their village
            for (const villageNpc of shuffleArray(villageNpcs).slice(0, Math.ceil(villageNpcs.length * 0.1))) {
                if (!npc.knowledge.some(k => k.npc?.id === villageNpc.id)) {
                    npc.knowledge.push({
                        npc: villageNpc,
                        npcLocation: villageNpc.location,
                        distance: this.distanceTo(node, villageNpc.location)
                    });
                }
            }

            // Everyone has knowledge of items within a range of 2
            for (const itemAndLoc of closebyItems) {
                const { item, location } = itemAndLoc;
                if (!npc.knowledge.some(k => k.item?.id === item.id)) {
                    npc.knowledge.push({
                        item,
                        itemLocation: location,
                        distance: this.distanceTo(node, location)
                    });
                }
            }

            // Everyone has knowledge of locations within a range of 2
            for (const location of closebyLocations) {
                if (!npc.knowledge.some(k => k.location?.id === location.id)) {
                    npc.knowledge.push({
                        location,
                        distance: this.distanceTo(node, location)
                    });
                }
            }

            // Everyone has knowledge of max. 5 random NPCs within a range of 50
            const random10Npcs = shuffleArray(allNpcsWithin50).slice(0, 3);
            for (const n of random10Npcs) {
                if (!npc.knowledge.some(k => k.npc?.id === n.id)) {
                    npc.knowledge.push({
                        npc: n,
                        npcLocation: n.location,
                        distance: this.distanceTo(node, n.location)
                    });
                }
            }

            // Everyone has knowledge of max. 5 random NPCs within a range of 150
            const random3Npcs = shuffleArray(allNpcsWithin150).slice(0, 3);
            for (const n of random3Npcs) {
                if (!npc.knowledge.some(k => k.npc?.id === n.id)) {
                    npc.knowledge.push({
                        npc: n,
                        npcLocation: n.location,
                        distance: this.distanceTo(node, n.location)
                    });
                }
            }

            // Everyone has knowledge of max. 5 random wilderness/building locations within a range of 150
            const random10Locations = shuffleArray(
                allLocationsWithin150.filter(
                    loc => loc.type === "wilderness" || loc.type === "building"
                )
            ).slice(0, 3);
            for (const loc of random10Locations) {
                if (!npc.knowledge.some(k => k.location?.id === loc.id)) {
                    npc.knowledge.push({
                        location: loc,
                        distance: this.distanceTo(node, loc)
                    });
                }
            }

        }

    }

    private walk(
        visitor: (node: IWorldNode) => void,
    ) {
        const visited = new Set<number>();
        const queue = [this._rootNode];
        visited.add(this._rootNode.id);

        while (queue.length > 0) {
            const node = queue.shift();
            if (!node) {
                continue;
            }

            visitor(node);

            for (const edge of node.outEdges) {
                if (!visited.has(edge.to.id)) {
                    queue.push(edge.to);
                    visited.add(edge.to.id);
                }
            }
        }
    }


    private generateWearableEffectsFromSpecs = (specs: Array<INodeItemWearableEffectSpec>) => {
        const resultEffects: Array<{ name: string, type: WorldWearableEffectType, activation: WorldWearableEffectActivation, value: number }> = [];
        for (const effectSpec of specs) {
            const effect: any = {
                name: attributeChoice(effectSpec.name),
                type: attributeChoice(effectSpec.type),
                activation: attributeChoice(effectSpec.activation)
            };
            if (typeof effectSpec.value === "number") {
                effect.value = effectSpec.value;
            }
            if (Array.isArray(effectSpec.value)) {
                effect.value = effectSpec.value[Math.floor(Math.random() * effectSpec.value.length)];
            }
            if (typeof effectSpec.probability === "number") {
                const roll = Math.random();
                if (roll > effectSpec.probability) {
                    continue;
                }
            }
            if (effect.type === "destroy-item") {
                effect.value = undefined;
            }
            resultEffects.push(effect);
        }
        return resultEffects;
    };

    private generateConsumableEffectsFromSpecs = (specs: Array<INodeItemConsumableEffectSpec>) => {
        const resultEffects: Array<{ name: string, type: WorldConsumableEffectType, value: number }> = [];
        for (const effectSpec of specs) {
            const effect: any = {
                name: attributeChoice(effectSpec.name),
                type: attributeChoice(effectSpec.type)
            };
            if (typeof effectSpec.value === "number") {
                effect.value = effectSpec.value;
            }
            if (Array.isArray(effectSpec.value)) {
                effect.value = effectSpec.value[Math.floor(Math.random() * effectSpec.value.length)];
            }
            if (typeof effectSpec.probability === "number") {
                const roll = Math.random();
                if (roll > effectSpec.probability) {
                    continue;
                }
            }
            if (effect.type === "destroy-enemy-item"
                || effect.type === "restore-hunger"
                || effect.type === "restore-thirst"
                || effect.type === "learn-skill") {
                effect.value = undefined;
            }
            resultEffects.push(effect);
        }
        return resultEffects;
    };

    private generateItemsFromSpecs: (specs: Array<INodeItemSpec | string>) => Array<IWorldItem> = (specs) => {
        const resultItems: Array<IWorldItem> = [];

        specLoop:
        for (const inputSpec of specs) {

            let spec = inputSpec;

            do {

                let didResolve = false;

                if (typeof spec === "object" && spec.oneOf && spec.oneOf.length > 0) {
                    spec = spec.oneOf[Math.floor(Math.random() * spec.oneOf.length)] as any;
                    didResolve = true;
                }

                if (Array.isArray(spec)) {
                    spec = spec[Math.floor(Math.random() * spec.length)] as any;
                    didResolve = true;
                }

                if (typeof spec === "string") {
                    spec = this.populators.find(p => p.id === spec) as any as INodeItemSpec;
                    if (!spec) {
                        console.warn("[WorldGenerator2] Could not find item populator with id", spec);
                        continue specLoop;
                    }

                }

                if (!spec) {
                    console.warn("[WorldGenerator2] Could not find spec for inputSpec", inputSpec);
                    continue specLoop;
                }

                if (!didResolve) {
                    break;
                }

            } while (true);

            if (typeof spec.probability === "number") {
                const roll = Math.random();
                if (roll > spec.probability) {
                    continue;
                }
            }

            const newItem = this.item(
                attributeChoice(spec.name),
                attributeChoice(spec.type),
                attributeChoice(spec.tier)
            );

            if (spec.static) {
                newItem.static = true;
            }

            if (spec.noAi) {
                newItem.details = {
                    description: ""
                };
            }

            if (typeof spec.lootable === "boolean") {
                newItem.lootable = spec.lootable;
            }

            if (spec.weapon) {
                newItem.weapon = {
                    weaponType: attributeChoice(spec.weapon.weaponType),
                    damage: attributeChoice(spec.weapon.damage)
                };
                if (spec.weapon.effects) {
                    newItem.weapon.effects = this.generateWearableEffectsFromSpecs(spec.weapon.effects);
                }
            }

            if (spec.armor) {
                newItem.armor = {
                    defense: attributeChoice(spec.armor.defense)
                };
                if (spec.armor.effects) {
                    newItem.armor.effects = this.generateWearableEffectsFromSpecs(spec.armor.effects);
                }
            }

            if (spec.wearable) {
                newItem.wearable = {
                    wearableType: attributeChoice(spec.wearable.wearableType),
                    defense: attributeChoice(spec.wearable.defense)
                };
                if (spec.wearable.effects) {
                    newItem.wearable.effects = this.generateWearableEffectsFromSpecs(spec.wearable.effects);
                }
            }

            if (spec.helmet) {
                newItem.helmet = {
                    defense: attributeChoice(spec.helmet.defense)
                };
                if (spec.helmet.effects) {
                    newItem.helmet.effects = this.generateWearableEffectsFromSpecs(spec.helmet.effects);
                }
            }

            if (spec.boots) {
                newItem.boots = {
                    defense: attributeChoice(spec.boots.defense)
                };
                if (spec.boots.effects) {
                    newItem.boots.effects = this.generateWearableEffectsFromSpecs(spec.boots.effects);
                }
            }

            if (spec.consumable) {
                newItem.consumable = {
                    effects: this.generateConsumableEffectsFromSpecs(spec.consumable.effects)
                };
            }

            resultItems.push(newItem);

            if (spec.contains) {
                const containsItems = this.generateItemsFromSpecs(spec.contains);
                newItem.contains.push(...containsItems);
            }

        }

        return resultItems;
    };

    private generateItemFromPopulator = (populator: INodeItemPopulator) => {
        return [...this.generateItemsFromSpecs([populator])];
    };

    public generateItemFrom(id: string) {
        const populator = this.populators.find(p => p.id === id) as INodeItemPopulator;
        return this.generateItemFromPopulator(populator);
    }

    public generateQuestFor(
        playerGear: ICharacterGear,
        playerHealth: ICharacterHealth,
        playerLocation: IWorldNode,
        npc: INonPlayerCharacter
    ) {

        const questPopulatorId = npc.possibleQuests[Math.floor(Math.random() * npc.possibleQuests.length)];
        const populator = this.populators.find(p => p.id === questPopulatorId) as IQuestPopulator;

        const result: IQuest = {
            id: this.questIdCounter++,
            type: attributeChoice(populator.type),
            difficulty: "impossible",
        };

        if (result.type === "deliver") {

            const chosenItemPopulatorId = attributeChoice(populator.deliver!.item);
            const chosenItemPopulator = this.populators.find(p => p.id === chosenItemPopulatorId) as INodeItemPopulator;
            const item = this.generateItemFromPopulator(chosenItemPopulator)[0];
            const knownNpcs = npc.knowledge.filter(k => !!k.npc).map(k => k.npc!);

            result.deliver = {
                item,
                recipient: knownNpcs[Math.floor(Math.random() * knownNpcs.length)]
            };

        } else if (result.type === "talk-to") {

            const knownNpcs = npc.knowledge.filter(k => !!k.npc).map(k => k.npc!);

            result.talkTo = {
                npc: knownNpcs[Math.floor(Math.random() * knownNpcs.length)],
                didTalk: false
            };

        } else if (result.type === "find-location") {

            const knownLocations = npc.knowledge.filter(k => !!k.location).map(k => k.location!);

            result.findLocation = {
                location: knownLocations[Math.floor(Math.random() * knownLocations.length)],
                didVisit: false
            };

        } else if (result.type === "kill") {

            const allEnemyWithin50 = allNpcsInRadius(playerLocation, 50)
                .filter(n => n.stance === "hostile");

            result.kill = {
                npc: allEnemyWithin50[Math.floor(Math.random() * allEnemyWithin50.length)],
                didKill: false
            };

        }

        if (populator.reward) {
            result.reward = {
                gold: typeof populator.reward.gold !== "undefined"
                    ? attributeChoice(populator.reward.gold)
                    : undefined,
                items: typeof populator.reward.items !== "undefined"
                    ? this.generateItemsFromSpecs(populator.reward.items)
                    : []
            };
        }

        result.difficulty = new QuestDifficultyCalculator().calculate(
            {
                gear: playerGear,
                health: playerHealth,
                location: playerLocation,
            },
            result
        );

        return result;
    }

    async generate(): Promise<Array<IWorldNode>> {

        const rootNode = this.node(
            "Middle of the World",
            "root",
            {
                temperature: "scorching",
                humidity: "dry",
            }
        );
        this._rootNode = rootNode;

        const appliedSet = new Set<string>();

        const appliedSetKey = (node: IWorldNode, rule: INodePopulatorRule) => {
            return `${node.id}::::${rule.id}`;
        };

        const generatedNodes: Array<IGeneratedWorldNode> = [{
            node: rootNode,
            depth: 0,
            generatedBy: null
        }];
        let roundCount = 0;

        const applyChildrenPopulator = (opts: { generatedNode: IGeneratedWorldNode, rule: INodePopulatorRule, populator: INodeChildrenPopulator, key: string }) => {
            const { generatedNode, populator, rule, key } = opts;
            const { node } = generatedNode;
            let childCount = Math.floor(Math.random() * (rule.count.max - rule.count.min + 1)) + rule.count.min;

            if (typeof opts.rule.probability === "number") {
                const roll = Math.random();
                if (roll > opts.rule.probability) {
                    childCount = 0;
                }
            }

            for (let i = 0; i < childCount; i++) {

                const newNode = this.node(
                    attributeChoice(populator.name),
                    attributeChoice(populator.type),
                    {
                        temperature: populator.temperature === "same"
                            ? node.temperature
                            : attributeChoice(populator.temperature),
                        humidity: populator.humidity === "same"
                            ? node.humidity
                            : attributeChoice(populator.humidity),
                        building: populator.building
                            ? { buildingType: attributeChoice(populator.building.buildingType) }
                            : undefined,
                        room: populator.room
                            ? { roomType: attributeChoice(populator.room.roomType) }
                            : undefined,
                        street: populator.street
                            ? { streetType: attributeChoice(populator.street.streetType) }
                            : undefined,
                        settlement: populator.settlement
                            ? { settlementType: attributeChoice(populator.settlement.settlementType) }
                            : undefined,
                        wilderness: populator.wilderness
                            ? { wildernessType: attributeChoice(populator.wilderness.wildernessType) }
                            : undefined,
                    }
                );
                if (populator.labels) {
                    newNode.labels.push(...populator.labels);
                }
                newNode.ancestor = node;
                const newEdgeTo = this.edge(node, newNode, attributeChoice(populator.distance));
                const newEdgeFrom = this.edge(newNode, node, newEdgeTo.distance);
                node.outEdges.push(newEdgeTo);
                newNode.outEdges.push(newEdgeFrom);
                generatedNodes.push({
                    node: newNode,
                    depth: generatedNode.depth + 1,
                    generatedBy: rule
                });

            }

            appliedSet.add(key);

        };

        const applyItemPopulator = (opts: { generatedNode: IGeneratedWorldNode, rule: INodePopulatorRule, populator: INodeItemPopulator, key: string }) => {
            const { generatedNode, populator, rule, key } = opts;
            const { node } = generatedNode;
            let itemCount = Math.floor(Math.random() * (rule.count.max - rule.count.min + 1)) + rule.count.min;

            if (typeof opts.rule.probability === "number") {
                const roll = Math.random();
                if (roll > opts.rule.probability) {
                    itemCount = 0;
                }
            }

            for (let i = 0; i < itemCount; i++) {
                const generatedItems = this.generateItemsFromSpecs([populator]);
                node.items.push(...generatedItems);
            }

            appliedSet.add(key);

        };

        const applyNpcPopulator = async (opts: { generatedNode: IGeneratedWorldNode, rule: INodePopulatorRule, populator: INodeNpcPopulator | string, key: string }) => {
            let { generatedNode, populator, rule, key } = opts;

            if (typeof populator === "object" && populator.oneOf && populator.oneOf.length > 0) {
                populator = populator.oneOf[Math.floor(Math.random() * populator.oneOf.length)] as any;
            }

            if (typeof populator === "string") {
                populator = this.populators.find(p => p.id === populator) as any as INodeNpcPopulator;
            }

            const { node } = generatedNode;
            let npcCount = Math.floor(Math.random() * (rule.count.max - rule.count.min + 1)) + rule.count.min;

            if (typeof opts.rule.probability === "number") {
                const roll = Math.random();
                if (roll > opts.rule.probability) {
                    npcCount = 0;
                }
            }

            for (let i = 0; i < npcCount; i++) {
                const newNpc = this.npc(
                    attributeChoice(populator.name),
                    attributeChoice(populator.race),
                    node
                );

                // FIXME
                if (newNpc.race === "human" || newNpc.race === "elf" || newNpc.race === "dwarf") {
                    newNpc.name = await (new NameGenerator().generate());
                }

                if (populator.stance) {
                    newNpc.stance = attributeChoice(populator.stance);
                }

                if (populator.health) {
                    newNpc.health = {
                        status: attributeChoice(populator.health.status),
                        points: attributeChoice(populator.health.points),
                        max: attributeChoice(populator.health.max)
                    };
                }

                if (populator.inventory) {
                    newNpc.inventory = {
                        gold: typeof populator.inventory.gold !== "undefined"
                            ? attributeChoice(populator.inventory.gold)
                            : 0,
                        items: []
                    };

                    if (populator.inventory.items) {
                        const generatedItems = this.generateItemsFromSpecs(
                            populator.inventory.items.map(
                                itemSpec => typeof itemSpec === "string"
                                    ? this.populators.find(p => p.id === itemSpec)
                                    : itemSpec
                            )
                        );
                        newNpc.inventory.items.push(...generatedItems);
                    }
                }

                if (populator.gear) {
                    newNpc.gear = {
                        armor: populator.gear.armor
                            ? this.generateItemsFromSpecs([
                                typeof populator.gear.armor === "string"
                                    ? this.populators.find(p => p.id === populator.gear.armor) as any
                                    : populator.gear.armor
                            ])[0]
                            : null,
                        helmet: populator.gear.helmet
                            ? this.generateItemsFromSpecs([
                                typeof populator.gear.helmet === "string"
                                    ? this.populators.find(p => p.id === populator.gear.helmet) as any
                                    : populator.gear.helmet
                            ])[0]
                            : null,
                        boots: populator.gear.boots
                            ? this.generateItemsFromSpecs([
                                typeof populator.gear.boots === "string"
                                    ? this.populators.find(p => p.id === populator.gear.boots) as any
                                    : populator.gear.boots
                            ])[0]
                            : null,
                        weapon: populator.gear.weapon
                            ? this.generateItemsFromSpecs([
                                typeof populator.gear.weapon === "string"
                                    ? this.populators.find(p => p.id === populator.gear.weapon) as any
                                    : populator.gear.weapon
                            ])[0]
                            : null,
                        wearable: populator.gear.wearable
                            ? this.generateItemsFromSpecs([
                                typeof populator.gear.wearable === "string"
                                    ? this.populators.find(p => p.id === populator.gear.wearable) as any
                                    : populator.gear.wearable
                            ])[0]
                            : null,
                    };
                }

                if (populator.personality) {
                    newNpc.personality = {
                        traits: shuffleArray(populator.personality.traits).slice(0, 3),
                        background: attributeChoice(populator.personality.background)
                    };
                }

                if (populator.labels) {
                    newNpc.labels.push(...populator.labels);
                }

                if (populator.quests) {
                    newNpc.possibleQuests.push(
                        ...populator.quests
                    );
                }

                node.npcs.push(newNpc);

            }

            appliedSet.add(key);

        }

        const canApplyTo = (node: IWorldNode, matcher: INodeRuleMatcher) => {

            const canApplyByHasType = !matcher.hasType || matcher.hasType === node.type;
            const canApplyByHasLabel = !matcher.hasLabel || node.labels.includes(matcher.hasLabel);
            const canApplyByBuilding = !matcher.building || matcher.building.hasBuildingType === node.building?.buildingType;
            const canApplyByRoom = !matcher.room || matcher.room.hasRoomType === node.room?.roomType;
            const canApplyByStreet = !matcher.street || matcher.street.hasStreetType === node.street?.streetType;
            const canApplyBySettlement = !matcher.settlement || matcher.settlement.hasSettlementType === node.settlement?.settlementType;
            const canApplyByWilderness = !matcher.wilderness || matcher.wilderness.hasWildernessType === node.wilderness?.wildernessType;
            const canApplyByAncestor = !matcher.ancestor || canApplyTo(node.ancestor, matcher.ancestor);

            const canApply = canApplyByHasType &&
                canApplyByBuilding &&
                canApplyByRoom &&
                canApplyByStreet &&
                canApplyBySettlement &&
                canApplyByWilderness &&
                canApplyByAncestor &&
                canApplyByHasLabel;

            return canApply;

        };

        const findApplicableChildrenRules = (generatedNode: IGeneratedWorldNode) => {
            const applicableChildrenRules: Array<{ generatedNode: IGeneratedWorldNode, rule: INodePopulatorRule, populator: INodePopulator, key: string }> = [];
            for (const rule of this.rules) {
                let populator: any = rule.apply;
                if (Array.isArray(rule.apply)) {
                    const randomPopulatorId = rule.apply[Math.floor(Math.random() * rule.apply.length)];
                    populator = this.populators.find(p => p.id === randomPopulatorId);
                } else if (typeof rule.apply === "object" && rule.apply.oneOf) {
                    const randomPopulatorId = rule.apply.oneOf[Math.floor(Math.random() * rule.apply.oneOf.length)];
                    populator = this.populators.find(p => p.id === randomPopulatorId);
                }
                populator = this.populators.find(p => p.id === populator) as INodePopulator;
                if (!populator) {
                    const setKey = appliedSetKey(generatedNode.node, rule);
                    appliedSet.add(setKey);
                    console.warn(`[WorldGenerator2] Populator not found for rule ${rule.id}: ${JSON.stringify(rule.apply)}`);
                    continue;
                }
                if (populator.populatorType !== "children") {
                    // We only care about children populators for now
                    continue;
                }

                const canApply = canApplyTo(generatedNode.node, rule);

                if (canApply) {
                    const setKey = appliedSetKey(generatedNode.node, rule);
                    if (!appliedSet.has(setKey)) {
                        applicableChildrenRules.push({ generatedNode, populator, rule, key: setKey });
                    }
                }
            }
            return applicableChildrenRules;
        };

        const findApplicableNonChildrenRules = (generatedNode: IGeneratedWorldNode) => {
            const applicableItemRules: Array<{ generatedNode: IGeneratedWorldNode, rule: INodePopulatorRule, populator: INodePopulator, key: string }> = [];
            for (const rule of this.rules) {
                let populator: any = rule.apply;
                if (Array.isArray(rule.apply)) {
                    const randomPopulatorId = rule.apply[Math.floor(Math.random() * rule.apply.length)];
                    populator = this.populators.find(p => p.id === randomPopulatorId);
                } else if (typeof rule.apply === "object" && rule.apply.oneOf) {
                    const randomPopulatorId = rule.apply.oneOf[Math.floor(Math.random() * rule.apply.oneOf.length)];
                    populator = this.populators.find(p => p.id === randomPopulatorId);
                }
                populator = this.populators.find(p => p.id === populator) as INodePopulator;
                if (!populator) {
                    const setKey = appliedSetKey(generatedNode.node, rule);
                    appliedSet.add(setKey);
                    console.warn(`[WorldGenerator2] Populator not found for rule ${rule.id}: ${JSON.stringify(rule.apply)}`);
                    continue;
                }
                if (populator.populatorType === "children") {
                    // We only care about non-children populators for now
                    continue;
                }
                const canApply = canApplyTo(generatedNode.node, rule);
                if (canApply) {
                    const setKey = appliedSetKey(generatedNode.node, rule);
                    if (!appliedSet.has(setKey)) {
                        applicableItemRules.push({ generatedNode, populator, rule, key: setKey });
                    }
                }
            }
            return applicableItemRules;
        };

        while (roundCount < MAX_ROUNDS) {

            // Find all applicable node - rule pairs
            const applicableChildrenRules = generatedNodes.flatMap(findApplicableChildrenRules);

            // Apply the rules
            for (const { generatedNode, populator, rule, key } of applicableChildrenRules) {
                if (populator.populatorType === "children") {

                    if (rule.depth && generatedNode.depth >= rule.depth.max) {
                        continue;
                    }

                    if (rule.depth && generatedNode.depth < rule.depth.min) {
                        continue;
                    }

                    applyChildrenPopulator({ generatedNode, rule, populator, key });
                }
            }

            roundCount++;
        }

        // Now we apply every children rule until we can, skipping terminal nodes
        while (true) {
            let appliedAnyRule = false;

            // Find all applicable node - rule pairs
            const applicableChildrenRules = generatedNodes.flatMap(findApplicableChildrenRules);

            // Apply the rules
            for (const { generatedNode, populator, rule, key } of applicableChildrenRules) {
                if (populator.populatorType === "children") {

                    if (rule.depth && generatedNode.depth >= rule.depth.max) {
                        continue;
                    }

                    if (rule.depth && generatedNode.depth < rule.depth.min) {
                        continue;
                    }

                    applyChildrenPopulator({ generatedNode, rule, populator, key });
                    appliedAnyRule = true;
                }
            }

            if (!appliedAnyRule) {
                break;
            }
        }

        // Apply any non-children rules, until we can
        while (true) {
            let appliedAnyRule = false;

            // Find all applicable node - rule pairs
            const applicableItemRules = generatedNodes.flatMap(findApplicableNonChildrenRules);

            // Apply the rules
            for (const { generatedNode, populator, rule, key } of applicableItemRules) {
                if (populator.populatorType === "item") {
                    applyItemPopulator({ generatedNode, rule, populator, key });
                    appliedAnyRule = true;
                } else if (populator.populatorType === "npc") {
                    await applyNpcPopulator({ generatedNode, rule, populator, key });
                    appliedAnyRule = true;
                }
            }

            if (!appliedAnyRule) {
                break;
            }
        }

        // Post-process nodes
        this.walk(this.postProcessNode.bind(this));

        console.log("[WorldGenerator2] Generated nodes:", generatedNodes.length, generatedNodes);

        return generatedNodes.map(gn => gn.node);

    }

}
