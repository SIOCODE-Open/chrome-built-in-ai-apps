import { createContext, useContext } from "react";
import { Observable } from "rxjs";
import { IGameEvent } from "./History.context";

export interface IGameSimulationContext {
    simulating: Observable<void>;
    nextTurn: Observable<void>;
    start(): void;

    addEventProcessor(processor: (event: any) => Promise<Array<IGameEvent>>): void;
    addTickProcessor(processor: (time: any) => Promise<Array<IGameEvent>>): void;
}

export const GameSimulationContext = createContext({} as IGameSimulationContext);
export const GameSimulationProvider = GameSimulationContext.Provider;
export const useGameSimulation = () => useContext(GameSimulationContext);
