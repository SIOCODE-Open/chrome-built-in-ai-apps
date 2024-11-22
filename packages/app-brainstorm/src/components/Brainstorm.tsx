import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { IGeneratedIdea, useProject } from "../context/Project.context";
import { useLanguageModel } from "@siocode/base";
import { BrainstormCard } from "./brainstorm/BrainstormCard";
import { BrainstormGenerator } from "./brainstorm/BrainstormGenerator";
import { Icon } from "@iconify/react";

export function Brainstorm(props: any) {

    const [projectIdeas, setProjectIdeas] = useState<Array<IGeneratedIdea>>([]);
    const [isBrainstorming, setIsBrainstorming] = useState(false);
    const generator = useRef<BrainstormGenerator | null>(null);

    const project = useProject();
    const languageModel = useLanguageModel();

    const containerDivCn = classNames(
        "flex flex-col justify-start items-start h-full grow",
        "dark:bg-neutral-700 dark:text-white bg-white text-black",
        "overflow-y-scroll",
        "p-2 gap-2"
    );

    const cards = [];
    for (const idea of projectIdeas) {
        cards.push(<BrainstormCard key={idea.id} idea={idea} />);
    }

    if (!isBrainstorming) {
        if (cards.length === 0) {
            cards.push(
                <div key="empty" className="w-full mt-4 flex flex-row justify-center items-center text-sm text-neutral-500 gap-2">
                    <Icon icon="mdi:idea" className="text-2xl" />
                    <span>
                        Press ▶️ to start brainstorming
                    </span>
                </div>
            );
        } else {
            cards.push(
                <div key="empty" className="w-full mt-4 flex flex-row justify-center items-center text-sm text-neutral-500 gap-2">
                    <Icon icon="mdi:idea" className="text-2xl" />
                    <span>
                        Press ▶️ to continue brainstorming
                    </span>
                </div>
            );
        }
    } else {
        cards.push(
            <div key="in-progress" className="w-full mt-4 flex flex-row justify-center items-center text-sm text-neutral-500 gap-2">
                <Icon icon="mdi:gear" className="text-2xl animate-spin" />
                <span>
                    The AI is brainstorming ideas ...
                </span>
            </div>
        );
    }

    useEffect(
        () => {
            const sub = project.generatedIdeasChanged.subscribe(
                (ideas) => {
                    setProjectIdeas(ideas);
                }
            );
            return () => {
                sub.unsubscribe();
            };
        },
        []
    );

    useEffect(
        () => {
            const sub = project.generatingIdeasChanged.subscribe(
                (newState) => {
                    if (newState && generator.current === null) {
                        console.log("Starting brainstorm generator");
                        generator.current = new BrainstormGenerator(
                            project.getScratchPadContent(),
                            languageModel,
                            (newIdea) => {
                                project.addGeneratedIdea(newIdea);
                            },
                            () => {
                                setIsBrainstorming(false);
                            }
                        );
                        generator.current.start();
                        setIsBrainstorming(true);
                    } else {
                        generator.current?.stop();
                        generator.current = null;
                    }
                }
            );
            return () => {
                sub.unsubscribe();
            };
        },
        []
    );

    return <>
        <div className={containerDivCn}>
            {cards}
        </div>
    </>;
}