import { InfoViews } from "./InfoViews";
import { GameFeed } from "./GameFeed";
import { GameWorld } from "./GameWorld";
import { GamePlayer } from "./GamePlayer";
import { GameHistory } from "./GameHistory";
import { GamePlayerActions } from "./GamePlayerActions";
import { GameCommander } from "./GameCommander";
import { GameSimulation } from "./GameSimulation";
import { GameNarration } from "./GameNarration";
import { GameHeader } from "./GameHeader";
import { GameCharacterCreation } from "./GameCharacterCreation";
import { App } from "@siocode/base";
import { GameHeaderMiddle } from "./header/GameHeaderMiddle";
import { GameHeaderRight } from "./header/GameHeaderRight";
import { useEffect, useState } from "react";
import { CharacterCreationScreen } from "./CharacterCreationScreen";
import { GameLayout } from "./GameLayout";
import { useGameLayout } from "../context/GameLayout.context";
import { LoadingModal } from "./LoadingModal";
import { GameOverScreen } from "./GameOverScreen";
import { GameTutorialWizard } from "./GameTutorialWizard";

function ShownLayout() {

    const layout = useGameLayout();

    const [currentLayout, setCurrentLayout] = useState(layout.getLayout());

    useEffect(
        () => {
            const sub = layout.layoutChanged.subscribe(
                () => setCurrentLayout(layout.getLayout())
            );
            return () => sub.unsubscribe();
        },
        []
    );

    if (currentLayout === "split-even") {
        return <>
            <div className="w-full h-1/2 overflow-hidden p-1 border-b border-b-1 dark:bg-neutral-900 dark:text-white">
                <InfoViews />
            </div>
            <div className="w-full h-1/2 overflow-hidden p-1 dark:bg-neutral-900 dark:text-white">
                <GameFeed />
            </div>
            <LoadingModal />
        </>;
    }

    if (currentLayout === "split-focus-top") {
        return <>
            <div className="w-full h-3/4 overflow-hidden p-1 border-b border-b-1 dark:bg-neutral-900 dark:text-white">
                <InfoViews />
            </div>
            <div className="w-full h-1/4 overflow-hidden p-1 dark:bg-neutral-900 dark:text-white">
                <GameFeed />
            </div>
            <LoadingModal />
        </>;
    }

    if (currentLayout === "split-focus-bottom") {
        return <>
            <div className="w-full h-1/4 overflow-hidden p-1 dark:bg-neutral-900 dark:text-white">
                <InfoViews />
            </div>
            <div className="w-full h-3/4 overflow-hidden p-1 border-t border-t-1 dark:bg-neutral-900 dark:text-white">
                <GameFeed />
            </div>
            <LoadingModal />
        </>;
    }

    if (currentLayout === "top-only") {
        return <>
            <div className="w-full h-full overflow-hidden p-1 border-b border-b-1 dark:bg-neutral-900 dark:text-white">
                <InfoViews />
            </div>
            <div className="hidden">
                <GameFeed />
            </div>
            <LoadingModal />
        </>;
    }

    if (currentLayout === "bottom-only") {
        return <>
            <div className="hidden">
                <InfoViews />
            </div>
            <div className="w-full h-full overflow-hidden p-1 dark:bg-neutral-900 dark:text-white">
                <GameFeed />
            </div>
            <LoadingModal />
        </>;
    }

    if (currentLayout === "game-over") {
        return <>
            <div className="w-full h-full overflow-y-auto overflow-x-hidden p-1 border-b border-b-1 dark:bg-neutral-900 dark:text-white">
                <GameOverScreen />
            </div>
        </>;
    }

    return null;

}

export function AppGame() {

    const [wizardCompleted, setWizardCompleted] = useState(false);
    const [characterCreated, setCharacterCreated] = useState(false);

    if (!wizardCompleted) {
        return <GameTutorialWizard onFinished={() => setWizardCompleted(true)} />;
    }

    if (!characterCreated) {
        return <GameCharacterCreation>
            <CharacterCreationScreen
                onFinished={() => setCharacterCreated(true)} />
        </GameCharacterCreation>;
    }

    return <GameHeader>
        <GameLayout>
            <App headerMiddle={<GameHeaderMiddle />} headerRight={<GameHeaderRight />}>
                <GameHistory>
                    <GameNarration>
                        <GameWorld>
                            <GamePlayer>
                                <GameSimulation>
                                    <GamePlayerActions>
                                        <GameCommander>
                                            <ShownLayout />
                                        </GameCommander>
                                    </GamePlayerActions>
                                </GameSimulation>
                            </GamePlayer>
                        </GameWorld>
                    </GameNarration>
                </GameHistory>
            </App>
        </GameLayout>
    </GameHeader>;
}