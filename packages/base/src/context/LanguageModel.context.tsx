import { createContext, useContext } from "react";
import { Observable } from "rxjs";

export interface ILanguageModelKind {
    name: string;
    identifier: string;
    isCloud: boolean;
}

export interface ILanguageModelContext {
    create(
        messages: Array<{
            role: "system" | "user" | "assistant";
            content: string;
        }>,
        opts?: { temperature: number; topK: number; stopSequence?: string; }
    ): Promise<{
        prompt(nextMessage: string): Promise<string>;
    }>
    getAvailableKinds(): Array<ILanguageModelKind>;
    getSelectedKind(): ILanguageModelKind;
    setSelectedKind(kind: ILanguageModelKind): void;
    selectedKindChanged: Observable<ILanguageModelKind>;
}
export const LanguageModelContext = createContext({} as ILanguageModelContext);
export const LanguageModelProvider = LanguageModelContext.Provider;
export const useLanguageModel = () => useContext(LanguageModelContext);
