import { ILanguageModelContext } from "@siocode/base";
import { IAITask } from "./AITask";
import { WORLD_ITEM_TIER_DISPLAYS, WORLD_ITEM_TYPE_DISPLAYS, WORLD_NODE_HUMIDITY_DESCRIPTIONS, WORLD_NODE_TEMPERATURE_DESCRIPTIONS, WORLD_PLAYER_CLASS_DESCRIPTIONS, WORLD_PLAYER_HEALTH_DESCRIPTIONS, WORLD_PLAYER_HUNGER_DESCRIPTIONS, WORLD_PLAYER_SKILL_DESCRIPTIONS, WORLD_PLAYER_THIRST_DESCRIPTIONS } from "../model/world.enums";
import { IPlayerContext } from "../context/Player.context";
import { IWorldContext, IWorldItem } from "../context/World.context";
import { aiDisplayGear, aiDisplayHealth, aiDisplayHunger, aiDisplayInventory, aiDisplayLocation, aiDisplayPlayer, aiDisplaySkills, aiDisplaySurroundings, aiDisplayThirst } from "./display";

export interface IInterpretRequest {
    player: IPlayerContext;
    world: IWorldContext;
    input: string;
}

export interface IInterpretedCommand {
    command: string;
    args: Record<string, string>;
}

export function createContext(
    player: IPlayerContext,
    world: IWorldContext
) {

    const pCharacter = player.getPlayerCharacter();
    const pHealth = player.getPlayerHealth();
    const pHunger = player.getPlayerHunger();
    const pThirst = player.getPlayerThirst();
    const pLocation = player.getPlayerLocation();
    const pInventory = player.getPlayerInventory();
    const pSkills = player.getPlayerSkills();
    const pGear = player.getPlayerGear();

    const result = [
        ...aiDisplayPlayer(pCharacter),
        aiDisplayHealth(pHealth),
        aiDisplayHunger(pHunger),
        aiDisplayThirst(pThirst),
        ...aiDisplayLocation(pLocation),
        ...aiDisplayInventory(pInventory),
        ...aiDisplaySkills(pSkills),
        ...aiDisplayGear(pGear),
        ...aiDisplaySurroundings(pLocation),
        `--- Player Input ---`,
    ];

    return result.filter(l => !!l);
}

const EXAMPLE_CONTEXT_1 = [
    `--- Player ---`,
    `Name: Bob`,
    `Class: knight (${WORLD_PLAYER_CLASS_DESCRIPTIONS.knight})`,
    `Health: healthy (${WORLD_PLAYER_HEALTH_DESCRIPTIONS.healthy})`,
    `Hunger: full (${WORLD_PLAYER_HUNGER_DESCRIPTIONS.full})`,
    `Thirst: hydrated (${WORLD_PLAYER_THIRST_DESCRIPTIONS.hydrated})`,
    `Location: The Dark Forest`,
    `Humidity: humid (${WORLD_NODE_HUMIDITY_DESCRIPTIONS.humid})`,
    `Temperature: cold (${WORLD_NODE_TEMPERATURE_DESCRIPTIONS.cold})`,
    `--- Inventory ---`,
    `Num Items: 3`,
    `Gold: 416`,
    `Item 304: Rusty Sword (${WORLD_ITEM_TYPE_DISPLAYS.weapon}) [${WORLD_ITEM_TIER_DISPLAYS.common}]`,
    `Item 199706: Leather Jacket (${WORLD_ITEM_TYPE_DISPLAYS.armor}) [${WORLD_ITEM_TIER_DISPLAYS.common}]`,
    `Item 14: Leather Boots (${WORLD_ITEM_TYPE_DISPLAYS.boots}) [${WORLD_ITEM_TIER_DISPLAYS.common}]`,
    `--- Skills ---`,
    `wield-sword (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-sword"]})`,
    `wield-axe (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-axe"]})`,
    `wield-knife (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-knife"]})`,
    `wield-dagger (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-dagger"]})`,
    `--- Gear ---`,
    `Weapon: Item 12: Rusty Sword (${WORLD_ITEM_TYPE_DISPLAYS.weapon}) [${WORLD_ITEM_TIER_DISPLAYS.common}]`,
    `Armor: Item 17: Leather Jacket (${WORLD_ITEM_TYPE_DISPLAYS.armor}) [${WORLD_ITEM_TIER_DISPLAYS.common}]`,
    `Helmet: None`,
    `Boots: None`,
    `Wearable: None`,
    `--- Surroundings ---`,
    `Can go to 2 (name: The Village) distance: 25`,
];

