import { useRef } from "react";
import { IGeneratedIdea, IProjectContext, ProjectProvider } from "../context/Project.context";
import { BehaviorSubject, Subject } from "rxjs";

export function AppProject(props: any) {

    const generatingIdeas = useRef(
        new BehaviorSubject<boolean>(false)
    );
    const generatedIdeas = useRef(
        new BehaviorSubject<Array<IGeneratedIdea>>([])
    );
    const scratchPadContent = useRef(
        new BehaviorSubject<string>(
            localStorage.getItem('scratchpad.content') || ""
        )
    );
    const scratchPadContentPushed = useRef(
        new Subject<string>()
    );

    const contextValue: IProjectContext = {
        isGeneratingIdeas: () => generatingIdeas.current.value,
        generatingIdeasChanged: generatingIdeas.current.asObservable(),
        getGeneratedIdeas: () => generatedIdeas.current.value,
        generatedIdeasChanged: generatedIdeas.current.asObservable(),
        getScratchPadContent: () => scratchPadContent.current.value,
        scratchPadContentChanged: scratchPadContent.current.asObservable(),
        scratchPadContentPushed: scratchPadContentPushed.current.asObservable(),

        startGeneratingIdeas: () => generatingIdeas.current.next(true),
        stopGeneratingIdeas: () => generatingIdeas.current.next(false),
        addGeneratedIdea: (idea: IGeneratedIdea) => generatedIdeas.current.next([...generatedIdeas.current.value, idea]),
        clearGeneratedIdeas: () => generatedIdeas.current.next([]),
        publishScratchPadContent: (content: string) => scratchPadContent.current.next(content),
        pushScratchPadContent: (content: string) => scratchPadContentPushed.current.next(content),
    };

    return <>
        <ProjectProvider value={contextValue}>
            {props.children}
        </ProjectProvider>
    </>;
}