import { IGameEvent } from "../context/History.context";
import { IPlayerCharacter, IPlayerHunger, IPlayerSkills, IPlayerThirst } from "../context/Player.context";
import {
    ICharacterGear,
    ICharacterHealth,
    ICharacterInventory,
    IConsumableItemEffect,
    INonPlayerCharacter,
    IQuest,
    IWearableItemEffect,
    IWorldItem,
    IWorldNode,
} from "../context/World.context";

import {
    WORLD_ITEM_TIER_DISPLAYS,
    WORLD_ITEM_TYPE_DISPLAYS,
    WORLD_PLAYER_CLASS_DESCRIPTIONS,
    WORLD_PLAYER_CLASS_DISPLAYS,
    WorldPlayerClass,
    WORLD_PLAYER_HEALTH_DESCRIPTIONS,
    WORLD_PLAYER_HUNGER_DESCRIPTIONS,
    WORLD_PLAYER_THIRST_DESCRIPTIONS,
    WORLD_NODE_HUMIDITY_DESCRIPTIONS,
    WORLD_NODE_TEMPERATURE_DESCRIPTIONS,
    WORLD_PLAYER_SKILL_DESCRIPTIONS,
    WORLD_NPC_RACE_DISPLAYS,
    WORLD_NPC_RACE_DESCRIPTIONS,
    WORLD_NPC_BACKGROUND_DISPLAYS,
    WORLD_NPC_BACKGROUND_DESCRIPTIONS,
    WORLD_NPC_PERSONALITY_TRAIT_DISPLAYS,
    WORLD_NPC_PERSONALITY_TRAIT_DESCRIPTIONS,
    WORLD_NPC_QUEST_DIFFICULTY_DESCRIPTIONS,
    WORLD_NPC_ACTION_DISPLAYS,
    WORLD_WEARABLE_EFFECT_ACTIVATION_DISPLAYS,
    WORLD_WEARABLE_EFFECT_TYPE_DESCRIPTIONS,
} from "../model/world.enums";
import { shuffleArray } from "../utils/shuffleArray";

export const aiDisplayItem = (item: IWorldItem | null) => {
    if (item) {
        return `Item ${item.id}: ${item.name} (${WORLD_ITEM_TYPE_DISPLAYS[item.type]}) [${WORLD_ITEM_TIER_DISPLAYS[item.tier]}]`;
    } else {
        return "None";
    }
};

export const aiDisplayClass = (cls: WorldPlayerClass) =>
    `${WORLD_PLAYER_CLASS_DISPLAYS[cls]} (${WORLD_PLAYER_CLASS_DESCRIPTIONS[cls]})`;

export const aiDisplayPlayer = (pCharacter: IPlayerCharacter) => [
    `--- Player ---`,
    `Name: ${pCharacter.name}`,
    `Class: ${aiDisplayClass(pCharacter.characterClass)}`,
];

export const aiDisplayHealth = (pHealth: ICharacterHealth) =>
    `Health: ${pHealth.status} (${WORLD_PLAYER_HEALTH_DESCRIPTIONS[pHealth.status]})`;

export const aiDisplayHunger = (pHunger: IPlayerHunger) =>
    `Hunger: ${pHunger.status} (${WORLD_PLAYER_HUNGER_DESCRIPTIONS[pHunger.status]})`;

export const aiDisplayThirst = (pThirst: IPlayerThirst) =>
    `Thirst: ${pThirst.status} (${WORLD_PLAYER_THIRST_DESCRIPTIONS[pThirst.status]})`;

export const aiDisplayLocation = (pLocation: IWorldNode) => [
    `Location: ${pLocation.name}`,
    `Humidity: ${pLocation.humidity} (${WORLD_NODE_HUMIDITY_DESCRIPTIONS[pLocation.humidity]})`,
    `Temperature: ${pLocation.temperature} (${WORLD_NODE_TEMPERATURE_DESCRIPTIONS[pLocation.temperature]})`,
];

