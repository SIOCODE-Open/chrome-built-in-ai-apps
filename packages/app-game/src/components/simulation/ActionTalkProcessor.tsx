import { useEffect } from "react";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { usePlayer } from "../../context/Player.context";

export function ActionTalkProcessor() {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-talk") {
            return R;
        }

        console.log("[ActionTalkProcessor]", "Processing action-talk event", ev);

        history.advanceTime(15);

        const currentSituation = player.getPlayerSituation();
        const currentLocation = player.getPlayerLocation();

        if (currentSituation === "conversation") {
            // End previous conversation
            R.push(
                history.noop("You end the previous conversation.")
            );
            player.endConversation();
        } else if (currentSituation === "combat") {
            R.push(
                history.noop("You try to engage in a conversation with someone, but you are too occupied with fighting.")
            );
            return R;
        }

        const target = ev.details.npc;

        if (target.location.id !== currentLocation.id) {
            R.push(
                history.noop("You try to talk to " + target.name + ", but they are not here.")
            );
            return R;
        }

        if (target.health.status === "dead") {
            R.push(
                history.noop("You try to talk to the dead, but they do not respond.")
            );
            return R;
        }

        if (target.race === "animal") {
            R.push(
                history.noop("You try to talk to the " + target.name + ", but they being an animal they do not respond.")
            );
            return R;
        }

        if (target.race === "orc") {
            R.push(
                history.noop("You try to talk to the " + target.name + ", but they just grunt.")
            );
            return R;
        }

        if (target.stance === "neutral") {
            R.push(
                history.noop("You try to talk to the " + target.name + ", but they do not respond.")
            );
            return R;
        }

        if (target.stance === "hostile") {
            R.push(
                history.noop("You try to talk to the " + target.name + ", but they respond by attacking you.")
            );
            R.push(
                history.startCombat(target)
            );
            player.startCombat(target);
            return R;
        }

        player.changeSituation("conversation");
        R.push(
            history.changeSituation("conversation")
        );
        player.startConversation(target);
        R.push(
            history.startConversation(target)
        );

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}