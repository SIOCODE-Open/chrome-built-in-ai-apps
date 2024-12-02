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
import { WORLD_ITEM_TIER_DISPLAYS, WORLD_ITEM_TYPE_DISPLAYS, WORLD_NODE_AREA_TYPE, WORLD_NPC_QUEST_DIFFICULTY_DESCRIPTIONS, WORLD_NPC_QUEST_DIFFICULTY_DISPLAYS, WORLD_NPC_QUEST_TYPE_DESCRIPTIONS, WORLD_NPC_QUEST_TYPE_DISPLAYS, WORLD_NPC_RACE_DISPLAYS, WORLD_NPC_STANCE_DISPLAYS, WORLD_PLAYER_CRAFTING_TYPE_DESCRIPTIONS, WORLD_PLAYER_CRAFTING_TYPE_DISPLAYS, WORLD_PLAYER_EQUIP_SLOT_DISPLAYS, WORLD_PLAYER_SKILL_DISPLAYS } from "../../model/world.enums";
import { LocationTooltip } from "../tooltips/LocationTooltip";
import { useNarration } from "../../context/Narration.context";
import { NpcTooltip } from "../tooltips/NpcTooltip";
import { ActionText } from "../ActionText";
import { ItemActions } from "../actions/ItemActions";
import { NpcActions } from "../actions/NpcActions";
import { LocationActions } from "../actions/LocationActions";

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
        quest: D.quest ? {
            type: D.quest.type,
            difficulty: D.quest.difficulty,
            narration: D.quest.narration,
            deliver: D.quest.deliver ? {
                item: {
                    id: D.quest.deliver.item.id,
                    name: D.quest.deliver.item.name,
                    type: D.quest.deliver.item.type,
                    tier: D.quest.deliver.item.tier
                },
                recipient: {
                    id: D.quest.deliver.recipient.id,
                    name: D.quest.deliver.recipient.name,
                    race: D.quest.deliver.recipient.race
                },
                location: {
                    id: D.quest.deliver.recipient.location.id,
                    name: D.quest.deliver.recipient.location.name,
                    temperature: D.quest.deliver.recipient.location.temperature,
                    humidity: D.quest.deliver.recipient.location.humidity,
                    type: D.quest.deliver.recipient.location.type,
                    building: D.quest.deliver.recipient.location.building ? {
                        buildingType: D.quest.deliver.recipient.location.building.buildingType
                    } : undefined,
                    room: D.quest.deliver.recipient.location.room ? {
                        roomType: D.quest.deliver.recipient.location.room.roomType
                    } : undefined,
                    street: D.quest.deliver.recipient.location.street ? {
                        streetType: D.quest.deliver.recipient.location.street.streetType
                    } : undefined,
                    settlement: D.quest.deliver.recipient.location.settlement ? {
                        settlementType: D.quest.deliver.recipient.location.settlement.settlementType
                    } : undefined,
                    wilderness: D.quest.deliver.recipient.location.wilderness ? {
                        wildernessType: D.quest.deliver.recipient.location.wilderness.wildernessType
                    } : undefined,
                }
            } : undefined,
            talkTo: D.quest.talkTo ? {
                npc: {
                    id: D.quest.talkTo.npc.id,
                    name: D.quest.talkTo.npc.name,
                    race: D.quest.talkTo.npc.race,
                },
                location: {
                    id: D.quest.talkTo.npc.location.id,
                    name: D.quest.talkTo.npc.location.name,
                    temperature: D.quest.talkTo.npc.location.temperature,
                    humidity: D.quest.talkTo.npc.location.humidity,
                    type: D.quest.talkTo.npc.location.type,
                    building: D.quest.talkTo.npc.location.building ? {
                        buildingType: D.quest.talkTo.npc.location.building.buildingType
                    } : undefined,
                    room: D.quest.talkTo.npc.location.room ? {
                        roomType: D.quest.talkTo.npc.location.room.roomType
                    } : undefined,
                    street: D.quest.talkTo.npc.location.street ? {
                        streetType: D.quest.talkTo.npc.location.street.streetType
                    } : undefined,
                    settlement: D.quest.talkTo.npc.location.settlement ? {
                        settlementType: D.quest.talkTo.npc.location.settlement.settlementType
                    } : undefined,
                    wilderness: D.quest.talkTo.npc.location.wilderness ? {
                        wildernessType: D.quest.talkTo.npc.location.wilderness.wildernessType
                    } : undefined,
                }
            } : undefined,
            findLocation: D.quest.findLocation ? {
                location: {
                    id: D.quest.findLocation.location.id,
                    name: D.quest.findLocation.location.name,
                    temperature: D.quest.findLocation.location.temperature,
                    humidity: D.quest.findLocation.location.humidity,
                    type: D.quest.findLocation.location.type,
                    building: D.quest.findLocation.location.building ? {
                        buildingType: D.quest.findLocation.location.building.buildingType
                    } : undefined,
                    room: D.quest.findLocation.location.room ? {
                        roomType: D.quest.findLocation.location.room.roomType
                    } : undefined,
                    street: D.quest.findLocation.location.street ? {
                        streetType: D.quest.findLocation.location.street.streetType
                    } : undefined,
                    settlement: D.quest.findLocation.location.settlement ? {
                        settlementType: D.quest.findLocation.location.settlement.settlementType
                    } : undefined,
                    wilderness: D.quest.findLocation.location.wilderness ? {
                        wildernessType: D.quest.findLocation.location.wilderness.wildernessType
                    } : undefined,
                }
            } : undefined,
            kill: D.quest.kill ? {
                npc: {
                    id: D.quest.kill.npc.id,
                    name: D.quest.kill.npc.name,
                    race: D.quest.kill.npc.race,
                },
                location: {
                    id: D.quest.kill.npc.location.id,
                    name: D.quest.kill.npc.location.name,
                    temperature: D.quest.kill.npc.location.temperature,
                    humidity: D.quest.kill.npc.location.humidity,
                    type: D.quest.kill.npc.location.type,
                    building: D.quest.kill.npc.location.building ? {
                        buildingType: D.quest.kill.npc.location.building.buildingType
                    } : undefined,
                    room: D.quest.kill.npc.location.room ? {
                        roomType: D.quest.kill.npc.location.room.roomType
                    } : undefined,
                    street: D.quest.kill.npc.location.street ? {
                        streetType: D.quest.kill.npc.location.street.streetType
                    } : undefined,
                    settlement: D.quest.kill.npc.location.settlement ? {
                        settlementType: D.quest.kill.npc.location.settlement.settlementType
                    } : undefined,
                    wilderness: D.quest.kill.npc.location.wilderness ? {
                        wildernessType: D.quest.kill.npc.location.wilderness.wildernessType
                    } : undefined,
                }
            } : undefined,
        } : undefined,
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
    // Define the helper functions

    function extraItem(item, label = 'Item') {
        return (

            <TooltipText tooltip={<ItemTooltip value={item} />}>
                <div className="relative shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                    <span className="absolute top-2 left-2 text-xs text-neutral-500">{label}</span>
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

    function extraNpc(npc, label = 'NPC') {
        return (

            <ActionText actions={<NpcActions value={npc} talk attack navigate />} >
                <TooltipText tooltip={<NpcTooltip value={npc} />}>
                    <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                        <span className="absolute top-2 left-2 text-xs text-neutral-500">{label}</span>
                        <span className="absolute bottom-2 left-2 text-xs text-neutral-500">
                            {WORLD_NPC_RACE_DISPLAYS[npc.race]}
                        </span>
                        <span className="absolute top-2 right-2 text-xs text-neutral-500">
                            {WORLD_NPC_STANCE_DISPLAYS[npc.stance]}
                        </span>
                        <span className="text-xs text-center font-bold">{npc.name}</span>
                    </div>
                </TooltipText>
            </ActionText>

        );
    }

    function extraLocation(location, label = 'Location') {
        return (

            <ActionText actions={<LocationActions value={location} navigate={true} />} >
                <TooltipText tooltip={<LocationTooltip value={location} />}>
                    <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                        <span className="absolute top-2 left-2 text-xs text-neutral-500">{label}</span>
                        <span className="absolute bottom-2 left-2 text-xs text-neutral-500">
                            {WORLD_NODE_AREA_TYPE[location.type]}
                        </span>
                        <span className="text-xs text-center font-bold">{location.name}</span>
                    </div>
                </TooltipText>
            </ActionText>

        );
    }

    function extraQuestType(type) {
        return (
            <TooltipText tooltip={<span className="text-xs italic">{WORLD_NPC_QUEST_TYPE_DESCRIPTIONS[type]}</span>}>
                <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                    <span className="absolute top-2 left-2 text-xs text-neutral-500">Type</span>
                    <span className="text-xs text-center font-bold">{WORLD_NPC_QUEST_TYPE_DISPLAYS[type]}</span>
                </div>
            </TooltipText>
        );
    }

    function extraQuestDifficulty(difficulty) {
        return (
            <TooltipText tooltip={<span className="text-xs italic">{WORLD_NPC_QUEST_DIFFICULTY_DESCRIPTIONS[difficulty]}</span>}>
                <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                    <span className="absolute top-2 left-2 text-xs text-neutral-500">Difficulty</span>
                    <span className="text-xs text-center font-bold">{WORLD_NPC_QUEST_DIFFICULTY_DISPLAYS[difficulty]}</span>
                </div>
            </TooltipText>
        );
    }

    function extraCraftingType(craftingType) {
        return (
            <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_PLAYER_CRAFTING_TYPE_DESCRIPTIONS[craftingType]}</span>}>
                <div className="shadow-md w-32 h-32 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col justify-center items-center gap-2">
                    <span className="absolute top-2 left-2 text-xs text-neutral-500">Crafting Type</span>
                    <span className="text-xs text-center font-bold">{WORLD_PLAYER_CRAFTING_TYPE_DISPLAYS[craftingType]}</span>
                </div>
            </TooltipText>
        );
    }

    // Refactored code using the helper functions

    if (props.value.details) {
        const D = props.value.details;

        if (D.item) {
            extras.push(extraItem(D.item, 'Item'));
        }

        if (D.location) {
            extras.push(extraLocation(D.location));
        }

        if (D.from) {
            extras.push(extraLocation(D.from, 'From'));
        }

        if (D.to) {
            extras.push(extraLocation(D.to, 'To'));
        }

        if (D.npc) {
            extras.push(extraNpc(D.npc, 'NPC'));
        }

        if (D.craftingType) {
            extras.push(extraCraftingType(D.craftingType));
        }

        if (D.ingredients) {
            D.ingredients.forEach((item) => {
                extras.push(extraItem(item, 'Ingredient'));
            });
        }

        if (D.tools) {
            D.tools.forEach((item) => {
                extras.push(extraItem(item, 'Tool'));
            });
        }

        if (D.quest) {
            extras.push(extraQuestType(D.quest.type));
            extras.push(extraQuestDifficulty(D.quest.difficulty));

            if (D.quest.deliver) {
                // Item
                extras.push(extraItem(D.quest.deliver.item, 'Item'));

                // Recipient
                extras.push(extraNpc(D.quest.deliver.recipient, 'Recipient'));

                // Location
                extras.push(extraLocation(D.quest.deliver.recipient.location));
            }

            if (D.quest.talkTo) {
                // NPC
                extras.push(extraNpc(D.quest.talkTo.npc));

                // Location
                extras.push(extraLocation(D.quest.talkTo.npc.location));
            }

            if (D.quest.kill) {
                // NPC
                extras.push(extraNpc(D.quest.kill.npc));

                // Location
                extras.push(extraLocation(D.quest.kill.npc.location));
            }
        }
    }

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
        </Card>
    </>;
}