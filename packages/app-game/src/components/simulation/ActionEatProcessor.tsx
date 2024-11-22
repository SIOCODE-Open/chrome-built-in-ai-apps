// ActionEatProcessor.tsx
import { useEffect } from "react";
import { usePlayer, IPlayerHunger } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionEatProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-eat") {
            return R;
        }

        console.log("[ActionEatProcessor]", "Processing action-eat event", ev);

        const currentLocation = player.getPlayerLocation();
        const item: IWorldItem = ev.details.item;

        const itemInInventory = player
            .getPlayerInventory()
            .items.find((i) => i.id === item.id);
        const itemInLocation = currentLocation.items.find(
            (i) => i.id === item.id
        );

        if (!itemInInventory && !itemInLocation) {
            console.warn("[ActionEatProcessor]", "Invalid eat", item);
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

        const h: IPlayerHunger = {
            status: item.type === "food" ? "full" : "starving",
            lastMeal: item,
            lastMealTime: history.t(),
        };

        // Advance the time
        history.advanceTime(15);

        // Hunger change
        R.push(history.changeHunger(h));

        // Update the player hunger
        player.updatePlayerHunger(h);

        // Update the player location
        player.updatePlayerLocation(currentLocation);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
