import { useLanguageModel } from "@siocode/base";
import { aiDisplayLocationShort } from "../ai/display";
import { WorldNodeDetailGenerator } from "../ai/WorldNodeDetailGenerator";
import { useHistory } from "../context/History.context";
import { usePlayer } from "../context/Player.context";
import { EquipActionSlot, IEquipAction, IPlayerActionsContext, PlayerActionsProvider } from "../context/PlayerActions.context";
import { INonPlayerCharacter, IWorldEdge, IWorldItem, IWorldNode, useWorld } from "../context/World.context";
import { WorldPlayerSkill } from "../model/world.enums";
import { LateContent } from "./LateContent";
import { useGameSimulation } from "../context/GameSimulation.context";
import { WorldNodeDetailGenerator2 } from "../ai/WorldNodeDetailGenerator2";

export function GamePlayerActions(
    props: {
        children?: any
    }
) {

    const player = usePlayer();
    const world = useWorld();
    const history = useHistory();
    const lm = useLanguageModel();
    const sim = useGameSimulation();

    const hasSkill = (skill: WorldPlayerSkill) => {
        return !!player.getPlayerSkills().skills.find(s => s === skill);
    };

    const generateMissingLevelDetails = async (nodes: Array<IWorldNode>) => {
        const generator = new WorldNodeDetailGenerator2(lm);
        for (const node of nodes) {
            await generator.generate(node);
        }
    };

    const contextValue: IPlayerActionsContext = {
        lookAround: () => {
            console.log("[GamePlayerActions]", "Looking around");

            history.actionLookAround(player.getPlayerLocation());
            sim.start();

        },
        move: (edge: IWorldEdge) => {
            console.log("[GamePlayerActions]", "Moving to", edge.to);

            history.actionMove(player.getPlayerLocation(), edge.to, edge);
            sim.start();
        },
        dropItem: (item: IWorldItem) => {
            console.log("[GamePlayerActions]", "Dropping item", item);

            history.actionDrop(item, player.getPlayerLocation());
            sim.start();
        },
        pickupItem: (item: IWorldItem) => {
            console.log("[GamePlayerActions]", "Picking up item", item);

            history.actionPickUp(item, player.getPlayerLocation());
            sim.start();
        },
        eatItem: (item: IWorldItem) => {
            console.log("[GamePlayerActions]", "Eating item", item);

            history.actionEat(item);
            sim.start();
        },
        drinkItem: (item: IWorldItem) => {
            console.log("[GamePlayerActions]", "Drinking item", item);

            history.actionDrink(item);
            sim.start();
        },
        equipItem: (equip: IEquipAction) => {
            console.log("[GamePlayerActions]", "Equipping item", equip);

            history.actionEquip(equip.slot, equip.item);
            sim.start();
        },
        unequipItem: (slot: EquipActionSlot) => {

            console.log("[GamePlayerActions]", "Unequipping item", slot);

            history.actionUnequip(slot, player.getPlayerGear()[slot]);
            sim.start();
        },
        settleDown: () => {
            console.log("[GamePlayerActions]", "Settling down");

            history.actionSettle(player.getPlayerLocation());
            sim.start();
        },
        hitTheRoad: () => {
            console.log("[GamePlayerActions]", "Hitting the road");

            history.actionHitTheRoad(player.getPlayerLocation());
            sim.start();
        },
        leave: () => {
            console.log("[GamePlayerActions]", "Leaving");

            history.actionLeave();
            sim.start();
        },
        unpack: (item: IWorldItem) => {
            console.log("[GamePlayerActions]", "Unpacking item", item);

            history.actionUnpack(item);
            sim.start();
        },
        craftBreak: (
            breakWhat: IWorldItem,
            breakUsing?: IWorldItem | null
        ) => {
            console.log("[GamePlayerActions]", "Breaking item", breakWhat, "using", breakUsing);

            history.actionCraft(
                "break",
                player.getPlayerLocation(),
                [breakWhat],
                breakUsing ? [breakUsing] : []
            );
            sim.start();
        },
        craftAssemble: (
            assembleWhat: Array<IWorldItem>,
            assembleUsing?: IWorldItem | null
        ) => {
            console.log("[GamePlayerActions]", "Assembling items", assembleWhat, "using", assembleUsing);

            history.actionCraft(
                "assemble",
                player.getPlayerLocation(),
                assembleWhat,
                assembleUsing ? [assembleUsing] : []
            );
            sim.start();
        },
        craftCook: (
            cookWhat: Array<IWorldItem>,
            cookUsing?: IWorldItem | null
        ) => {
            console.log("[GamePlayerActions]", "Cooking items", cookWhat, "using", cookUsing);

            history.actionCraft(
                "cook",
                player.getPlayerLocation(),
                cookWhat,
                cookUsing ? [cookUsing] : []
            );
            sim.start();
        },
        craftRefine: (
            refineWhat: IWorldItem,
            refineWith: Array<IWorldItem>,
            refineUsing?: IWorldItem | null
        ) => {
            console.log("[GamePlayerActions]", "Refining item", refineWhat, "with", refineWith, "using", refineUsing);

            history.actionCraft(
                "refine",
                player.getPlayerLocation(),
                [refineWhat, ...refineWith],
                refineUsing ? [refineUsing] : []
            );
            sim.start();
        },
        craftDisassemble: (
            disassembleWhat: IWorldItem,
            disassembleUsing?: IWorldItem | null
        ) => {
            console.log("[GamePlayerActions]", "Disassembling item", disassembleWhat, "using", disassembleUsing);

            history.actionCraft(
                "disassemble",
                player.getPlayerLocation(),
                [disassembleWhat],
                disassembleUsing ? [disassembleUsing] : []
            );
            sim.start();
        },
        craftSmelt: (
            smeltWhat: IWorldItem,
            smeltUsing?: IWorldItem | null
        ) => {
            console.log("[GamePlayerActions]", "Smelting item", smeltWhat, "using", smeltUsing);

            history.actionCraft(
                "smelt",
                player.getPlayerLocation(),
                [smeltWhat],
                smeltUsing ? [smeltUsing] : []
            );
            sim.start();
        },
        attack: (npc: INonPlayerCharacter) => {
            console.log("[GamePlayerActions]", "Attacking", npc);

            history.actionAttack(npc);
            sim.start();
        },
        talk: (npc: INonPlayerCharacter) => {
            console.log("[GamePlayerActions]", "Talking to", npc);

            history.actionTalk(npc, "");
            sim.start();
        },
        trade: (
            npc: INonPlayerCharacter,
            offered: { gold: number; items: Array<IWorldItem> },
            want: { gold: number; items: Array<IWorldItem> }
        ) => {
            console.log("[GamePlayerActions]", "Trading with", npc, "offering", offered, "wanting", want);

            history.actionTrade(npc, offered, want);
            sim.start();
        },
        rest: () => {
            console.log("[GamePlayerActions]", "Resting");

            history.actionRest();
            sim.start();
        },
        useItem: (item: IWorldItem) => {
            console.log("[GamePlayerActions]", "Using item", item);

            history.actionUseItem(item);
            sim.start();
        },
        beginQuest: () => {
            console.log("[GamePlayerActions]", "Beginning quest");

            history.actionBeginQuest();
            sim.start();
        },
        handInQuest: () => {
            console.log("[GamePlayerActions]", "Handing in quest");

            history.actionHandInQuest();
            sim.start();
        },
        tellSecret: () => {
            console.log("[GamePlayerActions]", "Telling secret");

            history.actionTellSecret();
            sim.start();
        },
    };

    return <PlayerActionsProvider value={contextValue}>
        {props.children}
    </PlayerActionsProvider>;

}