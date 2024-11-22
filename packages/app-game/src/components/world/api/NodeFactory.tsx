import { IWorldNode, WorldNodeLevel } from "../../../context/World.context";
import { WorldNodeAreaType, WorldNodeBuildingType, WorldNodeHumidity, WorldNodeRoomType, WorldNodeSettlementType, WorldNodeStreetType, WorldNodeTemperature, WorldNodeWildernessType } from "../../../model/world.enums";

export interface INodeFactory {
    node(
        name: string,
        type: WorldNodeAreaType,
        details: {
            level?: WorldNodeLevel,
            temperature: WorldNodeTemperature,
            humidity: WorldNodeHumidity,
            building?: {
                buildingType: WorldNodeBuildingType;
            },
            room?: {
                roomType: WorldNodeRoomType
            },
            street?: {
                streetType: WorldNodeStreetType;
            },
            settlement?: {
                settlementType: WorldNodeSettlementType;
            },
            wilderness?: {
                wildernessType: WorldNodeWildernessType;
            },
        }
    ): IWorldNode;
}