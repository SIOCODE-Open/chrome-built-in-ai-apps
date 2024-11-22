import { useRef, useEffect, useState } from "react"
import { usePlayer } from "../../context/Player.context";
import { useWorld } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { useLanguageModel } from "@siocode/base";

export function ActionLookAroundProcessor(props: any) {

    const player = usePlayer();
    const world = useWorld();
    const history = useHistory();
    const lm = useLanguageModel();
    const sim = useGameSimulation();

    const processEvent: ((ev: IGameEvent) => Promise<Array<IGameEvent>>) = async (ev: IGameEvent) => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-look-around") {
            return R;
        }

        // Discover all edges from the current location

        const location = player.getPlayerLocation();
        const discovered = [];
        for (const outEdge of location.outEdges) {
            discovered.push(outEdge);
        }

        // Advance the time
        history.advanceTime(15);

        if (discovered.length > 0) {
            discovered.forEach(edge => R.push(history.discoverPath(edge)));
        }

        // Discover all items in the location
        const items = location.items;
        if (items.length > 0) {
            items.forEach(item => R.push(history.discoverItem(item)));
        }

        // Discover NPCs
        const npcs = location.npcs;
        if (npcs.length > 0) {
            npcs.forEach(npc => R.push(history.discoverNpc(npc)));
        }

        // Update the player location
        player.updatePlayerLocation(location);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