export const aiDisplayLocationShort = (pLocation: IWorldNode) => {
    let r = `${pLocation.name} (${pLocation.id}) [${pLocation.temperature}, ${pLocation.humidity}]`;
    return r;
}

export const aiDisplayInventory = (pInventory: ICharacterInventory) => [
    `--- Inventory ---`,
    `Num Items: ${pInventory.items.length}`,
    `Gold: ${pInventory.gold}`,
    ...pInventory.items.map((i) => aiDisplayItem(i)),
];

export const aiDisplaySkills = (pSkills: IPlayerSkills) => [
    `--- Skills ---`,
    ...pSkills.skills.map(
        (skill) => `${skill} (${WORLD_PLAYER_SKILL_DESCRIPTIONS[skill]})`
    ),
];

export const aiDisplayGear = (pGear: ICharacterGear) => [
    `--- Gear ---`,
    `Weapon: ${aiDisplayItem(pGear.weapon)}`,
    `Armor: ${aiDisplayItem(pGear.armor)}`,
    `Helmet: ${aiDisplayItem(pGear.helmet)}`,
    `Boots: ${aiDisplayItem(pGear.boots)}`,
    `Wearable: ${aiDisplayItem(pGear.wearable)}`,
];

export const aiDisplayGearShort = (pGear: ICharacterGear) => {
    let r = [];
    if (pGear.weapon) r.push(`Weapon ${aiDisplayItem(pGear.weapon)}`)
    else r.push(`Weapon None`);
    if (pGear.armor) r.push(`Armor ${aiDisplayItem(pGear.armor)}`)
    else r.push(`Armor None`);
    if (pGear.helmet) r.push(`Helmet ${aiDisplayItem(pGear.helmet)}`)
    else r.push(`Helmet None`);
    if (pGear.boots) r.push(`Boots ${aiDisplayItem(pGear.boots)}`)
    else r.push(`Boots None`);
    if (pGear.wearable) r.push(`Wearable ${aiDisplayItem(pGear.wearable)}`)
    else r.push(`Wearable None`);
    return `[${r.join(', ')}]`;
};

export const aiDisplaySurroundings = (pLocation: IWorldNode) => {
    const discoveredEdges = pLocation.outEdges.filter((e) => e.discovered);
    const surroundings = [
        `--- Surroundings ---`,
        ...discoveredEdges.map(
            (e) =>
                `Can go to ${e.to.id} (name: ${e.to.name}) distance: ${e.distance}`
        ),
        // TODO: Discover items
        ...pLocation.items.map((i) => `Location: ${aiDisplayItem(i)}`),
    ];

    if (discoveredEdges.length === 0) {
        surroundings.push(
            `You have not discovered any destinations from here.`
        );
    }

    return surroundings;
};

export const aiDisplayEvent = (event: IGameEvent) => {
    return `Event at day ${event.time.day}, ${event.time.hour.toString().padStart(2, '0')}:${event.time.minute.toString().padStart(2, '0')}:${event.time.second.toString().padStart(2, '0')} - ${event.happening} - ${event.notes}`;
};

