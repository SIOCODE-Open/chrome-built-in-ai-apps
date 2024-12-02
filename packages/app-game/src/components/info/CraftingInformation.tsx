import { useEffect, useReducer, useState } from "react";
import { WORLD_PLAYER_CRAFTING_TYPE, WORLD_PLAYER_CRAFTING_TYPE_DISPLAYS, WorldPlayerCraftingType, WorldPlayerSitutation } from "../../model/world.enums";
import { usePlayer } from "../../context/Player.context";
import { usePlayerActions } from "../../context/PlayerActions.context";
import { Card } from "../Card";
import { CardTitle } from "../card/CardTitle";
import { ICharacterInventory, IWorldNode } from "../../context/World.context";

export function CraftingInformation() {

    const [situation, setSituation] = useState<WorldPlayerSitutation>("wandering");
    const [inventory, setInventory] = useState<ICharacterInventory | null>(null);
    const [currentLocation, setCurrentLocation] = useState<IWorldNode | null>(null);
    const [selectedCraftingType, setSelectedCraftingType] = useState<WorldPlayerCraftingType>("break");
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const [breakWhat, setBreakWhat] = useState<number>(-1);
    const [breakUsing, setBreakUsing] = useState<number>(-1);

    const [disassembleWhat, setDisassembleWhat] = useState<number>(-1);
    const [disassembleUsing, setDisassembleUsing] = useState<number>(-1);

    const [smeltWhat, setSmeltWhat] = useState<number>(-1);
    const [smeltUsing, setSmeltUsing] = useState<number>(-1);

    const [assembleWhat1, setAssembleWhat1] = useState<number>(-1);
    const [assembleWhat2, setAssembleWhat2] = useState<number>(-1);
    const [assembleWhat3, setAssembleWhat3] = useState<number>(-1);
    const [assembleWhat4, setAssembleWhat4] = useState<number>(-1);
    const [assembleUsing, setAssembleUsing] = useState<number>(-1);

    const [cookWhat1, setCookWhat1] = useState<number>(-1);
    const [cookWhat2, setCookWhat2] = useState<number>(-1);
    const [cookWhat3, setCookWhat3] = useState<number>(-1);
    const [cookWhat4, setCookWhat4] = useState<number>(-1);
    const [cookUsing, setCookUsing] = useState<number>(-1);

    const [refineWhat, setRefineWhat] = useState<number>(-1);
    const [refineWith1, setRefineWith1] = useState<number>(-1);
    const [refineWith2, setRefineWith2] = useState<number>(-1);
    const [refineUsing, setRefineUsing] = useState<number>(-1);

    const player = usePlayer();
    const actions = usePlayerActions();

    useEffect(
        () => {
            const subs = [
                player.playerSituation.subscribe(
                    (situation) => {
                        setSituation(situation);
                        forceUpdate();
                    }
                ),
                player.playerLocation.subscribe(
                    (location) => {
                        setCurrentLocation(location);
                        forceUpdate();
                    }
                ),
                player.playerInventory.subscribe(
                    (inventory) => {
                        setInventory(inventory);
                        forceUpdate();
                    }
                )
            ];
            return () => subs.forEach(s => s.unsubscribe());
        },
        []
    );

    if (situation !== "settled") {
        return <></>;
    }

    const onChangeCraftingType = (newType: WorldPlayerCraftingType) => {

        if (newType === "break") {
            setBreakWhat(-1);
            setBreakUsing(-1);
        } else if (newType === "assemble") {
            setAssembleWhat1(-1);
            setAssembleWhat2(-1);
            setAssembleWhat3(-1);
            setAssembleWhat4(-1);
            setAssembleUsing(-1);
        } else if (newType === "cook") {
            setCookWhat1(-1);
            setCookWhat2(-1);
            setCookWhat3(-1);
            setCookWhat4(-1);
            setCookUsing(-1);
        } else if (newType === "refine") {
            setRefineWhat(-1);
            setRefineWith1(-1);
            setRefineWith2(-1);
            setRefineUsing(-1);
        }

        setSelectedCraftingType(newType);
    };

    const onBreak = () => {

        const breakWhatItem = inventory.items.find(
            item => item.id === breakWhat
        );
        const breakUsingItem = inventory.items.find(
            item => item.id === breakUsing
        );

        if (!breakWhatItem) {
            return;
        }

        actions.craftBreak(breakWhatItem, breakUsingItem);

    };

    const onAssemble = () => {

        const assembleWhatItems = [
            assembleWhat1, assembleWhat2, assembleWhat3, assembleWhat4
        ].filter(id => id >= 0).map(
            id => inventory.items.find(
                item => item.id === id
            )
        );

        const assembleUsingItem = inventory.items.find(
            item => item.id === assembleUsing
        );

        if (assembleWhatItems.some(item => !item)) {
            return;
        }

        actions.craftAssemble(assembleWhatItems, assembleUsingItem);

    };

    const onCook = () => {

        const cookWhatItems = [
            cookWhat1, cookWhat2, cookWhat3, cookWhat4
        ].filter(id => id >= 0).map(
            id => inventory.items.find(
                item => item.id === id
            )
        );

        const cookUsingItem = inventory.items.find(
            item => item.id === cookUsing
        );

        if (cookWhatItems.some(item => !item)) {
            return;
        }

        actions.craftCook(cookWhatItems, cookUsingItem);

    };

    const onRefine = () => {

        const refineWhatItem = inventory.items.find(
            item => item.id === refineWhat
        );
        const refineWithItems = [
            refineWith1, refineWith2
        ].filter(id => id >= 0).map(
            id => inventory.items.find(
                item => item.id === id
            )
        ).filter(item => !!item);

        const refineUsingItem = inventory.items.find(
            item => item.id === refineUsing
        );

        actions.craftRefine(refineWhatItem, refineWithItems, refineUsingItem);

    };

    const onDisassemble = () => {

        const disassembleWhatItem = inventory.items.find(
            item => item.id === disassembleWhat
        );
        const disassembleUsingItem = inventory.items.find(
            item => item.id === disassembleUsing
        );

        if (!disassembleWhatItem) {
            return;
        }

        actions.craftDisassemble(disassembleWhatItem, disassembleUsingItem);

    };

    const onSmelt = () => {

        const smeltWhatItem = inventory.items.find(
            item => item.id === smeltWhat
        );
        const smeltUsingItem = inventory.items.find(
            item => item.id === smeltUsing
        );

        if (!smeltWhatItem) {
            return;
        }

        actions.craftSmelt(smeltWhatItem, smeltUsingItem);

    };

    return <>
        <Card>
            <CardTitle>Crafting</CardTitle>
            <select value={selectedCraftingType}
                onChange={(e) => onChangeCraftingType(e.target.value as WorldPlayerCraftingType)}
                className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                {
                    WORLD_PLAYER_CRAFTING_TYPE.map(
                        (type) => <option key={type} value={type}>
                            {WORLD_PLAYER_CRAFTING_TYPE_DISPLAYS[type]}
                        </option>
                    )
                }
            </select>


            {
                selectedCraftingType === "break" && <>
                    <CardTitle>Break what</CardTitle>
                    <select value={breakWhat}
                        onChange={(e) => setBreakWhat(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select what to break ...</option>
                        {
                            inventory && inventory.items.map(
                                (item, index) => <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            )
                        }
                    </select>
                    <CardTitle>Break using</CardTitle>
                    <select value={breakUsing}
                        onChange={(e) => setBreakUsing(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Use no tool</option>
                        {
                            inventory && inventory.items.filter(
                                (item) => item.id !== breakWhat
                            ).map(
                                (item, index) => <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            )
                        }
                    </select>
                    <button className="w-full py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onBreak}>
                        Break
                    </button>
                </>
            }

            {
                selectedCraftingType === "assemble" && <>
                    <CardTitle>Assemble these ...</CardTitle>
                    <select value={assembleWhat1}
                        onChange={(e) => setAssembleWhat1(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select first item ...</option>
                        {
                            inventory && inventory.items
                                .filter(
                                    (item) => item.id !== assembleWhat2
                                        && item.id !== assembleWhat3
                                        && item.id !== assembleWhat4
                                )
                                .map(
                                    (item, index) => <option key={index} value={item.id}>
                                        {item.name}
                                    </option>
                                )
                        }
                    </select>
                    <select value={assembleWhat2}
                        onChange={(e) => setAssembleWhat2(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select second item ...</option>
                        {
                            inventory && inventory.items
                                .filter(
                                    (item) => item.id !== assembleWhat1
                                        && item.id !== assembleWhat3
                                        && item.id !== assembleWhat4
                                )
                                .map(
                                    (item, index) => <option key={index} value={item.id}>
                                        {item.name}
                                    </option>
                                )
                        }
                    </select>
                    <select value={assembleWhat3}
                        onChange={(e) => setAssembleWhat3(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select third item ...</option>
                        {
                            inventory && inventory.items
                                .filter(
                                    (item) => item.id !== assembleWhat1
                                        && item.id !== assembleWhat2
                                        && item.id !== assembleWhat4
                                )
                                .map(
                                    (item, index) => <option key={index} value={item.id}>
                                        {item.name}
                                    </option>
                                )
                        }
                    </select>
                    <select value={assembleWhat4}
                        onChange={(e) => setAssembleWhat4(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select forth item ...</option>
                        {
                            inventory && inventory.items
                                .filter(
                                    (item) => item.id !== assembleWhat1
                                        && item.id !== assembleWhat2
                                        && item.id !== assembleWhat3
                                )
                                .map(
                                    (item, index) => <option key={index} value={item.id}>
                                        {item.name}
                                    </option>
                                )
                        }
                    </select>
                    <CardTitle>Assemble using</CardTitle>
                    <select value={assembleUsing}
                        onChange={(e) => setAssembleUsing(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Use no tool</option>
                        {
                            inventory && inventory.items.filter(
                                (item) => item.id !== assembleWhat1
                                    && item.id !== assembleWhat2
                                    && item.id !== assembleWhat3
                                    && item.id !== assembleWhat4
                            ).map(
                                (item, index) => <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            )
                        }
                    </select>
                    <button className="w-full py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onAssemble}>
                        Assemble
                    </button>
                </>
            }

            {
                selectedCraftingType === "cook" && <>
                    <CardTitle>Cooking ingredients ...</CardTitle>
                    <select value={cookWhat1}
                        onChange={(e) => setCookWhat1(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select first ingredient ...</option>
                        {
                            inventory && inventory.items
                                .filter(
                                    (item) => item.id !== cookWhat2
                                        && item.id !== cookWhat3
                                        && item.id !== cookWhat4
                                )
                                .map(
                                    (item, index) => <option key={index} value={item.id}>
                                        {item.name}
                                    </option>
                                )
                        }
                    </select>
                    <select value={cookWhat2}
                        onChange={(e) => setCookWhat2(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select second ingredient ...</option>
                        {
                            inventory && inventory.items
                                .filter(
                                    (item) => item.id !== cookWhat1
                                        && item.id !== cookWhat3
                                        && item.id !== cookWhat4
                                )
                                .map(
                                    (item, index) => <option key={index} value={item.id}>
                                        {item.name}
                                    </option>
                                )
                        }
                    </select>
                    <select value={cookWhat3}
                        onChange={(e) => setCookWhat3(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select third ingredient ...</option>
                        {
                            inventory && inventory.items
                                .filter(
                                    (item) => item.id !== cookWhat1
                                        && item.id !== cookWhat2
                                        && item.id !== cookWhat4
                                )
                                .map(
                                    (item, index) => <option key={index} value={item.id}>
                                        {item.name}
                                    </option>
                                )
                        }
                    </select>
                    <select value={cookWhat4}
                        onChange={(e) => setCookWhat4(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select forth ingredient ...</option>
                        {
                            inventory && inventory.items
                                .filter(
                                    (item) => item.id !== cookWhat1
                                        && item.id !== cookWhat2
                                        && item.id !== cookWhat3
                                )
                                .map(
                                    (item, index) => <option key={index} value={item.id}>
                                        {item.name}
                                    </option>
                                )
                        }
                    </select>
                    <CardTitle>Cook using</CardTitle>
                    <select value={cookUsing}
                        onChange={(e) => setCookUsing(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Use no tool</option>
                        {
                            inventory && inventory.items.filter(
                                (item) => item.id !== cookWhat1
                                    && item.id !== cookWhat2
                                    && item.id !== cookWhat3
                                    && item.id !== cookWhat4
                            ).map(
                                (item, index) => <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            )
                        }
                    </select>
                    <button className="w-full py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onCook}>
                        Cook
                    </button>
                </>
            }

            {
                selectedCraftingType === "refine" && <>
                    <CardTitle>Refine what</CardTitle>
                    <select value={refineWhat}
                        onChange={(e) => setRefineWhat(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select what to refine ...</option>
                        {
                            inventory && inventory.items.map(
                                (item, index) => <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            )
                        }
                    </select>
                    <CardTitle>Refine with</CardTitle>
                    <select value={refineWith1}
                        onChange={(e) => setRefineWith1(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select first ingredient ...</option>
                        {
                            inventory && inventory.items
                                .filter(
                                    (item) => item.id !== refineWith2
                                        && item.id !== refineWhat
                                )
                                .map(
                                    (item, index) => <option key={index} value={item.id}>
                                        {item.name}
                                    </option>
                                )
                        }
                    </select>
                    <select value={refineWith2}
                        onChange={(e) => setRefineWith2(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select second ingredient ...</option>
                        {
                            inventory && inventory.items
                                .filter(
                                    (item) => item.id !== refineWith1
                                        && item.id !== refineWhat
                                )
                                .map(
                                    (item, index) => <option key={index} value={item.id}>
                                        {item.name}
                                    </option>
                                )
                        }
                    </select>
                    <CardTitle>Refine using</CardTitle>
                    <select value={refineUsing}
                        onChange={(e) => setRefineUsing(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Use no tool</option>
                        {
                            inventory && inventory.items.filter(
                                (item) => item.id !== refineWhat
                                    && item.id !== refineWith1
                                    && item.id !== refineWith2
                            ).map(
                                (item, index) => <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            )
                        }
                    </select>
                    <button className="w-full py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onRefine}>
                        Refine
                    </button>
                </>
            }

            {
                selectedCraftingType === "disassemble" && <>
                    <CardTitle>Disassemble what</CardTitle>
                    <select value={disassembleWhat}
                        onChange={(e) => setDisassembleWhat(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select what to disassemble ...</option>
                        {
                            inventory && inventory.items.map(
                                (item, index) => <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            )
                        }
                    </select>
                    <CardTitle>Disassemble using</CardTitle>
                    <select value={disassembleUsing}
                        onChange={(e) => setDisassembleUsing(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Use no tool</option>
                        {
                            inventory && inventory.items.filter(
                                (item) => item.id !== disassembleWhat
                            ).map(
                                (item, index) => <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            )
                        }
                    </select>
                    <button className="w-full py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onDisassemble}>
                        Disassemble
                    </button>
                </>
            }

            {
                selectedCraftingType === "smelt" && <>
                    <CardTitle>Smelt what</CardTitle>
                    <select value={smeltWhat}
                        onChange={(e) => setSmeltWhat(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Select what to smelt ...</option>
                        {
                            inventory && inventory.items.map(
                                (item, index) => <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            )
                        }
                    </select>
                    <CardTitle>Smelt using</CardTitle>
                    <select value={smeltUsing}
                        onChange={(e) => setSmeltUsing(parseInt(e.target.value))}
                        className="w-full rounded-full px-2 py-1 border border-neutral-300 bg-white dark:bg-neutral-900 text-black dark:text-white appearance-none">
                        <option value={-1}>Use no tool</option>
                        {
                            inventory && inventory.items.filter(
                                (item) => item.id !== smeltWhat
                            ).map(
                                (item, index) => <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            )
                        }
                    </select>
                    <button className="w-full py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold text-xs text-center rounded-full"
                        onClick={onSmelt}>
                        Smelt
                    </button>
                </>
            }
        </Card>
    </>;

}