import { createContext, useContext } from "react";
import { Observable } from "rxjs";
import { ICharacterGear, ICharacterHealth, ICharacterInventory, INonPlayerCharacter, IWorldItem, IWorldNode } from "./World.context";
import { WorldPlayerClass, WorldPlayerHealth, WorldPlayerHunger, WorldPlayerSitutation, WorldPlayerSkill, WorldPlayerThirst } from "../model/world.enums";

export interface IPlayerSkills {
    skills: Array<WorldPlayerSkill>;
}

export interface IPlayerHunger {
    status: WorldPlayerHunger;
    lastMealTime: number;
    lastMeal: IWorldItem | null;
}

export interface IPlayerThirst {
    status: WorldPlayerThirst;
    lastDrinkTime: number;
    lastDrink: IWorldItem | null;
}

export interface IPlayerCharacter {
    name: string;
    characterClass: WorldPlayerClass;
}

export interface IPlayerContext {
    spawned: Observable<void>;

    playerCharacter: Observable<IPlayerCharacter>;
    getPlayerCharacter(): IPlayerCharacter;
    playerHealth: Observable<ICharacterHealth>;
    getPlayerHealth(): ICharacterHealth;
    playerLocation: Observable<IWorldNode>;
    getPlayerLocation(): IWorldNode;
    playerGear: Observable<ICharacterGear>;
    getPlayerGear(): ICharacterGear;
    playerInventory: Observable<ICharacterInventory>;
    getPlayerInventory(): ICharacterInventory;
    playerHunger: Observable<IPlayerHunger>;
    getPlayerHunger(): IPlayerHunger;
    playerThirst: Observable<IPlayerThirst>;
    getPlayerThirst(): IPlayerThirst;
    playerSkills: Observable<IPlayerSkills>;
    getPlayerSkills(): IPlayerSkills;
    playerSituation: Observable<WorldPlayerSitutation>;
    getPlayerSituation(): WorldPlayerSitutation;
    inCombatWith: Observable<INonPlayerCharacter | null>;
    getInCombatWith(): INonPlayerCharacter | null;
    inConversationWith: Observable<INonPlayerCharacter | null>;
    getInConversationWith(): INonPlayerCharacter | null;

    updatePlayerCharacter(character: IPlayerCharacter): void;
    updatePlayerHealth(health: ICharacterHealth): void;
    updatePlayerLocation(location: IWorldNode): void;
    updatePlayerGear(gear: ICharacterGear): void;
    updatePlayerHunger(hunger: IPlayerHunger): void;
    updatePlayerThirst(thirst: IPlayerThirst): void;
    addGold(amount: number): void;
    spendGold(amount: number): boolean;
    addItem(item: IWorldItem): void;
    removeItem(item: IWorldItem): boolean;
    learnSkill(skill: WorldPlayerSkill): void;
    changeSituation(situation: WorldPlayerSitutation): void;
    startCombat(npc: INonPlayerCharacter): void;
    updateInCombatWith(npc: INonPlayerCharacter): void;
    endCombat(): void;
    startConversation(npc: INonPlayerCharacter): void;
    updateInConversationWith(npc: INonPlayerCharacter): void;
    endConversation(): void;
}

export const PlayerContext = createContext({} as IPlayerContext);
export const PlayerProvider = PlayerContext.Provider;
export const usePlayer = () => useContext(PlayerContext);