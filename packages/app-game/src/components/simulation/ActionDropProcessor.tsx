// ActionDropProcessor.tsx
import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionDropProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-drop") {
            return R;
        }

        console.log("[ActionDropProcessor]", "Processing action-drop event", ev);

        const currentLocation = player.getPlayerLocation();
        const item: IWorldItem = ev.details.item;

        const itemInInventory = player
            .getPlayerInventory()
            .items.find((i) => i.id === item.id);

        if (!itemInInventory) {
            console.warn("[ActionDropProcessor]", "Invalid drop", item);
            R.push(
                history.noop(
                    "Nothing happens, because you don't have the item to drop."
                )
            );
            return R;
        }

        // Remove the item from inventory
        player.removeItem(itemInInventory);

        // Advance the time
        history.advanceTime(15);

        // Add the item to the current location
        currentLocation.items.push(itemInInventory);
        R.push(
            history.loseItem(
                itemInInventory,
                "Dropped at " + currentLocation.name
            )
        );

        // Update the player location
        player.updatePlayerLocation(currentLocation);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
