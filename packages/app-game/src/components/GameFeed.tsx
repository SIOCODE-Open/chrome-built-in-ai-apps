import classNames from "classnames";
import { eventToJsonData, GameEvent } from "./feed/GameEvent";
import { IGameEvent, useHistory } from "../context/History.context";
import { useEffect, useReducer, useRef, useState } from "react";
import { usePlayerActions } from "../context/PlayerActions.context";
import { Icon } from "@iconify/react";
import { Card } from "./Card";
import { EventNarrator2 } from "../ai/EventNarrator2";
import { useLanguageModel } from "@siocode/base";

export function GameFeed() {

    const history = useHistory();
    const actions = usePlayerActions();
    const lm = useLanguageModel();

    const [gameEvents, setGameEvents] = useState<Array<IGameEvent>>([]);
    const [gameNarration, setGameNarration] = useState<string>("");
    const allTurnsRef = useRef<Array<{ events: Array<IGameEvent>, narration: string }>>([]);
    const [turnCount, setTurnCount] = useState(0);
    const [selectedTurn, setSelectedTurn] = useState(-1);
    const [now, setNow] = useState(
        `Day ${history.now().day}, ${history.now().hour.toString().padStart(2, "0")}:${history.now().minute.toString().padStart(2, "0")}:${history.now().second.toString().padStart(2, "0")}`
    );
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const cn = classNames(
        "w-full h-full flex flex-col justify-start items-stretch gap-2 pb-96 px-8",
        "overflow-y-auto"
    );

    const buttonCn = classNames(
        "px-2 py-1 bg-blue-500 text-white font-bold text-xs rounded-full",
        "active:bg-blue-600"
    );

    useEffect(
        () => {
            const sub = history.turnEnded.subscribe(
                (opts) => {
                    const newTurns = [
                        ...allTurnsRef.current,
                        { events: opts.events, narration: opts.endTurnEvent.notes }
                    ];
                    allTurnsRef.current = newTurns;
                    setSelectedTurn(newTurns.length - 1);
                    setTurnCount(newTurns.length);
                    setGameEvents(opts.events);
                    setGameNarration(opts.endTurnEvent.notes);
                    forceUpdate();

                    console.log("Turn ended", opts, newTurns);
                }
            );
            return () => {
                sub.unsubscribe();
            };
        },
        []
    );

    useEffect(
        () => {
            const sub = history.ticked.subscribe(
                time => {
                    setNow(`Day ${time.day}, ${time.hour.toString().padStart(2, "0")}:${time.minute.toString().padStart(2, "0")}:${time.second.toString().padStart(2, "0")}`);
                }
            );
            return () => {
                sub.unsubscribe();
            };
        },
        []
    );

    const onPrevTurn = () => {
        if (selectedTurn > 0) {
            setSelectedTurn(selectedTurn - 1);
            setGameEvents(allTurnsRef.current[selectedTurn - 1].events);
            setGameNarration(allTurnsRef.current[selectedTurn - 1].narration);
        }
    };

    const onNextTurn = () => {
        if (selectedTurn + 1 < turnCount) {
            setSelectedTurn(selectedTurn + 1);
            setGameEvents(allTurnsRef.current[selectedTurn + 1].events);
            setGameNarration(allTurnsRef.current[selectedTurn + 1].narration);
        }
    };

    const onCopyTurnData = () => {
        const jsonData = allTurnsRef.current[selectedTurn].events.map(
            e => JSON.stringify(eventToJsonData(e))
        ).join("\n");
        navigator.clipboard.writeText(jsonData);
    };

    const onRejectTurnNarration = async () => {

        const narrator = new EventNarrator2(lm);
        const narration = await narrator.prompt({
            events: gameEvents,
            history: allTurnsRef.current.slice(0, selectedTurn).map(
                turn => ({
                    events: turn.events,
                    response: turn.narration
                })
            )
        });

        allTurnsRef.current[selectedTurn].narration = narration;
        setGameNarration(narration);

        forceUpdate();

    };

    return <>
        <div className={cn}>
            <div className="flex flex-row justify-start items-center gap-2 w-full py-4">

                <span className="text-xs italic text-neutral-500">{now}</span>

                {
                    turnCount > 0 && <>

                        <button className="text-xl text-black dark:text-white" onClick={onPrevTurn}>
                            <Icon icon="mdi:chevron-left" />
                        </button>

                        {selectedTurn + 1} / {turnCount} Turns

                        <button className="text-xl text-black dark:text-white" onClick={onNextTurn}>
                            <Icon icon="mdi:chevron-right" />
                        </button>

                        <button className="text-xl text-black dark:text-white" onClick={onCopyTurnData}>
                            <Icon icon="mdi:content-copy" />
                        </button>

                        <button className="text-xl text-black dark:text-white" onClick={onRejectTurnNarration}>
                            <Icon icon="mdi:refresh" />
                        </button>

                    </>
                }

                {
                    turnCount === 0 && <>

                        <Icon icon="mdi:gear" className="text-xl text-black dark:text-white animate-spin" />

                    </>
                }

            </div>
            <Card>
                <p className="font-serif italic">
                    {gameNarration}
                </p>
            </Card>
            {
                gameEvents.map(
                    (event, idx) => <GameEvent value={event} key={`${selectedTurn}.${event.origin}.${idx}`} />
                )
            }
            {/*
            <GameEvent title="You" time={now}>
                <p className="text-sm italic">What do you do?</p>
                <div className="flex flex-row flex-wrap gap-2 justify-start items-center">
                    <button className={buttonCn} onClick={onLookAround}>Look around</button>
                    <button className={buttonCn}>Go elsewhere</button>
                    <button className={buttonCn}>Inspect an item</button>
                    <button className={buttonCn}>Use an item</button>
                    <button className={buttonCn}>Talk with someone</button>
                    <button className={buttonCn}>Craft something</button>
                    <button className={buttonCn}>Farm something</button>
                    <button className={buttonCn}>Cast a spell</button>
                    <button className={buttonCn}>Eat something</button>
                    <button className={buttonCn}>Drink something</button>
                    <button className={buttonCn}>Give someone a thing</button>
                    <button className={buttonCn}>Take something</button>
                    <button className={buttonCn}>Put something down</button>
                </div>
            </GameEvent>
            */}
        </div>
    </>;
}