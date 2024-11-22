import { useEffect, useReducer, useState } from "react";
import { usePlayer } from "../../context/Player.context";
import { Card } from "../Card";
import { CardTitle } from "../card/CardTitle";
import { CardLabelList } from "../card/CardLabelList";
import { WORLD_NPC_RACE_DISPLAYS } from "../../model/world.enums";
import { NpcActions } from "../actions/NpcActions";
import { NpcTooltip } from "../tooltips/NpcTooltip";
import { createNpcLabel } from "../labels/NpcLabel";

export function RoomNpcsInformation(props: any) {

    const [playerLocation, setPlayerLocation] = useState(null);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const player = usePlayer();

    useEffect(
        () => {
            const subs = [
                player.playerLocation.subscribe(
                    (location) => {
                        setPlayerLocation(location);
                        forceUpdate();
                    }
                ),
            ];
            return () => subs.forEach(s => s.unsubscribe());
        },
        []
    );

    const widgets = [];

    if (playerLocation && playerLocation.npcs.length === 0) {
        widgets.push(<span className="text-xs italic text-neutral-500" key="nonpcs">
            There are no living-beings in this location.
        </span>);
    }

    if (playerLocation && playerLocation.npcs.length > 0) {
        const npcLabels = [];
        for (const npc of playerLocation.npcs) {
            npcLabels.push(
                createNpcLabel(
                    npc,
                    { actions: ["talk", "attack"] }
                )
            );
        }
        widgets.push(
            <CardLabelList value={npcLabels} key="npcs" />
        );
    }

    return <>
        <Card>
            <CardTitle>Living-beings at this location</CardTitle>
            {widgets}
        </Card>
    </>
}