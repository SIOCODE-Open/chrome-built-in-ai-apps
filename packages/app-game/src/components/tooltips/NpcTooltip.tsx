import { INonPlayerCharacter, IWorldItem } from "../../context/World.context";
import { WORLD_ITEM_TIER_DISPLAYS, WORLD_NPC_RACE_DISPLAYS, WORLD_NPC_STANCE_DISPLAYS, WORLD_WEAPON_TYPE_DISPLAYS, WORLD_WEARABLE_TYPE_DISPLAYS, WorldItemTier, WorldItemType, WorldWeaponType, WorldWearableType } from "../../model/world.enums";
import { CardInfoTable } from "../card/CardInfoTable";
import { CardTitle } from "../card/CardTitle";
import { TooltipText } from "../TooltipText";

export function NpcTooltip(
    props: {
        value: INonPlayerCharacter;
    }
) {
    const infoTable = {
        "Name": props.value.name,
        "Stance": WORLD_NPC_STANCE_DISPLAYS[props.value.stance],
        "Race": WORLD_NPC_RACE_DISPLAYS[props.value.race],
    }

    const gearTable = {
        "Weapon": props.value.gear && props.value.gear.weapon
            ? `${props.value.gear.weapon.name}`
            : "None",
        "Armor": props.value.gear && props.value.gear.armor
            ? `${props.value.gear.armor.name}`
            : "None",
        "Helmet": props.value.gear && props.value.gear.helmet
            ? `${props.value.gear.helmet.name}`
            : "None",
        "Boots": props.value.gear && props.value.gear.boots
            ? `${props.value.gear.boots.name}`
            : "None",
        "Wearable": props.value.gear && props.value.gear.wearable
            ? `${props.value.gear.wearable.name}`
            : "None",
    };

    const inventoryTable = {
    };

    if (props.value.inventory) {
        if (props.value.inventory.gold) {
            inventoryTable["Gold"] = props.value.inventory.gold;
        }

        inventoryTable["Total items"] = props.value.inventory.items.length;
    }

    const tt = <>
        <CardInfoTable value={infoTable} />
        <CardTitle>Gear</CardTitle>
        <CardInfoTable value={gearTable} />
        <CardTitle>Inventory</CardTitle>
        <CardInfoTable value={inventoryTable} />
    </>;

    return tt;
}