import { useEffect, useReducer, useState } from "react";
import { Card } from "../Card";
import { CardInfoTable } from "../card/CardInfoTable";
import { CardTitle } from "../card/CardTitle";
import { ICharacterGear, IWorldItem } from "../../context/World.context";
import { usePlayer } from "../../context/Player.context";
import { TooltipText } from "../TooltipText";
import { ItemTooltip } from "../tooltips/ItemTooltip";
import { ActionText } from "../ActionText";
import { ItemActions } from "../actions/ItemActions";
import { EquipActionSlot } from "../../context/PlayerActions.context";

export function GearInformation(props: any) {

    const [gear, setGear] = useState<ICharacterGear>(null);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const player = usePlayer();

    useEffect(
        () => {
            const subs = [
                player.playerGear.subscribe(
                    gear => {
                        setGear(gear);
                        forceUpdate();
                    }
                ),
            ];
            return () => subs.forEach(s => s.unsubscribe());
        },
        []
    );

    const displayItem = (item: IWorldItem | null | undefined, slot: EquipActionSlot) => {
        if (!item) {
            return <>
                <span className="text-xs text-neutral-500 italic">None</span>
            </>;
        } else {
            return <>
                <TooltipText tooltip={<ItemTooltip value={item} />}>
                    <ActionText actions={<ItemActions value={item} slot={slot} unequip />}>
                        <span className="text-xs font-bold">{item.name}</span>
                    </ActionText>
                </TooltipText>
            </>;
        }
    };

    const gearTable = {};
    if (gear) {
        gearTable["Head"] = displayItem(gear.helmet, "helmet");
        gearTable["Chest"] = displayItem(gear.armor, "armor");
        gearTable["Legs"] = displayItem(gear.boots, "boots");
        gearTable["Weapon"] = displayItem(gear.weapon, "weapon");
        gearTable["Wearable"] = displayItem(gear.wearable, "wearable");
    }

    return <>
        {
            gear && <Card>
                <CardTitle>Gear</CardTitle>
                <CardInfoTable value={gearTable} />
            </Card>
        }
    </>;
}