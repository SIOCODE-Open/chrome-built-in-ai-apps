import { Icon } from "@iconify/react";
import classNames from "classnames";
import { IGeneratedIdea, useProject } from "../../context/Project.context";
import { IGeneratedArtifact, useIdea } from "../../context/Idea.context";
import { useState } from "react";

export function IdeaArtifactButtons(
    props: {
        artifact: IGeneratedArtifact;
    }
) {

    const [isLiked, setIsLiked] = useState<boolean>(false);

    const project = useProject();
    const idea = useIdea();

    const floatingButtonsContainerDivCn = classNames(
        "absolute bottom-2 right-6",
        "flex flex-row justify-start items-center gap-2"
    );

    const buttonCn = classNames(
        "w-8 h-8",
        "flex flex-col justify-center items-center",
        "text-blue-500/50 hover:text-blue-500 active:text-blue-400",
        "text-2xl font-bold"
    );

    const likedCn = classNames(
        buttonCn,
        {
            "text-blue-500": isLiked,
        }
    );

    const onForkClicked = () => {
        project.stopGeneratingIdeas();
        idea.stopGeneratingArtifacts();
        project.clearGeneratedIdeas();
        project.pushScratchPadContent(props.artifact.text);
        project.publishScratchPadContent(props.artifact.text);
        project.startGeneratingIdeas();
    };

    const onLikeClicked = () => {
        const likedArtifact = {
            id: props.artifact.id,
            userNotes: project.getScratchPadContent(),
            idea: idea.getIdea(),
            artifact: props.artifact,
        };
        const currentLiked = JSON.parse(
            localStorage.getItem("artifacts.liked") || "[]"
        );
        const existing = currentLiked.find(
            (liked: any) => liked.id === likedArtifact.id
        );
        if (!existing) {
            currentLiked.push(likedArtifact);
            localStorage.setItem("artifacts.liked", JSON.stringify(currentLiked));
        }
        setIsLiked(true);
    };

    return <>
        <div className={floatingButtonsContainerDivCn}>
            <button className={buttonCn}>
                <Icon icon="mdi:source-fork" onClick={onForkClicked} />
            </button>
            <button className={likedCn}>
                <Icon icon="mdi:heart" onClick={onLikeClicked} />
            </button>
        </div>
    </>

}