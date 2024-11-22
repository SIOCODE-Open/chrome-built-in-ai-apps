import { useEffect, useRef, useState } from "react";
import { Card } from "../Card";
import { CardTitle } from "../card/CardTitle";
import { IGameEvent, useHistory } from "../../context/History.context";
import { EventNarrator } from "../../ai/EventNarrator";
import { useLanguageModel } from "@siocode/base";
import { usePlayer } from "../../context/Player.context";
import { useWorld } from "../../context/World.context";
import { Icon } from "@iconify/react";
import { TooltipText } from "../TooltipText";
import { ItemTooltip } from "../tooltips/ItemTooltip";
import { WORLD_ITEM_TIER_DISPLAYS, WORLD_ITEM_TYPE_DISPLAYS, WORLD_NODE_AREA_TYPE, WORLD_NPC_RACE_DISPLAYS, WORLD_NPC_STANCE_DISPLAYS, WORLD_PLAYER_CRAFTING_TYPE_DESCRIPTIONS, WORLD_PLAYER_CRAFTING_TYPE_DISPLAYS, WORLD_PLAYER_EQUIP_SLOT_DISPLAYS, WORLD_PLAYER_SKILL_DISPLAYS } from "../../model/world.enums";
import { LocationTooltip } from "../tooltips/LocationTooltip";
import { useNarration } from "../../context/Narration.context";
import { NpcTooltip } from "../tooltips/NpcTooltip";

export function eventToJsonData(event: IGameEvent) {
    const D = event.details;
    return {
        location: D.location ? {
            id: D.location.id,
            name: D.location.name,
            temperature: D.location.temperature,
            humidity: D.location.humidity,
            type: D.location.type,
            building: D.location.building ? {
                buildingType: D.location.building.buildingType
            } : undefined,
            room: D.location.room ? {
                roomType: D.location.room.roomType
            } : undefined,
            street: D.location.street ? {
                streetType: D.location.street.streetType
            } : undefined,
            settlement: D.location.settlement ? {
                settlementType: D.location.settlement.settlementType
            } : undefined,
            wilderness: D.location.wilderness ? {
                wildernessType: D.location.wilderness.wildernessType
            } : undefined,
            npcCount: D.location.npcs.length,
            itemCount: D.location.items.length,
        } : undefined,
        item: D.item ? {
            id: D.item.id,
            name: D.item.name,
            type: D.item.type,
            tier: D.item.tier
        } : undefined,
        npc: D.npc ? {
            id: D.npc.id,
            name: D.npc.name,
            race: D.npc.race,
        } : undefined,
        slot: D.slot ? WORLD_PLAYER_EQUIP_SLOT_DISPLAYS[D.slot] : undefined,
        from: D.from ? {
            id: D.from.id,
            name: D.from.name,
            temperature: D.from.temperature,
            humidity: D.from.humidity,
            type: D.from.type,
            building: D.from.building ? {
                buildingType: D.from.building.buildingType
            } : undefined,
            room: D.from.room ? {
                roomType: D.from.room.roomType
            } : undefined,
            street: D.from.street ? {
                streetType: D.from.street.streetType
            } : undefined,
            settlement: D.from.settlement ? {
                settlementType: D.from.settlement.settlementType
            } : undefined,
            wilderness: D.from.wilderness ? {
                wildernessType: D.from.wilderness.wildernessType
            } : undefined,
        } : undefined,
        to: D.to ? {
            id: D.to.id,
            name: D.to.name,
            temperature: D.to.temperature,
            humidity: D.to.humidity,
            type: D.to.type,
            building: D.to.building ? {
                buildingType: D.to.building.buildingType
            } : undefined,
            room: D.to.room ? {
                roomType: D.to.room.roomType
            } : undefined,
            street: D.to.street ? {
                streetType: D.to.street.streetType
            } : undefined,
            settlement: D.to.settlement ? {
                settlementType: D.to.settlement.settlementType
            } : undefined,
            wilderness: D.to.wilderness ? {
                wildernessType: D.to.wilderness.wildernessType
            } : undefined,
        } : undefined,
        cost: typeof D.cost === "number" ? D.cost : undefined,
        amount: typeof D.amount === "number" ? D.amount : undefined,
        notes: D.notes,
        health: D.health ? {
            status: D.health.status,
        } : undefined,
        hunger: D.hunger ? {
            status: D.hunger.status,
        } : undefined,
        thirst: D.thirst ? {
            status: D.thirst.status,
        } : undefined,
        skill: D.skill ? WORLD_PLAYER_SKILL_DISPLAYS[D.skill] : undefined,
        eventHappening: event.happening,
        eventNotes: event.notes,
        messages: D.messages ? D.messages : undefined,
        craftingType: D.craftingType ? `${WORLD_PLAYER_CRAFTING_TYPE_DISPLAYS[D.craftingType]} (${WORLD_PLAYER_CRAFTING_TYPE_DESCRIPTIONS[D.craftingType]})` : undefined,
        ingredients: D.ingredients ? D.ingredients.map(
            (item: any) => ({
                id: item.id,
                name: item.name,
                type: item.type,
                tier: item.tier
            })
        ) : undefined,
        tools: D.tools ? D.tools.map(
            (item: any) => ({
                id: item.id,
                name: item.name,
                type: item.type,
                tier: item.tier
            })
        ) : undefined,
    }
}

