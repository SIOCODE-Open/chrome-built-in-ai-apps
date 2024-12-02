import { createContext, useContext } from "react";
import { INonPlayerCharacter, IQuest, IWorldEdge, IWorldItem } from "./World.context";
import { WorldPlayerCraftingType } from "../model/world.enums";

export type EquipActionSlot =
    | "weapon"
    | "armor"
    | "boots"
    | "helmet"
    | "wearable";

export interface IEquipAction {
    item: IWorldItem;
    slot: EquipActionSlot;
}

export interface IPlayerActionsContext {
    lookAround(): void;
    settleDown(): void;
    hitTheRoad(): void;
    leave(): void;
    move(edge: IWorldEdge): void;
    equipItem(action: IEquipAction): void;
    unequipItem(slot: EquipActionSlot): void;
    dropItem(item: IWorldItem): void;
    pickupItem(item: IWorldItem): void;
    eatItem(item: IWorldItem): void;
    drinkItem(item: IWorldItem): void;
    useItem(item: IWorldItem): void;
    talk(npc: INonPlayerCharacter, message: string): void;
    trade(npc: INonPlayerCharacter, offered: { gold: number; items: Array<IWorldItem> }, want: { gold: number; items: Array<IWorldItem> }): void;
    attack(npc: INonPlayerCharacter): void;
    unpack(item: IWorldItem): void;
    craftBreak(
        breakWhat: IWorldItem,
        breakUsing?: IWorldItem | null | undefined
    ): void;
    craftAssemble(
        assembleWhat: Array<IWorldItem>,
        assembleUsing?: IWorldItem | null | undefined
    ): void;
    craftCook(
        cookWhat: Array<IWorldItem>,
        cookUsing?: IWorldItem | null | undefined
    ): void;
    craftRefine(
        refineWhat: IWorldItem,
        refineWith: Array<IWorldItem>,
        refineUsing?: IWorldItem | null | undefined
    ): void;
    craftDisassemble(
        disassembleWhat: IWorldItem,
        disassembleUsing?: IWorldItem | null | undefined
    ): void;
    craftSmelt(
        smeltWhat: IWorldItem,
        smeltUsing?: IWorldItem | null | undefined
    ): void;
    rest(): void;
    beginQuest(): void;
    handInQuest(): void;
    tellSecret(): void;
}

export const PlayerActionsContext = createContext({} as IPlayerActionsContext);
export const PlayerActionsProvider = PlayerActionsContext.Provider;
export const usePlayerActions = () => useContext(PlayerActionsContext);