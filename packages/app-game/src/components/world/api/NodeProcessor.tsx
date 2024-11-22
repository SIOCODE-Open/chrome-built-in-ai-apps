import { IWorldNode } from "../../../context/World.context";

export interface INodeProcessor {
    labels?: Array<string>;
    process(node: IWorldNode): Promise<boolean>;
}