import { ILanguageModelContext } from "@siocode/base";
import { INodeFactory } from "./api/NodeFactory";
import { IEdgeFactory } from "./api/EdgeFactory";
import { IBiomeModule } from "./api/BiomeModule";
import { IWorldEdge, IWorldNode } from "../../context/World.context";
import { shuffleArray } from "../../utils/shuffleArray";
import { DISTANCES } from "./constants";
import { IModuleHost } from "./api/ModuleHost";
import { IGeneratorModule } from "./api/GeneratorModule";

const BIOME_COUNT = 5;

export class BiomeGenerator {

    private modules: Array<IBiomeModule>;

    constructor(
        private host: IModuleHost
    ) {
        this.modules = this.host.modules
            .map(m => m.biomeModules)
            .filter(m => !!m)
            .flat();
        console.log("[BiomeGenerator]", "Created", this.modules);
    }

    async generate(
        rootNode: IWorldNode
    ): Promise<void> {

        const biomeNodes: Array<IWorldNode> = [];

        const shuffledModules = shuffleArray(this.modules);

        if (this.modules.length === 0) {
            console.warn("[BiomeGenerator]", "No modules to generate");
            return;
        }

        for (let i = 0; i < BIOME_COUNT; i++) {
            const randomModule = shuffledModules[i % shuffledModules.length];
            console.log("[BiomeGenerator]", "Generating biome", randomModule.name);
            const perimeterNode = await randomModule.generate(
                this.host,
                i
            );

            // Connect perimeter node to the root node
            const perimeterToRootEdge = this.host.edgeFactory.edge(perimeterNode, rootNode, DISTANCES.long);
            perimeterNode.outEdges.push(perimeterToRootEdge);
            const rootToPerimeterEdge = this.host.edgeFactory.edge(rootNode, perimeterNode, DISTANCES.long);
            rootNode.outEdges.push(rootToPerimeterEdge);

            biomeNodes.push(perimeterNode);
        }

        // Connect all biomes to each other
        for (let i = 0; i < BIOME_COUNT; i++) {
            for (let j = i + 1; j < BIOME_COUNT; j++) {
                const from = biomeNodes[i];
                const to = biomeNodes[j];
                const edge1 = this.host.edgeFactory.edge(from, to, DISTANCES.medium);
                from.outEdges.push(edge1);
                const edge2 = this.host.edgeFactory.edge(to, from, DISTANCES.medium);
                to.outEdges.push(edge2);
            }
        }

    }

}