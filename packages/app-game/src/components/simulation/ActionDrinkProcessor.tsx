// ActionDrinkProcessor.tsx
import { useEffect } from "react";
import { usePlayer, IPlayerThirst } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionDrinkProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-drink") {
            return R;
        }

        console.log("[ActionDrinkProcessor]", "Processing action-drink event", ev);

        const currentLocation = player.getPlayerLocation();
        const item: IWorldItem = ev.details.item;

        const itemInInventory = player
            .getPlayerInventory()
            .items.find((i) => i.id === item.id);
        const itemInLocation = currentLocation.items.find(
            (i) => i.id === item.id
        );

        if (!itemInInventory && !itemInLocation) {
            console.warn("[ActionDrinkProcessor]", "Invalid drink", item);
            R.push(history.noop("Nothing happens, because the item is not here."));
            return R;
        }

        if (itemInInventory) {
            player.removeItem(itemInInventory);
            R.push(history.consumeInventoryItem(itemInInventory));
        }

        if (itemInLocation) {
            currentLocation.items = currentLocation.items.filter(
                (i) => i.id !== item.id
            );
            R.push(history.consumeLocationItem(itemInLocation, currentLocation));
        }

        const t: IPlayerThirst = {
            status: item.type === "drink" ? "hydrated" : "dehydrated",
            lastDrink: item,
            lastDrinkTime: history.t(),
        };

        // Advance the time
        history.advanceTime(15);

        // Thirst change
        R.push(history.changeThirst(t));

        // Update the player thirst
        player.updatePlayerThirst(t);

        // Update the player location
        player.updatePlayerLocation(currentLocation);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
