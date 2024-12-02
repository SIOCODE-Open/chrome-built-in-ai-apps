import { useEffect, useRef } from "react";
import { ICharacterGear, ICharacterHealth, INonPlayerCharacter, IPossibleQuest, IQuest, IWorldContext, IWorldEdge, IWorldNode, WorldProvider } from "../context/World.context"
import { BehaviorSubject, map } from "rxjs";
import { WorldGenerator } from "./world/WorldGenerator";
import { useLanguageModel } from "@siocode/base";
import { BUILTIN_BIOMES_MODULE } from "./world/modules/BuiltinBiomesModule";
import { useHistory } from "../context/History.context";
import { ItemFactory } from "./world/api/ItemFactory";
import { WorldGenerator2 } from "./world2/WorldGenerator2";
import { BuiltinPopulators } from "./world2/BuiltinPopulators";
import { BuiltinRules } from "./world2/BuiltinRules";

export function GameWorld(
    props: {
        children?: any
    }
) {

    const graphRef = useRef(
        new BehaviorSubject<Array<IWorldNode>>(null)
    );

    const itemFactoryRef = useRef(
        new ItemFactory()
    );

    const lm = useLanguageModel();
    const history = useHistory();

    const generator = useRef(
        new WorldGenerator2(
            BuiltinPopulators,
            BuiltinRules
        )
    );

    const generateItems = (populatorId: string) => {
        return generator.current.generateItemFrom(populatorId);
    };

    const generateQuestFor = (player: { gear: ICharacterGear; health: ICharacterHealth; location: IWorldNode }, npc: INonPlayerCharacter): IQuest => {
        return generator.current.generateQuestFor(
            player.gear,
            player.health,
            player.location,
            npc
        );
    }

    const contextValue: IWorldContext = {
        getAllNodes: () => graphRef.current.value,
        getNodesWithLabel: (label: string) => graphRef.current.value.filter(n => n.labels.includes(label)),
        getNode: (id: number) => graphRef.current.value[id],
        nodesGenerated: graphRef.current.asObservable(),
        createItem: generator.current.item.bind(generator.current),
        createNpc: generator.current.npc.bind(generator.current),
        generateItems,
        generateQuestFor,
    };

    useEffect(
        () => {
            const fn = async () => {
                const newWorldGraph = await generator.current.generate();
                graphRef.current.next(newWorldGraph);
            };
            fn();
        },
        []
    );

    return <WorldProvider value={contextValue}>
        {props.children}
    </WorldProvider>;
}