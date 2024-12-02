// FinishQuestProcessor.tsx
import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem, IQuest } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function FinishQuestProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "finish-quest") {
            return R;
        }

        console.log("[FinishQuestProcessor]", "Processing finish-quest event", ev);

        const currentLocation = player.getPlayerLocation();
        const quest: IQuest = ev.details.quest;

        history.advanceTime(15);

        if (quest.reward) {
            console.log("[FinishQuestProcessor]", "Quest reward", quest.reward);
            if (quest.reward.gold) {
                R.push(
                    history.getGold(quest.reward.gold, "Quest reward")
                );
                player.addGold(quest.reward.gold);
            }
            if (quest.reward.items) {
                quest.reward.items.forEach((item) => {
                    R.push(
                        history.getItem(item, "Quest reward")
                    );
                    player.addItem(item);
                });
            }
        }

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
