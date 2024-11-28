import chalk from "chalk";
import { input, password } from '@inquirer/prompts';
import path from "path";
import { readdir, readFile, writeFile } from "fs/promises";

const LOGTAG = chalk.dim("[extender-cli]");
const CLOUD_URL = `https://chrome-builtin-ai-challenge-gemini-gateway-700248413310.europe-west4.run.app`;

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
}

const project: IProject = {
    populators: [],
    rules: [],
    populatorCollections: [],
    ruleCollections: [],
    interfacesContent: "",
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
            for (const [name, change] of Object.entries(req.populators.change)) {
                createAffectedFiles(name);
                affectedFiles[name].change.push(
                    ...change.map(o => o.id)
                );
            }
        }
        if (req.populators.remove) {
            for (const [name, remove] of Object.entries(req.populators.remove)) {
                createAffectedFiles(name);
                affectedFiles[name].remove.push(...remove);
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
            for (const [name, change] of Object.entries(req.rules.change)) {
                createAffectedFiles(name);
                affectedFiles[name].change.push(
                    ...change.map(o => o.id)
                );
            }
        }
        if (req.rules.remove) {
            for (const [name, remove] of Object.entries(req.rules.remove)) {
                createAffectedFiles(name);
                affectedFiles[name].remove.push(...remove);
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
    print("Loaded", chalk.bold(project.rules.length), "rules.");

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

async function mainLoopTick(password: string) {

    const userCommand = await input({
        message: '>',
        theme
    });

    if (userCommand === "exit" || userCommand === "quit") {
        return false;
    }

    const machineResponse = await callCloud({
        messages: [
            { role: "system", content: projectSystemPrompt() },
            { role: "user", content: userCommand },
        ],
        password,
        model: "gemini-1.5-flash",
    });
    const parsedResponse = parseResponseText(machineResponse);

    const parsedResponseDebugPath = path.resolve(
        process.cwd(),
        "PARSED_RESPONSE_DEBUG.txt"
    );
    await writeFile(parsedResponseDebugPath, JSON.stringify(parsedResponse, null, 2), "utf-8");
    print("Wrote parsed response debug to", chalk.bold(parsedResponseDebugPath));
    displayCommand(parsedResponse);

    return true;
}

async function main() {
    print("Running.");

    print(chalk.bold("Please enter the cloud password."));

    const cloudPassword = await password({
        message: '>',
        theme
    });
    if (!cloudPassword || cloudPassword.length === 0) {
        print(chalk.red("Invalid password. Password cannot be empty."));
        process.exit(1);
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

    while (true) {
        const keepRunning = await mainLoopTick(cloudPassword);
        if (!keepRunning) {
            break;
        }
    }
}

main();