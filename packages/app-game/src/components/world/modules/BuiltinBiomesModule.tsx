import { FOREST_BIOME_MODULE } from "../biomes/ForestBiomeModule";
import { IGeneratorModule } from "../api/GeneratorModule";

export const BUILTIN_BIOMES_MODULE: IGeneratorModule = {
    name: "Builtin Biomes",
    biomeModules: [
        FOREST_BIOME_MODULE
    ]
};