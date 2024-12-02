import chalk from "chalk";
import { input, password } from '@inquirer/prompts';
import path from "path";
import { readdir, readFile, writeFile } from "fs/promises";
import * as worldenums from "./world.enums";

const LOGTAG = chalk.dim("[extender-cli]");
const CLOUD_URL = `https://chrome-builtin-ai-challenge-gemini-gateway-700248413310.europe-west4.run.app`;

var MODELNAME: "gemini-1.5-flash" | "gemini-1.5-flash-8b" | "gemini-1.5-pro" = "gemini-1.5-flash";

const theme = {
    prefix: LOGTAG,
}

function print(...args: any[]) {
    console.log(LOGTAG, ...args);
}

interface ICloudMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface ICloudRequest {
    messages: ICloudMessage[];
    dryRun?: boolean;
    password: string;
    model?: "gemini-1.5-flash" | "gemini-1.5-flash-8b" | "gemini-1.5-pro";
}

async function callCloud(
    request: ICloudRequest
) {
    const fetchResponse = await fetch(CLOUD_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });
    if (!fetchResponse.ok) {
        throw new Error(`Failed to call cloud. Status: ${fetchResponse.status}`);
    }
    if (request.dryRun) {
        return (await fetchResponse.json()).ok;
    }
    return await fetchResponse.text();
}

async function testCloudConnection(password: string) {
    try {
        const result = await callCloud({
            messages: [],
            password,
            dryRun: true,
        });
        return !!result;
    } catch (e) {
        return false;
    }
}

interface IProject {
    populators: Array<any>;
    rules: Array<any>;
    populatorCollections: Array<any>;
    ruleCollections: Array<any>;
    interfacesContent: string;
    populatorInterfacesContent: string;
    playerContextInterfacesContent: string;
    worldContextInterfacesContent: string;
    worldEnumsContent: string;
}

const project: IProject = {
    populators: [],
    rules: [],
    populatorCollections: [],
    ruleCollections: [],
    interfacesContent: "",
    populatorInterfacesContent: "",
    playerContextInterfacesContent: "",
    worldContextInterfacesContent: "",
    worldEnumsContent: "",
}

interface IProjectCommand {
    populators?: {
        add?: {
            [key: string]: Array<any>;
        }
        change?: {
            [key: string]: Array<any>;
        }
        remove?: {
            [key: string]: Array<string>;
        }
    }
    rules?: {
        add?: {
            [key: string]: Array<any>;
        }
        change?: {
            [key: string]: Array<any>;
        }
        remove?: {
            [key: string]: Array<string>;
        }
    }
}

function projectSystemPrompt(): string {

    // Replace to new JSON between:
    // "Starting populators:"
    // "End of starting populators."

    let txt = project.interfacesContent.trim();

    const startingPopulatorsStartIndex = txt.indexOf("Starting populators:");
    const startingPopulatorsEndIndex = txt.indexOf("End of starting populators.");
    const newStartingPopulatorsContent = project.populatorCollections.map(
        pc => `${pc.name}\n[\n${pc.populators.map(p => JSON.stringify(p)).join(",\n")}\n]`
    ).join("\n");

    txt = txt.substring(0, startingPopulatorsStartIndex) + "Starting populators:\n\n" + newStartingPopulatorsContent + "\n\n" + txt.substring(startingPopulatorsEndIndex);

    // Replace to new JSON between:
    // "Starting rules:"
    // "End of starting rules."

    const startingRulesStartIndex = txt.indexOf("Starting rules:");
    const startingRulesEndIndex = txt.indexOf("End of starting rules.");
    const newStartingRulesContent = project.ruleCollections.map(
        pc => `${pc.name}\n[\n${pc.rules.map(p => JSON.stringify(p)).join(",\n")}\n]`
    ).join("\n");

    txt = txt.substring(0, startingRulesStartIndex) + "Starting rules:\n\n" + newStartingRulesContent + "\n\n" + txt.substring(startingRulesEndIndex);

    txt = txt.replace("[WORLD_CONTEXT_INTERFACES]", project.worldContextInterfacesContent.trim());
    txt = txt.replace("[PLAYER_CONTEXT_INTERFACES]", project.playerContextInterfacesContent.trim());
    txt = txt.replace("[WORLD_ENUMS]", project.worldEnumsContent.trim());
    txt = txt.replace("[POPULATOR_INTERFACES]", project.populatorInterfacesContent.trim());

    return txt;

}

