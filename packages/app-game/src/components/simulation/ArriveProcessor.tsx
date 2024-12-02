import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { INonPlayerCharacter, IWorldItem, IWorldNode, useWorld } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { ItemDetailGenerator } from "../../ai/ItemDetailGenerator";
import { WorldNodeDetailGenerator } from "../../ai/WorldNodeDetailGenerator";
import { useLanguageModel } from "@siocode/base";
import { WorldNodeDetailGenerator2 } from "../../ai/WorldNodeDetailGenerator2";
import { populateItem, populateNode, populateNpc } from "../../model/GamePopulator";

export function ArriveProcessor(props: any) {
    const player = usePlayer();
    const world = useWorld();
    const history = useHistory();
    const sim = useGameSimulation();
    const lm = useLanguageModel();

    const processEvent: ((ev: IGameEvent) => Promise<Array<IGameEvent>>) = async (
        ev: IGameEvent
    ) => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "arrive") {
            return R;
        }

        console.log("[ArriveProcessor]", "Processing arrive event", ev);

        const currentLocation = player.getPlayerLocation();

        await populateNode(lm, currentLocation);
        for (const item of currentLocation.items) {
            await populateItem(lm, item);
            if (item.contains && item.contains.length > 0) {
                for (const containedItem of item.contains) {
                    await populateItem(lm, containedItem);
                }
            }
        }
        for (const npc of currentLocation.npcs) {
            await populateNpc(lm, npc);
        }
        for (const edge of currentLocation.outEdges) {
            await populateNode(lm, edge.to);
        }

        // Update the player location
        player.updatePlayerLocation(currentLocation);

        // Check if we encountered any hostile NPCs
        for (const npc of currentLocation.npcs) {
            if (npc.stance === "hostile") {
                R.push(
                    history.changeSituation("combat")
                );
                player.startCombat(npc);
                R.push(
                    history.startCombat(npc)
                );
                player.changeSituation("combat");
                history.advanceTime(15);
                break;
            }
        }

        // Check if we have any active quests to reach this place
        const activeQuests = player.getActiveQuests();
        for (const quest of activeQuests) {
            if (quest.type === "find-location" && quest.findLocation!.location.id === currentLocation.id) {
                quest.findLocation!.didVisit = true;
                R.push(
                    history.noop(
                        "You have reached the location your quest required you to reach."
                    )
                );
            }
        }

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
