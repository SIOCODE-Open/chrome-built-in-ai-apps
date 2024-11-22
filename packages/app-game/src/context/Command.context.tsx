import { createContext, useContext } from "react";
import { Observable } from "rxjs";

export interface ICommandContext {
    inputChanged: Observable<string>;
    getInput();
    externalInput: Observable<string>;

    publishUserInput(input: string);
    publishExternalInput(input: string);
}

export const CommandContext = createContext({} as ICommandContext);
export const CommandProvider = CommandContext.Provider;
export const useCommand = () => useContext(CommandContext);