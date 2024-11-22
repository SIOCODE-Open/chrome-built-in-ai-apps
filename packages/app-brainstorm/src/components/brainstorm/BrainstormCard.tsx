import classNames from "classnames";
import { IGeneratedIdea } from "../../context/Project.context";
import { IdeaProvider, IGeneratedArtifact, IIdeaContext } from "../../context/Idea.context";
import { useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { IdeaTitle } from "./IdeaTitle";
import { IdeaPrompt } from "./IdeaPrompt";
import { IdeaArtifacts } from "./IdeaArtifacts";

function onLikedIdea(idea: IGeneratedIdea) {
    const currentLiked = JSON.parse(
        localStorage.getItem("brainstorm.liked") || "[]"
    );
    const existing = currentLiked.find(
        (liked: IGeneratedIdea) => liked.id === idea.id
    );
    if (!existing) {
        currentLiked.push(idea);
        localStorage.setItem("brainstorm.liked", JSON.stringify(currentLiked));
    }
}

export function BrainstormCard(
    props: {
        idea: IGeneratedIdea;
    }
) {

    const isGeneratingArtifacts = useRef(
        new BehaviorSubject<boolean>(false)
    );
    const generatedArtifacts = useRef(
        new BehaviorSubject<Array<IGeneratedArtifact>>([])
    );

    const containerDivCn = classNames(
        "flex flex-col justify-start items-start relative",
        "border dark:border-neutral-600 border-neutral-300 rounded-lg",
        "p-2 gap-2",
        "w-full"
    );

    const ideaContext: IIdeaContext = {
        isGeneratingArtifacts: () => isGeneratingArtifacts.current.value,
        generatingArtifactsChanged: isGeneratingArtifacts.current.asObservable(),
        getGeneratedArtifacts: () => generatedArtifacts.current.value,
        generatedArtifactsChanged: generatedArtifacts.current.asObservable(),

        startGeneratingArtifacts: () => isGeneratingArtifacts.current.next(true),
        stopGeneratingArtifacts: () => isGeneratingArtifacts.current.next(false),
        addGeneratedArtifact: (artifact: IGeneratedArtifact) => generatedArtifacts.current.next([...generatedArtifacts.current.value, artifact]),
        clearGeneratedArtifacts: () => generatedArtifacts.current.next([]),
        onLikedIdea: () => onLikedIdea(props.idea),

        getIdea: () => props.idea,
    };

    return <>
        <IdeaProvider value={ideaContext}>
            <div className={containerDivCn}>
                <IdeaTitle />
                <IdeaPrompt />
                <IdeaArtifacts />
            </div>
        </IdeaProvider>
    </>;
}
