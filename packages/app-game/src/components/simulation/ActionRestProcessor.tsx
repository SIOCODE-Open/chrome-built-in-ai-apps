// ActionRestProcessor.tsx
import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionRestProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-rest") {
            return R;
        }

        console.log("[ActionRestProcessor]", "Processing action-rest event", ev);

        const currentSituation = player.getPlayerSituation();

        if (currentSituation !== "settled") {
            R.push(
                history.noop("You can't rest now. You are not settled.")
            );
            return R;
        }

        history.advanceTime(8 * 60 * 60);

        const health = player.getPlayerHealth();

        health.points = Math.min(health.points + 20, health.max);

        if (health.points <= health.max / 2) {
            health.status = "injured";
        } else {
            health.status = "healthy";
        }

        player.updatePlayerHealth(health);

        R.push(
            history.changeHealth(health)
        );

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
