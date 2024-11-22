import { ILanguageModelContext } from "@siocode/base";
import { IWorldItem, IWorldNode } from "../context/World.context";
import { shuffleArray } from "../utils/shuffleArray";
import { InspirationKeywords } from "./InspirationKeywords";
import { WORLD_CONSUMABLE_EFFECT_TYPE_DESCRIPTIONS, WORLD_CONSUMABLE_EFFECT_TYPE_DISPLAYS, WORLD_WEARABLE_EFFECT_ACTIVATION_DESCRIPTIONS, WORLD_WEARABLE_EFFECT_ACTIVATION_DISPLAYS, WORLD_WEARABLE_EFFECT_TYPE_DESCRIPTIONS, WORLD_WEARABLE_EFFECT_TYPE_DISPLAYS } from "../model/world.enums";

const EXAMPLES = [
    // Household Items
    {
        name: "Household Item",
        tier: "common",
        type: "household",
        proposedName: "Bucket"
    },
    {
        name: "Household Item",
        tier: "common",
        type: "household",
        proposedName: "Candle"
    },
    {
        name: "Household Item",
        tier: "common",
        type: "household",
        proposedName: "Chair"
    },

    // Tools
    {
        name: "A Tool",
        tier: "common",
        type: "material",
        proposedName: "Wooden Hammer"
    },
    {
        name: "A Tool",
        tier: "rare",
        type: "material",
        proposedName: "Blacksmith's Tongs"
    },
    {
        name: "A Tool",
        tier: "epic",
        type: "material",
        proposedName: "Crystal Engraver"
    },

    // Snack
    {
        name: "Snack",
        tier: "common",
        type: "food",
        proposedName: "Dried Apple Slices"
    },
    {
        name: "Snack",
        tier: "rare",
        type: "food",
        proposedName: "Honeyed Almonds"
    },
    {
        name: "Snack",
        tier: "epic",
        type: "food",
        proposedName: "Elven Lembas Bread"
    },

    // Sword
    {
        name: "Sword",
        tier: "common",
        type: "weapon",
        proposedName: "Iron Shortsword"
    },
    {
        name: "Sword",
        tier: "rare",
        type: "weapon",
        effects: `When Defending (The effect is activated when defending against an enemy.) -> Destroy Item (The item destroys an item of your enemy.)`,
        proposedName: "Jack's Blade"
    },
    {
        name: "Sword",
        tier: "epic",
        type: "weapon",
        proposedName: "Perfected Steel Broadsword"
    },
    {
        name: "Sword",
        tier: "legendary",
        type: "weapon",
        proposedName: "Dragon's Fang"
    },

    // Axe
    {
        name: "Axe",
        tier: "common",
        type: "weapon",
        proposedName: "Woodcutter's Hatchet"
    },
    {
        name: "Axe",
        tier: "rare",
        type: "weapon",
        proposedName: "Bloodthirsty Cleaver"
    },
    {
        name: "Axe",
        tier: "epic",
        type: "weapon",
        proposedName: "Titan's Battleaxe"
    },

    // Armor
    {
        name: "Armor",
        tier: "common",
        type: "armor",
        proposedName: "Leather Shirt"
    },
    {
        name: "Armor",
        tier: "rare",
        type: "armor",
        proposedName: "Chainmail Armor"
    },
    {
        name: "Armor",
        tier: "epic",
        type: "armor",
        proposedName: "Palladium Plate Armor"
    },
    {
        name: "Armor",
        tier: "legendary",
        type: "armor",
        effects: `When Attacking (The effect is activated when attacking an enemy.) -> Heal (The item heals you.) - value = 1000, When Defending (The effect is activated when defending against an enemy.) -> Destroy Item (The item destroys an item of your enemy.)`,
        proposedName: "Dragon's Scale"
    },

    // Helmet
    {
        name: "Helmet",
        tier: "common",
        type: "helmet",
        proposedName: "Leather Cap"
    },
    {
        name: "Helmet",
        tier: "rare",
        type: "helmet",
        proposedName: "Silver Knight Helm"
    },
    {
        name: "Helmet",
        tier: "epic",
        type: "helmet",
        effects: `When Attacking (The effect is activated when attacking an enemy.) -> Heal (The item heals you.) - value = 1000`,
        proposedName: "Enchanted Crown"
    },

    // Boots
    {
        name: "Boots",
        tier: "common",
        type: "boots",
        proposedName: "Traveler's Boots"
    },
    {
        name: "Boots",
        tier: "rare",
        type: "boots",
        proposedName: "Elven Leather Boots"
    },
    {
        name: "Boots",
        tier: "epic",
        type: "boots",
        proposedName: "Storm Strider Boots"
    },

    // Wearable
    {
        name: "Wearable",
        tier: "common",
        type: "wearable",
        proposedName: "Woolen Cloak"
    },
    {
        name: "Wearable",
        tier: "rare",
        type: "wearable",
        proposedName: "Jeweled Amulet"
    },
    {
        name: "Wearable",
        tier: "epic",
        type: "wearable",
        proposedName: "Ring of the Phoenix"
    },

    // Material
    {
        name: "Crafting Material",
        tier: "common",
        type: "material",
        proposedName: "Clay Brick"
    },
    {
        name: "Crafting Material",
        tier: "rare",
        type: "material",
        proposedName: "Enchanted Wood"
    },
    {
        name: "Raw Material",
        tier: "epic",
        type: "material",
        proposedName: "Starlight Crystal"
    },

    // Food
    {
        name: "Food",
        tier: "common",
        type: "food",
        proposedName: "Loaf of Bread"
    },
    {
        name: "Food",
        tier: "rare",
        type: "food",
        proposedName: "Honey-Glazed Ham"
    },
    {
        name: "Food",
        tier: "epic",
        type: "food",
        proposedName: "Dragonfruit Tart"
    },

    // Drink
    {
        name: "Drink",
        tier: "common",
        type: "drink",
        proposedName: "Apple Cider"
    },
    {
        name: "Drink",
        tier: "rare",
        type: "drink",
        proposedName: "Elven Mead"
    },
    {
        name: "Drink",
        tier: "epic",
        type: "drink",
        proposedName: "Celestial Wine"
    },

    // Consumable
    {
        name: "Potion",
        tier: "common",
        type: "consumable",
        proposedName: "Healing Potion"
    },
    {
        name: "Elixir",
        tier: "rare",
        type: "consumable",
        proposedName: "Elixir of Wisdom"
    },
    {
        name: "Medicine",
        tier: "epic",
        type: "consumable",
        proposedName: "Phoenix Tear"
    }
];

