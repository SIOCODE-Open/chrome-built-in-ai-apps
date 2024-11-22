import { useEffect, useState } from "react";
import { useIdea } from "../../context/Idea.context";
import classNames from "classnames";
import { Icon } from "@iconify/react";

function ControlButtons(
    props: any
) {

    const [isGeneratingArtifacts, setIsGeneratingArtifacts] = useState(false);

    const idea = useIdea();

    const containerDivCn = classNames(
        "flex flex-row justify-start items-center",
        "border dark:border-neutral-600 border-neutral-300 rounded-full",
    );

    const resetButtonCn = classNames(
        "px-2 py-1 rounded-l-full text-xs",
        "hover:bg-red-500/25 active:bg-red-500/50 dark:text-white text-black",
    );

    const playButtonCn = classNames(
        "px-2 py-1 rounded-r-full text-xs",
        "hover:bg-green-500/25 active:bg-green-500/50 dark:text-white text-black",
        {
            "bg-green-500/50": isGeneratingArtifacts,
        }
    );

    useEffect(
        () => {
            const sub = idea.generatingArtifactsChanged.subscribe(
                (isGenerating) => {
                    setIsGeneratingArtifacts(isGenerating);
                }
            );
            return () => {
                sub.unsubscribe();
            };
        },
        []
    );

    const onClickReset = () => {
        idea.clearGeneratedArtifacts();
    };
    const onClickPlay = () => {
        if (!isGeneratingArtifacts) {
            idea.startGeneratingArtifacts();
            idea.onLikedIdea();
        } else {
            idea.stopGeneratingArtifacts();
        }
    };

    return <>
        <div className={containerDivCn}>
            <button className={resetButtonCn} onClick={onClickReset}>
                <Icon icon="mdi:trash" />
            </button>
            <button className={playButtonCn} onClick={onClickPlay}>
                <Icon icon="mdi:play" />
            </button>
        </div>
    </>;
}

export function IdeaTitle(props: any) {

    const [ideaTitle, setIdeaTitle] = useState<string>("");

    const containerDivCn = classNames(
        "w-full flex flex-row justify-between items-center",
    );

    const idea = useIdea();

    useEffect(
        () => {
            setIdeaTitle(
                idea.getIdea().title
            );
        },
        []
    );

    return <>
        <div className={containerDivCn}>
            <h1 className="font-bold text-xl">{ideaTitle}</h1>
            <ControlButtons />
        </div>
    </>;

}