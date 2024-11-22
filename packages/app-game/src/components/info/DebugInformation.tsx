import classNames from "classnames";
import { Card } from "../Card";
import { CardTitle } from "../card/CardTitle";
import { usePlayer } from "../../context/Player.context";
import { useWorld } from "../../context/World.context";
import { usePlayerActions } from "../../context/PlayerActions.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { CommandInterpreter } from "../../ai/CommandInterpreter";
import { useLanguageModel } from "@siocode/base";
import { useCommand } from "../../context/Command.context";
import { useEffect, useRef, useState } from "react";
import { aiDisplayEvent } from "../../ai/display";
import { EventNarrator } from "../../ai/EventNarrator";

export function DebugInformation(props: any) {

    const allEvents = useRef<Array<IGameEvent>>([]);

    const player = usePlayer();
    const world = useWorld();
    const actions = usePlayerActions();
    const history = useHistory();
    const lm = useLanguageModel();
    const commander = useCommand();

    const onMakeCommandPrompt = () => {
        console.log("[DebugInformation]", "onMakeCommandPrompt");

        const cmdInterpreter = new CommandInterpreter(lm);
        const cmdPrompt = cmdInterpreter.getPromptFor({
            player,
            world,
            input: commander.getInput()
        });

        navigator.clipboard.writeText(
            JSON.stringify(cmdPrompt, null, 4)
        );
    };

    const onMakeCommandPromptSituation = () => {
        console.log("[DebugInformation]", "onMakeCommandPromptSituation");

        const cmdInterpreter = new CommandInterpreter(lm);
        const cmdPrompt = cmdInterpreter.getPromptFor({
            player,
            world,
            input: commander.getInput()
        });

        navigator.clipboard.writeText(
            cmdPrompt.nextMessage
        );
    };

    const onExportEvents = () => {
        console.log("[DebugInformation]", "onExportEvents");

        navigator.clipboard.writeText(
            JSON.stringify(allEvents.current, null, 4)
        );
    };

    const onExportEventsAiFormat = () => {
        console.log("[DebugInformation]", "onExportEventsAiFormat");

        const aiEvents = allEvents.current.map(
            e => aiDisplayEvent(e)
        );

        navigator.clipboard.writeText(
            aiEvents.join("\n")
        );
    };

    const onExportEventPrompt = () => {
        console.log("[DebugInformation]", "onExportEventPrompts");

        const narrator = new EventNarrator(lm);
        const lastEvent = history.getRecentEvents()[history.getRecentEvents().length - 1];
        const prompt = narrator.getPromptFor({
            player,
            world,
            history: history.getRecentEvents(),
            event: lastEvent
        });

        navigator.clipboard.writeText(
            JSON.stringify(prompt, null, 4)
        );
    };

    const onExportEventPromptSituation = () => {
        console.log("[DebugInformation]", "onExportEventPromptSituation");

        const narrator = new EventNarrator(lm);
        const lastEvent = history.getRecentEvents()[history.getRecentEvents().length - 1];
        const prompt = narrator.getPromptFor({
            player,
            world,
            history: history.getRecentEvents().slice(0, -1),
            event: lastEvent
        });

        navigator.clipboard.writeText(
            prompt.nextMessage
        );
    };

    const buttonCn = classNames(
        "bg-red-500 text-white px-2 py-1 font-bold text-xs",
        "hover:bg-red-600 active:bg-red-400",
        "rounded-lg shadow-md"
    );

    useEffect(
        () => {
            const subs = [
                history.eventPublished.subscribe(
                    e => {
                        allEvents.current.push({
                            ...e
                        });
                    }
                ),
            ];
            return () => subs.forEach(s => s.unsubscribe());
        },
        []
    );

    return <>
        <Card>
            <CardTitle>Debug</CardTitle>
            <div className="flex flex-row flex-wrap gap-2 justify-start items-center p-2">
                <button className={buttonCn}
                    onClick={onMakeCommandPrompt}>
                    Make Command Prompt
                </button>

                <button className={buttonCn}
                    onClick={onMakeCommandPromptSituation}>
                    Make Command Prompt Situation
                </button>

                <button className={buttonCn}
                    onClick={onExportEvents}>
                    Export Events
                </button>

                <button className={buttonCn}
                    onClick={onExportEventsAiFormat}>
                    Export Events AI Format
                </button>

                <button className={buttonCn}
                    onClick={onExportEventPrompt}>
                    Export Last Event Prompt
                </button>

                <button className={buttonCn}
                    onClick={onExportEventPromptSituation}>
                    Export Events Prompt Situation
                </button>
            </div>
        </Card>
    </>;
}