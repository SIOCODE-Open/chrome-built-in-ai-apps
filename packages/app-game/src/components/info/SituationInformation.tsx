import { useEffect, useReducer, useState } from "react";
import { INonPlayerCharacter, IWorldNode } from "../../context/World.context";
import { Card } from "../Card";
import { CardInfoTable } from "../card/CardInfoTable";
import { CardLabelList } from "../card/CardLabelList";
import { CardTitle } from "../card/CardTitle";
import { usePlayer } from "../../context/Player.context";
import { TooltipText } from "../TooltipText";
import { WORLD_NODE_AREA_TYPE, WORLD_NODE_AREA_TYPE_DESCRIPTIONS, WORLD_NODE_AREA_TYPE_DISPLAYS, WORLD_NODE_BUILDING_TYPE_DESCRIPTIONS, WORLD_NODE_BUILDING_TYPE_DISPLAYS, WORLD_NODE_HUMIDITY_DESCRIPTIONS, WORLD_NODE_HUMIDITY_DISPLAYS, WORLD_NODE_ROOM_TYPE_DESCRIPTIONS, WORLD_NODE_ROOM_TYPE_DISPLAYS, WORLD_NODE_SETTLEMENT_TYPE_DESCRIPTIONS, WORLD_NODE_SETTLEMENT_TYPE_DISPLAYS, WORLD_NODE_STREET_TYPE_DESCRIPTIONS, WORLD_NODE_STREET_TYPE_DISPLAYS, WORLD_NODE_TEMPERATURE_DESCRIPTIONS, WORLD_NODE_TEMPERATURE_DISPLAYS, WORLD_NODE_WILDERNESS_TYPE_DESCRIPTIONS, WORLD_NODE_WILDERNESS_TYPE_DISPLAYS, WORLD_NPC_RACE_DESCRIPTIONS, WORLD_NPC_RACE_DISPLAYS, WORLD_PLAYER_HEALTH_DESCRIPTIONS, WORLD_PLAYER_HEALTH_DISPLAYS, WorldPlayerSitutation } from "../../model/world.enums";
import { usePlayerActions } from "../../context/PlayerActions.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { HealthTooltip } from "../tooltips/HealthTooltip";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function SituationInformation(props: any) {

    const [situation, setSituation] = useState<WorldPlayerSitutation>("wandering");
    const [location, setLocation] = useState<IWorldNode>(null);
    const [inCombatWith, setInCombatWith] = useState<INonPlayerCharacter | null>(null);
    const [inConversationWith, setInConversationWith] = useState<INonPlayerCharacter | null>(null);
    const [controlsDisabled, setControlsDisabled] = useState(false);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const player = usePlayer();
    const actions = usePlayerActions();
    const sim = useGameSimulation();

    useEffect(
        () => {
            const sub = player.playerLocation.subscribe(setLocation);
            return () => sub.unsubscribe();
        },
        []
    );

    useEffect(
        () => {
            const sub = player.playerSituation.subscribe(setSituation);
            return () => sub.unsubscribe();
        },
        []
    );

    useEffect(
        () => {
            const sub = player.inCombatWith.subscribe(setInCombatWith);
            return () => sub.unsubscribe();
        },
        []
    );

    useEffect(
        () => {
            const sub = player.inConversationWith.subscribe(setInConversationWith);
            return () => sub.unsubscribe();
        },
        []
    );

    useEffect(
        () => {
            const sub = player.navigationTarget.subscribe(
                (_) => forceUpdate()
            );
            return () => sub.unsubscribe();
        },
        []
    );

    useEffect(
        () => {
            const subs = [
                sim.simulating.subscribe(
                    () => setControlsDisabled(true)
                ),
                sim.nextTurn.subscribe(
                    () => setControlsDisabled(false)
                )
            ];
            return () => subs.forEach(s => s.unsubscribe());
        },
        []
    );

    const onLookAround = () => {
        actions.lookAround();
    };
    const onHitTheRoad = () => {
        actions.hitTheRoad();
    };
    const onSettleDown = () => {
        actions.settleDown();
    };
    const onAttack = () => {
        actions.attack(inCombatWith);
    };
    const onLeave = () => {
        actions.leave();
    };
    const onRest = () => {
        actions.rest();
    };

    let infoTable = {}

    if (location) {
        infoTable = {
            "Name": location.name,
            "Type": <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_NODE_AREA_TYPE_DESCRIPTIONS[location.type]}</span>}>
                {WORLD_NODE_AREA_TYPE_DISPLAYS[location.type]}
            </TooltipText>,
            "Temperature": <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_NODE_TEMPERATURE_DESCRIPTIONS[location.temperature]}</span>}>
                {WORLD_NODE_TEMPERATURE_DISPLAYS[location.temperature]}
            </TooltipText>,
            "Humidity": <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_NODE_HUMIDITY_DESCRIPTIONS[location.humidity]}</span>}>
                {WORLD_NODE_HUMIDITY_DISPLAYS[location.humidity]}
            </TooltipText>,
        };

        if (location.type === "wilderness") {
            infoTable["Wilderness"] = <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_NODE_WILDERNESS_TYPE_DESCRIPTIONS[location.wilderness.wildernessType]}</span>}>
                {WORLD_NODE_WILDERNESS_TYPE_DISPLAYS[location.wilderness.wildernessType]}
            </TooltipText>;
        }

        if (location.type === "settlement") {
            infoTable["Settlement"] = <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_NODE_SETTLEMENT_TYPE_DESCRIPTIONS[location.settlement.settlementType]}</span>}>
                {WORLD_NODE_SETTLEMENT_TYPE_DISPLAYS[location.settlement.settlementType]}
            </TooltipText>;
        }

        if (location.type === "street") {
            infoTable["Street"] = <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_NODE_STREET_TYPE_DESCRIPTIONS[location.street.streetType]}</span>}>
                {WORLD_NODE_STREET_TYPE_DISPLAYS[location.street.streetType]}
            </TooltipText>;
        }

        if (location.type === "building") {
            infoTable["Building"] = <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_NODE_BUILDING_TYPE_DESCRIPTIONS[location.building.buildingType]}</span>}>
                {WORLD_NODE_BUILDING_TYPE_DISPLAYS[location.building.buildingType]}
            </TooltipText>;
        }

        if (location.type === "room") {
            infoTable["Room"] = <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_NODE_ROOM_TYPE_DESCRIPTIONS[location.room.roomType]}</span>}>
                {WORLD_NODE_ROOM_TYPE_DISPLAYS[location.room.roomType]}
            </TooltipText>;
        }

        if (location.id === player.getNavigationTarget()?.id) {
            infoTable["Target"] = <TooltipText tooltip={<span className="text-xs font-normal italic text-left">This place is your navigation target.</span>}>
                Reached
            </TooltipText>;
        }

    }

    if (inCombatWith) {
        infoTable["Foe"] = inCombatWith.name;
        infoTable["Foe Race"] = <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_NPC_RACE_DESCRIPTIONS[inCombatWith.race]}</span>}>
            {WORLD_NPC_RACE_DISPLAYS[inCombatWith.race]}
        </TooltipText>;
        infoTable["Foe Health"] = <TooltipText tooltip={<HealthTooltip value={inCombatWith.health} />}>
            {WORLD_PLAYER_HEALTH_DISPLAYS[inCombatWith.health.status]}
        </TooltipText>;
    }

    if (inConversationWith) {
        infoTable["Friend"] = inConversationWith.name;
        infoTable["Friend Race"] = <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_NPC_RACE_DESCRIPTIONS[inConversationWith.race]}</span>}>
            {WORLD_NPC_RACE_DISPLAYS[inConversationWith.race]}
        </TooltipText>;
        infoTable["Friend Health"] = <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_PLAYER_HEALTH_DESCRIPTIONS[inConversationWith.health.status]}</span>}>
            {WORLD_PLAYER_HEALTH_DISPLAYS[inConversationWith.health.status]}
        </TooltipText>;
    }

    return <>
        {
            situation === 'wandering' && location && <Card>
                <CardTitle>Wandering ...</CardTitle>
                <CardInfoTable value={infoTable} />
                <div className="w-full flex flex-row justify-stretch items-center gap-2">
                    {/*
                    <button className="grow py-1 disabled:bg-neutral-500 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onLookAround}
                        disabled={controlsDisabled}>
                        Look around
                    </button>
                    */}
                    <button className="grow py-1 disabled:bg-neutral-500 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onSettleDown}
                        disabled={controlsDisabled}>
                        Settle down
                    </button>
                </div>
            </Card>
        }
        {
            situation === 'settled' && location && <Card>
                <CardTitle>Settled ...</CardTitle>
                <CardInfoTable value={infoTable} />
                <div className="w-full flex flex-row justify-stretch items-center gap-2">
                    <button className="grow py-1 disabled:bg-neutral-500 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onRest}
                        disabled={controlsDisabled}>
                        Rest
                    </button>
                    <button className="grow py-1 disabled:bg-neutral-500 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onHitTheRoad}
                        disabled={controlsDisabled}>
                        Hit the road
                    </button>
                </div>
            </Card>
        }
        {
            situation === 'combat' && inCombatWith && <Card>
                <CardTitle>Combat!</CardTitle>
                <CardInfoTable value={infoTable} />
                <button className="w-full py-1 disabled:bg-neutral-500 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                    onClick={onAttack}
                    disabled={controlsDisabled}>
                    Attack
                </button>
            </Card>
        }
        {
            situation === 'conversation' && inConversationWith && <Card>
                <CardTitle>In a conversation ...</CardTitle>
                <CardInfoTable value={infoTable} />
                <div className="w-full flex flex-row justify-stretch items-center gap-2">
                    <button className="grow py-1 disabled:bg-neutral-500 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onLeave}
                        disabled={controlsDisabled}>
                        Leave
                    </button>
                </div>
            </Card>
        }
    </>;
}