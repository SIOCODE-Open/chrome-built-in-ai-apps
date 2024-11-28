
async function parseAllPopulatorsJsonFiles(files) {

    const mergedData = {
        id: "game-worldgen-populators",
        name: "Game World Generation Populators",
        description: "Populators are used to generate parts of the world of the game.",
        schema: "GameWorldgenPopulator",
        objects: [],
    };
    const collectionsData = {
        id: "game-worldgen-populator-collections",
        name: "Game World Generation Populator Collections",
        description: "Collections of populators.",
        schema: "GameWorldgenPopulatorCollection",
        objects: [],
    };
    const parseErrors = [];

    for (const file of files) {
        const fileCollectionObject = {
            name: file.filename.split('/').slice(-1)[0],
            description: "Populators from " + file.filename.split('/').slice(-1)[0],
            populators: [],
        };
        collectionsData.objects.push(fileCollectionObject);
        try {
            const fileJsonData = JSON.parse(file.content);
            if (Array.isArray(fileJsonData)) {
                const fileObjects = fileJsonData.map(
                    populatorJson => ({
                        name: populatorJson.id,
                        description: Array.isArray(populatorJson.name)
                            ? populatorJson.name[0]
                            : populatorJson.name,
                        jsonData: JSON.stringify(populatorJson),
                        source: file.filename.split('/').slice(-1)[0],
                    })
                );
                mergedData.objects.push(
                    ...fileObjects
                );
                fileCollectionObject.populators.push(
                    ...fileObjects.map(
                        populatorObject => `game-worldgen-populators#${populatorObject.name}`
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
    extensions: ['.populators.json'],
    parse: parseAllPopulatorsJsonFiles,
};
