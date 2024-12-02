import { useEffect } from "react";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { usePlayer } from "../../context/Player.context";
import { IConsumableItemEffect, IWearableItemEffect, IWorldItem, IWorldNode, useWorld } from "../../context/World.context";
import { WORLD_CONSUMABLE_EFFECT_TYPE, WORLD_ITEM_TYPE_DISPLAYS, WORLD_WEAPON_TYPE, WORLD_WEARABLE_EFFECT_ACTIVATION, WORLD_WEARABLE_EFFECT_TYPE, WORLD_WEARABLE_TYPE, WorldConsumableEffectType, WorldItemTier, WorldPlayerCraftingType, WorldWeaponType, WorldWearableEffectActivation, WorldWearableEffectType, WorldWearableType } from "../../model/world.enums";
import { ItemDetailGenerator } from "../../ai/ItemDetailGenerator";
import { useLanguageModel } from "@siocode/base";
import { CraftingGenerator } from "../../ai/CraftingGenerator";
import { ArmorDefenseGenerator } from "../../model/ArmorDefenseGenerator";
import { WeaponDamageGenerator } from "../../model/WeaponDamageGenerator";
import { WeaponSpecializer } from "../../ai/WeaponSpecializer";
import { WearableSpecializer } from "../../ai/WearableSpecializer";
import { EffectNamer } from "../../ai/EffectNamer";
import { aiDisplayConsumableEffect, aiDisplayWearableEffect } from "../../ai/display";
import { populateItem } from "../../model/GamePopulator";

const tierNumbers = {
    "garbage": 0,
    "common": 1,
    "rare": 2,
    "epic": 3,
    "legendary": 4,
};

const craftingResultTypes = {
    "break": {
        "weapon": ["material"],
        "armor": ["material"],
        "wearable": ["material"],
        "helmet": ["material"],
        "boots": ["material"],
        "food": ["material"],
        "drink": ["material"],
        "household": ["material"],
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
        "food": ["material"],
        "drink": ["material"],
        "household": ["material"],
    },
    "refine": {
        "weapon": ["weapon"],
        "armor": ["armor"],
        "wearable": ["wearable"],
        "helmet": ["helmet"],
        "boots": ["boots"],
        "food": ["food", "drink", "consumable"],
        "drink": ["food", "drink", "consumable"],
        "household": ["household"],
        "material": ["material", "household"],
        "consumable": ["consumable"],
    },
    "smelt": {
        "weapon": ["material"],
        "armor": ["material"],
        "wearable": ["material"],
        "helmet": ["material"],
        "boots": ["material"],
        "food": ["material"],
        "drink": ["material"],
        "household": ["material"],
        "material": ["material"],
    },
};

