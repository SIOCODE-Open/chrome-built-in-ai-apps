import { createContext, useContext } from "react";
import { IGeneratedIdea } from "./Project.context";
import { Observable } from "rxjs";

export interface IGeneratedArtifact {
    id: number;
    text: string;
}

export interface IIdeaContext {
    isGeneratingArtifacts(): boolean;
    generatingArtifactsChanged: Observable<boolean>;
    getGeneratedArtifacts(): Array<IGeneratedArtifact>;
    generatedArtifactsChanged: Observable<Array<IGeneratedArtifact>>;
    getIdea(): IGeneratedIdea;

    startGeneratingArtifacts(): void;
    stopGeneratingArtifacts(): void;
    addGeneratedArtifact(artifact: IGeneratedArtifact): void;
    clearGeneratedArtifacts(): void;
    onLikedIdea(): void;
}

export const IdeaContext = createContext({} as IIdeaContext);
export const IdeaProvider = IdeaContext.Provider;
export const useIdea = () => useContext(IdeaContext);