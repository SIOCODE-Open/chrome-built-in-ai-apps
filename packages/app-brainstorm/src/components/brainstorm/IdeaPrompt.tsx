import { useEffect, useState } from "react";
import { useIdea } from "../../context/Idea.context";

export function IdeaPrompt(props: any) {

    const [ideaPrompt, setIdeaPrompt] = useState<string>("");

    const idea = useIdea();

    useEffect(
        () => {
            setIdeaPrompt(
                idea.getIdea().prompt
            );
        },
        []
    );

    return <>
        <p className="text-sm">{ideaPrompt}</p>
    </>;

}