function parseResponseText(txt: string): IProjectCommand {

    let buf = txt.trim();

    const firstTripleBacktickIndex = buf.indexOf("```");

    if (firstTripleBacktickIndex === -1) {
        return {};
    }

    const lastTripleBacktickIndex = buf.lastIndexOf("```");

    if (lastTripleBacktickIndex === firstTripleBacktickIndex) {
        return {};
    }

    // Between
    buf = buf.substring(firstTripleBacktickIndex + 3, lastTripleBacktickIndex);

    if (buf.startsWith("json")) {
        buf = buf.substring(4).trim();
    }

    try {
        return JSON.parse(buf);
    } catch (e) {
        return {};
    }

}

function displayCommand(req: IProjectCommand): void {

    const affectedFiles: Record<string, {
        add: string[];
        change: string[];
        remove: string[];
    }> = {};

    const createAffectedFiles = (name: string) => {
        if (!affectedFiles[name]) {
            affectedFiles[name] = {
                add: [],
                change: [],
                remove: [],
            }
        }
    }

    if (req.populators) {
        if (req.populators.add) {
            for (const [name, add] of Object.entries(req.populators.add)) {
                createAffectedFiles(name);
                affectedFiles[name].add.push(
                    ...add.map(o => o.id)
                );
            }
        }
        if (req.populators.change) {

            if (Array.isArray(req.populators.change)) {
                // Handle changes as array
                for (const change of req.populators.change) {
                    for (const pc of project.populatorCollections) {
                        const foundPopulator = pc.populators.find(p => p.id === change.id);
                        if (foundPopulator) {
                            createAffectedFiles(pc.name);
                            affectedFiles[pc.name].change.push(change.id);
                            break;
                        }
                    }
                }
            } else {

                for (const [name, change] of Object.entries(req.populators.change)) {
                    createAffectedFiles(name);
                    affectedFiles[name].change.push(
                        ...change.map(o => o.id)
                    );
                }
            }
        }
        if (req.populators.remove) {

            if (Array.isArray(req.populators.remove)) {
                // Handle removals as array
                for (const populatorId of req.populators.remove) {
                    for (const pc of project.populatorCollections) {
                        pc.populators = pc.populators.filter(p => p.id !== populatorId);
                    }
                }
            } else {

                for (const [name, remove] of Object.entries(req.populators.remove)) {
                    createAffectedFiles(name);
                    affectedFiles[name].remove.push(...remove);
                }
            }
        }
    }
    if (req.rules) {
        if (req.rules.add) {
            for (const [name, add] of Object.entries(req.rules.add)) {
                createAffectedFiles(name);
                affectedFiles[name].add.push(
                    ...add.map(o => o.id)
                );
            }
        }
        if (req.rules.change) {

            if (Array.isArray(req.rules.change)) {
                // Handle changes as array
                for (const change of req.rules.change) {
                    for (const pc of project.ruleCollections) {
                        const foundRule = pc.rules.find(r => r.id === change.id);
                        if (foundRule) {
                            createAffectedFiles(pc.name);
                            affectedFiles[pc.name].change.push(change.id);
                            break;
                        }
                    }
                }
            } else {

                for (const [name, change] of Object.entries(req.rules.change)) {
                    createAffectedFiles(name);
                    affectedFiles[name].change.push(
                        ...change.map(o => o.id)
                    );
                }
            }
        }
        if (req.rules.remove) {

            if (Array.isArray(req.rules.remove)) {
                // Handle removals as array
                for (const ruleId of req.rules.remove) {
                    for (const pc of project.ruleCollections) {
                        pc.rules = pc.rules.filter(r => r.id !== ruleId);
                    }
                }
            } else {

                for (const [name, remove] of Object.entries(req.rules.remove)) {
                    createAffectedFiles(name);
                    affectedFiles[name].remove.push(...remove);
                }
            }
        }
    }

    for (const fileName of Object.keys(affectedFiles)) {
        const fileObject = affectedFiles[fileName];

        print(chalk.bold(fileName));

        if (fileObject.add.length > 0) {
            for (const add of fileObject.add) {
                print(chalk.green(chalk.bold("  [+]")), add);
            }
        }
        if (fileObject.change.length > 0) {
            for (const change of fileObject.change) {
                print(chalk.yellow(chalk.bold("  [~]")), change);
            }
        }
        if (fileObject.remove.length > 0) {
            for (const remove of fileObject.remove) {
                print(chalk.red(chalk.bold("  [X]")), remove);
            }
        }
    }

}

