import { useEffect } from "react";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { usePlayer } from "../../context/Player.context";

export function DefeatNpcProcessor() {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "defeat-npc") {
            return R;
        }

        console.log("[ActionDefeatNpcProcessor]", "Processing defeat-npc event", ev);

        const currentLocation = player.getPlayerLocation();
        const target = ev.details.npc;

        for (const item of target.inventory.items) {
            if (item.lootable) {
                player.addItem(item);
                R.push(
                    history.getItem(item, "Looted from " + target.name)
                );
            }
        }
        if (target.inventory.gold > 0) {
            player.addGold(target.inventory.gold);
            R.push(
                history.getGold(target.inventory.gold, "Looted from " + target.name)
            );
        }

        if (target.gear.weapon && target.gear.weapon.lootable) {
            player.addItem(target.gear.weapon);
            R.push(
                history.getItem(target.gear.weapon, "Looted from " + target.name)
            );
        }
        if (target.gear.armor && target.gear.armor.lootable) {
            player.addItem(target.gear.armor);
            R.push(
                history.getItem(target.gear.armor, "Looted from " + target.name)
            );
        }
        if (target.gear.helmet && target.gear.helmet.lootable) {
            player.addItem(target.gear.helmet);
            R.push(
                history.getItem(target.gear.helmet, "Looted from " + target.name)
            );
        }
        if (target.gear.boots && target.gear.boots.lootable) {
            player.addItem(target.gear.boots);
            R.push(
                history.getItem(target.gear.boots, "Looted from " + target.name)
            );
        }
        if (target.gear.wearable && target.gear.wearable.lootable) {
            player.addItem(target.gear.wearable);
            R.push(
                history.getItem(target.gear.wearable, "Looted from " + target.name)
            );
        }

        const nextTarget = currentLocation.npcs.find(npc => npc.id !== target.id && npc.stance === "hostile" && npc.health.status !== "dead");

        if (nextTarget) {
            player.startCombat(nextTarget);
            R.push(
                history.startCombat(nextTarget)
            );
        } else {
            player.endCombat();
            player.changeSituation("wandering");
            R.push(
                history.changeSituation("wandering")
            );
        }

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}