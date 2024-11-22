import { IWorldEdge } from "../../context/World.context";

export interface IEdgeProcessor {
    fromLabels?: Array<string>;
    toLabels?: Array<string>;
    labels?: Array<string>;
    process(edge: IWorldEdge): Promise<boolean>;
}