async function readProject() {
    const cwd = process.cwd();
    print("Running in directory", chalk.bold(cwd));

    const interfacesFilePath = path.resolve(
        cwd,
        "INTERFACES.txt"
    );
    const interfacesFileContent = await readFile(interfacesFilePath, "utf-8");
    project.interfacesContent = interfacesFileContent;
    print("Loaded interfaces from", chalk.bold(interfacesFilePath));

    const populatorInterfacesFilePath = path.resolve(
        cwd,
        "POPULATOR_INTERFACES.txt"
    );
    const populatorInterfacesFileContent = await readFile(populatorInterfacesFilePath, "utf-8");
    project.populatorInterfacesContent = populatorInterfacesFileContent;
    print("Loaded populator interfaces from", chalk.bold(populatorInterfacesFilePath));

    const playerContextInterfacesFilePath = path.resolve(
        cwd,
        "PLAYER_CONTEXT_INTERFACES.txt"
    );
    const playerContextInterfacesFileContent = await readFile(playerContextInterfacesFilePath, "utf-8");
    project.playerContextInterfacesContent = playerContextInterfacesFileContent;
    print("Loaded player context interfaces from", chalk.bold(playerContextInterfacesFilePath));

    const worldContextInterfacesFilePath = path.resolve(
        cwd,
        "WORLD_CONTEXT_INTERFACES.txt"
    );
    const worldContextInterfacesFileContent = await readFile(worldContextInterfacesFilePath, "utf-8");
    project.worldContextInterfacesContent = worldContextInterfacesFileContent;
    print("Loaded world context interfaces from", chalk.bold(worldContextInterfacesFilePath));

    const worldEnumsFilePath = path.resolve(
        cwd,
        "WORLD_ENUMS.txt"
    );
    const worldEnumsFileContent = await readFile(worldEnumsFilePath, "utf-8");
    project.worldEnumsContent = worldEnumsFileContent;
    print("Loaded world enums from", chalk.bold(worldEnumsFilePath));

    const projorDataDirectory = path.resolve(
        cwd,
        "../../.projor/data"
    );
    print("Reading project data from", chalk.bold(projorDataDirectory));

    const populatorsDirectory = path.resolve(
        projorDataDirectory,
        "populators"
    );
    print("Reading populators from", chalk.bold(populatorsDirectory));

    project.populatorCollections = (await Promise.all(
        (await readdir(populatorsDirectory))
            .map(async (populatorFilename) => ({ name: populatorFilename, populators: JSON.parse(await readFile(path.resolve(populatorsDirectory, populatorFilename), "utf-8")) }))
    )).flat();
    project.populators = project.populatorCollections.map(pc => pc.populators).flat();
    print("Loaded", chalk.bold(project.populators.length), "populators from", chalk.bold(project.populatorCollections.length), "collections.");

    const rulesDirectory = path.resolve(
        projorDataDirectory,
        "rules"
    );
    print("Reading rules from", chalk.bold(rulesDirectory));

    project.ruleCollections = (await Promise.all(
        (await readdir(rulesDirectory))
            .map(async (ruleFilename) => ({ name: ruleFilename, rules: JSON.parse(await readFile(path.resolve(rulesDirectory, ruleFilename), "utf-8")) }))
    )).flat();
    project.rules = project.ruleCollections.map(pc => pc.rules).flat();
    print("Loaded", chalk.bold(project.rules.length), "rules from", chalk.bold(project.ruleCollections.length), "collections.");

    const systemPromptDebugPath = path.resolve(
        cwd,
        "SYSTEM_PROMPT_DEBUG.txt"
    );
    await writeFile(systemPromptDebugPath, projectSystemPrompt(), "utf-8");
    print("Wrote system prompt debug to", chalk.bold(systemPromptDebugPath));
}

