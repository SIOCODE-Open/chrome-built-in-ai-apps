import classNames from "classnames";
import { EquipActionSlot, usePlayerActions } from "../../context/PlayerActions.context";
import { IWorldItem } from "../../context/World.context";
import { Icon } from "@iconify/react";

export function ItemActions(
    props: {
        value: IWorldItem;
        onCancel?: () => void;
        slot?: EquipActionSlot;
        cancel?: boolean;
        unequip?: boolean;
        equip?: boolean;
        drop?: boolean;
        pickUp?: boolean;
        eat?: boolean;
        drink?: boolean;
        unpack?: boolean;
        consume?: boolean;
    }
) {

    const actions = usePlayerActions();

    const onUnequip = () => {
        if (!props.unequip) {
            return;
        }

        actions.unequipItem(props.slot);
    };

    const onEquip = () => {
        if (!props.equip) {
            return;
        }

        if (props.value.type === "weapon") {
            actions.equipItem({
                slot: "weapon",
                item: props.value
            });
        } else if (props.value.type === "armor") {
            actions.equipItem({
                slot: "armor",
                item: props.value
            });
        } else if (props.value.type === "helmet") {
            actions.equipItem({
                slot: "helmet",
                item: props.value
            });
        } else if (props.value.type === "boots") {
            actions.equipItem({
                slot: "boots",
                item: props.value
            });
        } else if (props.value.type === "wearable") {
            actions.equipItem({
                slot: "wearable",
                item: props.value
            });
        }
    };

    const onDrop = () => {
        if (!props.drop) {
            return;
        }

        actions.dropItem(props.value);
    };

    const onPickUp = () => {
        if (!props.pickUp) {
            return;
        }

        actions.pickupItem(props.value);
    };

    const onEat = () => {
        if (!props.eat) {
            return;
        }

        actions.eatItem(props.value);
    };

    const onDrink = () => {
        if (!props.drink) {
            return;
        }

        actions.drinkItem(props.value);
    };

    const onUnpack = () => {
        if (!props.unpack) {
            return;
        }

        actions.unpack(props.value);
    };

    const onUse = () => {
        if (!props.consume) {
            return;
        }

        actions.useItem(props.value);
    };


    const onCancel = () => {
        if (props.onCancel) {
            props.onCancel();
        }
    };

    const buttonCn = classNames(
        "dark:text-neutral-200 text-neutral-800 hover:dark:text-white hover:text-black p-2 rounded-full border border-2 border-neutral-500"
    );

    const canUnequip = props.unequip && props.slot !== undefined;
    const canEquip = props.equip && props.slot === undefined;
    const canDrop = props.drop;
    const canPickUp = props.pickUp && !props.value.static;
    const canEat = props.eat && props.value.type === "food";
    const canDrink = props.drink && props.value.type === "drink";
    const canUnpack = props.unpack && props.value.contains && props.value.contains.length > 0;
    const canCancel = props.cancel;
    const canUse = props.consume;

    const actionItems = [
        canUnequip && <button className={buttonCn} onClick={onUnequip}>
            <Icon icon="mdi:arrow-down-bold" />
        </button>,
        canEquip && <button className={buttonCn} onClick={onEquip}>
            <Icon icon="mdi:clothes-hanger" />
        </button>,
        canDrop && <button className={buttonCn} onClick={onDrop}>
            <Icon icon="mdi:hand-pointing-down" />
        </button>,
        canPickUp && <button className={buttonCn} onClick={onPickUp}>
            <Icon icon="mdi:hand-pointing-up" />
        </button>,
        canEat && <button className={buttonCn} onClick={onEat}>
            <Icon icon="mdi:food-drumstick" />
        </button>,
        canDrink && <button className={buttonCn} onClick={onDrink}>
            <Icon icon="mdi:cup" />
        </button>,
        canUnpack && <button className={buttonCn} onClick={onUnpack}>
            <Icon icon="mdi:package-variant" />
        </button>,
        canUse && <button className={buttonCn} onClick={onUse}>
            <Icon icon="mdi:hand-heart" />
        </button>,
        canCancel && <button className={buttonCn} onClick={onCancel}>
            <Icon icon="mdi:close" />
        </button>
    ].filter(a => !!a);

    return <>
        <div className="flex flex-row justify-center items-center gap-2">
            {actionItems}
            {
                actionItems.length === 0 && <span className="text-xs italic text-neutral-500">
                    No actions available.
                </span>
            }
        </div>
    </>;
}