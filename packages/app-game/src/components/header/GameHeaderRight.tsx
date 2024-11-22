import { useEffect, useState } from "react";
import { useGameHeader } from "../../context/GameHeader.context";

export function GameHeaderRight(props: any) {

    const [content, setContent] = useState<any>(null);

    const gh = useGameHeader();

    useEffect(
        () => {
            const sub = gh.rightChanged.subscribe(
                setContent
            );
            return () => sub.unsubscribe();
        },
        []
    );

    return <>
        {content}
    </>
}