async function saveProject() {
    const cwd = process.cwd();
    print("Running in directory", chalk.bold(cwd));

    const projorDataDirectory = path.resolve(
        cwd,
        "../../.projor/data"
    );
    print("Saving project data to", chalk.bold(projorDataDirectory));

    const populatorsDirectory = path.resolve(
        projorDataDirectory,
        "populators"
    );
    print("Saving populators to", chalk.bold(populatorsDirectory));

    await Promise.all(
        project.populatorCollections.map(async pc => {
            await writeFile(path.resolve(populatorsDirectory, pc.name), JSON.stringify(pc.populators, null, 4), "utf-8");
        })
    );

    const rulesDirectory = path.resolve(
        projorDataDirectory,
        "rules"
    );
    print("Saving rules to", chalk.bold(rulesDirectory));

    await Promise.all(
        project.ruleCollections.map(async pc => {
            await writeFile(path.resolve(rulesDirectory, pc.name), JSON.stringify(pc.rules, null, 4), "utf-8");
        })
    );

    const interfacesFilePath = path.resolve(
        cwd,
        "INTERFACES.txt"
    );
    await writeFile(interfacesFilePath, project.interfacesContent, "utf-8");
    print("Wrote interfaces to", chalk.bold(interfacesFilePath));
}

function addPopulatorCollectionIfNecessary(name: string): any {
    let pc = project.populatorCollections.find(pc => pc.name === name);
    if (!pc) {
        pc = { name, populators: [] };
        project.populatorCollections.push(pc);
    }
    return pc;
}

function addRuleCollectionIfNecessary(name: string): any {
    let pc = project.ruleCollections.find(pc => pc.name === name);
    if (!pc) {
        pc = { name, rules: [] };
        project.ruleCollections.push(pc);
    }
    return pc;
}

