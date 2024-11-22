import { IWorldNode } from "../../../context/World.context";
import { IModuleHost } from "./ModuleHost";

export interface IBiomeModule {
    name: string;
    generate(
        host: IModuleHost,
        biomeIndex: number
    ): Promise<IWorldNode>;
}