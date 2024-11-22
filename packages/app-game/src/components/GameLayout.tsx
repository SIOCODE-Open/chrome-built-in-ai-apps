import { useEffect, useReducer, useRef } from "react";
import { GameLayoutProvider, GameLayoutType, IGameLayoutContext, useGameLayout } from "../context/GameLayout.context";
import { BehaviorSubject } from "rxjs";
import { useGameHeader } from "../context/GameHeader.context";
import classNames from "classnames";
import { Icon } from "@iconify/react";

function GameHeaderLayoutSwitcher() {

    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const layout = useGameLayout();

    const buttonClassname = (buttonLayout: GameLayoutType) => {
        return classNames(
            "w-6 h-6 flex flex-col justify-center items-center text-sm",
            {
                "text-black dark:text-white": layout.getLayout() === buttonLayout,
                "text-neutral-400": layout.getLayout() !== buttonLayout
            }
        )
    };

    useEffect(
        () => {
            const sub = layout.layoutChanged.subscribe(
                () => forceUpdate()
            );
            return () => sub.unsubscribe();
        },
        []
    );

    return <>
        <div className="flex flex-row justify-start items-center">
            <button onClick={() => layout.changeLayout("split-even")}
                className={buttonClassname("split-even")}>
                <Icon icon="material-symbols:splitscreen" />
            </button>
            <button onClick={() => layout.changeLayout("split-focus-top")}
                className={buttonClassname("split-focus-top")}>
                <Icon icon="material-symbols:splitscreen-top" />
            </button>
            <button onClick={() => layout.changeLayout("split-focus-bottom")}
                className={buttonClassname("split-focus-bottom")}>
                <Icon icon="material-symbols:splitscreen-bottom" />
            </button>
            <button onClick={() => layout.changeLayout("top-only")}
                className={buttonClassname("top-only")}>
                <Icon icon="material-symbols:move-selection-up-rounded" />
            </button>
            <button onClick={() => layout.changeLayout("bottom-only")}
                className={buttonClassname("bottom-only")}>
                <Icon icon="material-symbols:move-selection-down-rounded" />
            </button>
        </div>
    </>;

}

export function GameLayout(props: { children?: any }) {

    const gh = useGameHeader();

    const layoutRef = useRef(
        new BehaviorSubject<GameLayoutType>("split-even")
    );

    const contextValue: IGameLayoutContext = {
        layoutChanged: layoutRef.current.asObservable(),
        getLayout: () => layoutRef.current.value,
        changeLayout: (layout: GameLayoutType) => layoutRef.current.next(layout)
    };

    useEffect(
        () => {
            gh.changeRight(<GameHeaderLayoutSwitcher />);
        },
        []
    );

    return <GameLayoutProvider value={contextValue}>
        {props.children}
    </GameLayoutProvider>
}