import { createContext, useContext } from "react";
import { Observable } from "rxjs";
import { WorldConsumableEffectType, WorldItemTier, WorldItemType, WorldNodeAreaType, WorldNodeBuildingType, WorldNodeHumidity, WorldNodeRoomType, WorldNodeSettlementType, WorldNodeStreetType, WorldNodeTemperature, WorldNodeWildernessType, WorldNpcBackground, WorldNpcGender, WorldNpcPersonalityTrait, WorldNpcQuestDifficulty, WorldNpcQuestType, WorldNpcRace, WorldNpcStance, WorldPlayerHealth, WorldWeaponType, WorldWearableEffectActivation, WorldWearableEffectType, WorldWearableType } from "../model/world.enums";

export interface IWorldItemDetails {
    description: string;
}

export interface IWearableItemEffect {
    name: string;
    details?: any;
    type: WorldWearableEffectType;
    activation: WorldWearableEffectActivation;
    value?: number;
}

export interface IConsumableItemEffect {
    name: string;
    details?: any;
    type: WorldConsumableEffectType;
    value?: number;
}

export interface IWorldItemWeaponCharacteristics {
    weaponType: WorldWeaponType;
    damage: number;
    effects?: Array<IWearableItemEffect>;
}

export interface IWorldItemArmorCharacteristics {
    defense: number;
    effects?: Array<IWearableItemEffect>;
}

export interface IWorldItemBootsCharacteristics {
    defense: number;
    effects?: Array<IWearableItemEffect>;
}

export interface IWorldItemHelmetCharacteristics {
    defense: number;
    effects?: Array<IWearableItemEffect>;
}

export interface IWorldItemWearableCharacteristics {
    wearableType: WorldWearableType;
    defense: number;
    effects?: Array<IWearableItemEffect>;
}

export interface IWorldItemConsumableCharacteristics {
    effects: Array<IConsumableItemEffect>;
}

export interface IWorldItem {
    id: number;
    name: string;
    type: WorldItemType;
    tier: WorldItemTier;
    labels: Array<string>;
    details?: IWorldItemDetails;
    contains?: Array<IWorldItem>;
    static?: boolean;
    destroyed?: boolean;
    weapon?: IWorldItemWeaponCharacteristics;
    armor?: IWorldItemArmorCharacteristics;
    boots?: IWorldItemBootsCharacteristics;
    helmet?: IWorldItemHelmetCharacteristics;
    wearable?: IWorldItemWearableCharacteristics;
    consumable?: IWorldItemConsumableCharacteristics;
    lootable?: boolean;
    tradeValue?: number;
}

export interface ICharacterInventory {
    gold: number;
    items: Array<IWorldItem>;
}

export interface ICharacterGear {
    armor?: IWorldItem | null;
    boots?: IWorldItem | null;
    helmet?: IWorldItem | null;
    weapon?: IWorldItem | null;
    wearable?: IWorldItem | null;
}

export interface INonPlayerCharacterPersonality {
    traits: Array<WorldNpcPersonalityTrait>;
    background: WorldNpcBackground;
}

export interface ICharacterHealth {
    status: WorldPlayerHealth;
    points: number;
    max: number;
}

export interface IKnowledge {
    item?: IWorldItem;
    itemLocation?: IWorldNode;
    location?: IWorldNode;
    npc?: INonPlayerCharacter;
    npcLocation?: IWorldNode;
    distance?: number;
}

export interface IDeliverQuestCharacteristics {
    item: IWorldItem;
    recipient: INonPlayerCharacter;
}

export interface ICollectQuestCharacteristics {
    // FIXME
    // items: Array<IWorldItemMatcher>;
}

export interface IFindLocationQuestCharacteristics {
    location: IWorldNode;
    didVisit?: boolean;
}

export interface ITalkToQuestCharacteristics {
    npc: INonPlayerCharacter;
    didTalk?: boolean;
}

