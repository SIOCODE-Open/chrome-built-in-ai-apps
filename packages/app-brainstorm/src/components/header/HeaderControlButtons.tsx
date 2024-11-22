import { useEffect, useState } from "react";
import { useProject } from "../../context/Project.context";
import classNames from "classnames";
import { Icon } from "@iconify/react";

export function HeaderControlButtons(
    props: any
) {

    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

    const project = useProject();

    const containerDivCn = classNames(
        "flex flex-row justify-start items-center",
        "border dark:border-neutral-700 border-neutral-300 rounded-full",
    );

    const resetButtonCn = classNames(
        "px-2 py-1 rounded-l-full text-xs",
        "hover:bg-red-500/25 active:bg-red-500/50 dark:text-white text-black",
    );

    const pauseButtonCn = classNames(
        "px-2 py-1 text-xs",
        "hover:bg-yellow-500/25 active:bg-yellow-500/50 dark:text-white text-black",
        {
            "bg-yellow-500/50": !isGeneratingIdeas,
        }
    );

    const playButtonCn = classNames(
        "px-2 py-1 rounded-r-full text-xs",
        "hover:bg-green-500/25 active:bg-green-500/50 dark:text-white text-black",
        {
            "bg-green-500/50": isGeneratingIdeas,
        }
    );

    useEffect(
        () => {
            const sub = project.generatingIdeasChanged.subscribe(
                (isGenerating) => {
                    setIsGeneratingIdeas(isGenerating);
                }
            );
            return () => {
                sub.unsubscribe();
            };
        },
        []
    );

    const onClickReset = () => {
        project.clearGeneratedIdeas();
    }
    const onClickPause = () => {
        project.stopGeneratingIdeas();
    };
    const onClickPlay = () => {
        project.startGeneratingIdeas();
    };

    return <>
        <div className={containerDivCn}>
            <button className={resetButtonCn} onClick={onClickReset}>
                <Icon icon="mdi:trash" />
            </button>
            <button className={pauseButtonCn} onClick={onClickPause}>
                <Icon icon="mdi:pause" />
            </button>
            <button className={playButtonCn} onClick={onClickPlay}>
                <Icon icon="mdi:play" />
            </button>
        </div>
    </>;
}
