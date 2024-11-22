// ActionUseProcessor.tsx
import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionUseProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-use-item") {
            return R;
        }

        console.log("[ActionUseProcessor]", "Processing action-use-item event", ev);

        const currentLocation = player.getPlayerLocation();
        const item: IWorldItem = ev.details.item;

        const itemInInventory = player
            .getPlayerInventory()
            .items.find((i) => i.id === item.id);
        const itemInLocation = currentLocation
            .items
            .find((i) => i.id === item.id);

        if (!itemInInventory && !itemInLocation) {
            console.warn("[ActionUseProcessor]", "Invalid use-item", item);
            R.push(
                history.noop(
                    "Nothing happens, because you don't have the item to use-item."
                )
            );
            return R;
        }

        if (item.type !== "consumable") {
            console.warn("[ActionUseProcessor]", "Invalid use-item", item);
            R.push(
                history.noop(
                    "Nothing happens, because you can't use this item. It's not a consumable."
                )
            );
            return R;
        }

        // Advance the time
        history.advanceTime(15);

        // Remove the item from inventory
        if (itemInInventory) {
            player.removeItem(itemInInventory);
            R.push(
                history.consumeInventoryItem(
                    itemInInventory
                )
            );
        } else {
            currentLocation.items = currentLocation.items.filter((i) => i.id !== item.id);
            R.push(
                history.consumeLocationItem(
                    itemInLocation,
                    currentLocation
                )
            );
        }

        for (const eff of item.consumable.effects) {

            if (eff.type === "heal") {
                const health = player.getPlayerHealth();
                health.points += eff.value;
                R.push(
                    history.changeHealth(health)
                );
                player.updatePlayerHealth(health);
            } else if (eff.type === "restore-hunger") {
                const hunger = player.getPlayerHunger();
                hunger.lastMealTime = Date.now();
                hunger.status = "full";
                R.push(
                    history.changeHunger(hunger)
                );
                player.updatePlayerHunger(hunger);
            } else if (eff.type === "restore-thirst") {
                const thirst = player.getPlayerThirst();
                thirst.lastDrinkTime = Date.now();
                thirst.status = "hydrated";
                R.push(
                    history.changeThirst(thirst)
                );
                player.updatePlayerThirst(thirst);
            } else if (eff.type === "damage-enemy") {
                const foe = player.getInCombatWith();

                if (foe) {
                    const foeHealth = foe.health;
                    foeHealth.points -= eff.value;
                    R.push(
                        history.inflictDamage(foe, eff.value)
                    );

                    if (foeHealth.points <= 0) {
                        foeHealth.status = "dead";
                        R.push(
                            history.defeatNpc(foe)
                        );
                        currentLocation.npcs = currentLocation.npcs.filter((npc) => npc.id !== foe.id);
                    }
                } else {
                    R.push(
                        history.noop("You use the item, but there is no enemy to damage.")
                    );
                }
            } else if (eff.type === "damage-self") {
                const health = player.getPlayerHealth();
                health.points -= eff.value;
                R.push(
                    history.takeDamageFromWorld(eff.value)
                );
                player.updatePlayerHealth(health);
            } else {
                R.push(
                    history.noop("You use the item, but nothing happens.")
                );
            }

        }

        player.updatePlayerLocation(currentLocation);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
