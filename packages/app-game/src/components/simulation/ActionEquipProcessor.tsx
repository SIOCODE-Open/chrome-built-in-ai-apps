import { useEffect } from "react";
import { usePlayer, } from "../../context/Player.context";
import { useWorld } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { IWorldItem } from "../../context/World.context";
import { WorldPlayerEquipSlot, WorldPlayerSkill } from "../../model/world.enums";

export function ActionEquipProcessor(props: any) {
    const player = usePlayer();
    const world = useWorld();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent: ((ev: IGameEvent) => Promise<Array<IGameEvent>>) = async (
        ev: IGameEvent
    ) => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-equip") {
            return R;
        }

        console.log("[ActionEquipProcessor]", "Processing action-equip event", ev);

        let equipSlot = ev.details.slot as WorldPlayerEquipSlot;
        const equipItem = ev.details.item as IWorldItem;

        const hasSkill = (skill: WorldPlayerSkill) => {
            return !!player.getPlayerSkills().skills.find((s) => s === skill);
        };

        const location = player.getPlayerLocation();
        const itemInLocation = location.items.find((i) => i.id === equipItem.id);
        const itemInInventory = player
            .getPlayerInventory()
            .items.find((i) => i.id === equipItem.id);

        if (!itemInLocation && !itemInInventory) {
            console.warn("[ActionEquipProcessor]", "Invalid equip", equipItem);
            R.push(history.noop("Nothing happens, because the item is not here."));
            return R;
        }

        if (!equipSlot) {
            if (equipItem.type === "weapon") {
                equipSlot = "weapon";
            } else if (equipItem.type === "armor") {
                equipSlot = "armor";
            } else if (equipItem.type === "boots") {
                equipSlot = "boots";
            } else if (equipItem.type === "helmet") {
                equipSlot = "helmet";
            } else if (equipItem.type === "wearable") {
                equipSlot = "wearable";
            }
        }

        const isValidEquip =
            equipSlot &&
            ((equipItem.type === "weapon" && equipSlot === "weapon") ||
                (equipItem.type === "armor" && equipSlot === "armor") ||
                (equipItem.type === "boots" && equipSlot === "boots") ||
                (equipItem.type === "helmet" && equipSlot === "helmet") ||
                (equipItem.type === "wearable" && equipSlot === "wearable"));

        if (!isValidEquip) {
            console.warn(
                "[ActionEquipProcessor]",
                "Invalid equip (slot/type mismatch)",
                { equipItem, equipSlot }
            );
            R.push(
                history.noop("Nothing happens, because the item cannot be equipped in that slot.")
            );
            return R;
        }

        const isValidForSkills =
            equipItem.type !== "weapon" ||
            ((equipItem.weapon.weaponType === "knife" && hasSkill("wield-knife")) ||
                (equipItem.weapon.weaponType === "sword" && hasSkill("wield-sword")) ||
                (equipItem.weapon.weaponType === "axe" && hasSkill("wield-axe")) ||
                (equipItem.weapon.weaponType === "bow" && hasSkill("wield-bow")) ||
                (equipItem.weapon.weaponType === "staff" && hasSkill("wield-staff")) ||
                (equipItem.weapon.weaponType === "crossbow" &&
                    hasSkill("wield-crossbow")) ||
                (equipItem.weapon.weaponType === "dagger" && hasSkill("wield-dagger")));

        if (!isValidForSkills) {
            console.warn(
                "[ActionEquipProcessor]",
                "Invalid equip (skills mismatch)",
                equipItem
            );
            R.push(
                history.noop(
                    "Nothing happens, because you don't have the required skills to equip that item."
                )
            );
            return R;
        }

        console.log("[ActionEquipProcessor]", "Equipping item", { equipItem, equipSlot });

        // If we have something equipped, unequip it
        const equippedItem = player.getPlayerGear()[equipSlot];

        if (equippedItem) {
            // Add the item to the player inventory
            player.addItem(equippedItem);
            R.push(history.unequipItem(equippedItem, equipSlot));
        }

        // Equip the item
        player.updatePlayerGear({
            ...player.getPlayerGear(),
            [equipSlot]: equipItem,
        });

        // Remove the item from the player inventory
        if (itemInInventory) {
            player.removeItem(itemInInventory);
        }

        // Remove the item from the location
        if (itemInLocation) {
            location.items = location.items.filter((i) => i.id !== itemInLocation.id);
            player.updatePlayerLocation(location);
        }

        // Advance the time
        history.advanceTime(60);

        R.push(history.equipItem(equipItem, equipSlot));

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
