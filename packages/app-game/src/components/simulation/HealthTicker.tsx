import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function HealthTicker() {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const onTick = async (now: any) => {

        const R: Array<IGameEvent> = [];

        const health = player.getPlayerHealth();

        let doChange = false;

        if (health.points > health.max) {
            health.points = health.max;
            doChange = true;
        }

        if (health.points <= 0.5 * health.max && health.status !== "injured") {
            health.status = "injured";
            doChange = true;
        }

        if (health.points > 0.5 * health.max && health.status !== "healthy") {
            health.status = "healthy";
            doChange = true;
        }

        if (doChange) {
            R.push(
                history.changeHealth(health)
            );
        }

        return R;
    }


    useEffect(
        () => {
            sim.addTickProcessor(onTick);
        },
        []
    );

    return <></>;
}