function applyCommand(req: IProjectCommand) {

    if (req.populators) {
        if (req.populators.add) {
            for (const [populatorCollectionName, toAdd] of Object.entries(req.populators.add)) {
                const pc = addPopulatorCollectionIfNecessary(populatorCollectionName);
                for (const populator of toAdd) {
                    // Remove existing populator with same ID
                    pc.populators = pc.populators.filter(p => p.id !== populator.id);
                    pc.populators.push(populator);
                }
            }
        }

        if (req.populators.change) {

            if (Array.isArray(req.populators.change)) {
                // Handle changes as array
                for (const populator of req.populators.change) {
                    for (const pc of project.populatorCollections) {
                        const foundPopulator = pc.populators.find(p => p.id === populator.id);
                        if (foundPopulator) {
                            pc.populators = pc.populators.filter(p => p.id !== populator.id);
                            pc.populators.push(populator);
                            break;
                        }
                    }
                }
            } else {

                for (const [populatorCollectionName, toChange] of Object.entries(req.populators.change)) {
                    const pc = addPopulatorCollectionIfNecessary(populatorCollectionName);
                    for (const populator of toChange) {
                        // Remove existing populator with same ID
                        pc.populators = pc.populators.filter(p => p.id !== populator.id);
                        pc.populators.push(populator);
                    }
                }

            }
        }

        if (req.populators.remove) {

            if (Array.isArray(req.populators.remove)) {
                // Handle removals as array
                for (const populatorId of req.populators.remove) {
                    for (const pc of project.populatorCollections) {
                        pc.populators = pc.populators.filter(p => p.id !== populatorId);
                    }
                }
            } else {

                for (const [populatorCollectionName, toRemove] of Object.entries(req.populators.remove)) {
                    const pc = addPopulatorCollectionIfNecessary(populatorCollectionName);
                    for (const populatorId of toRemove) {
                        pc.populators = pc.populators.filter(p => p.id !== populatorId);
                    }
                }

            }
        }
    }

    if (req.rules) {
        if (req.rules.add) {
            for (const [ruleCollectionName, toAdd] of Object.entries(req.rules.add)) {
                const pc = addRuleCollectionIfNecessary(ruleCollectionName);
                for (const rule of toAdd) {
                    // Remove existing rule with same ID
                    pc.rules = pc.rules.filter(r => r.id !== rule.id);
                    pc.rules.push(rule);
                }
            }
        }

        if (req.rules.change) {

            if (Array.isArray(req.rules.change)) {
                // Handle changes as array
                for (const rule of req.rules.change) {
                    for (const pc of project.ruleCollections) {
                        const foundRule = pc.rules.find(r => r.id === rule.id);
                        if (foundRule) {
                            pc.rules = pc.rules.filter(r => r.id !== rule.id);
                            pc.rules.push(rule);
                            break;
                        }
                    }
                }
            } else {

                for (const [ruleCollectionName, toChange] of Object.entries(req.rules.change)) {
                    const pc = addRuleCollectionIfNecessary(ruleCollectionName);
                    for (const rule of toChange) {
                        // Remove existing rule with same ID
                        pc.rules = pc.rules.filter(r => r.id !== rule.id);
                        pc.rules.push(rule);
                    }
                }

            }
        }

        if (req.rules.remove) {

            if (Array.isArray(req.rules.remove)) {
                // Handle removals as array
                for (const ruleId of req.rules.remove) {
                    for (const pc of project.ruleCollections) {
                        pc.rules = pc.rules.filter(r => r.id !== ruleId);
                    }
                }
            } else {

                for (const [ruleCollectionName, toRemove] of Object.entries(req.rules.remove)) {
                    const pc = addRuleCollectionIfNecessary(ruleCollectionName);
                    for (const ruleId of toRemove) {
                        pc.rules = pc.rules.filter(r => r.id !== ruleId);
                    }
                }

            }
        }
    }

    project.populators = project.populatorCollections.map(pc => pc.populators).flat();
    project.rules = project.ruleCollections.map(pc => pc.rules).flat();

    print("Applied command.", chalk.bold(project.populatorCollections.length), "populator collections with", chalk.bold(project.populators.length), "populators,", chalk.bold(project.ruleCollections.length), "rule collections with", chalk.bold(project.rules.length), "rules.");

}

