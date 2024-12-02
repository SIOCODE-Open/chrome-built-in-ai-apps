import { ICharacterGear, ICharacterHealth, IQuest, IWorldNode } from "../context/World.context";
import { AttackDamageCalculator } from "./AttackDamageCalculator";
import { WorldNpcQuestDifficulty } from "./world.enums";

const findPath = (from: IWorldNode, to: IWorldNode) => {
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

export class QuestDifficultyCalculator {

    calculate(
        player: { gear: ICharacterGear, health: ICharacterHealth, location: IWorldNode },
        quest: IQuest
    ): WorldNpcQuestDifficulty {

        let path = [];

        if (quest.type === "deliver") {

            const targetLocation = quest.deliver!.recipient!.location;

            path = findPath(player.location, targetLocation);

        } else if (quest.type === "talk-to") {

            const targetLocation = quest.talkTo!.npc!.location;

            path = findPath(player.location, targetLocation);

        } else if (quest.type === "find-location") {

            const targetLocation = quest.findLocation!.location;

            path = findPath(player.location, targetLocation);

        } else if (quest.type === "kill") {

            const targetLocation = quest.kill!.npc!.location;

            path = findPath(player.location, targetLocation);

        }

        let estimatedRemainingHealth = player.health.points;

        for (let pathNode of path) {
            for (let npc of pathNode.npcs) {
                if (npc.stance !== "hostile") {
                    continue;
                }

                const calculator = new AttackDamageCalculator();

                const playerDmg = calculator.calculate(
                    player.gear.weapon?.weapon?.damage ?? 1,
                    { gear: npc.gear }
                );
                const enemyDmg = calculator.calculate(
                    npc.gear.weapon?.weapon?.damage ?? 1,
                    { gear: player.gear }
                );
                let enemyHealth = npc.health.points;

                while (enemyHealth > 0) {
                    estimatedRemainingHealth -= enemyDmg;
                    enemyHealth -= playerDmg;
                }
            }
        }

        if (estimatedRemainingHealth === player.health.points) {
            return "easy";
        }
        if (estimatedRemainingHealth > 0) {
            return "challenging";
        }
        if (estimatedRemainingHealth > -1 * player.health.max) {
            return "hard";
        }

        return "impossible";

    }

}