import { useEffect, useState } from "react";
import { useGameHeader } from "../../context/GameHeader.context";

export function GameHeaderMiddle(props: any) {

    const [content, setContent] = useState<any>(null);

    const gh = useGameHeader();

    useEffect(
        () => {
            const sub = gh.middleChanged.subscribe(
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