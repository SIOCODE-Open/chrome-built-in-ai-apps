import { ILanguageModelContext } from "@siocode/base";
import { INonPlayerCharacter, IWorldEdge, IWorldItem, IWorldNode, WorldNodeLevel } from "../../context/World.context";
import { INodeFactory } from "./api/NodeFactory";
import { IEdgeFactory } from "./api/EdgeFactory";
import { IGeneratorModule } from "./api/GeneratorModule";
import { BiomeGenerator } from "./BiomeGenerator";
import { WorldItemTier, WorldItemType, WorldNodeHumidity, WorldNodeTemperature, WorldNpcRace } from "../../model/world.enums";
import { IItemFactory, ItemFactory } from "./api/ItemFactory";
import { INpcFactory, NpcFactory } from "./api/NpcFactory";

export class WorldGenerator implements INodeFactory, IEdgeFactory, IItemFactory, INpcFactory {

    private nodeId: number = 0;
    private edgeId: number = 0;
    private builtinItemFactory = new ItemFactory();
    private builtinNpcFactory = new NpcFactory();
    private biomeGenerator: BiomeGenerator;

    private allNodes: Array<IWorldNode> = [];
    private allEdges: Array<IWorldEdge> = [];

    constructor(
        public readonly lm: ILanguageModelContext,
        public readonly modules: Array<IGeneratorModule>
    ) {
        console.log("[WorldGenerator]", "Created", modules);
        this.biomeGenerator = new BiomeGenerator(this);
    }

    private nid(): number {
        return this.nodeId++;
    }

    private eid(): number {
        return this.edgeId++;
    }

    get nodeFactory(): INodeFactory {
        return this;
    }

    get edgeFactory(): IEdgeFactory {
        return this;
    }

    get itemFactory(): IItemFactory {
        return this;
    }

    get npcFactory(): INpcFactory {
        return this;
    }

    node(
        name: string,
        details: {
            level: WorldNodeLevel,
            temperature: WorldNodeTemperature,
            humidity: WorldNodeHumidity
        }
    ): IWorldNode {
        const newNode = {
            id: this.nid(),
            name: name,
            hierarchy: [],
            labels: [],
            level: details.level,
            temperature: details.temperature,
            humidity: details.humidity,
            outEdges: [],
            items: [],
            npcs: [],
        };
        this.allNodes.push(newNode);
        return newNode;
    }

    edge(from: IWorldNode, to: IWorldNode, distance: number): IWorldEdge {
        const newEdge = {
            id: this.eid(),
            from: from,
            to: to,
            distance: distance,
            labels: [],
            discovered: true // FIXME ???
        };
        this.allEdges.push(newEdge);
        return newEdge;
    }

    item(name: string, type: WorldItemType, tier: WorldItemTier): IWorldItem {
        return this.builtinItemFactory.item(name, type, tier);
    }

    npc(name: string, race: WorldNpcRace, location: IWorldNode): INonPlayerCharacter {
        return this.builtinNpcFactory.npc(name, race, location);
    }

    private async processNodes(): Promise<void> {

    }

    private async processEdges(): Promise<void> {

    }

    async generate(): Promise<{
        nodes: Array<IWorldNode>,
        edges: Array<IWorldEdge>
    }> {

        // The world generator algorithm creates a random world, that can be explored by the player
        // It consists of multiple "levels", such as villages, forests, streets, buildings and rooms
        // The root node is the center of the world.

        const rootNode: IWorldNode = this.node(
            "The Middle of the World",
            {
                level: "world",
                humidity: "dry",
                temperature: "scorching"
            }
        );

        console.log("[WorldGenerator]", "Generated root node", rootNode);

        // Generate biomes
        await this.biomeGenerator.generate(rootNode);

        await this.processNodes();
        await this.processEdges();

        console.log("[WorldGenerator]", "Generated world", this.allNodes, this.allEdges);

        return {
            nodes: this.allNodes,
            edges: this.allEdges
        };
    }

}