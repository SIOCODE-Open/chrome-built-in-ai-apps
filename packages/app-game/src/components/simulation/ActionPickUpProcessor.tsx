// ActionPickUpProcessor.tsx
import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionPickUpProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-pick-up") {
            return R;
        }

        console.log("[ActionPickUpProcessor]", "Processing action-pick-up event", ev);

        const currentLocation = player.getPlayerLocation();
        const item: IWorldItem = ev.details.item;

        const itemInLocation = currentLocation.items.find(
            (i) => i.id === item.id
        );

        if (!itemInLocation) {
            console.warn("[ActionPickUpProcessor]", "Invalid pick up", item);
            R.push(history.noop("Nothing happens, because the item is not here."));
            return R;
        }

        if (itemInLocation.static) {
            console.warn("[ActionPickUpProcessor]", "Cannot pick up static item", item);
            R.push(
                history.noop(
                    "Nothing happens, because the item is too heavy to be picked up."
                )
            );
            return R;
        }

        currentLocation.items = currentLocation.items.filter(
            (i) => i.id !== item.id
        );

        // Advance the time
        history.advanceTime(15);

        player.addItem(itemInLocation);
        R.push(
            history.getItem(
                itemInLocation,
                "Picked up from " + currentLocation.name
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