const EXAMPLE_CONTEXT_2 = [
    `--- Player ---`,
    `Name: Bob`,
    `Class: knight (${WORLD_PLAYER_CLASS_DESCRIPTIONS.knight})`,
    `Health: healthy (${WORLD_PLAYER_HEALTH_DESCRIPTIONS.healthy})`,
    `Hunger: full (${WORLD_PLAYER_HUNGER_DESCRIPTIONS["slightly-hungry"]})`,
    `Thirst: hydrated (${WORLD_PLAYER_THIRST_DESCRIPTIONS["slightly-thirsty"]})`,
    `Location: Room`,
    `Humidity: humid (${WORLD_NODE_HUMIDITY_DESCRIPTIONS.humid})`,
    `Temperature: mild (${WORLD_NODE_TEMPERATURE_DESCRIPTIONS.mild})`,
    `--- Inventory ---`,
    `Num Items: 0`,
    `Gold: 10`,
    `--- Skills ---`,
    `wield-sword (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-sword"]})`,
    `wield-axe (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-axe"]})`,
    `wield-knife (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-knife"]})`,
    `wield-dagger (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-dagger"]})`,
    `--- Gear ---`,
    `Weapon: None`,
    `Armor: Item 12: Leather Jacket (${WORLD_ITEM_TYPE_DISPLAYS.armor}) [${WORLD_ITEM_TIER_DISPLAYS.common}]`,
    `Helmet: None`,
    `Boots: Item 95: Leather Boots (${WORLD_ITEM_TYPE_DISPLAYS.boots}) [${WORLD_ITEM_TIER_DISPLAYS.common}]`,
    `Wearable: None`,
    `--- Surroundings ---`,
    `Can go to 159 (name: Tavern) distance: 1`,
];

const EXAMPLE_CONTEXT_3 = [
    `--- Player ---`,
    `Name: Unnamed Hero`,
    `Class: knight (${WORLD_PLAYER_CLASS_DESCRIPTIONS.knight})`,
    `Health: healthy (${WORLD_PLAYER_HEALTH_DESCRIPTIONS.healthy})`,
    `Hunger: full (${WORLD_PLAYER_HUNGER_DESCRIPTIONS["slightly-hungry"]})`,
    `Thirst: hydrated (${WORLD_PLAYER_THIRST_DESCRIPTIONS["slightly-thirsty"]})`,
    `Location: Room`,
    `Humidity: humid (${WORLD_NODE_HUMIDITY_DESCRIPTIONS.humid})`,
    `Temperature: mild (${WORLD_NODE_TEMPERATURE_DESCRIPTIONS.mild})`,
    `--- Inventory ---`,
    `Num Items: 0`,
    `Gold: 10`,
    `--- Skills ---`,
    `wield-sword (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-sword"]})`,
    `wield-axe (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-axe"]})`,
    `wield-knife (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-knife"]})`,
    `wield-dagger (${WORLD_PLAYER_SKILL_DESCRIPTIONS["wield-dagger"]})`,
    `--- Gear ---`,
    `Weapon: None`,
    `Armor: Item 34: Cloth Shirt (${WORLD_ITEM_TYPE_DISPLAYS.armor}) [${WORLD_ITEM_TIER_DISPLAYS.common}]`,
    `Helmet: None`,
    `Boots: Item 35: Nice Shoes (${WORLD_ITEM_TYPE_DISPLAYS.boots}) [${WORLD_ITEM_TIER_DISPLAYS.common}]`,
    `Wearable: None`,
    `--- Surroundings ---`,
    `Can go to 159 (name: Tavern) distance: 1`,
];

