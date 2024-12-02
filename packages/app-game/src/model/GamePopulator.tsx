import { ILanguageModelContext } from "@siocode/base";
import { WorldNodeDetailGenerator2 } from "../ai/WorldNodeDetailGenerator2";
import { ItemDetailGenerator } from "../ai/ItemDetailGenerator";
import { INonPlayerCharacter, IWorldItem, IWorldNode } from "../context/World.context";

export const populateItem = async (lm: ILanguageModelContext, item: IWorldItem) => {
    const gen = new ItemDetailGenerator(lm);
    await gen.generate(item);
};

export const populateNode = async (lm: ILanguageModelContext, node: IWorldNode) => {
    const gen = new WorldNodeDetailGenerator2(lm);
    await gen.generate(node);
};

export const populateNpc = async (lm: ILanguageModelContext, npc: INonPlayerCharacter) => {
    if (npc.gear) {
        if (npc.gear.armor) {
            await populateItem(lm, npc.gear.armor);
        }
        if (npc.gear.boots) {
            await populateItem(lm, npc.gear.boots);
        }
        if (npc.gear.helmet) {
            await populateItem(lm, npc.gear.helmet);
        }
        if (npc.gear.weapon) {
            await populateItem(lm, npc.gear.weapon);
        }
        if (npc.gear.wearable) {
            await populateItem(lm, npc.gear.wearable);
        }
    }
    if (npc.inventory) {
        for (const item of npc.inventory.items) {
            await populateItem(lm, item);
        }
    }
    if (npc.knowledge) {
        for (const k of npc.knowledge) {
            if (k.item) {
                await populateItem(lm, k.item);
                await populateNode(lm, k.itemLocation);
            }
            if (k.location) {
                await populateNode(lm, k.location);
            }
            if (k.npc) {
                await populateNode(lm, k.npcLocation);
            }
        }
    }
};
