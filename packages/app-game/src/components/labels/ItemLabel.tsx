import { IWorldItem } from "../../context/World.context";
import { ItemActions } from "../actions/ItemActions";
import { ItemTooltip } from "../tooltips/ItemTooltip";

export function createItemLabel(
    item: IWorldItem,
    opts: any = {
        actions: [],
        onCancel: () => { },
        slot: null,
    }
) {
    const { actions } = opts;
    return {
        id: item.id,
        label: <>
            {item.details ? item.name : "(???)"}
        </>,
        color: item.tier === "common"
            ? "neutral"
            : item.tier === "rare"
                ? "blue"
                : item.tier === "epic"
                    ? "purple"
                    : item.tier === "legendary"
                        ? "orange"
                        : item.tier === "garbage"
                            ? "black"
                            : "neutral",
        count: 1,
        tooltip: <>
            <ItemTooltip value={item} />
        </>,
        actions: <ItemActions value={item}
            drop={actions.includes("drop")}
            equip={
                actions.includes("equip") &&
                (item.type === "weapon" || item.type === "armor" || item.type === "helmet" || item.type === "boots" || item.type === "wearable")
            }
            eat={actions.includes("eat") && item.type === 'food'}
            drink={actions.includes("drink") && item.type === 'drink'}
            cancel={actions.includes("cancel")}
            onCancel={opts.onCancel}
            pickUp={actions.includes("pickUp") && !item.static}
            unpack={actions.includes("unpack") && item.contains.length > 0}
            unequip={actions.includes("unequip")}
            consume={actions.includes("consume") || actions.includes("use")}
            slot={opts.slot}
        />
    }
}

export function createGoldLabel(value: number) {
    return {
        id: "gold",
        label: `${value} Gold`,
        color: "blue",
        count: value,
        tooltip: <>
            <span className="text-xs italic font-normal">You get <span className="font-bold">{value}</span> gold.</span>
        </>,
        actions: null
    };
}