function checkProjectIntegrity() {

    let noViolations = true;

    for (const ruleCollection of project.ruleCollections) {

        let violations = [];

        for (let rule of ruleCollection.rules) {

            if (typeof rule.apply !== "string") {
                violations.push([chalk.yellow(chalk.bold("  [!]")), "Rule", rule.id, "has invalid apply field."]);
                continue;
            }

            const applyPopulator = project.populators.find(p => p.id === rule.apply);

            if (!applyPopulator) {
                violations.push([chalk.red(chalk.bold("  [!]")), "Rule", rule.id, "has missing apply populator", rule.apply]);
            }

        }

        if (violations.length > 0) {
            print(chalk.red(chalk.bold(ruleCollection.name)), "INTEGRITY VIOLATIONS");
            for (const violation of violations) {
                print(...violation);
            }
            noViolations = false;
        } else {
            // print(chalk.green(chalk.bold(ruleCollection.name)), "OK");
        }
    }

    for (const populatorCollection of project.populatorCollections) {
        let violations = [];

        let refsToCheck = [];
        let enumsToCheck = [];

        for (let populator of populatorCollection.populators) {

            if (populator.populatorType === "npc") {

                if (populator.gear) {
                    refsToCheck.push(
                        populator.gear.armor,
                        populator.gear.boots,
                        populator.gear.helmet,
                        populator.gear.weapon,
                        populator.gear.wearable,
                    )
                }

                if (populator.inventory && populator.inventory.items) {
                    refsToCheck.push(
                        ...populator.inventory.items
                    )
                }

                if (populator.health && populator.health.status) {
                    enumsToCheck.push([worldenums.WORLD_PLAYER_HEALTH, populator.health.status]);
                }

                if (populator.race) {
                    enumsToCheck.push([worldenums.WORLD_NPC_RACE, populator.race]);
                }

                if (populator.stance) {
                    enumsToCheck.push([worldenums.WORLD_NPC_STANCE, populator.stance]);
                }

                if (populator.personality && Array.isArray(populator.personality.traits)) {
                    if (populator.personality.traits.length < 3) {
                        violations.push([chalk.red(chalk.bold("  [!]")), "Populator", populator.id, "has less than 3 personality traits."]);
                    }
                    enumsToCheck.push(
                        ...populator.personality.traits.map(t => [worldenums.WORLD_NPC_PERSONALITY_TRAIT, t])
                    );
                }

                if (populator.personality && populator.personality.background) {
                    enumsToCheck.push([worldenums.WORLD_NPC_BACKGROUND, populator.personality.background]);
                }

            } else if (populator.populatorType === "item") {

                enumsToCheck.push([worldenums.WORLD_ITEM_TYPE, populator.type]);
                enumsToCheck.push([worldenums.WORLD_ITEM_TIER, populator.tier]);

                if (populator.weapon && populator.weapon.weaponType) {
                    enumsToCheck.push([worldenums.WORLD_WEAPON_TYPE, populator.weapon.weaponType]);
                }

                if (populator.weapon && Array.isArray(populator.weapon.effects)) {
                    enumsToCheck.push(
                        ...populator.weapon.effects.map(e => [worldenums.WORLD_WEARABLE_EFFECT_ACTIVATION, e.activation]),
                        ...populator.weapon.effects.map(e => [worldenums.WORLD_WEARABLE_EFFECT_TYPE, e.type]),
                    );
                }

                if (populator.armor && Array.isArray(populator.armor.effects)) {
                    enumsToCheck.push(
                        ...populator.armor.effects.map(e => [worldenums.WORLD_WEARABLE_EFFECT_ACTIVATION, e.activation]),
                        ...populator.armor.effects.map(e => [worldenums.WORLD_WEARABLE_EFFECT_TYPE, e.type]),
                    );
                }

                if (populator.boots && Array.isArray(populator.boots.effects)) {
                    enumsToCheck.push(
                        ...populator.boots.effects.map(e => [worldenums.WORLD_WEARABLE_EFFECT_ACTIVATION, e.activation]),
                        ...populator.boots.effects.map(e => [worldenums.WORLD_WEARABLE_EFFECT_TYPE, e.type]),
                    );
                }

                if (populator.helmet && Array.isArray(populator.helmet.effects)) {
                    enumsToCheck.push(
                        ...populator.helmet.effects.map(e => [worldenums.WORLD_WEARABLE_EFFECT_ACTIVATION, e.activation]),
                        ...populator.helmet.effects.map(e => [worldenums.WORLD_WEARABLE_EFFECT_TYPE, e.type]),
                    );
                }

                if (populator.wearable && populator.wearableType) {
                    enumsToCheck.push([worldenums.WORLD_WEARABLE_TYPE, populator.wearableType]);
                }

                if (populator.wearable && Array.isArray(populator.wearable.effects)) {
                    enumsToCheck.push(
                        ...populator.wearable.effects.map(e => [worldenums.WORLD_WEARABLE_EFFECT_ACTIVATION, e.activation]),
                        ...populator.wearable.effects.map(e => [worldenums.WORLD_WEARABLE_EFFECT_TYPE, e.type]),
                    );
                }

            }

        }

        for (let ref of refsToCheck) {
            if (typeof ref === "string") {
                if (!project.populators.find(p => p.id === ref)) {
                    violations.push([chalk.red(chalk.bold("  [!]")), "Populator", ref, "is missing."]);
                }
            } else if (Array.isArray(ref)) {
                for (let r of ref) {
                    if (!project.populators.find(p => p.id === r)) {
                        violations.push([chalk.red(chalk.bold("  [!]")), "Populator", r, "is missing."]);
                    }
                }
            } else if (typeof ref === "object" && Array.isArray(ref.oneOf)) {
                for (let r of ref.oneOf) {
                    if (!project.populators.find(p => p.id === r)) {
                        violations.push([chalk.red(chalk.bold("  [!]")), "Populator", r, "is missing."]);
                    }
                }
            }
        }

        for (let [enumValues, checkValue] of enumsToCheck) {
            if (typeof checkValue === "string") {
                if (!enumValues.includes(checkValue)) {
                    violations.push([chalk.red(chalk.bold("  [!]")), "Enum", checkValue, "is invalid."]);
                }
            } else if (Array.isArray(checkValue)) {
                for (let cv of checkValue) {
                    if (!enumValues.includes(cv)) {
                        violations.push([chalk.red(chalk.bold("  [!]")), "Enum", cv, "is invalid."]);
                    }
                }
            } else if (typeof checkValue === "object" && Array.isArray(checkValue.oneOf)) {
                violations.push([chalk.red(chalk.bold("  [!]")), "Enum oneOf is not implemented."]);
            }
        }

        if (violations.length > 0) {
            print(chalk.red(chalk.bold(populatorCollection.name)), "INTEGRITY VIOLATIONS");
            for (const violation of violations) {
                print(...violation);
            }
            noViolations = false;
        } else {
            // print(chalk.green(chalk.bold(populatorCollection.name)), "OK");
        }

    }

    if (noViolations) {
        print(chalk.green("Project integrity OK."));
    }

}