export const aiDisplayNpc = (npc: INonPlayerCharacter) => {
    return [
        `Name: ${npc.name}`,
        ...aiDisplayLocation(npc.location),
        `Race: ${WORLD_NPC_RACE_DISPLAYS[npc.race]} - ${WORLD_NPC_RACE_DESCRIPTIONS[npc.race]}`,
        `Background: ${WORLD_NPC_BACKGROUND_DISPLAYS[npc.personality!.background]} - ${WORLD_NPC_BACKGROUND_DESCRIPTIONS[npc.personality!.background]}`,
        `Personality Traits:`,
        ...npc.personality!.traits.map((t) => `* ${WORLD_NPC_PERSONALITY_TRAIT_DISPLAYS[t]} - ${WORLD_NPC_PERSONALITY_TRAIT_DESCRIPTIONS[t]}`),
        `Knowledge:`,
        ...shuffleArray([...npc.knowledge!]).slice(0, 5).map(
            (k) => {
                if (k.location) {
                    const enemiesCount = k.location.npcs.filter((n) => n.stance === "hostile").length;
                    const friendliesCount = k.location.npcs.filter((n) => n.stance === "friendly").length;
                    return `* Knows about location ${k.location.name} (id ${k.location.id}, distance ${k.distance}) [${k.location.type}, ${k.location.temperature}, ${k.location.humidity}] with ${enemiesCount} enemies and ${friendliesCount} friendlies, ${k.location.items.length} items`;
                }
                if (k.item) {
                    return `* Knows about item ${k.item.name} (id ${k.item.id}, distance ${k.distance}) [${WORLD_ITEM_TYPE_DISPLAYS[k.item.type]}, ${WORLD_ITEM_TIER_DISPLAYS[k.item.tier]}], which is at ${k.itemLocation!.name} (${k.itemLocation!.id}) [${k.itemLocation!.type}, ${k.itemLocation!.temperature}, ${k.itemLocation!.humidity}]`;
                }
                if (k.npc) {
                    return `* Knows about ${k.npc.name} (id ${k.npc.id}, distance ${k.distance}) [${k.npc.race}, ${k.npc.stance}], who is in ${k.npcLocation!.name} (${k.npcLocation!.id}) [${k.npcLocation!.type}, ${k.npcLocation!.temperature}, ${k.npcLocation!.humidity}]`;
                }
                return `* Unknown knowledge`;
            }
        )
    ].join("\n").trim();
}

export const aiDisplayTrade = (offered: { gold: number, items: IWorldItem[] }, wanted: { gold: number, items: IWorldItem[] }) => {
    const offeredItems = offered.items.map((i) => aiDisplayItem(i));
    const wantedItems = wanted.items.map((i) => aiDisplayItem(i));
    return [
        `Other party gives you ${offered.gold} gold`,
        ...offeredItems.map(i => `Other party gives you ${i}`),
        offeredItems.length === 0 ? `Other party gives you no items` : null,
        `You give the other party ${wanted.gold} gold`,
        ...wantedItems.map(i => `You give the other party ${i}`),
        wantedItems.length === 0 ? `You give the other party no items` : null,
    ].filter(l => !!l).join("\n").trim();
}

export const aiDisplayQuest = (quest: IQuest) => {

    let txt = `Unknown quest type`;

    if (quest.type === "deliver") {
        txt = `Deliver item ${aiDisplayItem(quest.deliver!.item)} to person ${quest.deliver!.recipient.name} at location ${aiDisplayLocationShort(quest.deliver!.recipient.location)}`;
    } else if (quest.type === "find-location") {
        txt = `Travel to location ${aiDisplayLocationShort(quest.findLocation!.location)} and report back`;
    } else if (quest.type === "talk-to") {
        txt = `Find person ${quest.talkTo!.npc.name} at location ${aiDisplayLocationShort(quest.talkTo!.npc.location)} and tell them my secret`;
    } else if (quest.type === "kill") {
        txt = `Kill person or animal ${quest.kill!.npc.name} at location ${aiDisplayLocationShort(quest.kill!.npc.location)}`;
    }

    return `[${WORLD_NPC_QUEST_DIFFICULTY_DESCRIPTIONS[quest.difficulty]}] ${txt}`;

}

export const aiDisplayWearableEffect = (effect: IWearableItemEffect) => {
    return `${WORLD_WEARABLE_EFFECT_ACTIVATION_DISPLAYS[effect.activation]} - ${WORLD_WEARABLE_EFFECT_TYPE_DESCRIPTIONS[effect.type]} - Value: ${effect.value}`;
}

export const aiDisplayConsumableEffect = (effect: IConsumableItemEffect) => {
    return `On use - ${WORLD_WEARABLE_EFFECT_TYPE_DESCRIPTIONS[effect.type]} - Value: ${effect.value}`;
}
