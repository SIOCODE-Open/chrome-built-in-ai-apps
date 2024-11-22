import { useEffect, useRef, useState } from "react";
import { IdeaGenerator } from "./IdeaGenerator";
import { IGeneratedArtifact, useIdea } from "../../context/Idea.context";
import { useProject } from "../../context/Project.context";
import { useLanguageModel } from "@siocode/base";
import classNames from "classnames";
import { Icon } from "@iconify/react";
import { IdeaArtifactButtons } from "./IdeaArtifactButtons";

function IdeaArtifactView_SVG(
    props: {
        artifact: IGeneratedArtifact;
    }
) {
    const svgClassname = classNames(
        "w-96 h-96 p-2",
        "border dark:border-neutral-700 border-neutral-300 rounded-lg",
        "dark:text-white text-black",
        "font-mono text-sm",
    );

    return <>
        <svg
            className={svgClassname}
            dangerouslySetInnerHTML={{ __html: props.artifact.text }}
        />
    </>;
}

function IdeaArtifactView_HTMLPage(
    props: {
        artifact: IGeneratedArtifact;
    }
) {
    const iframeClassname = classNames(
        "w-full h-96 p-2",
        "border dark:border-neutral-700 border-neutral-300 rounded-lg",
    );

    const iframeData = `data:text/html;base64,${btoa(unescape(encodeURIComponent(props.artifact.text)))}`;

    return <>
        <iframe
            className={iframeClassname}
            src={iframeData}
        />
    </>;
}


function IdeaArtifactView(
    props: {
        artifact: IGeneratedArtifact;
    }
) {

    const textareaClassname = classNames(
        "w-full h-64 p-2",
        "border dark:border-neutral-700 border-neutral-300 rounded-lg",
        "dark:text-white text-black dark:bg-neutral-800 bg-white",
        "font-mono text-sm",
    );

    const isSvg = props.artifact.text.startsWith("<svg");
    const isHtml = props.artifact.text.startsWith("<!DOCTYPE html>") || props.artifact.text.startsWith("<html");

    let artifactView = null;

    if (isSvg) {
        artifactView = <IdeaArtifactView_SVG artifact={props.artifact} />;
    } else if (isHtml) {
        artifactView = <IdeaArtifactView_HTMLPage artifact={props.artifact} />;
    } else {
        artifactView = <textarea
            className={textareaClassname}
            value={props.artifact.text}
            readOnly
        />;
    };

    return <>
        <div className="relative w-full">
            {artifactView}
            <IdeaArtifactButtons artifact={props.artifact} />
        </div>
    </>
}

export function IdeaArtifacts(props: any) {

    const [ideaArtifacts, setIdeaArtifacts] = useState<Array<IGeneratedArtifact>>([]);
    const [isGeneratingArtifacts, setIsGeneratingArtifacts] = useState(false);
    const generator = useRef<IdeaGenerator | null>(null);

    const idea = useIdea();
    const project = useProject();
    const languageModel = useLanguageModel();

    useEffect(
        () => {
            const sub = idea.generatingArtifactsChanged.subscribe(
                (newState) => {
                    if (newState && generator.current === null) {
                        generator.current = new IdeaGenerator(
                            project.getScratchPadContent(),
                            idea.getIdea(),
                            languageModel,
                            (newArtifact) => {
                                idea.addGeneratedArtifact(newArtifact);
                            },
                            () => {
                                setIsGeneratingArtifacts(false);
                                idea.stopGeneratingArtifacts();
                            }
                        );
                        generator.current.start();
                        setIsGeneratingArtifacts(true);
                    } else if (!newState) {
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

    useEffect(
        () => {
            const sub = idea.generatedArtifactsChanged.subscribe(
                (artifacts) => {
                    setIdeaArtifacts(artifacts);
                }
            );
            return () => {
                sub.unsubscribe();
            };
        },
        []
    );

    const views = [];
    for (const artifact of ideaArtifacts) {
        views.push(<IdeaArtifactView key={artifact.id} artifact={artifact} />);
    }

    if (isGeneratingArtifacts) {
        views.push(
            <div key="in-progress" className="w-full mt-4 flex flex-row justify-center items-center text-sm text-neutral-500 gap-2">
                <Icon icon="mdi:gear" className="text-2xl animate-spin" />
                <span>
                    The AI is working on this task ...
                </span>
            </div>
        );
    }

    return <>
        {views}
    </>;
}