import { IWorldItem, IWorldNode } from "../../context/World.context";
import { WORLD_NODE_AREA_TYPE_DISPLAYS, WORLD_NODE_BUILDING_TYPE_DISPLAYS, WORLD_NODE_HUMIDITY_DISPLAYS, WORLD_NODE_ROOM_TYPE_DISPLAYS, WORLD_NODE_SETTLEMENT_TYPE_DISPLAYS, WORLD_NODE_STREET_TYPE_DISPLAYS, WORLD_NODE_TEMPERATURE_DISPLAYS, WORLD_NODE_WILDERNESS_TYPE_DISPLAYS, WORLD_WEAPON_TYPE_DISPLAYS, WORLD_WEARABLE_TYPE_DISPLAYS, WorldItemTier, WorldItemType, WorldWeaponType, WorldWearableType } from "../../model/world.enums";
import { CardInfoTable } from "../card/CardInfoTable";
import { TooltipText } from "../TooltipText";

export function LocationTooltip(
    props: {
        value: IWorldNode;
    }
) {

    const infoTable = {
        "Name": props.value.name,
        "Type": WORLD_NODE_AREA_TYPE_DISPLAYS[props.value.type],
        "Temperature": WORLD_NODE_TEMPERATURE_DISPLAYS[props.value.temperature],
        "Humidity": WORLD_NODE_HUMIDITY_DISPLAYS[props.value.humidity],
        "Num Routes": props.value.outEdges.length,
    };


    if (props.value.type === "wilderness") {
        infoTable["Wilderness"] = WORLD_NODE_WILDERNESS_TYPE_DISPLAYS[props.value.wilderness.wildernessType]
    }

    if (props.value.type === "settlement") {
        infoTable["Settlement"] = WORLD_NODE_SETTLEMENT_TYPE_DISPLAYS[props.value.settlement.settlementType]
    }

    if (props.value.type === "street") {
        infoTable["Street"] = WORLD_NODE_STREET_TYPE_DISPLAYS[props.value.street.streetType]
    }

    if (props.value.type === "building") {
        infoTable["Building"] = WORLD_NODE_BUILDING_TYPE_DISPLAYS[props.value.building.buildingType]
    }

    if (props.value.type === "room") {
        infoTable["Room"] = WORLD_NODE_ROOM_TYPE_DISPLAYS[props.value.room.roomType]
    }

    const tt = <CardInfoTable value={infoTable} />;

    return tt;
}