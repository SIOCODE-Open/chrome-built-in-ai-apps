import { ILanguageModelContext } from "@siocode/base";
import { IEdgeFactory } from "./EdgeFactory";
import { IGeneratorModule } from "./GeneratorModule";
import { INodeFactory } from "./NodeFactory";
import { IItemFactory } from "./ItemFactory";
import { INpcFactory } from "./NpcFactory";

export interface IModuleHost {
    lm: ILanguageModelContext;
    nodeFactory: INodeFactory;
    edgeFactory: IEdgeFactory;
    itemFactory: IItemFactory;
    npcFactory: INpcFactory;
    modules: Array<IGeneratorModule>;
}