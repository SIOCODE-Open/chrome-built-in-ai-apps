import { INodePopulator } from "./WorldGenerator2";

import FOREST_POPULATORS from "./populators/forest.populators.json";
import MOUNTAIN_POPULATORS from "./populators/mountain.populators.json";
import VILLAGE_POPULATORS from "./populators/village.populators.json";

import HOUSE_POPULATORS from "./populators/house.populators.json";
import TAVERN_POPULATORS from "./populators/tavern.populators.json";
import BLACKSMITH_POPULATORS from "./populators/blacksmith.populators.json";
import FARM_POPULATORS from "./populators/farm.populators.json";
import CHURCH_POPULATORS from "./populators/church.populators.json";
import TOWN_HALL_POPULATORS from "./populators/town-hall.populators.json";

import MERCHANT_POPULATORS from "./populators/merchant.populators.json";

import WEAPON_POPULATORS from "./populators/weapon.populators.json";
import ARMOR_POPULATORS from "./populators/armor.populators.json";
import HELMETS_POPULATORS from "./populators/helmets.populators.json";
import BOOTS_POPULATORS from "./populators/boots.populators.json";
import FOOD_POPULATORS from "./populators/food.populators.json";
import DRINK_POPULATORS from "./populators/drink.populators.json";
import HOUSEHOLD_POPULATORS from "./populators/household.populators.json";
import MATERIAL_POPULATORS from "./populators/material.populators.json";
import ARTIFACT_POPULATORS from "./populators/artifact.populators.json";
import CONSUMABLE_POPULATORS from "./populators/consumable.populators.json";

export const BuiltinPopulators: Array<INodePopulator> = [
    ...FOREST_POPULATORS,
    ...MOUNTAIN_POPULATORS,
    ...VILLAGE_POPULATORS,
    ...HOUSE_POPULATORS,
    ...TAVERN_POPULATORS,
    ...MERCHANT_POPULATORS,
    ...ARMOR_POPULATORS,
    ...BOOTS_POPULATORS,
    ...DRINK_POPULATORS,
    ...FOOD_POPULATORS,
    ...HELMETS_POPULATORS,
    ...HOUSEHOLD_POPULATORS,
    ...BLACKSMITH_POPULATORS,
    ...MATERIAL_POPULATORS,
    ...WEAPON_POPULATORS,
    ...FARM_POPULATORS,
    ...CHURCH_POPULATORS,
    ...TOWN_HALL_POPULATORS,
    ...ARTIFACT_POPULATORS,
    ...CONSUMABLE_POPULATORS,
] as Array<INodePopulator>;
