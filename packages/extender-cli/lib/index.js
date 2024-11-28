var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chalk from "chalk";
import { input, password } from '@inquirer/prompts';
import path from "path";
import { readdir, readFile, writeFile } from "fs/promises";
const LOGTAG = chalk.dim("[extender-cli]");
const CLOUD_URL = `https://chrome-builtin-ai-challenge-gemini-gateway-700248413310.europe-west4.run.app`;
const theme = {
    prefix: LOGTAG,
};
function print(...args) {
    console.log(LOGTAG, ...args);
}
function callCloud(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetchResponse = yield fetch(CLOUD_URL, {
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
            return (yield fetchResponse.json()).ok;
        }
        return yield fetchResponse.text();
    });
}
function testCloudConnection(password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield callCloud({
                messages: [],
                password,
                dryRun: true,
            });
            return !!result;
        }
        catch (e) {
            return false;
        }
    });
}
const project = {
    populators: [],
    rules: [],
    populatorCollections: [],
    ruleCollections: [],
    interfacesContent: "",
};
function projectSystemPrompt() {
    // Replace to new JSON between:
    // "Starting populators:"
    // "End of starting populators."
    let txt = project.interfacesContent.trim();
    const startingPopulatorsStartIndex = txt.indexOf("Starting populators:");
    const startingPopulatorsEndIndex = txt.indexOf("End of starting populators.");
    const newStartingPopulatorsContent = project.populatorCollections.map(pc => `${pc.name}\n[\n${pc.populators.map(p => JSON.stringify(p)).join(",\n")}\n]`).join("\n");
    txt = txt.substring(0, startingPopulatorsStartIndex) + "Starting populators:\n\n" + newStartingPopulatorsContent + "\n\n" + txt.substring(startingPopulatorsEndIndex);
    // Replace to new JSON between:
    // "Starting rules:"
    // "End of starting rules."
    const startingRulesStartIndex = txt.indexOf("Starting rules:");
    const startingRulesEndIndex = txt.indexOf("End of starting rules.");
    const newStartingRulesContent = project.ruleCollections.map(pc => `${pc.name}\n[\n${pc.rules.map(p => JSON.stringify(p)).join(",\n")}\n]`).join("\n");
    txt = txt.substring(0, startingRulesStartIndex) + "Starting rules:\n\n" + newStartingRulesContent + "\n\n" + txt.substring(startingRulesEndIndex);
    return txt;
}
function parseResponseText(txt) {
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
    }
    catch (e) {
        return {};
    }
}
function displayCommand(req) {
    const affectedFiles = {};
    const createAffectedFiles = (name) => {
        if (!affectedFiles[name]) {
            affectedFiles[name] = {
                add: [],
                change: [],
                remove: [],
            };
        }
    };
    if (req.populators) {
        if (req.populators.add) {
            for (const [name, add] of Object.entries(req.populators.add)) {
                createAffectedFiles(name);
                affectedFiles[name].add.push(...add.map(o => o.id));
            }
        }
        if (req.populators.change) {
            for (const [name, change] of Object.entries(req.populators.change)) {
                createAffectedFiles(name);
                affectedFiles[name].change.push(...change.map(o => o.id));
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
                affectedFiles[name].add.push(...add.map(o => o.id));
            }
        }
        if (req.rules.change) {
            for (const [name, change] of Object.entries(req.rules.change)) {
                createAffectedFiles(name);
                affectedFiles[name].change.push(...change.map(o => o.id));
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
function readProject() {
    return __awaiter(this, void 0, void 0, function* () {
        const cwd = process.cwd();
        print("Running in directory", chalk.bold(cwd));
        const interfacesFilePath = path.resolve(cwd, "INTERFACES.txt");
        const interfacesFileContent = yield readFile(interfacesFilePath, "utf-8");
        project.interfacesContent = interfacesFileContent;
        print("Loaded interfaces from", chalk.bold(interfacesFilePath));
        const projorDataDirectory = path.resolve(cwd, "../../.projor/data");
        print("Reading project data from", chalk.bold(projorDataDirectory));
        const populatorsDirectory = path.resolve(projorDataDirectory, "populators");
        print("Reading populators from", chalk.bold(populatorsDirectory));
        project.populatorCollections = (yield Promise.all((yield readdir(populatorsDirectory))
            .map((populatorFilename) => __awaiter(this, void 0, void 0, function* () { return ({ name: populatorFilename, populators: JSON.parse(yield readFile(path.resolve(populatorsDirectory, populatorFilename), "utf-8")) }); })))).flat();
        project.populators = project.populatorCollections.map(pc => pc.populators).flat();
        print("Loaded", chalk.bold(project.populators.length), "populators from", chalk.bold(project.populatorCollections.length), "collections.");
        const rulesDirectory = path.resolve(projorDataDirectory, "rules");
        print("Reading rules from", chalk.bold(rulesDirectory));
        project.ruleCollections = (yield Promise.all((yield readdir(rulesDirectory))
            .map((ruleFilename) => __awaiter(this, void 0, void 0, function* () { return ({ name: ruleFilename, rules: JSON.parse(yield readFile(path.resolve(rulesDirectory, ruleFilename), "utf-8")) }); })))).flat();
        project.rules = project.ruleCollections.map(pc => pc.rules).flat();
        print("Loaded", chalk.bold(project.rules.length), "rules.");
        const systemPromptDebugPath = path.resolve(cwd, "SYSTEM_PROMPT_DEBUG.txt");
        yield writeFile(systemPromptDebugPath, projectSystemPrompt(), "utf-8");
        print("Wrote system prompt debug to", chalk.bold(systemPromptDebugPath));
    });
}
function mainLoopTick(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const userCommand = yield input({
            message: '>',
            theme
        });
        if (userCommand === "exit" || userCommand === "quit") {
            return false;
        }
        const machineResponse = yield callCloud({
            messages: [
                { role: "system", content: projectSystemPrompt() },
                { role: "user", content: userCommand },
            ],
            password,
            model: "gemini-1.5-flash",
        });
        const parsedResponse = parseResponseText(machineResponse);
        const parsedResponseDebugPath = path.resolve(process.cwd(), "PARSED_RESPONSE_DEBUG.txt");
        yield writeFile(parsedResponseDebugPath, JSON.stringify(parsedResponse, null, 2), "utf-8");
        print("Wrote parsed response debug to", chalk.bold(parsedResponseDebugPath));
        displayCommand(parsedResponse);
        return true;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        print("Running.");
        print(chalk.bold("Please enter the cloud password."));
        const cloudPassword = yield password({
            message: '>',
            theme
        });
        if (!cloudPassword || cloudPassword.length === 0) {
            print(chalk.red("Invalid password. Password cannot be empty."));
            process.exit(1);
        }
        print("Connecting to cloud ...");
        const testResult = yield testCloudConnection(cloudPassword);
        if (!testResult) {
            print(chalk.red("Failed to connect to cloud. Invalid password."));
            process.exit(1);
        }
        else {
            print(chalk.green(chalk.bold("Connected to cloud.")));
        }
        yield readProject();
        while (true) {
            const keepRunning = yield mainLoopTick(cloudPassword);
            if (!keepRunning) {
                break;
            }
        }
    });
}
main();
