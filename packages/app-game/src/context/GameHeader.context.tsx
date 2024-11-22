import { createContext, useContext } from "react";
import { Observable } from "rxjs";

export interface IGameHeaderContext {
    middleChanged: Observable<any>;
    changeMiddle: (middle: any) => void;
    rightChanged: Observable<any>;
    changeRight: (right: any) => void;
}

export const GameHeaderContext = createContext({} as IGameHeaderContext);
export const GameHeaderProvider = GameHeaderContext.Provider;
export const useGameHeader = () => useContext(GameHeaderContext);