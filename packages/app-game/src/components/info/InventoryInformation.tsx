import { useEffect, useReducer, useState } from "react";
import { usePlayer } from "../../context/Player.context";
import { Card } from "../Card";
import { CardInfoTable } from "../card/CardInfoTable";
import { CardTitle } from "../card/CardTitle";
import { CardLabelList } from "../card/CardLabelList";
import { ItemTooltip } from "../tooltips/ItemTooltip";
import { ActionText } from "../ActionText";
import { ItemActions } from "../actions/ItemActions";
import { createItemLabel } from "../labels/ItemLabel";

export function InventoryInformation(props: any) {

    const [inventory, setInventory] = useState({
        gold: 0,
        items: []
    });
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const player = usePlayer();

    useEffect(
        () => {
            const subs = [
                player.playerInventory.subscribe(
                    character => {
                        setInventory(character);
                        forceUpdate();
                    }
                ),
            ];
            return () => subs.forEach(s => s.unsubscribe());
        },
        []
    );

    const inventoryTable = {
        "Gold": inventory.gold,
        "Total items": inventory.items.length
    };

    const inventoryItemLabels = [];

    for (const item of inventory.items) {
        inventoryItemLabels.push(
            createItemLabel(
                item,
                { actions: ["drop", "equip", "eat", "drink", "use"] }
            )
        );
    }

    return <>
        {
            inventory && <Card>
                <CardTitle>Your inventory</CardTitle>
                <CardInfoTable value={inventoryTable} />
                <CardLabelList value={inventoryItemLabels} />
            </Card>
        }
    </>;
}