export interface IKillQuestCharacteristics {
    npc: INonPlayerCharacter;
    didKill?: boolean;
}

export interface IQuest {
    id: number;
    type: WorldNpcQuestType;
    difficulty: WorldNpcQuestDifficulty;
    narration?: string;
    deliver?: IDeliverQuestCharacteristics;
    collect?: ICollectQuestCharacteristics;
    findLocation?: IFindLocationQuestCharacteristics;
    talkTo?: ITalkToQuestCharacteristics;
    kill?: IKillQuestCharacteristics;
}

export interface INonPlayerCharacter {
    id: number;
    name: string;
    race: WorldNpcRace;
    labels: Array<string>;
    location: IWorldNode;
    stance: WorldNpcStance;
    health: ICharacterHealth;
    inventory?: ICharacterInventory;
    gear?: ICharacterGear;
    personality?: INonPlayerCharacterPersonality;
    knowledge?: Array<IKnowledge>;
    activeQuest?: IQuest;
    nextQuest?: IQuest;
    possibleQuests?: Array<string>;
    itemValueOpinions?: Record<number, number>;
}

export const WORLD_NODE_LEVELS = [
    'room',
    'building',
    'street',
    'wilderness',
    'dungeon',
    'world',
];

export type WorldNodeLevel = typeof WORLD_NODE_LEVELS[number];

export interface IWorldNodeDetails {
    description: string;
}

export interface IWorldHierarchyNode {
    name: string;
    level?: WorldNodeLevel;
    details?: IWorldNodeDetails; // FIXME ???
}

export interface IWorldNodeBuilding {
    buildingType: WorldNodeBuildingType;
}

export interface IWorldNodeRoom {
    roomType: WorldNodeRoomType;
}

export interface IWorldNodeStreet {
    streetType: WorldNodeStreetType;
}

export interface IWorldNodeSettlement {
    settlementType: WorldNodeSettlementType;
}

export interface IWorldNodeWilderness {
    wildernessType: WorldNodeWildernessType;
}

export interface IWorldNode {
    id: number;
    name: string;
    type: WorldNodeAreaType;
    level?: WorldNodeLevel;
    temperature: WorldNodeTemperature;
    humidity: WorldNodeHumidity;
    labels: Array<string>;
    outEdges: Array<IWorldEdge>;
    details?: IWorldNodeDetails;
    hierarchy: Array<IWorldHierarchyNode>;
    items?: Array<IWorldItem>;
    npcs?: Array<INonPlayerCharacter>;
    building?: IWorldNodeBuilding;
    room?: IWorldNodeRoom;
    street?: IWorldNodeStreet;
    settlement?: IWorldNodeSettlement;
    wilderness?: IWorldNodeWilderness;
    ancestor?: IWorldNode;
}

export interface IWorldEdge {
    id: number;
    from: IWorldNode;
    to: IWorldNode;
    distance: number;
    labels: Array<string>;
    discovered: boolean;
}

export interface IWorldContext {
    nodesGenerated: Observable<Array<IWorldNode>>;
    getAllNodes(): Array<IWorldNode>;
    getNode(id: number): IWorldNode;
    getNodesWithLabel(label: string): Array<IWorldNode>;
    createItem(
        name: string,
        type: WorldItemType,
        tier: WorldItemTier,
    ): IWorldItem;
    createNpc(
        name: string,
        race: WorldNpcRace,
        location: IWorldNode,
    ): INonPlayerCharacter;
    generateItems(populatorId: string): Array<IWorldItem>;
    generateQuestFor(
        player: {
            gear: ICharacterGear;
            health: ICharacterHealth;
            location: IWorldNode;
        },
        npc: INonPlayerCharacter
    ): IQuest;
}

export const WorldContext = createContext({} as IWorldContext);
export const WorldProvider = WorldContext.Provider;
export const useWorld = () => useContext(WorldContext);