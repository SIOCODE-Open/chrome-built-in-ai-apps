import { createContext, useContext } from "react";
import { Observable } from "rxjs";

export interface IGeneratedIdea {
    id: number;
    title: string;
    prompt: string;
    userInput: string;
}

export interface IProjectContext {
    isGeneratingIdeas(): boolean;
    generatingIdeasChanged: Observable<boolean>;
    getGeneratedIdeas(): Array<IGeneratedIdea>;
    generatedIdeasChanged: Observable<Array<IGeneratedIdea>>;
    getScratchPadContent(): string;
    scratchPadContentChanged: Observable<string>;
    scratchPadContentPushed: Observable<string>;

    startGeneratingIdeas(): void;
    stopGeneratingIdeas(): void;
    addGeneratedIdea(idea: IGeneratedIdea): void;
    clearGeneratedIdeas(): void;
    publishScratchPadContent(content: string): void;
    pushScratchPadContent(content: string): void;
}

export const ProjectContext = createContext({} as IProjectContext);
export const ProjectProvider = ProjectContext.Provider;
export const useProject = () => useContext(ProjectContext);
