import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { INonPlayerCharacter, IWorldItem, IWorldNode, useWorld } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { ItemDetailGenerator } from "../../ai/ItemDetailGenerator";
import { WorldNodeDetailGenerator } from "../../ai/WorldNodeDetailGenerator";
import { useLanguageModel } from "@siocode/base";
import { WorldNodeDetailGenerator2 } from "../../ai/WorldNodeDetailGenerator2";

export function ArriveProcessor(props: any) {
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

    const populateNpc = async (npc: INonPlayerCharacter) => {
        if (npc.gear) {
            if (npc.gear.armor) {
                await populateItem(npc.gear.armor);
            }
            if (npc.gear.boots) {
                await populateItem(npc.gear.boots);
            }
            if (npc.gear.helmet) {
                await populateItem(npc.gear.helmet);
            }
            if (npc.gear.weapon) {
                await populateItem(npc.gear.weapon);
            }
            if (npc.gear.wearable) {
                await populateItem(npc.gear.wearable);
            }
        }
        if (npc.inventory) {
            for (const item of npc.inventory.items) {
                await populateItem(item);
            }
        }
        if (npc.knowledge) {
            for (const k of npc.knowledge) {
                if (k.item) {
                    await populateItem(k.item);
                    await populateNode(k.itemLocation);
                }
                if (k.location) {
                    await populateNode(k.location);
                }
                if (k.npc) {
                    await populateNode(k.npcLocation);
                }
            }
        }
    };

    const processEvent: ((ev: IGameEvent) => Promise<Array<IGameEvent>>) = async (
        ev: IGameEvent
    ) => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "arrive") {
            return R;
        }

        console.log("[ArriveProcessor]", "Processing arrive event", ev);

        const currentLocation = player.getPlayerLocation();

        await populateNode(currentLocation);
        for (const item of currentLocation.items) {
            await populateItem(item);
            if (item.contains && item.contains.length > 0) {
                for (const containedItem of item.contains) {
                    await populateItem(containedItem);
                }
            }
        }
        for (const npc of currentLocation.npcs) {
            await populateNpc(npc);
        }
        for (const edge of currentLocation.outEdges) {
            await populateNode(edge.to);
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

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
