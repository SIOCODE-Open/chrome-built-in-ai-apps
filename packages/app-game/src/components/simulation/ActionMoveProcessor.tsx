import { useRef, useEffect, useState } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldEdge, IWorldNode } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { useLanguageModel } from "@siocode/base";

export function ActionMoveProcessor(props: any) {
    const player = usePlayer();
    const world = useWorld();
    const history = useHistory();
    const lm = useLanguageModel();
    const sim = useGameSimulation();

    const processEvent: ((
        ev: IGameEvent,
    ) => Promise<Array<IGameEvent>>) = async (ev: IGameEvent) => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-move") {
            return R;
        }

        console.log("[ActionMoveProcessor]", "Processing action-move event", ev);

        const currentLocation = player.getPlayerLocation();
        const currentSituation = player.getPlayerSituation();
        const edge = ev.details.through as IWorldEdge;

        if (currentLocation.id !== edge.from.id) {
            console.warn("[ActionMoveProcessor]", "Invalid move", edge);
            return R;
        }

        if (currentSituation === "combat") {
            // Attempt to flee from combat
            // TODO: Things affecting flee chance
            const fleeRoll = Math.random();
            if (fleeRoll > 0.2) {
                // Failed flee
                R.push(
                    history.failFlee("You try to flee, but you are too slow!")
                );
                R.push(
                    history.npcAttack(player.getInCombatWith())
                );
                return R;
            }
            R.push(
                history.flee("You manage to flee from combat!")
            );
            player.changeSituation("wandering");
            R.push(
                history.changeSituation("wandering")
            );
            player.endCombat();
        } else if (currentSituation === "settled") {
            R.push(
                history.noop("You pack up in a hurry, and hit the road.")
            );
            player.changeSituation("wandering");
            R.push(
                history.changeSituation("wandering")
            );
        } else if (currentSituation === "conversation") {
            R.push(
                history.noop("You rudely leave your conversation partner behind, and hit the road.")
            );
            player.changeSituation("wandering");
            R.push(
                history.changeSituation("wandering")
            );
            player.endConversation();
        }

        console.log("[ActionMoveProcessor]", "Moving to", edge.to.name);

        // Advance the time
        history.advanceTime(edge.distance * 15);

        // Publish a message
        R.push(history.arrive(edge.to));

        // Update the player location
        player.updatePlayerLocation(edge.to);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
