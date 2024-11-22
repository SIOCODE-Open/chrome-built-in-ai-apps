import { useEffect, useReducer, useState } from "react";
import { usePlayer } from "../../context/Player.context";
import { Card } from "../Card";
import { CardInfoTable } from "../card/CardInfoTable";
import { CardTitle } from "../card/CardTitle";
import { CardLabelList } from "../card/CardLabelList";
import { ItemTooltip } from "../tooltips/ItemTooltip";
import { ItemActions } from "../actions/ItemActions";
import { createItemLabel } from "../labels/ItemLabel";

export function RoomItemsInformation(props: any) {

    const [inventory, setInventory] = useState({
        gold: 0,
        items: []
    });
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const player = usePlayer();

    useEffect(
        () => {
            const subs = [
                player.playerLocation.subscribe(
                    (location) => {
                        setInventory({
                            gold: 0, // FIXME
                            items: location.items
                        });
                        forceUpdate();
                    }
                ),
            ];
            return () => subs.forEach(s => s.unsubscribe());
        },
        []
    );

    let widgets = [];

    if (inventory.items.length === 0 && inventory.gold === 0) {
        widgets.push(<>
            <span className="text-xs italic text-neutral-500" key="noitems">
                You don't know of any items in this location.
            </span>
        </>);
    }

    if (inventory.gold > 0) {
        widgets.push(<>
            <span className="text-xs italic text-neutral-500" key="locationgold">
                There's {inventory.gold} gold in this location.
            </span>
        </>);
    }

    if (inventory.items.length > 0) {

        const inventoryTable = {
            "Total items": inventory.items.length
        };

        const inventoryItemLabels = [];

        for (const item of inventory.items) {
            inventoryItemLabels.push(
                createItemLabel(
                    item,
                    { actions: ["pickUp", "eat", "drink", "unpack", "use"] }
                )
            );
        }

        widgets.push(<CardInfoTable key="infotable" value={inventoryTable} />);
        widgets.push(<CardLabelList key="labellist" value={inventoryItemLabels} />);

    }

    return <>
        {
            <Card>
                <CardTitle>Items at this location</CardTitle>
                {widgets}
            </Card>
        }
    </>;
}