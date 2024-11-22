import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionUnpackProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-unpack") {
            return R;
        }

        console.log("[ActionUnpackProcessor]", "Processing action-unpack event", ev);

        const currentLocation = player.getPlayerLocation();
        const item: IWorldItem = ev.details.item;

        const itemInLocation = currentLocation
            .items.find((i) => i.id === item.id);

        if (!itemInLocation) {
            console.warn("[ActionUnpackProcessor]", "Invalid unpack", item);
            R.push(
                history.noop(
                    "Nothing happens, because the item is not in this location."
                )
            );
            return R;
        }

        if (!item.contains || item.contains.length === 0) {
            console.warn("[ActionUnpackProcessor]", "Invalid unpack", item);
            R.push(
                history.noop(
                    "Nothing happens, because it doesn't contain anything."
                )
            );
            return R;
        }

        // Remove the items from contains
        for (const containedItem of item.contains) {
            currentLocation.items.push(containedItem);
            R.push(
                history.unpackedItem(containedItem)
            );

            // Advance the time
            history.advanceTime(item.contains.length * 15);
        }
        item.contains = [];

        // Update the player location
        player.updatePlayerLocation(currentLocation);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
