import { useEffect } from "react";
import { usePlayer, } from "../../context/Player.context";
import { useWorld } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { IWorldItem } from "../../context/World.context";
import { WorldPlayerEquipSlot } from "../../model/world.enums";

export function ActionUnequipProcessor(props: any) {
    const player = usePlayer();
    const world = useWorld();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent: ((ev: IGameEvent) => Promise<Array<IGameEvent>>) = async (
        ev: IGameEvent
    ) => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-unequip") {
            return R;
        }

        console.log("[ActionUnequipProcessor]", "Processing action-unequip event", ev);

        const slot = ev.details.slot as WorldPlayerEquipSlot;
        const gear = player.getPlayerGear();

        const item = gear[slot];

        if (!item) {
            console.warn("[ActionUnequipProcessor]", "Invalid unequip", slot);
            R.push(history.noop("Nothing happens, because the slot is empty."));
            return R;
        }

        // Add the item to the player inventory
        player.addItem(item);

        // Unequip the item
        player.updatePlayerGear({
            ...gear,
            [slot]: null,
        });

        // Advance the time
        history.advanceTime(60);

        R.push(history.unequipItem(item, slot));

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