const EXAMPLES = [
    {
        context: EXAMPLE_CONTEXT_1,
        userMessage: `I take a look around.`,
        assistantMessage: `The parsed command is: {"lookAround": {}}`
    },
    {
        context: EXAMPLE_CONTEXT_2,
        userMessage: `I go through the door.`,
        assistantMessage: `The parsed command is: {"move": {"to": 159}}`
    },
    {
        context: EXAMPLE_CONTEXT_1,
        userMessage: `adkgjh adeq kajdhkq adg`,
        assistantMessage: `The parsed command is: {"noop": {"message": "You have likely just bashed your keyboard, please enter a real command."}}`,
    },
    {
        context: EXAMPLE_CONTEXT_3,
        userMessage: `What is this game? How do I play?`,
        assistantMessage: `The parsed command is: {"noop": {"message": "This is a text-based adventure game. You play by typing commands into the input box and pressing Enter. For example, you might consider looking around now."}}`,
    },
    {
        context: EXAMPLE_CONTEXT_2,
        userMessage: `Where can I go from here?`,
        assistantMessage: `The parsed command is: {"noop": {"message": "You see a door, leading to the Tavern."}}`
    },
    {
        context: EXAMPLE_CONTEXT_1,
        userMessage: `I'll leave my other boots here.`,
        assistantMessage: `The parsed command is: {"drop": {"item": 14}}`
    },
    {
        context: EXAMPLE_CONTEXT_2,
        userMessage: `I take off my boots`,
        assistantMessage: `The parsed command is: {"unequip": {"slot": "boots"}}`
    }
];

const SYSTEM_PROMPT = `Your task is to extract the command JSON object, based on what the user entered. Respond with nothing else, just the extracted JSON command object. If the player asks you a question, you should use noop to respond to him/her. You must start your respond with 'The parsed command is: '. The following commands are available:

{"noop": {"message": "This message will be printed."}}
{"move": {"to": <numeric id of target location>}}
{"lookAround": {}}
{"equip": {"item": <numeric id of item in inventory or location>, "slot": "weapon" | "armor" | "helmet" | "boots" | "wearable"}}
{"unequip": {"slot": "weapon" | "armor" | "helmet" | "boots" | "wearable"}}
{"drop": {"item": <numeric id of item in inventory>}}
{"pickup": {"item": <numeric id of item in location>}}`.trim();

export class CommandInterpreter implements IAITask<IInterpretRequest, IInterpretedCommand> {

    constructor(
        private lm: ILanguageModelContext
    ) { }

    get name(): string {
        return "CommandInterpreter";
    }

    getPromptFor(input: IInterpretRequest) {
        const inContext = createContext(
            input.player,
            input.world
        );
        const inMessage = `${inContext.join('\n')}\n\n> ${input.input.trim()}`;

        return {
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                ...EXAMPLES.map(
                    ex => ([
                        {
                            role: "user",
                            content: `${ex.context.join('\n')}\n\n> ${ex.userMessage}`
                        } as any,
                        {
                            role: "assistant",
                            content: ex.assistantMessage
                        } as any
                    ])
                ).flat()
            ],
            nextMessage: inMessage
        }
    }

    async prompt(input: IInterpretRequest): Promise<IInterpretedCommand> {
        const result: IInterpretedCommand = {
            command: "noop",
            args: {
                message: "The input could not be understood."
            }
        };

        const inPrompt = this.getPromptFor(input);

        while (true) {

            try {

                const llm = await this.lm.create(inPrompt.messages);

                let resultText = await llm.prompt(inPrompt.nextMessage);

                resultText = resultText.trim();

                if (resultText.startsWith("The parsed command is: ")) {
                    resultText = resultText.replace("The parsed command is: ", "").trim();
                }

                if (resultText.startsWith("```")) {
                    const ending = resultText.indexOf("```", 3);
                    resultText = resultText.substring(resultText.indexOf("\n"), ending).trim();
                }

                const resultJSON = JSON.parse(resultText);

                const validCommands = ["noop", "move", "lookAround", "equip", "unequip", "drop", "pickup"];

                if (validCommands.includes(Object.keys(resultJSON)[0])) {
                    result.command = Object.keys(resultJSON)[0];
                    result.args = resultJSON[result.command];
                } else {
                    console.warn("[CommandInterpreter]", "Invalid command", resultJSON);
                }

                return result;

            } catch (err: any) {
                console.warn("[CommandInterpreter]", "Error", err);
            }

        }
    }

}