async function mainLoopTick(password: string) {

    let userCommand = await input({
        message: '>',
        theme
    });
    userCommand = userCommand.trim().toLowerCase();

    if (userCommand === "exit" || userCommand === "quit") {
        return false;
    }

    if (userCommand === "save" || userCommand === "dump" || userCommand === "write") {
        await saveProject();
        print(chalk.green("Saved project."), chalk.bold(project.populatorCollections.length), "populator collections,", chalk.bold(project.ruleCollections.length), "rule collections.");
        return true;
    }

    if (userCommand === "reset" || userCommand === "reload" || userCommand === "load" || userCommand === "read" || userCommand === "restore") {
        await readProject();
        checkProjectIntegrity();
        print(chalk.green("Reloaded project."), chalk.bold(project.populatorCollections.length), "populator collections,", chalk.bold(project.ruleCollections.length), "rule collections.");
        return true;
    }

    if (userCommand === "pro") {
        MODELNAME = "gemini-1.5-pro";
        print("Switched to", chalk.bold(MODELNAME), "model.");
        return true;
    }

    if (userCommand === "flash") {
        MODELNAME = "gemini-1.5-flash";
        print("Switched to", chalk.bold(MODELNAME), "model.");
        return true;
    }

    const machineResponse = await callCloud({
        messages: [
            { role: "system", content: projectSystemPrompt() },
            { role: "user", content: userCommand },
        ],
        password,
        model: MODELNAME,
    });

    try {
        const parsedResponse = parseResponseText(machineResponse);

        const parsedResponseDebugPath = path.resolve(
            process.cwd(),
            "PARSED_RESPONSE_DEBUG.txt"
        );
        await writeFile(parsedResponseDebugPath, JSON.stringify(parsedResponse, null, 2), "utf-8");
        print("Wrote parsed response debug to", chalk.bold(parsedResponseDebugPath));
        displayCommand(parsedResponse);
        applyCommand(parsedResponse);
        checkProjectIntegrity();
    } catch (e: any) {
        print(chalk.red("Failed to parse response. Reloading project."));
        await readProject();
        checkProjectIntegrity();
    }

    return true;
}

async function main() {
    print("Running.");

    print(chalk.bold("Please enter the cloud password."));

    let cloudPassword = process.env.CLOUD_PASSWORD || "";

    if (cloudPassword === "") {

        cloudPassword = await password({
            message: '>',
            theme
        });
        if (!cloudPassword || cloudPassword.length === 0) {
            print(chalk.red("Invalid password. Password cannot be empty."));
            process.exit(1);
        }

    }

    print("Connecting to cloud ...");
    const testResult = await testCloudConnection(cloudPassword);
    if (!testResult) {
        print(chalk.red("Failed to connect to cloud. Invalid password."));
        process.exit(1);
    } else {
        print(chalk.green(chalk.bold("Connected to cloud.")));
    }

    await readProject();
    checkProjectIntegrity();

    while (true) {
        const keepRunning = await mainLoopTick(cloudPassword);
        if (!keepRunning) {
            break;
        }
    }
}

main();