export function GameEvent(
    props: {
        value: IGameEvent
    }
) {

    const lm = useLanguageModel();
    const history = useHistory();
    const player = usePlayer();
    const world = useWorld();
    const narr = useNarration();

    const extras = [];

    const iconName = props.value.origin === "story-teller"
        ? "mdi:book-open-variant"
        : props.value.origin === "npc"
            ? "mdi:person"
            : props.value.origin === "player"
                ? "mdi:account-star"
                : "mdi:globe";

    if (props.value.details) {

        const D = props.value.details;

        if (D.item) {
            extras.push(
                <TooltipText tooltip={<ItemTooltip value={D.item} />}>
                    <div className="relative shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                        <span className="absolute top-2 left-2 text-xs text-neutral-500">Item</span>
                        <span className="absolute bottom-2 left-2 text-xs text-neutral-500">
                            {WORLD_ITEM_TIER_DISPLAYS[D.item.tier]}
                        </span>
                        <span className="absolute top-2 right-2 text-xs text-neutral-500">
                            {WORLD_ITEM_TYPE_DISPLAYS[D.item.type]}
                        </span>
                        <span className="text-xs text-center font-bold">{D.item.name}</span>
                    </div>
                </TooltipText>
            );
        }

        if (D.location) {
            extras.push(
                <TooltipText tooltip={<LocationTooltip value={D.location} />}>
                    <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                        <span className="absolute top-2 left-2 text-xs text-neutral-500">Location</span>
                        <span className="absolute bottom-2 left-2 text-xs text-neutral-500">
                            {WORLD_NODE_AREA_TYPE[D.location.type]}
                        </span>
                        <span className="text-xs text-center font-bold">{D.location.name}</span>
                    </div>
                </TooltipText>
            );
        }

        if (D.from) {
            extras.push(
                <TooltipText tooltip={<LocationTooltip value={D.from} />}>
                    <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                        <span className="absolute top-2 left-2 text-xs text-neutral-500">From</span>
                        <span className="absolute bottom-2 left-2 text-xs text-neutral-500">
                            {WORLD_NODE_AREA_TYPE[D.from.type]}
                        </span>
                        <span className="text-xs text-center font-bold">{D.from.name}</span>
                    </div>
                </TooltipText>
            );
        }

        if (D.to) {
            extras.push(
                <TooltipText tooltip={<LocationTooltip value={D.to} />}>
                    <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                        <span className="absolute top-2 left-2 text-xs text-neutral-500">To</span>
                        <span className="absolute bottom-2 left-2 text-xs text-neutral-500">
                            {WORLD_NODE_AREA_TYPE[D.to.type]}
                        </span>
                        <span className="text-xs text-center font-bold">{D.to.name}</span>
                    </div>
                </TooltipText>
            );
        }

        if (D.npc) {
            extras.push(
                <TooltipText tooltip={<NpcTooltip value={D.npc} />}>
                    <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                        <span className="absolute top-2 left-2 text-xs text-neutral-500">NPC</span>
                        <span className="absolute bottom-2 left-2 text-xs text-neutral-500">
                            {WORLD_NPC_STANCE_DISPLAYS[D.npc.stance]}
                        </span>
                        <span className="absolute top-2 right-2 text-xs text-neutral-500">
                            {WORLD_NPC_RACE_DISPLAYS[D.npc.race]}
                        </span>
                        <span className="text-xs text-center font-bold">{D.npc.name}</span>
                    </div>
                </TooltipText>
            );
        }

        if (D.craftingType) {
            extras.push(
                <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_PLAYER_CRAFTING_TYPE_DESCRIPTIONS[D.craftingType]}</span>}>
                    <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                        <span className="absolute top-2 left-2 text-xs text-neutral-500">Crafting Type</span>
                        <span className="text-xs text-center font-bold">{WORLD_PLAYER_CRAFTING_TYPE_DISPLAYS[D.craftingType]}</span>
                    </div>
                </TooltipText>
            );
        }

        if (D.ingredients) {
            D.ingredients.forEach(
                (item: any) => {
                    extras.push(
                        <TooltipText tooltip={<ItemTooltip value={item} />}>
                            <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                                <span className="absolute top-2 left-2 text-xs text-neutral-500">Ingredient</span>
                                <span className="absolute bottom-2 left-2 text-xs text-neutral-500">
                                    {WORLD_ITEM_TIER_DISPLAYS[item.tier]}
                                </span>
                                <span className="absolute top-2 right-2 text-xs text-neutral-500">
                                    {WORLD_ITEM_TYPE_DISPLAYS[item.type]}
                                </span>
                                <span className="text-xs text-center font-bold">{item.name}</span>
                            </div>
                        </TooltipText>
                    );
                }
            );
        }

        if (D.tools) {
            D.tools.forEach(
                (item: any) => {
                    extras.push(
                        <TooltipText tooltip={<ItemTooltip value={item} />}>
                            <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                                <span className="absolute top-2 left-2 text-xs text-neutral-500">Tool</span>
                                <span className="absolute bottom-2 left-2 text-xs text-neutral-500">
                                    {WORLD_ITEM_TIER_DISPLAYS[item.tier]}
                                </span>
                                <span className="absolute top-2 right-2 text-xs text-neutral-500">
                                    {WORLD_ITEM_TYPE_DISPLAYS[item.type]}
                                </span>
                                <span className="text-xs text-center font-bold">{item.name}</span>
                            </div>
                        </TooltipText>
                    );
                }
            );
        }

    }

    const debugCopyJson = () => {
        const D = props.value.details;
        const jsonData = JSON.stringify(eventToJsonData(props.value));
        navigator.clipboard.writeText(jsonData);
    };

    return <>
        <Card>
            <div className="flex flex-row justify-start items-center gap-2">
                <Icon className="dark:text-white text-black text-xl" icon={iconName} />
                <CardTitle>{props.value.origin.split('-').join(' ')}</CardTitle>
                <span className="text-xs text-neutral-400">
                    Day {props.value.time.day}, {props.value.time.hour.toString().padStart(2, "0")}:{props.value.time.minute.toString().padStart(2, "0")}:{props.value.time.second.toString().padStart(2, "0")}
                </span>
            </div>
            {
                <div className="flex flex-row justify-start items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-neutral-500 text-white rounded-full text-ellipsis text-nowrap">
                        {props.value.happening}
                    </span>
                    <span className="text-xs italic">
                        {props.value.notes}
                    </span>
                </div>
            }
            {
                extras && extras.length > 0 && <div className="flex flex-row flex-wrap justify-start items-center gap-2 p-2">
                    {extras}
                </div>
            }
            <button onClick={debugCopyJson} className="text-xs text-neutral-500 hover:text-neutral-700 active:text-neutral-400">
                Copy JSON
            </button>
        </Card>
    </>;
}