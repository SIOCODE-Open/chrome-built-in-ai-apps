import { IBiomeModule } from "./BiomeModule";
import { IEdgeProcessor } from "./EdgeProcessor";
import { INodeProcessor } from "./NodeProcessor";

export interface IGeneratorModule {
    name: string;
    biomeModules?: Array<IBiomeModule>;
    nodeProcessors?: Array<INodeProcessor>;
    edgeProcessors?: Array<IEdgeProcessor>;
}