import { useRef } from "react";
import { NarrationProvider } from "../context/Narration.context";

export function GameNarration(props: { children?: any }) {

    const pastResponses = useRef<{ event: any, response: string }[]>([]);

    const contextValue = {
        getPastResponses: () => pastResponses.current,
        addPastResponse: (event: any, response: string) => {
            pastResponses.current.push({ event, response });
        }
    }

    return <>
        <NarrationProvider value={contextValue}>
            {props.children}
        </NarrationProvider>
    </>
}