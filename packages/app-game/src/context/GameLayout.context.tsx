import { createContext, useContext } from "react";
import { Observable } from "rxjs";

export type GameLayoutType = "split-even"
    | "split-focus-top"
    | "split-focus-bottom"
    | "top-only"
    | "bottom-only"
    | "game-over";

export interface IGameLayoutContext {
    layoutChanged: Observable<GameLayoutType>;
    getLayout(): GameLayoutType;
    changeLayout(layout: GameLayoutType): void;
}

export const GameLayoutContext = createContext({} as IGameLayoutContext);
export const GameLayoutProvider = GameLayoutContext.Provider;
export const useGameLayout = () => useContext(GameLayoutContext);