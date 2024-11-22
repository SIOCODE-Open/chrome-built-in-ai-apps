import { useRef } from "react";
import { GameHeaderProvider, IGameHeaderContext } from "../context/GameHeader.context";
import { BehaviorSubject } from "rxjs";

export function GameHeader(props: { children?: any }) {

    const middleChangedRef = useRef(
        new BehaviorSubject<any>(null)
    );

    const rightChangedRef = useRef(
        new BehaviorSubject<any>(null)
    );

    const contextValue: IGameHeaderContext = {
        middleChanged: middleChangedRef.current.asObservable(),
        changeMiddle: (middle: any) => middleChangedRef.current.next(middle),
        rightChanged: rightChangedRef.current.asObservable(),
        changeRight: (right: any) => rightChangedRef.current.next(right),
    };

    return <GameHeaderProvider value={contextValue}>
        {props.children}
    </GameHeaderProvider>;
}