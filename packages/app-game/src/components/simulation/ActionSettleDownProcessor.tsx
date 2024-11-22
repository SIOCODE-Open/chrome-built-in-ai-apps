import { useRef, useEffect, useState } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldEdge, IWorldNode } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { useLanguageModel } from "@siocode/base";

export function ActionSettleDownProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent: ((
        ev: IGameEvent,
    ) => Promise<Array<IGameEvent>>) = async (ev: IGameEvent) => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-settle-down") {
            return R;
        }

        console.log("[ActionSettleDownProcessor]", "Processing action-settle-down event", ev);

        const currentLocation = player.getPlayerLocation();
        const currentSituation = player.getPlayerSituation();

        if (currentSituation !== "wandering") {
            console.warn("[ActionSettleDownProcessor]", "Player is not wandering", currentSituation);
            R.push(
                history.noop("You are not wandering, you cannot settle down here.")
            );
            return R;
        }

        // Advance the time
        history.advanceTime(15);

        // TODO: Check settle down conditions
        player.changeSituation("settled");
        R.push(
            history.changeSituation("settled")
        );

        // Update the player location
        player.updatePlayerLocation(currentLocation);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
