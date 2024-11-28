import { IConsumableItemEffect, IWearableItemEffect, IWorldItem } from "../../context/World.context";
import { WORLD_WEAPON_TYPE_DISPLAYS, WORLD_WEARABLE_EFFECT_ACTIVATION_DISPLAYS, WORLD_WEARABLE_EFFECT_TYPE_DESCRIPTIONS, WORLD_WEARABLE_TYPE_DISPLAYS, WorldItemTier, WorldItemType, WorldWeaponType, WorldWearableType } from "../../model/world.enums";
import { CardInfoTable } from "../card/CardInfoTable";
import { TooltipText } from "../TooltipText";

export function ItemTooltip(
    props: {
        value: IWorldItem;
    }
) {
    const displayType = (type: WorldItemType) => {
        return <>
            {type.substring(0, 1).toUpperCase()}{type.substring(1)}
        </>
    };

    const displayTier = (tier: WorldItemTier) => {
        if (tier === "common") {
            return <span className="text-neutral-500">Common</span>;
        } else if (tier === "rare") {
            return <span className="text-blue-500">
                Rare
            </span>;
        } else if (tier === "epic") {
            return <span className="text-purple-500">
                Epic
            </span>;
        } else if (tier === "legendary") {
            return <span className="text-orange-500">
                Legendary
            </span>;
        } else if (tier === "garbage") {
            return <span className="text-neutral-500 italic">
                Garbage
            </span>;
        } else {
            return <>{tier}</>;
        }
    };

    const displayWeaponType = (type: WorldWeaponType) => {
        return <>
            {WORLD_WEAPON_TYPE_DISPLAYS[type]}
        </>
    };

    const displayWearableType = (type: WorldWearableType) => {
        return <>
            {WORLD_WEARABLE_TYPE_DISPLAYS[type]}
        </>
    };

    const infoTable = {
        "Name": props.value.name,
        "Type": displayType(props.value.type),
        "Tier": displayTier(props.value.tier),
    };

    if (props.value.static) {
        infoTable["Static"] = <TooltipText tooltip={<span className="text-xs italic">This item is too heavy to be moved.</span>}>
            Yes
        </TooltipText>
    }

    if (props.value.type === "weapon") {
        infoTable["Weapon"] = displayWeaponType(props.value.weapon!.weaponType);
        infoTable["Damage"] = props.value.weapon!.damage;
    } else if (props.value.type === "armor") {
        infoTable["Defense"] = props.value.armor!.defense;
    } else if (props.value.type === "boots") {
        infoTable["Defense"] = props.value.boots!.defense;
    } else if (props.value.type === "helmet") {
        infoTable["Defense"] = props.value.helmet!.defense;
    } else if (props.value.type === "wearable") {
        infoTable["Wearable"] = displayWearableType(props.value.wearable!.wearableType);
        infoTable["Defense"] = props.value.wearable!.defense;
    }

    if (props.value.contains && props.value.contains.length > 0) {
        infoTable["Contains"] = `${props.value.contains.length} items`;
    }

    const effects = [];

    const wEffect = (eff: IWearableItemEffect) => {
        return <span className="text-xs font-normal italic text-left">
            {eff.value && <span className="font-bold">[{eff.value}]</span>} <span className="font-bold">{WORLD_WEARABLE_EFFECT_ACTIVATION_DISPLAYS[eff.activation]}</span> {WORLD_WEARABLE_EFFECT_TYPE_DESCRIPTIONS[eff.type]}
        </span>;
    };
    const cEffect = (eff: IConsumableItemEffect) => {
        return <span className="text-xs font-normal italic text-left">
            {eff.value && <span className="font-bold">[{eff.value}]</span>} {WORLD_WEARABLE_EFFECT_TYPE_DESCRIPTIONS[eff.type]}
        </span>;
    };

    if (props.value.weapon?.effects) {
        props.value.weapon.effects.forEach(
            eff => effects.push(wEffect(eff))
        );
    }

    if (props.value.armor?.effects) {
        props.value.armor.effects.forEach(
            eff => effects.push(wEffect(eff))
        );
    }

    if (props.value.boots?.effects) {
        props.value.boots.effects.forEach(
            eff => effects.push(wEffect(eff))
        );
    }

    if (props.value.helmet?.effects) {
        props.value.helmet.effects.forEach(
            eff => effects.push(wEffect(eff))
        );
    }

    if (props.value.wearable?.effects) {
        props.value.wearable.effects.forEach(
            eff => effects.push(wEffect(eff))
        );
    }

    if (props.value.consumable?.effects) {
        props.value.consumable.effects.forEach(
            eff => effects.push(cEffect(eff))
        );
    }

    const tt = <>
        <CardInfoTable value={infoTable} />
        {effects}
    </>;

    return tt;
}