const SYSTEM_PROMPT = `Generate a fitting and entertaining name for an item. Take into consideration the type and tier of the item. The user will send you the current name, and other characteristics of this item. Make sure to stay in a medieval / fantasy setting. Be creative but realistic. You must start your response with 'I propose the following name: '.`;

export class ItemDetailGenerator {

    constructor(
        private lm: ILanguageModelContext,
    ) { }

    async generate(
        item: IWorldItem
    ): Promise<void> {
        if (item.details) {
            console.log("[ItemDetailGenerator]", "Item already has details", item);
            return;
        }

        console.log("[ItemDetailGenerator]", "Generating details for item", item);
        item.details = {
            description: "TODO: Generate this node description as well."
        };

        while (true) {

            const shuffled = shuffleArray(EXAMPLES);
            const randomExamples = shuffled;
            const inPrompt = [
                { role: "system", content: SYSTEM_PROMPT + "\n\n" + (new InspirationKeywords().format(5, ["fantasy", "medieval"])) },
                ...randomExamples.map(
                    ex => {
                        let itemEffectsPart = "";
                        if (typeof ex["effects"] === "string") {
                            itemEffectsPart = `\nItem effects: ${ex["effects"]}`;
                        }
                        return [
                            { role: "user", content: `Item name: ${ex.name}\nItem tier: ${ex.tier}\nItem type: ${ex.type}${itemEffectsPart}` },
                            { role: "assistant", content: `I propose the following name: ${ex.proposedName}` }
                        ]
                    }
                ).flat()
            ];
            const llm = await this.lm.create(
                inPrompt as any,
                { temperature: 1.0, topK: 4, stopSequence: "\n" }
            );
            const itemEffects = [
                ...(item.weapon?.effects || []),
                ...(item.armor?.effects || []),
                ...(item.boots?.effects || []),
                ...(item.helmet?.effects || []),
                ...(item.wearable?.effects || []),
            ].filter(e => !!e).map(
                eff => `[${eff.name}] ${WORLD_WEARABLE_EFFECT_ACTIVATION_DISPLAYS[eff.activation]} (${WORLD_WEARABLE_EFFECT_ACTIVATION_DESCRIPTIONS[eff.activation]}) -> ${WORLD_WEARABLE_EFFECT_TYPE_DISPLAYS[eff.type]} (${WORLD_WEARABLE_EFFECT_TYPE_DESCRIPTIONS[eff.type]})${typeof eff.value !== "undefined" ? ` - value = ${eff.value}` : ""}`
            );
            itemEffects.push(
                ...(item.consumable?.effects || []).map(
                    eff => `[${eff.name}] On consumption -> ${WORLD_CONSUMABLE_EFFECT_TYPE_DISPLAYS[eff.type]} (${WORLD_CONSUMABLE_EFFECT_TYPE_DESCRIPTIONS[eff.type]})${typeof eff.value !== "undefined" ? ` - value = ${eff.value}` : ""}`
                )
            );

            const promptMessage = `Item name: ${item.name}\nItem tier: ${item.tier}\nItem type: ${item.type}`
                + (
                    itemEffects.length > 0
                        ? "\nItem effects: " + itemEffects.join(", ")
                        : ""
                );
            const responseText = await llm.prompt(promptMessage);
            console.log("[ItemDetailGenerator]", "Item name response", promptMessage, item, responseText);
            let extractedName = responseText.trim().split("\n")[0].trim();
            if (extractedName.startsWith("I propose the following name: ")) {
                extractedName = extractedName.replace("I propose the following name: ", "").trim();
            } else {
                console.warn("[ItemDetailGenerator]", "Item name response does not start with prefix", item, responseText);
            }

            while (true) {

                let didStartWith = false;

                if (extractedName.startsWith("\"") && extractedName.endsWith("\"")) {
                    extractedName = extractedName.substring(1, extractedName.length - 1);
                    didStartWith = true;
                }

                if (extractedName.startsWith("'") && extractedName.endsWith("'")) {
                    extractedName = extractedName.substring(1, extractedName.length - 1);
                    didStartWith = true;
                }

                if (extractedName.startsWith("**") && extractedName.endsWith("**")) {
                    extractedName = extractedName.substring(2, extractedName.length - 2);
                    didStartWith = true;
                }

                if (extractedName.endsWith(".")) {
                    extractedName = extractedName.substring(0, extractedName.length - 1);
                    didStartWith = true;
                }

                if (!didStartWith) {
                    break;
                }

            }

            if (extractedName.length > 0 && extractedName.length < 40) {
                item.name = extractedName;
                break;
            } else {
                console.warn("[ItemDetailGenerator]", "Extracted name is too long or too short", item, extractedName);
            }

        }

    }

}