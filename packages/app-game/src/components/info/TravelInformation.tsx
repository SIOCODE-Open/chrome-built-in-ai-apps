import { useEffect, useReducer, useState } from "react";
import { usePlayer } from "../../context/Player.context";
import { Card } from "../Card";
import { CardInfoTable } from "../card/CardInfoTable";
import { CardTitle } from "../card/CardTitle";
import { usePlayerActions } from "../../context/PlayerActions.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { WORLD_NODE_AREA_TYPE, WORLD_NODE_AREA_TYPE_DISPLAYS } from "../../model/world.enums";
import { LocationTooltip } from "../tooltips/LocationTooltip";

export function TravelInformation(props: any) {

    const [playerLocation, setPlayerLocation] = useState(null);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);
    const [controlsDisabled, setControlsDisabled] = useState(false);

    const player = usePlayer();
    const actions = usePlayerActions();
    const sim = useGameSimulation();

    useEffect(
        () => {
            const sub = player.playerLocation.subscribe(
                location => {
                    console.log("[TravelInformation]", "Player location changed", location);
                    setPlayerLocation(location);
                    forceUpdate();
                }
            );
            return () => sub.unsubscribe();
        },
        []
    );

    useEffect(
        () => {
            const subs = [
                sim.simulating.subscribe(
                    () => setControlsDisabled(true)
                ),
                sim.nextTurn.subscribe(
                    () => setControlsDisabled(false)
                )
            ];
            return () => subs.forEach(s => s.unsubscribe());
        },
        []
    );

    const travelTable = {};
    const travelTooltips = {};
    const possibleTravels = {};

    if (playerLocation) {
        for (const edge of playerLocation.outEdges) {
            if (edge.discovered) {
                const travelKey = `${edge.to.name} (${WORLD_NODE_AREA_TYPE_DISPLAYS[edge.to.type]})`;
                if (!possibleTravels[travelKey]) {
                    possibleTravels[travelKey] = [];
                }
                possibleTravels[travelKey].push(edge);
            }
        }
    }

    for (const key in possibleTravels) {
        const edges = possibleTravels[key];
        if (edges.length === 1) {
            travelTable[key] = <button className="text-xs px-2 py-1 disabled:bg-neutral-500 bg-blue-500 text-white font-bold rounded-full"
                disabled={controlsDisabled} onClick={() => actions.move(edges[0])}>Go</button>;
            travelTooltips[key] = <LocationTooltip value={edges[0].to} />;
        } else {
            for (let i = 0; i < edges.length; i++) {
                const newKey = `${key} [${i + 1}]`;
                travelTable[newKey] = <button className="text-xs px-2 py-1 disabled:bg-neutral-500 bg-blue-500 text-white font-bold rounded-full"
                    disabled={controlsDisabled} onClick={() => actions.move(edges[i])}>Go</button>;
                travelTooltips[newKey] = <LocationTooltip value={edges[i].to} />;
            }
        }
    }

    return <>
        {
            playerLocation && <Card>
                <CardTitle>You can go to</CardTitle>
                <CardInfoTable value={travelTable} tooltips={travelTooltips} />
                {
                    Object.keys(travelTable).length === 0 && <p className="text-xs italic text-center">
                        You don't know where you can go yet.
                    </p>
                }
            </Card>
        }
    </>;
}