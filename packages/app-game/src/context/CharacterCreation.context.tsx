import { Observable } from "rxjs";
import { WorldItemTier, WorldItemType, WorldNpcRace, WorldPlayerClass, WorldPlayerSkill } from "../model/world.enums";
import { createContext, useContext } from "react";

export interface IStartingItem {
    name: string;
    tier: WorldItemTier;
    type: WorldItemType;
}

export interface IStartingGear {
    weapon?: IStartingItem | null;
    armor?: IStartingItem | null;
    helmet?: IStartingItem | null;
    boots?: IStartingItem | null;
    wearable?: IStartingItem | null;
}

export interface ICharacterCreationDetails {
    name: string;
    characterClass: WorldPlayerClass;
    inventoryItems: Array<IStartingItem>;
    inventoryGold: number;
    gear: IStartingGear;
    skills: Array<WorldPlayerSkill>;
}

export interface ICharacterCreationContext {
    detailsChanged: Observable<ICharacterCreationDetails>;
    finished: Observable<ICharacterCreationDetails>;
    getDetails(): ICharacterCreationDetails;
    updateDetails(details: ICharacterCreationDetails): void;
    finalizeDetails(details: ICharacterCreationDetails): void;
}

export const CharacterCreationContext = createContext({} as ICharacterCreationContext);
export const CharacterCreationProvider = CharacterCreationContext.Provider;
export const useCharacterCreation = () => useContext(CharacterCreationContext);