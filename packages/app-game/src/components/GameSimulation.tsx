import { useRef, useEffect } from "react"
import { GameSimulationProvider, IGameSimulationContext } from "../context/GameSimulation.context"
import { Subject } from "rxjs"
import { IPlayerHunger, IPlayerThirst, usePlayer } from "../context/Player.context";
import { IWorldItem, IWorldNode, useWorld } from "../context/World.context";
import { IGameEvent, useHistory } from "../context/History.context";
import { useLanguageModel } from "@siocode/base";
import { ItemDetailGenerator } from "../ai/ItemDetailGenerator";
import { WorldNodeDetailGenerator } from "../ai/WorldNodeDetailGenerator";
import { WorldPlayerSkill } from "../model/world.enums";
import { ActionLookAroundProcessor } from "./simulation/ActionLookAroundProcessor";
import { ActionMoveProcessor } from "./simulation/ActionMoveProcessor";
import { ActionEatProcessor } from "./simulation/ActionEatProcessor";
import { ActionDrinkProcessor } from "./simulation/ActionDrinkProcessor";
import { ActionPickUpProcessor } from "./simulation/ActionPickUpProcessor";
import { ActionDropProcessor } from "./simulation/ActionDropProcessor";
import { ActionEquipProcessor } from "./simulation/ActionEquipProcessor";
import { ActionUnequipProcessor } from "./simulation/ActionUnequipProcessor";
import { WakeUpProcessor } from "./simulation/WakeUpProcessor";
import { ArriveProcessor } from "./simulation/ArriveProcessor";
import { EventNarrator2 } from "../ai/EventNarrator2";
import { WorldNodeDetailGenerator2 } from "../ai/WorldNodeDetailGenerator2";
import { ActionUnpackProcessor } from "./simulation/ActionUnpackProcessor";
import { ActionSettleDownProcessor } from "./simulation/ActionSettleDownProcessor";
import { ActionHitTheRoadProcessor } from "./simulation/ActionHitTheRoadProcessor";
import { ActionCraftProcessor } from "./simulation/ActionCraftProcessor";
import { DefeatNpcProcessor } from "./simulation/DefeatNpcProcessor";
import { ActionAttackProcessor } from "./simulation/ActionAttackProcessor";
import { NpcAttackProcessor } from "./simulation/NpcAttackProcessor";
import { ActionTalkProcessor } from "./simulation/ActionTalkProcessor";
import { ActionLeaveProcessor } from "./simulation/ActionLeaveProcessor";
import { ActionTradeProcessor } from "./simulation/ActionTradeProcessor";
import { HungerThirstTicker } from "./simulation/HungerThirstTicker";
import { ActionRestProcessor } from "./simulation/ActionRestProcessor";
import { ActionUseProcessor } from "./simulation/ActionUseProcessor";
import { HealthTicker } from "./simulation/HealthTicker";
import { TurnHeadlineWriter } from "../ai/TurnHeadlineWriter";
import { ActionBeginQuestProcessor } from "./simulation/ActionBeginQuestProcessor";
import { ActionHandInQuestProcessor } from "./simulation/ActionHandInQuestProcessor";
import { ActionTellSecretProcessor } from "./simulation/ActionTellSecretProcessor";

export function GameSimulation(
    props: {
        children?: any
    }
) {

    const turnCountRef = useRef(0);

    const simulating = useRef(
        new Subject<void>()
    );

    const nextTurn = useRef(
        new Subject<void>()
    );

    const previousTurns = useRef(
        []
    );

    const trackedProcessors = useRef<any>([]);
    const trackedTicks = useRef<any>([]);

    const player = usePlayer();
    const world = useWorld();
    const history = useHistory();
    const lm = useLanguageModel();

    const EVENT_PROCESSORS = [

    ];

    const processEvent: ((ev: IGameEvent) => Promise<Array<IGameEvent>>) = async (ev: IGameEvent) => {
        console.log("[GameSimulation]", "Processing event", ev);

        const result: Array<IGameEvent> = [];

        for (const processor of EVENT_PROCESSORS) {
            result.push(...(await processor(ev)));
        }

        for (const processor of trackedProcessors.current) {
            result.push(...(await processor(ev)));
        }

        return result;
    };

    const onSimulate = async () => {

        const eventQueue = [
            ...history.getThisTurnEvents()
        ];
        const thisTurn = [...eventQueue];

        console.log("[GameSimulation]", "Starting simulation", eventQueue.length, [...eventQueue]);

        while (eventQueue.length > 0) {
            const curr = eventQueue.shift();
            if (!curr) {
                continue;
            }

            const newEvents = await processEvent(curr);
            if (newEvents) {
                eventQueue.push(...newEvents);
                thisTurn.push(...newEvents);
            }


            // Process ticks
            const currentTime = history.t();
            for (const processor of trackedTicks.current) {
                const tickEvents = await processor(currentTime);
                if (tickEvents) {
                    thisTurn.push(...tickEvents);
                }
            }

        }

        console.log("[GameSimulation]", "Simulation complete");

        const narrator = new EventNarrator2(lm);
        const narration = await narrator.prompt({
            events: thisTurn,
            history: previousTurns.current.map(
                evList => ({
                    events: evList.filter(ev => ev.happening !== "end-turn"),
                    response: evList.find(ev => ev.happening === "end-turn").notes || "No narration."
                })
            )
        });

        const headliner = new TurnHeadlineWriter(lm);
        const headline = await headliner.prompt({
            narration,
        });

        thisTurn.push(
            history.endTurn(turnCountRef.current, narration, headline)
        );

        previousTurns.current.push(thisTurn);

        turnCountRef.current++;

    };

    const contextValue: IGameSimulationContext = {
        simulating: simulating.current,
        nextTurn: nextTurn.current,
        start: () => {
            simulating.current.next();
            onSimulate().finally(() => nextTurn.current.next());
        },
        addEventProcessor: (processor) => {
            trackedProcessors.current.push(processor);
        },
        addTickProcessor: (processor) => {
            trackedTicks.current.push(processor);
        }
    };

    useEffect(
        () => {
            const sub = player.spawned.subscribe(
                () => {
                    console.log("[GameSimulation]", "Player spawned, starting simulation");
                    contextValue.start();
                }
            );
            return () => sub.unsubscribe();
        },
        []
    );

    return <GameSimulationProvider value={contextValue}>
        <ActionLookAroundProcessor />
        <ActionMoveProcessor />
        <ActionEatProcessor />
        <ActionDrinkProcessor />
        <ActionPickUpProcessor />
        <ActionDropProcessor />
        <ActionEquipProcessor />
        <ActionUnequipProcessor />
        <ActionUnpackProcessor />
        <ActionSettleDownProcessor />
        <ActionHitTheRoadProcessor />
        <ActionCraftProcessor />
        <ActionAttackProcessor />
        <ActionTalkProcessor />
        <ActionLeaveProcessor />
        <ActionTradeProcessor />
        <ActionRestProcessor />
        <ActionUseProcessor />
        <ActionBeginQuestProcessor />
        <ActionHandInQuestProcessor />
        <ActionTellSecretProcessor />
        <WakeUpProcessor />
        <ArriveProcessor />
        <DefeatNpcProcessor />
        <NpcAttackProcessor />
        <HungerThirstTicker />
        <HealthTicker />
        {props.children}
    </GameSimulationProvider>
}