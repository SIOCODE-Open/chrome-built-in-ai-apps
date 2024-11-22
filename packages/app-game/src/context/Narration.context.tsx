import { createContext, useContext } from "react";
import { IGameEvent } from "./History.context";

export interface INarrationContext {
    getPastResponses(): Array<{ event: IGameEvent, response: string }>;
    addPastResponse(event: IGameEvent, response: string): void;
}

export const NarrationContext = createContext({} as INarrationContext);
export const NarrationProvider = NarrationContext.Provider;
export const useNarration = () => useContext(NarrationContext);