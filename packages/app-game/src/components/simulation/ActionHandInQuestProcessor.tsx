// ActionHandInQuestProcessor.tsx
import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionHandInQuestProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-hand-in-quest") {
            return R;
        }

        console.log("[ActionHandInQuestProcessor]", "Processing action-hand-in-quest event", ev);

        const inConversationWith = player.getInConversationWith();
        const activeQuest = inConversationWith?.activeQuest;

        if (!inConversationWith) {
            R.push(
                history.noop(
                    "Nothing happens, because you are not in conversation with anyone to hand in quests."
                )
            );
            return R;
        }

        if (!activeQuest) {
            R.push(
                history.noop(
                    "Nothing happens, because you do not have any active quests to hand in."
                )
            );
            return R;
        }

        if (activeQuest.type === "deliver") {

            const targetHasItem = activeQuest.deliver!.recipient!.inventory.items.some(
                (i: IWorldItem) => i.id === activeQuest.deliver!.item.id
            );

            if (targetHasItem) {
                R.push(
                    history.finishQuest(activeQuest)
                );
                player.updateActiveQuests(
                    player.getActiveQuests().filter(q => q.id !== activeQuest.id)
                );
                inConversationWith.activeQuest = null;
                // TODO: Quest rewards
            } else {
                R.push(
                    history.noop(
                        "Nothing happens, because the recipient does not have the required item. You must deliver the item to the recipient."
                    )
                );
                return R;
            }

        } else if (activeQuest.type === "find-location") {

            if (!activeQuest.findLocation.didVisit) {
                R.push(
                    history.noop(
                        "Nothing happens, because you haven't visited the location yet."
                    )
                );
                return R;
            }

            R.push(
                history.finishQuest(activeQuest)
            );
            player.updateActiveQuests(
                player.getActiveQuests().filter(q => q.id !== activeQuest.id)
            );
            inConversationWith.activeQuest = null;

        } else if (activeQuest.type === "kill") {

            if (activeQuest.kill.npc.health.points > 0) {
                R.push(
                    history.noop(
                        "Nothing happens, because the NPC you were supposed to kill is still alive."
                    )
                );
                return R;
            }

            R.push(
                history.finishQuest(activeQuest)
            );
            player.updateActiveQuests(
                player.getActiveQuests().filter(q => q.id !== activeQuest.id)
            );
            inConversationWith.activeQuest = null;

        } else if (activeQuest.type === "talk-to") {

            if (!activeQuest.talkTo.didTalk) {
                R.push(
                    history.noop(
                        "Nothing happens, because you haven't talked to the NPC yet."
                    )
                );
                return R;
            }

            R.push(
                history.finishQuest(activeQuest)
            );
            player.updateActiveQuests(
                player.getActiveQuests().filter(q => q.id !== activeQuest.id)
            );
            inConversationWith.activeQuest = null;

        } else {
            R.push(
                history.noop(
                    "Nothing happens, because you haven't completed the requirements for this quest."
                )
            );
            return R;
        }

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
