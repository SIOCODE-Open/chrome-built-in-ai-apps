import { IWorldItem } from "../../../context/World.context";
import { WorldItemTier, WorldItemType } from "../../../model/world.enums";

export interface IItemFactory {
    item(
        name: string,
        type: WorldItemType,
        tier: WorldItemTier
    ): IWorldItem;
}

export class ItemFactory implements IItemFactory {

    private itemId = 0;

    item(
        name: string,
        type: WorldItemType,
        tier: WorldItemTier
    ): IWorldItem {
        return {
            id: this.itemId++,
            name,
            type,
            tier,
            labels: [],
            contains: [],
            destroyed: false,
            static: false,
        };
    }

}