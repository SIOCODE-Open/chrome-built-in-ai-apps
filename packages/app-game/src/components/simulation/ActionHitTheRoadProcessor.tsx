import { useRef, useEffect, useState } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldEdge, IWorldNode } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { useLanguageModel } from "@siocode/base";

export function ActionHitTheRoadProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent: ((
        ev: IGameEvent,
    ) => Promise<Array<IGameEvent>>) = async (ev: IGameEvent) => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-hit-the-road") {
            return R;
        }

        console.log("[ActionHitTheRoadProcessor]", "Processing action-hit-the-road event", ev);

        const currentLocation = player.getPlayerLocation();
        const currentSituation = player.getPlayerSituation();

        if (currentSituation !== "settled") {
            console.warn("[ActionHitTheRoadProcessor]", "Player is not settled", currentSituation);
            R.push(
                history.noop("You are not settled, you cannot hit the road.")
            );
            return R;
        }

        // Advance the time
        history.advanceTime(15);

        // TODO: Check settle down conditions
        player.changeSituation("wandering");
        R.push(
            history.changeSituation("wandering")
        );

        // Update the player location
        player.updatePlayerLocation(currentLocation);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
