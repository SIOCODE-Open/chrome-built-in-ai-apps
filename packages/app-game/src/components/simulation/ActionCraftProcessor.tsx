import { useEffect } from "react";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { usePlayer } from "../../context/Player.context";
import { IWorldItem, IWorldNode, useWorld } from "../../context/World.context";
import { WORLD_ITEM_TYPE_DISPLAYS, WORLD_WEAPON_TYPE, WORLD_WEARABLE_TYPE, WorldItemTier, WorldPlayerCraftingType, WorldWeaponType, WorldWearableType } from "../../model/world.enums";
import { ItemDetailGenerator } from "../../ai/ItemDetailGenerator";
import { useLanguageModel } from "@siocode/base";
import { CraftingGenerator } from "../../ai/CraftingGenerator";
import { ArmorDefenseGenerator } from "../../model/ArmorDefenseGenerator";
import { WeaponDamageGenerator } from "../../model/WeaponDamageGenerator";
import { WeaponSpecializer } from "../../ai/WeaponSpecializer";
import { WearableSpecializer } from "../../ai/WearableSpecializer";

const tierNumbers = {
    "garbage": 0,
    "common": 1,
    "rare": 2,
    "epic": 3,
    "legendary": 4,
};

const craftingResultTypes = {
    "break": {
        "weapon": ["material", "household"],
        "armor": ["material", "household"],
        "wearable": ["material", "household"],
        "helmet": ["material", "household"],
        "boots": ["material", "household"],
        "food": ["material", "household", "food", "drink", "consumable"],
        "drink": ["material", "household", "food", "drink", "consumable"],
        "household": ["material", "household", "consumable"],
    },
    "assemble": {
        "household": ["wearable", "armor", "weapon", "helmet", "boots"],
        "material": ["wearable", "armor", "weapon", "helmet", "boots"],
    },
    "cook": {
        "food": ["food", "drink", "consumable"],
        "drink": ["food", "drink", "consumable"],
        "consumable": ["food", "drink", "consumable"],
        "material": ["food", "drink", "consumable"],
        "household": ["food", "drink", "consumable"],
    },
    "disassemble": {
        "weapon": ["material", "household"],
        "armor": ["material", "household"],
        "wearable": ["material", "household"],
        "helmet": ["material", "household"],
        "boots": ["material", "household"],
        "food": ["material", "household", "food", "drink", "consumable"],
        "drink": ["material", "household", "food", "drink", "consumable"],
        "household": ["material", "household", "consumable"],
    },
    "refine": {
        "weapon": ["weapon"],
        "armor": ["armor"],
        "wearable": ["wearable"],
        "helmet": ["helmet"],
        "boots": ["boots"],
        "food": ["food", "drink", "consumable"],
        "drink": ["food", "drink", "consumable"],
        "household": ["household", "consumable"],
        "material": ["material", "household", "consumable"],
        "consumable": ["consumable"],
    },
    "smelt": {
        "weapon": ["material"],
        "armor": ["material"],
        "wearable": ["material"],
        "helmet": ["material"],
        "boots": ["material"],
        "food": ["material", "consumable"],
        "drink": ["material", "consumable"],
        "household": ["material", "consumable"],
        "material": ["material", "consumable"],
    },
}

