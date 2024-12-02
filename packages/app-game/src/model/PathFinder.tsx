import { IWorldNode } from "../context/World.context";

export const findPath = (from: IWorldNode, to: IWorldNode) => {
    const queue = [{ node: from, path: [from] }];
    const visited = new Set<number>([from.id]);

    while (queue.length > 0) {
        const { node, path } = queue.shift()!;

        if (node.id === to.id) {
            return path;
        }

        for (const edge of node.outEdges) {
            if (!visited.has(edge.to.id)) {
                queue.push({ node: edge.to, path: [...path, edge.to] });
                visited.add(edge.to.id);
            }
        }
    }

    return null;
}
