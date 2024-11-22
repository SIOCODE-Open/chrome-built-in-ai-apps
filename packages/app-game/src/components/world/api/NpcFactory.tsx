import { INonPlayerCharacter, IWorldNode } from "../../../context/World.context";
import { WorldNpcRace } from "../../../model/world.enums";

export interface INpcFactory {
    npc(
        name: string,
        race: WorldNpcRace,
        location: IWorldNode
    ): INonPlayerCharacter;
}

export class NpcFactory implements INpcFactory {

    private npcId = 0;

    npc(
        name: string,
        race: WorldNpcRace,
        location: IWorldNode
    ): INonPlayerCharacter {
        return {
            id: this.npcId++,
            name,
            race,
            location,
            labels: [],
            health: {
                status: "healthy",
                points: 100,
                max: 100
            },
            inventory: {
                gold: 0,
                items: []
            },
            gear: {
                armor: null,
                helmet: null,
                boots: null,
                weapon: null,
                wearable: null
            },
            personality: {
                traits: [],
                background: "peasant"
            }
        };
    }

}