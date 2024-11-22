import { useEffect } from "react";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { usePlayer } from "../../context/Player.context";

export function ActionLeaveProcessor() {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-leave") {
            return R;
        }

        console.log("[ActionLeaveProcessor]", "Processing action-leave event", ev);

        history.advanceTime(15);

        const currentSituation = player.getPlayerSituation();

        if (currentSituation === "conversation") {
            // End previous conversation
            R.push(
                history.noop("You leave respectfully, ending the conversation.")
            );
            player.endConversation();
            R.push(
                history.changeSituation("wandering")
            );
            player.changeSituation("wandering");
        } else if (currentSituation === "combat") {
            R.push(
                history.noop("You try to leave the combat, but your foes keep attacking you.")
            );
            return R;
        } else if (currentSituation === "settled") {
            R.push(
                history.noop("You nicely pack your things, and leave the place.")
            );
            player.changeSituation("wandering");
            R.push(
                history.changeSituation("wandering")
            );
        } else {
            R.push(
                history.noop("Nothing happens, as you are already wandering.")
            );
        }

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}