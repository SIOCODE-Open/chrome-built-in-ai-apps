import { INodePopulatorRule } from "./WorldGenerator2";

import ROOT_RULES from "./rules/root.rules.json";

import FOREST_RULES from "./rules/forest.rules.json";
import MOUNTAIN_RULES from "./rules/mountain.rules.json";
import VILLAGE_RULES from "./rules/village.rules.json";

import VILLAGE_STREET_RULES from "./rules/village-street.rules.json";

import TAVERN_RULES from "./rules/tavern.rules.json";
import HOUSE_RULES from "./rules/house.rules.json";
import BLACKSMITH_RULES from "./rules/blacksmith.rules.json";
import FARM_RULES from "./rules/farm.rules.json";
import CHURCH_RULES from "./rules/church.rules.json";
import TOWN_HALL_RULES from "./rules/town-hall.rules.json";

import BEDROOM_RULES from "./rules/bedroom.rules.json";
import KITCHEN_RULES from "./rules/kitchen.rules.json";
import STORAGE_RULES from "./rules/storage.rules.json";

export const BuiltinRules: Array<INodePopulatorRule> = [
    ...ROOT_RULES,

    ...FOREST_RULES,
    ...MOUNTAIN_RULES,
    ...VILLAGE_RULES,

    ...VILLAGE_STREET_RULES,

    ...TAVERN_RULES,
    ...HOUSE_RULES,
    ...BLACKSMITH_RULES,
    ...FARM_RULES,
    ...CHURCH_RULES,
    ...TOWN_HALL_RULES,

    ...BEDROOM_RULES,
    ...KITCHEN_RULES,
    ...STORAGE_RULES
] as Array<INodePopulatorRule>;