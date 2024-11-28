
async function parseAllRulesJsonFiles(files) {

    const mergedData = {
        id: "game-worldgen-rules",
        name: "Game World Generation Rules",
        description: "Rules are used to determine which populators to apply where.",
        schema: "GameWorldgenRule",
        objects: [],
    };
    const collectionsData = {
        id: "game-worldgen-rule-collections",
        name: "Game World Generation Rule Collections",
        description: "Collections of rules.",
        schema: "GameWorldgenRuleCollection",
        objects: [],
    };
    const parseErrors = [];

    for (const file of files) {
        const fileCollectionObject = {
            name: file.filename.split('/').slice(-1)[0],
            description: "Rules from " + file.filename.split('/').slice(-1)[0],
            rules: [],
        };
        collectionsData.objects.push(fileCollectionObject);
        try {
            const fileJsonData = JSON.parse(file.content);
            if (Array.isArray(fileJsonData)) {
                const fileObjects = fileJsonData.map(
                    ruleJson => ({
                        name: ruleJson.id,
                        description: ruleJson.id,
                        jsonData: JSON.stringify(ruleJson),
                        source: file.filename.split('/').slice(-1)[0],
                    })
                );
                mergedData.objects.push(
                    ...fileObjects
                );
                fileCollectionObject.rules.push(
                    ...fileObjects.map(
                        ruleObject => `game-worldgen-rules#${ruleObject.name}`
                    )
                );
            } else {
                parseErrors.push({
                    filename: file.filename,
                    message: `Expected an array of objects, but got ${typeof fileJsonData}`,
                })
            }
        } catch (err) {
            parseErrors.push({
                filename: file.filename,
                message: `Error parsing file: ${err.message}`,
            })
        }
    }

    if (parseErrors.length > 0) {
        return {
            errors: parseErrors,
        }
    }

    return [mergedData, collectionsData];

}


return {
    extensions: ['.rules.json'],
    parse: parseAllRulesJsonFiles,
};