export function ActionCraftProcessor() {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();
    const world = useWorld();
    const lm = useLanguageModel();

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


    const onCraftDisassemble = async (R: Array<IGameEvent>, ingredients: Array<IWorldItem>, tools: Array<IWorldItem>) => {

        console.log("[ActionCraftProcessor]", "Disassembling", ingredients, "using", tools);

        if (ingredients.length < 1) {
            R.push(
                history.noop("You think hard about how to disassemble nothing, but nothing comes to mind.")
            );
            return;
        }

        // Guaranteed: SUM(ingredient count) + SUM(tool count) + 1
        // Max: 2 + SUM(ingredient tier) + SUM(tool tier)
        const guaranteedItemCount = 1 + ingredients.length + tools.length;
        const maxItemCount = 2 + ingredients.reduce((sum, item) => sum + tierNumbers[item.tier], 0) + tools.reduce((sum, item) => sum + tierNumbers[item.tier], 0);
        const itemCount = Math.floor(Math.random() * (maxItemCount - guaranteedItemCount)) + guaranteedItemCount;
        const possibleResults = craftingResultTypes.disassemble[ingredients[0].type];

        if (itemCount === 0 || !possibleResults) {
            R.push(
                history.noop("You disassemble the ingredients, but recover nothing.")
            );
        }

        if (possibleResults) {

            let resultItems: Array<IWorldItem> = [];

            const maxIngredientTier = ingredients.reduce((max, item) => Math.max(max, tierNumbers[item.tier]), 1);
            let breakDescription = `created by disassembling ${ingredients.map(i => i.name).join(", ")}`;
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
                craftingType: "disassemble",
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

    const onCraftSmelt = async (R: Array<IGameEvent>, ingredients: Array<IWorldItem>, tools: Array<IWorldItem>) => {

        console.log("[ActionCraftProcessor]", "Smelting", ingredients, "using", tools);

        const currentLocation = player.getPlayerLocation();

        if (currentLocation.type !== "building") {
            R.push(
                history.noop("You can't smelt here, you are not in a forge.")
            );
            return;
        }

        if (currentLocation.building?.buildingType !== "store" || !currentLocation.labels.includes("blacksmith")) {
            R.push(
                history.noop("You can't smelt here, you are not in a forge.")
            );
            return;
        }

        if (ingredients.length < 1) {
            R.push(
                history.noop("You think hard about how to smelt nothing, but nothing comes to mind.")
            );
            return;
        }

        // Guaranteed: SUM(ingredient count) + SUM(tool count)
        // Max: 1 + SUM(ingredient tier) + SUM(tool tier)
        const guaranteedItemCount = 1 + ingredients.length + tools.length;
        const maxItemCount = 1 + ingredients.reduce((sum, item) => sum + tierNumbers[item.tier], 0) + tools.reduce((sum, item) => sum + tierNumbers[item.tier], 0);
        const itemCount = Math.floor(Math.random() * (maxItemCount - guaranteedItemCount)) + guaranteedItemCount;
        const possibleResults = craftingResultTypes.smelt[ingredients[0].type];

        if (itemCount === 0 || !possibleResults) {
            R.push(
                history.noop("You smelt the ingredients, but recover nothing.")
            );
        }

        if (possibleResults) {

            let resultItems: Array<IWorldItem> = [];

            const maxIngredientTier = ingredients.reduce((max, item) => Math.max(max, tierNumbers[item.tier]), 1);
            let breakDescription = `created by smelting ${ingredients.map(i => i.name).join(", ")}`;
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
                craftingType: "smelt",
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

    const generateWearableEffect = async (tier: WorldItemTier) => {

        let value = 5 + Math.floor(Math.random() * 10);

        if (tier === "rare") {
            value = 10 + Math.floor(Math.random() * 15);
        }

        if (tier === "epic") {
            value = 25 + Math.floor(Math.random() * 50);
        }

        if (tier === "legendary") {
            value = 40 + Math.floor(Math.random() * 200);
        }

        const effectType = WORLD_WEARABLE_EFFECT_TYPE[Math.floor(Math.random() * WORLD_WEARABLE_EFFECT_TYPE.length)] as WorldWearableEffectType;
        const effectActivation = WORLD_WEARABLE_EFFECT_ACTIVATION[Math.floor(Math.random() * WORLD_WEARABLE_EFFECT_ACTIVATION.length)] as WorldWearableEffectActivation;

        if (effectType === "destroy-item") {
            value = undefined;
        }

        const newEffect: IWearableItemEffect = {
            details: {},
            type: effectType,
            activation: effectActivation,
            value,
            name: "Unnamed Effect",
        };
        const effectNamer = new EffectNamer(lm);
        const response = await effectNamer.prompt({
            effectDescription: aiDisplayWearableEffect(newEffect),
        });
        newEffect.name = response;

        return newEffect;

    };

    const generateConsumableEffect = async (tier: WorldItemTier) => {

        let value = 5 + Math.floor(Math.random() * 10);

        if (tier === "rare") {
            value = 10 + Math.floor(Math.random() * 15);
        }

        if (tier === "epic") {
            value = 25 + Math.floor(Math.random() * 50);
        }

        if (tier === "legendary") {
            value = 40 + Math.floor(Math.random() * 200);
        }

        const possibleTypes = ["heal", "damage-self", "damage-enemy"];
        const effectType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)] as WorldConsumableEffectType;

        const newEffect: IConsumableItemEffect = {
            details: {},
            type: effectType,
            value,
            name: "Unnamed Effect",
        };
        const effectNamer = new EffectNamer(lm);
        const response = await effectNamer.prompt({
            effectDescription: aiDisplayConsumableEffect(newEffect),
        });
        newEffect.name = response;

        return newEffect;

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
                effects: [],
            };
            item.name = newName;

        } else if (item.type === "armor") {

            item.armor = {
                defense: new ArmorDefenseGenerator().generate(item),
                effects: [],
            };

        } else if (item.type === "wearable") {

            const wearableSpecializer = new WearableSpecializer(lm);
            const specializationRequest = {
                name: item.name,
                desiredWearableType: WORLD_WEARABLE_TYPE[Math.floor(Math.random() * WORLD_WEARABLE_TYPE.length)],
                effects: [],
            };
            const newName = await wearableSpecializer.prompt(specializationRequest);

            item.wearable = {
                wearableType: specializationRequest.desiredWearableType as WorldWearableType,
                defense: new ArmorDefenseGenerator().generate(item),
                effects: [],
            };
            item.name = newName;

        } else if (item.type === "helmet") {

            item.helmet = {
                defense: new ArmorDefenseGenerator().generate(item),
                effects: [],
            };

        } else if (item.type === "boots") {

            item.boots = {
                defense: new ArmorDefenseGenerator().generate(item),
                effects: [],
            };

        } else if (item.type === "consumable") {

            item.consumable = {
                effects: [],
            };

        }

        const hasWearableEffects = item.type === "weapon"
            || item.type === "armor"
            || item.type === "wearable"
            || item.type === "helmet"
            || item.type === "boots";
        const hasConsumableEffects = item.type === "consumable";

        if (hasWearableEffects) {

            let maxEffectCount = 1;

            if (item.tier === "rare") {
                maxEffectCount = 2;
            }
            if (item.tier === "epic") {
                maxEffectCount = 3;
            }
            if (item.tier === "legendary") {
                maxEffectCount = 4;
            }
            if (item.tier === "garbage") {
                maxEffectCount = 0;
            }

            const effectCount = Math.floor(Math.random() * (maxEffectCount + 1));

            for (let i = 0; i < effectCount; i++) {
                const newEffect = await generateWearableEffect(item.tier);
                item.wearable.effects.push(newEffect);
            }

        }

        if (hasConsumableEffects) {

            let maxEffectCount = 1;

            if (item.tier === "rare") {
                maxEffectCount = 2;
            }
            if (item.tier === "epic") {
                maxEffectCount = 3;
            }
            if (item.tier === "legendary") {
                maxEffectCount = 4;
            }
            if (item.tier === "garbage") {
                maxEffectCount = 0;
            }

            const effectCount = Math.floor(Math.random() * (maxEffectCount + 1));

            for (let i = 0; i < effectCount; i++) {
                const newEffect = await generateConsumableEffect(item.tier);
                item.consumable.effects.push(newEffect);
            }

        }

        item.details = undefined;
        await populateItem(lm, item);

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
                effects: item.weapon?.effects || [],
            };

        } else if (item.type === "armor") {

            // TODO: Calculate defense
            item.armor = {
                defense: new ArmorDefenseGenerator().generateAtLeast(item, item.armor.defense),
                effects: item.armor?.effects || [],
            };

        } else if (item.type === "wearable") {

            // TODO: Detect wearable type
            // TODO: Calculate defense
            item.wearable = {
                wearableType: "necklace",
                defense: new ArmorDefenseGenerator().generateAtLeast(item, item.wearable.defense),
                effects: item.wearable?.effects || [],
            };

        } else if (item.type === "helmet") {

            // TODO: Calculate defense
            item.helmet = {
                defense: new ArmorDefenseGenerator().generateAtLeast(item, item.helmet.defense),
                effects: item.helmet?.effects || [],
            };

        } else if (item.type === "boots") {

            // TODO: Calculate defense
            item.boots = {
                defense: new ArmorDefenseGenerator().generateAtLeast(item, item.boots.defense),
                effects: item.boots?.effects || [],
            };

        } else if (item.type === "consumable") {

            item.consumable = {
                effects: item.consumable?.effects || [],
            };

        }

        const hasWearableEffects = item.type === "weapon"
            || item.type === "armor"
            || item.type === "wearable"
            || item.type === "helmet"
            || item.type === "boots";
        const hasConsumableEffects = item.type === "consumable";

        if (hasWearableEffects) {

            let maxEffectCount = 1;

            if (item.tier === "rare") {
                maxEffectCount = 2;
            }
            if (item.tier === "epic") {
                maxEffectCount = 3;
            }
            if (item.tier === "legendary") {
                maxEffectCount = 4;
            }
            if (item.tier === "garbage") {
                maxEffectCount = 0;
            }

            let effectCount = Math.floor(Math.random() * (maxEffectCount + 1));
            effectCount -= item.wearable.effects.length;

            for (let i = 0; i < effectCount; i++) {
                const newEffect = await generateWearableEffect(item.tier);
                item.wearable.effects.push(newEffect);
            }

        }

        if (hasConsumableEffects) {

            let maxEffectCount = 1;

            if (item.tier === "rare") {
                maxEffectCount = 2;
            }
            if (item.tier === "epic") {
                maxEffectCount = 3;
            }
            if (item.tier === "legendary") {
                maxEffectCount = 4;
            }
            if (item.tier === "garbage") {
                maxEffectCount = 0;
            }

            let effectCount = Math.floor(Math.random() * (maxEffectCount + 1));
            effectCount -= item.consumable.effects.length;

            for (let i = 0; i < effectCount; i++) {
                const newEffect = await generateConsumableEffect(item.tier);
                item.consumable.effects.push(newEffect);
            }

        }

        item.details = undefined;
        await populateItem(lm, item);

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
            await onCraftDisassemble(R, ingredients, tools);
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
            await onCraftSmelt(R, ingredients, tools);
        }

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}