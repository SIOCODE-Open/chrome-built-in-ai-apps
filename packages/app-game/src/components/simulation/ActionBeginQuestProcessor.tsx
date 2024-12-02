// ActionBeginQuestProcessor.tsx
import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionBeginQuestProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-begin-quest") {
            return R;
        }

        console.log("[ActionBeginQuestProcessor]", "Processing action-begin-quest event", ev);

        const inConversationWith = player.getInConversationWith();
        const nextQuest = inConversationWith.nextQuest;

        if (inConversationWith.activeQuest) {
            R.push(
                history.noop(
                    "You are already doing a quest for " + inConversationWith.name + ". You should finish it first."
                )
            );
            return R;
        }

        history.advanceTime(15);

        R.push(
            history.beginQuest(nextQuest)
        );

        inConversationWith.activeQuest = nextQuest;
        inConversationWith.nextQuest = null;

        player.updateInConversationWith(inConversationWith);
        player.updateActiveQuests(
            [...player.getActiveQuests(), nextQuest]
        );

        if (nextQuest.type === "deliver") {
            R.push(
                history.getItem(nextQuest.deliver!.item, `Got from ${inConversationWith.name} to be delivered to ${nextQuest.deliver!.recipient!.name}`)
            );
            player.addItem(nextQuest.deliver!.item);
        }

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
