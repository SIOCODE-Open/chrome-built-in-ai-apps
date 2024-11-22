import { useRef } from "react";
import { CommandProvider, ICommandContext } from "../context/Command.context";
import { BehaviorSubject, Subject } from "rxjs";

export function GameCommander(props: { children?: any }) {

    const input = useRef(
        new BehaviorSubject("")
    );

    const externalInput = useRef(
        new Subject<string>()
    );

    const contextValue: ICommandContext = {
        getInput: () => input.current.value,
        inputChanged: input.current.asObservable(),
        externalInput: externalInput.current.asObservable(),
        publishUserInput: (i: string) => {
            input.current.next(i);
        },
        publishExternalInput: (i: string) => {
            externalInput.current.next(i);
        },
    };

    return <>
        <CommandProvider value={contextValue}>
            {props.children}
        </CommandProvider>
    </>
}