import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { IWorldItem, IWorldNode, useWorld } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { ItemDetailGenerator } from "../../ai/ItemDetailGenerator";
import { WorldNodeDetailGenerator } from "../../ai/WorldNodeDetailGenerator";
import { useLanguageModel } from "@siocode/base";
import { WorldNodeDetailGenerator2 } from "../../ai/WorldNodeDetailGenerator2";
import { populateItem, populateNode } from "../../model/GamePopulator";

export function WakeUpProcessor(props: any) {
    const player = usePlayer();
    const world = useWorld();
    const history = useHistory();
    const sim = useGameSimulation();
    const lm = useLanguageModel();

    const processEvent: ((ev: IGameEvent) => Promise<Array<IGameEvent>>) = async (
        ev: IGameEvent
    ) => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "wake-up") {
            return R;
        }

        console.log("[WakeUpProcessor]", "Processing wake-up event", ev);

        const currentLocation = player.getPlayerLocation();
        const currentInventory = player.getPlayerInventory();
        const currentGear = player.getPlayerGear();

        await populateNode(lm, currentLocation);
        for (const item of currentLocation.items) {
            await populateItem(lm, item);
            if (item.contains && item.contains.length > 0) {
                for (const containedItem of item.contains) {
                    await populateItem(lm, containedItem);
                }
            }
        }
        for (const edge of currentLocation.outEdges) {
            await populateNode(lm, edge.to);
        }
        for (const item of currentInventory.items) {
            await populateItem(lm, item);
        }
        if (currentGear.weapon) {
            await populateItem(lm, currentGear.weapon);
        }
        if (currentGear.armor) {
            await populateItem(lm, currentGear.armor);
        }
        if (currentGear.helmet) {
            await populateItem(lm, currentGear.helmet);
        }
        if (currentGear.boots) {
            await populateItem(lm, currentGear.boots);
        }
        if (currentGear.wearable) {
            await populateItem(lm, currentGear.wearable);
        }

        // Advance the time
        history.advanceTime(15);

        // Update the player location and gear
        player.updatePlayerLocation(currentLocation);
        player.updatePlayerGear(currentGear);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
