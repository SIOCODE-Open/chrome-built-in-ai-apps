import { createContext, useContext } from "react";
import { Observable } from "rxjs";
import { ICharacterHealth, IConsumableItemEffect, INonPlayerCharacter, IWearableItemEffect, IWorldEdge, IWorldItem, IWorldNode } from "./World.context";
import { WorldHistoryHappening, WorldPlayerCraftingType, WorldPlayerEquipSlot, WorldPlayerSitutation, WorldPlayerSkill } from "../model/world.enums";
import { IPlayerHunger, IPlayerThirst } from "./Player.context";

export type GameEventOrigin =
    | 'story-teller'
    | 'player'
    | 'npc'
    | 'world';

export interface IGameEventMeta {
}

export interface IGameTime {
    day: number;
    hour: number;
    minute: number;
    second: number;
}

export interface IGameEvent {
    id: number;
    origin: GameEventOrigin;
    time: IGameTime;
    happening: WorldHistoryHappening;
    notes: string;
    details: any;
}

export interface IHistoryContext {
    eventPublished: Observable<IGameEvent>;
    turnEnded: Observable<{ events: IGameEvent[], endTurnEvent: IGameEvent }>;
    ticked: Observable<IGameTime>;
    epoch(): IGameTime;
    now(): IGameTime;
    t(): number;
    publish(
        origin: GameEventOrigin,
        happening: WorldHistoryHappening,
        notes: string,
        details: any,
    ): IGameEvent;
    advanceTime(
        deltaSeconds: number
    ): IGameTime;
    getRecentEvents(): IGameEvent[];
    getThisTurnEvents(): IGameEvent[];
    getAllTurns(): Array<{ events: IGameEvent[], endTurnEvent: IGameEvent }>;

    wakeUp(where: IWorldNode): IGameEvent;

    actionLookAround(where: IWorldNode): IGameEvent;
    actionPickUp(what: IWorldItem): IGameEvent;
    actionDrop(what: IWorldItem): IGameEvent;
    actionEquip(slot: WorldPlayerEquipSlot, what: IWorldItem): IGameEvent;
    actionUnequip(slot: WorldPlayerEquipSlot, what: IWorldItem): IGameEvent;
    actionMove(from: IWorldNode, to: IWorldNode, through: IWorldEdge): IGameEvent;
    actionSettle(where: IWorldNode): IGameEvent;
    actionTalk(who: INonPlayerCharacter, message: string): IGameEvent;
    actionUseItem(what: IWorldItem): IGameEvent;
    actionFlee(): IGameEvent;
    actionBuy(from: INonPlayerCharacter, what: IWorldItem, cost: number): IGameEvent;
    actionSell(to: INonPlayerCharacter, what: IWorldItem, cost: number): IGameEvent;
    actionLeave(): IGameEvent;
    actionWork(): IGameEvent;
    actionEat(what: IWorldItem): IGameEvent;
    actionDrink(what: IWorldItem): IGameEvent;
    actionHitTheRoad(where: IWorldNode): IGameEvent;
    actionAttack(who: INonPlayerCharacter): IGameEvent;
    actionUnpack(what: IWorldItem): IGameEvent;
    actionCraft(
        type: WorldPlayerCraftingType,
        location: IWorldNode,
        ingredients: Array<IWorldItem>,
        tools: Array<IWorldItem>,
    ): IGameEvent;
    actionTrade(
        npc: INonPlayerCharacter,
        offer: { gold: number, items: Array<IWorldItem> },
        want: { gold: number, items: Array<IWorldItem> },
    ): IGameEvent;
    actionRest(): IGameEvent;

    npcTalk(who: INonPlayerCharacter, message: string): IGameEvent;
    npcAttack(who: INonPlayerCharacter): IGameEvent;

    getGold(amount: number, notes: string): IGameEvent;
    spendGold(amount: number, notes: string): IGameEvent;
    getItem(item: IWorldItem, notes: string): IGameEvent;
    loseItem(item: IWorldItem, notes: string): IGameEvent;
    changeHealth(newHealth: ICharacterHealth): IGameEvent;
    changeHunger(newHunger: IPlayerHunger): IGameEvent;
    changeThirst(newThirst: IPlayerThirst): IGameEvent;
    inflictDamage(on: INonPlayerCharacter, amount: number): IGameEvent;
    takeDamage(from: INonPlayerCharacter, amount: number): IGameEvent;
    takeDamageFromWorld(amount: number): IGameEvent;
    arrive(where: IWorldNode): IGameEvent;
    learnSkill(skill: WorldPlayerSkill): IGameEvent;
    discoverPath(edge: IWorldEdge): IGameEvent;
    discoverItem(item: IWorldItem): IGameEvent;
    discoverNpc(npc: INonPlayerCharacter): IGameEvent;
    noop(notes: string): IGameEvent;
    consumeInventoryItem(item: IWorldItem): IGameEvent;
    consumeLocationItem(item: IWorldItem, where: IWorldNode): IGameEvent;
    equipItem(item: IWorldItem, slot: WorldPlayerEquipSlot): IGameEvent;
    unequipItem(item: IWorldItem, slot: WorldPlayerEquipSlot): IGameEvent;
    unpackedItem(item: IWorldItem): IGameEvent;
    changeSituation(situation: WorldPlayerSitutation): IGameEvent;
    craftedItem(item: IWorldItem, notes: string): IGameEvent;
    startCombat(npc: INonPlayerCharacter): IGameEvent;
    startConversation(npc: INonPlayerCharacter): IGameEvent;
    defeatNpc(npc: INonPlayerCharacter): IGameEvent;
    die(notes: string): IGameEvent;
    flee(notes: string): IGameEvent;
    failFlee(notes: string): IGameEvent;

    endTurn(turnNumber: number, notes: string): IGameEvent;
}

export const HistoryContext = createContext({} as IHistoryContext);
export const HistoryProvider = HistoryContext.Provider;
export const useHistory = () => useContext(HistoryContext);