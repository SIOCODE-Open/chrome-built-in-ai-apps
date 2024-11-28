import { useEffect, useReducer, useState } from "react";
import { IGameEvent, useHistory } from "../context/History.context";
import { usePlayer } from "../context/Player.context";
import { GameEvent } from "./feed/GameEvent";
import { CardTitle } from "./card/CardTitle";
import { Card } from "./Card";

export function GameOverScreen() {

    const [allTurns, setAllTurns] = useState<Array<{ events: Array<IGameEvent>, endTurnEvent: IGameEvent }>>([]);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const history = useHistory();
    const player = usePlayer();

    const onPlayAgain = () => {
        window.location.reload();
    };

    useEffect(
        () => {
            setAllTurns(
                history.getAllTurns()
            );
            const sub = history.turnEnded.subscribe(
                (turnEvents) => {
                    setAllTurns(
                        history.getAllTurns()
                    );
                    forceUpdate();
                }
            );
            return () => sub.unsubscribe();
        },
        []
    );

    return <>
        <div className="w-full max-h-full grid grid-cols-1 pb-96 p-4 gap-4 overflow-y-auto overflow-x-hidden">
            <h1 className="w-full text-center text-4xl font-bold text-red-500">You have died.</h1>
            <h2 className="w-full text-center text-sm italic text-neutral-500">This is how it happened ...</h2>

            {
                allTurns.map(
                    (turn, idx) => <div key={idx} className="w-full border border-1 dark:border-neutral-600 border-neutral-400 p-2 flex flex-col justify-start items-stretch gap-2 rounded-lg">

                        <Card>
                            <h1 className="font-serif text-2xl font-bold" dangerouslySetInnerHTML={{ __html: turn.endTurnEvent.details?.headline }} />
                            <CardTitle>
                                Turn {idx + 1}
                            </CardTitle>
                            <p className="font-serif italic">
                                {turn.endTurnEvent.notes}
                            </p>
                        </Card>
                        {
                            turn.events.map(
                                (turnEvent, eventIdx) => <GameEvent value={turnEvent} key={eventIdx} />
                            )
                        }

                    </div>
                )
            }

            <button onClick={onPlayAgain}
                className="w-full bg-green-500 text-white font-bold px-2 py-1 rounded-full">Play again</button>
        </div>
    </>

}