// ActionTradeProcessor.tsx
import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionTradeProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-trade") {
            return R;
        }

        console.log("[ActionTradeProcessor]", "Processing action-trade event", ev);

        const offered = ev.details.offered;

        const offeredGold = offered.gold;
        const offeredItems = offered.items;

        const want = ev.details.want;

        const wantGold = want.gold;
        const wantItems = want.items;

        const npc = ev.details.npc;

        const playerInventory = player.getPlayerInventory();
        const npcInventory = npc.inventory;

        history.advanceTime(15);

        if (offeredGold > playerInventory.gold) {
            R.push(
                history.noop(
                    "You want to trade, but you don't have enough gold."
                )
            );
            return R;
        }

        if (wantGold > npcInventory.gold) {
            R.push(
                history.noop(
                    "The NPC wants to trade, but they don't have enough gold."
                )
            );
            return R;
        }

        npcInventory.gold += offeredGold;
        playerInventory.gold -= offeredGold;

        npcInventory.gold -= wantGold;
        playerInventory.gold += wantGold;

        if (offeredGold > 0) {
            R.push(
                history.spendGold(
                    offeredGold,
                    "Traded with " + npc.name
                )
            );
        }

        if (wantGold > 0) {
            R.push(
                history.getGold(
                    wantGold,
                    "Received from trade with " + npc.name
                )
            );
        }

        npcInventory.items.push(...offeredItems);
        npcInventory.items = npcInventory.items.filter(
            (i) => !wantItems.some((wi) => wi.id === i.id)
        );

        for (let i of wantItems) {
            player.addItem(i);
            R.push(
                history.getItem(i, "Received from trade with " + npc.name)
            );
        }
        for (let i of offeredItems) {
            player.removeItem(i);
            R.push(
                history.loseItem(i, "Traded with " + npc.name)
            );
        }

        player.updatePlayerLocation(player.getPlayerLocation());

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