export function ActionCraftProcessor() {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();
    const world = useWorld();
    const lm = useLanguageModel();

    const populateItem = async (item: IWorldItem) => {
        const gen = new ItemDetailGenerator(lm);
        await gen.generate(item);
    };

    const onConsumeIngredients = async (R: Array<IGameEvent>, ingredients: Array<IWorldItem>) => {

        for (let ingredient of ingredients) {
            history.advanceTime(60);
            R.push(
                history.consumeInventoryItem(ingredient)
            );
            player.removeItem(ingredient);
        }

    };

    const onCraftNewItems = async (R: Array<IGameEvent>, items: Array<IWorldItem>, description: string) => {

        for (let item of items) {
            history.advanceTime(60);
            player.addItem(item);
            R.push(
                history.craftedItem(item, description)
            );
        }

    }

    const onCraftBreak = async (R: Array<IGameEvent>, ingredients: Array<IWorldItem>, tools: Array<IWorldItem>) => {

        console.log("[ActionCraftProcessor]", "Breaking", ingredients, "using", tools);

        // Guaranteed: SUM(ingredient count) + SUM(tool count)
        // Max: 1 + SUM(ingredient tier) + SUM(tool tier)
        const guaranteedItemCount = ingredients.length + tools.length;
        const maxItemCount = 1 + ingredients.reduce((sum, item) => sum + tierNumbers[item.tier], 0) + tools.reduce((sum, item) => sum + tierNumbers[item.tier], 0);
        const itemCount = Math.floor(Math.random() * (maxItemCount - guaranteedItemCount)) + guaranteedItemCount;
        const possibleResults = craftingResultTypes.break[ingredients[0].type];

        if (itemCount === 0 || !possibleResults) {
            R.push(
                history.noop("You break the ingredients, but recover nothing.")
            );
        }

        if (possibleResults) {

            let resultItems: Array<IWorldItem> = [];

            const maxIngredientTier = ingredients.reduce((max, item) => Math.max(max, tierNumbers[item.tier]), 0);
            let breakDescription = `created by breaking ${ingredients.map(i => i.name).join(", ")}`;
            if (tools.length > 0) {
                breakDescription += ` using ${tools.map(i => i.name).join(", ")}`;
            }

            for (let i = 0; i < itemCount; i++) {
                let resultTier = Math.floor(Math.random() * (maxIngredientTier + 1));
                const resultTierName = Object.keys(tierNumbers).find(k => tierNumbers[k] === resultTier);
                const resultType = possibleResults[Math.floor(Math.random() * possibleResults.length)];
                const resultItem = world.createItem(
                    WORLD_ITEM_TYPE_DISPLAYS[resultType] + " " + WORLD_ITEM_TYPE_DISPLAYS[resultTierName],
                    resultType,
                    resultTierName as WorldItemTier,
                );
                resultItems.push(resultItem);
            }

            const craftingGenerator = new CraftingGenerator(lm);
            const craftingResult = await craftingGenerator.prompt({
                craftingType: "break",
                ingredients,
                tools,
                resultPrototypes: resultItems,
            });

            resultItems = craftingResult.items;

            for (const item of resultItems) {
                await onPostProcessNewItem(ingredients, item);
            }

            await onCraftNewItems(R, resultItems, breakDescription);

        }

        await onConsumeIngredients(R, ingredients);

    };

    const onCraftAssemble = async (R: Array<IGameEvent>, ingredients: Array<IWorldItem>, tools: Array<IWorldItem>) => {

        console.log("[ActionCraftProcessor]", "Assembling", ingredients, "using", tools);

        const possibleResults = craftingResultTypes.assemble[ingredients[0].type];

        if (!possibleResults) {
            R.push(
                history.noop("You think hard about how to assemble the ingredients, but nothing comes to mind.")
            );
            return;
        }

        if (ingredients.length < 2 && tools.length === 0) {
            R.push(
                history.noop("You think hard about how to assemble one thing, but you realize you'll need to add more ingredients.")
            );
            return;
        }

        const maxIngredientTier = ingredients.reduce((max, item) => Math.max(max, tierNumbers[item.tier]), 0);
        const minIngredientTier = ingredients.reduce((min, item) => Math.min(min, tierNumbers[item.tier]), Infinity);
        let assembleDescription = `created by assembling ${ingredients.map(i => i.name).join(", ")}`;
        if (tools.length > 0) {
            assembleDescription += ` using ${tools.map(i => i.name).join(", ")}`;
        }

        let resultTier = Math.floor(Math.random() * (maxIngredientTier - minIngredientTier + 1)) + minIngredientTier;
        const luckyRoll = Math.random();
        let luckyChance = 0.1;
        if (tools.length > 0) {
            luckyChance = 0.5;
        }
        if (luckyRoll < luckyChance) {
            resultTier = Math.min(4, resultTier + 1);
        }
        const resultTierName = Object.keys(tierNumbers).find(k => tierNumbers[k] === resultTier);
        // TODO: Better control over result type
        const resultType = possibleResults[Math.floor(Math.random() * possibleResults.length)];
        const resultItem = world.createItem(
            WORLD_ITEM_TYPE_DISPLAYS[resultType] + " " + WORLD_ITEM_TYPE_DISPLAYS[resultTierName],
            resultType,
            resultTierName as WorldItemTier,
        );

        const craftingGenerator = new CraftingGenerator(lm);
        const craftingResult = await craftingGenerator.prompt({
            craftingType: "assemble",
            ingredients,
            tools,
            resultPrototypes: [resultItem],
        });

        resultItem.name = craftingResult.items[0].name;

        await onPostProcessNewItem(ingredients, resultItem);

        await onCraftNewItems(R, [resultItem], assembleDescription);

        await onConsumeIngredients(R, ingredients);

    };


    const onCraftRefine = async (R: Array<IGameEvent>, ingredients: Array<IWorldItem>, tools: Array<IWorldItem>) => {

        console.log("[ActionCraftProcessor]", "Refining", ingredients[0], "using", ingredients.slice(1), "and", tools);

        const possibleResults = craftingResultTypes.refine[ingredients[0].type];

        if (!possibleResults) {
            R.push(
                history.noop("You think hard about how to refine the item, but nothing comes to mind.")
            );
            return;
        }

        if (ingredients.length < 2 && tools.length === 0) {
            R.push(
                history.noop("You think hard about how to refine something without both ingredients and tools, but nothing comes to mind.")
            );
            return;
        }

        let assembleDescription = `refined from ${ingredients.map(i => i.name).join(", ")}`;
        if (tools.length > 0) {
            assembleDescription += ` using ${tools.map(i => i.name).join(", ")}`;
        }

        let resultTier = tierNumbers[ingredients[0].tier];
        const luckyRoll = Math.random();
        if (luckyRoll < 0.25) {
            resultTier = Math.min(4, resultTier + 1);
        }
        const resultTierName = Object.keys(tierNumbers).find(k => tierNumbers[k] === resultTier);
        const resultType = possibleResults[Math.floor(Math.random() * possibleResults.length)];
        const resultItem = ingredients[0];

        resultItem.name = WORLD_ITEM_TYPE_DISPLAYS[resultType] + " " + WORLD_ITEM_TYPE_DISPLAYS[resultTierName];
        resultItem.type = resultType;
        resultItem.tier = resultTierName as WorldItemTier;

        const craftingGenerator = new CraftingGenerator(lm);
        const craftingResult = await craftingGenerator.prompt({
            craftingType: "refine",
            ingredients,
            tools,
            resultPrototypes: [resultItem],
        });

        resultItem.name = craftingResult.items[0].name;

        await onPostProcessRefinedItem(ingredients, resultItem);

        await onCraftNewItems(R, [resultItem], assembleDescription);

        await onConsumeIngredients(R, ingredients.slice(1));

    };

    const onCraftCook = async (R: Array<IGameEvent>, ingredients: Array<IWorldItem>, tools: Array<IWorldItem>) => {

        console.log("[ActionCraftProcessor]", "Cooking", ingredients, "using", tools);

        const currentLocation = player.getPlayerLocation();

        if (currentLocation.type !== "room") {
            R.push(
                history.noop("You can't cook here, you are not in a kitchen.")
            );
            return;
        }

        if (currentLocation.room?.roomType !== "kitchen") {
            R.push(
                history.noop("You can't cook here, you are not in a kitchen.")
            );
            return;
        }

        if (ingredients.length < 1) {
            R.push(
                history.noop("You think hard about how to cook nothing, but nothing comes to mind.")
            );
            return;
        }

        const possibleResults = craftingResultTypes.cook[ingredients[0].type];

        if (!possibleResults) {
            R.push(
                history.noop("You think hard about how to cook the ingredients, but nothing comes to mind.")
            );
            return;
        }

        let assembleDescription = `cooked from ${ingredients.map(i => i.name).join(", ")}`;

        let resultTier = tierNumbers[ingredients[Math.floor(Math.random() * ingredients.length)].tier];
        const luckyRoll = Math.random();
        if (luckyRoll < 0.1) {
            resultTier = Math.min(4, resultTier + 1);
        }
        const resultTierName = Object.keys(tierNumbers).find(k => tierNumbers[k] === resultTier);
        const resultType = possibleResults[Math.floor(Math.random() * possibleResults.length)];
        const resultItem = world.createItem(
            WORLD_ITEM_TYPE_DISPLAYS[resultType] + " " + WORLD_ITEM_TYPE_DISPLAYS[resultTierName],
            resultType,
            resultTierName as WorldItemTier,
        );

        const craftingGenerator = new CraftingGenerator(lm);
        const craftingResult = await craftingGenerator.prompt({
            craftingType: "cook",
            ingredients,
            tools,
            resultPrototypes: [resultItem],
        });

        resultItem.name = craftingResult.items[0].name;

        await onPostProcessNewItem(ingredients, resultItem);

        await onCraftNewItems(R, [resultItem], assembleDescription);

        await onConsumeIngredients(R, ingredients);

    };

    const onPostProcessNewItem = async (ingredients: Array<IWorldItem>, item: IWorldItem) => {

        item.details = {
            description: "Crafted by the player",
        };

        if (item.type === "weapon") {

            const weaponSpecializer = new WeaponSpecializer(lm);
            const specializationRequest = {
                name: item.name,
                desiredWeaponType: WORLD_WEAPON_TYPE[Math.floor(Math.random() * WORLD_WEAPON_TYPE.length)],
            };
            const newName = await weaponSpecializer.prompt(specializationRequest);

            item.weapon = {
                weaponType: specializationRequest.desiredWeaponType as WorldWeaponType,
                damage: new WeaponDamageGenerator().generate(item),
            };
            item.name = newName;

        } else if (item.type === "armor") {

            item.armor = {
                defense: new ArmorDefenseGenerator().generate(item),
            };

        } else if (item.type === "wearable") {

            const wearableSpecializer = new WearableSpecializer(lm);
            const specializationRequest = {
                name: item.name,
                desiredWearableType: WORLD_WEARABLE_TYPE[Math.floor(Math.random() * WORLD_WEARABLE_TYPE.length)],
            };
            const newName = await wearableSpecializer.prompt(specializationRequest);

            item.wearable = {
                wearableType: specializationRequest.desiredWearableType as WorldWearableType,
                defense: new ArmorDefenseGenerator().generate(item),
            };
            item.name = newName;

        } else if (item.type === "helmet") {

            item.helmet = {
                defense: new ArmorDefenseGenerator().generate(item),
            };

        } else if (item.type === "boots") {

            item.boots = {
                defense: new ArmorDefenseGenerator().generate(item),
            };

        }

        // TODO: Add effects

    };

    const onPostProcessRefinedItem = async (ingredients: Array<IWorldItem>, item: IWorldItem) => {

        item.details = {
            description: "Refined by the player",
        };

        if (item.type === "weapon") {

            // TODO: Detect weapon type
            // TODO: Calculate damage, like in ForestBiomeModule.tsx
            item.weapon = {
                weaponType: item.weapon.weaponType,
                damage: new WeaponDamageGenerator().generateAtLeast(item, item.weapon.damage),
            };

        } else if (item.type === "armor") {

            // TODO: Calculate defense
            item.armor = {
                defense: new ArmorDefenseGenerator().generateAtLeast(item, item.armor.defense),
            };

        } else if (item.type === "wearable") {

            // TODO: Detect wearable type
            // TODO: Calculate defense
            item.wearable = {
                wearableType: "necklace",
                defense: new ArmorDefenseGenerator().generateAtLeast(item, item.wearable.defense),
            };

        } else if (item.type === "helmet") {

            // TODO: Calculate defense
            item.helmet = {
                defense: new ArmorDefenseGenerator().generateAtLeast(item, item.helmet.defense),
            };

        } else if (item.type === "boots") {

            // TODO: Calculate defense
            item.boots = {
                defense: new ArmorDefenseGenerator().generateAtLeast(item, item.boots.defense),
            };

        }

    };

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-craft") {
            return R;
        }

        console.log("[ActionCraftProcessor]", "Processing action-craft event", ev);

        const currentLocation = ev.details.location as IWorldNode;
        const ingredients = ev.details.ingredients as Array<IWorldItem>;
        const tools = ev.details.tools as Array<IWorldItem>;
        const craftingType = ev.details.craftingType as WorldPlayerCraftingType;

        if (craftingType === "disassemble") {
            console.log("[ActionCraftProcessor]", "Disassembling", ingredients, "using", tools);
        } else if (craftingType === "assemble") {
            console.log("[ActionCraftProcessor]", "Assembling", ingredients, "using", tools);
            await onCraftAssemble(R, ingredients, tools);
        } else if (craftingType === "break") {
            console.log("[ActionCraftProcessor]", "Breaking", ingredients, "using", tools);
            await onCraftBreak(R, ingredients, tools);
        } else if (craftingType === "cook") {
            console.log("[ActionCraftProcessor]", "Cooking", ingredients, "using", tools);
            await onCraftCook(R, ingredients, tools);
        } else if (craftingType === "refine") {
            console.log("[ActionCraftProcessor]", "Refining", ingredients, "using", tools);
            await onCraftRefine(R, ingredients, tools);
        } else if (craftingType === "smelt") {
            console.log("[ActionCraftProcessor]", "Smelting", ingredients, "using", tools);
        }

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}