import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { IWorldItem, IWorldNode, useWorld } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { ItemDetailGenerator } from "../../ai/ItemDetailGenerator";
import { WorldNodeDetailGenerator } from "../../ai/WorldNodeDetailGenerator";
import { useLanguageModel } from "@siocode/base";
import { WorldNodeDetailGenerator2 } from "../../ai/WorldNodeDetailGenerator2";

export function WakeUpProcessor(props: any) {
    const player = usePlayer();
    const world = useWorld();
    const history = useHistory();
    const sim = useGameSimulation();
    const lm = useLanguageModel();

    const populateItem = async (item: IWorldItem) => {
        const gen = new ItemDetailGenerator(lm);
        await gen.generate(item);
    };

    const populateNode = async (node: IWorldNode) => {
        const gen = new WorldNodeDetailGenerator2(lm);
        await gen.generate(node);
    };

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

        await populateNode(currentLocation);
        for (const item of currentLocation.items) {
            await populateItem(item);
            if (item.contains && item.contains.length > 0) {
                for (const containedItem of item.contains) {
                    await populateItem(containedItem);
                }
            }
        }
        for (const edge of currentLocation.outEdges) {
            await populateNode(edge.to);
        }
        for (const item of currentInventory.items) {
            await populateItem(item);
        }
        if (currentGear.weapon) {
            await populateItem(currentGear.weapon);
        }
        if (currentGear.armor) {
            await populateItem(currentGear.armor);
        }
        if (currentGear.helmet) {
            await populateItem(currentGear.helmet);
        }
        if (currentGear.boots) {
            await populateItem(currentGear.boots);
        }
        if (currentGear.wearable) {
            await populateItem(currentGear.wearable);
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
