// ActionTellSecretProcessor.tsx
import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";

export function ActionTellSecretProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-tell-secret") {
            return R;
        }

        console.log("[ActionTellSecretProcessor]", "Processing action-tell-secret event", ev);

        const inConversationWith = player.getInConversationWith();

        if (!inConversationWith) {
            console.warn("[ActionTellSecretProcessor]", "Invalid tell-secret");
            R.push(
                history.noop(
                    "Nothing happens, because you're not in conversation with anyone, so you cannot tell secrets."
                )
            );
            return R;
        }

        const activeQuests = player.getActiveQuests();
        const secretRecipientQuest = activeQuests.find(q => q.type === "talk-to" && q.talkTo?.npc.id === inConversationWith.id);

        if (!secretRecipientQuest) {
            console.warn("[ActionTellSecretProcessor]", "Invalid tell-secret", "No active quest to tell secret to", inConversationWith);
            R.push(
                history.noop(
                    "Nothing happens, because you don't have an active quest to tell secrets to this person."
                )
            );
        }

        // Advance the time
        history.advanceTime(15);

        secretRecipientQuest.talkTo!.didTalk = true;
        player.updateInConversationWith(inConversationWith);
        player.updateActiveQuests(activeQuests);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
