import { useEffect, useReducer, useState } from "react";
import { usePlayer } from "../../context/Player.context";
import { Card } from "../Card";
import { CardInfoTable } from "../card/CardInfoTable";
import { CardTitle } from "../card/CardTitle";
import { usePlayerActions } from "../../context/PlayerActions.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { WORLD_NODE_AREA_TYPE, WORLD_NODE_AREA_TYPE_DISPLAYS } from "../../model/world.enums";
import { LocationTooltip } from "../tooltips/LocationTooltip";
import { findPath } from "../../model/PathFinder";
import classNames from "classnames";
import { TooltipText } from "../TooltipText";

export function TravelInformation(props: any) {

    const [playerLocation, setPlayerLocation] = useState(null);
    const [navigationTarget, setNavigationTarget] = useState(null);
    const [navigationPathNodes, setNavigationPathNodes] = useState([]);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);
    const [controlsDisabled, setControlsDisabled] = useState(false);

    const player = usePlayer();
    const actions = usePlayerActions();
    const sim = useGameSimulation();

    useEffect(
        () => {
            const subs = [
                sim.simulating.subscribe(
                    () => setControlsDisabled(true)
                ),
                sim.nextTurn.subscribe(
                    () => setControlsDisabled(false)
                ),
                player.playerLocation.subscribe(
                    location => {
                        setPlayerLocation(location);

                        let newPath = [];
                        const nt = player.getNavigationTarget();
                        if (nt) {
                            newPath = findPath(location, nt)
                        } else {
                            newPath = [];
                        }

                        console.log("[TravelInformation]", "Player location changed", location, nt, newPath);
                        setNavigationPathNodes(newPath);

                        forceUpdate();
                    }
                ),
                player.navigationTarget.subscribe(
                    location => {
                        setNavigationTarget(location);

                        let newPath = [];
                        const pc = player.getPlayerLocation();
                        if (location) {
                            newPath = findPath(pc, location)
                        } else {
                            newPath = [];
                        }

                        console.log("[TravelInformation]", "Navigation target changed", pc, location, newPath);
                        setNavigationPathNodes(newPath);

                        forceUpdate();
                    }
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

    const buttonForLocation = (edge) => {

        const buttonCn = classNames(
            "text-xs px-2 py-1 disabled:bg-neutral-500 text-white font-bold rounded-full",
            {
                "bg-blue-500": !navigationPathNodes || !navigationPathNodes.some(n => n.id === edge.to.id),
                "bg-green-500": navigationPathNodes && navigationPathNodes.some(n => n.id === edge.to.id)
            }
        );

        if (navigationPathNodes && navigationPathNodes.some(n => n.id === edge.to.id)) {
            return <TooltipText tooltip={<span className="text-xs font-normal italic text-left text-black dark:text-white">Hops to reach navigation target: {navigationPathNodes.length - 1}</span>}>
                <button className={buttonCn}
                    disabled={controlsDisabled} onClick={() => actions.move(edge)}>Go</button>
            </TooltipText>
        }

        return <button className={buttonCn}
            disabled={controlsDisabled} onClick={() => actions.move(edge)}>Go</button>;
    };

    const tooltipForLocation = (location) => {
        return <LocationTooltip value={location} />;
    }

    for (const key in possibleTravels) {
        const edges = possibleTravels[key];
        if (edges.length === 1) {
            travelTable[key] = buttonForLocation(edges[0]);
            travelTooltips[key] = tooltipForLocation(edges[0].to);
        } else {
            for (let i = 0; i < edges.length; i++) {
                const newKey = `${key} [${i + 1}]`;
                travelTable[newKey] = buttonForLocation(edges[i]);
                travelTooltips[newKey] = tooltipForLocation(edges[i].to);
            }
        }
    }

    const cancelNavigation = () => {
        player.endNavigation();
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
                {
                    navigationTarget && <button className="w-full text-xs px-2 py-1 bg-red-500 text-white font-bold rounded-full" onClick={cancelNavigation}>
                        Cancel navigation
                    </button>
                }
            </Card>
        }
    </>;
}