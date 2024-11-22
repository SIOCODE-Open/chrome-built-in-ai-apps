import { IWorldEdge, IWorldNode } from "../../../context/World.context";

export interface IEdgeFactory {
    edge(
        from: IWorldNode,
        to: IWorldNode,
        distance: number
    ): IWorldEdge;
}