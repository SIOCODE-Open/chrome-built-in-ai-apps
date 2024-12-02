import classNames from "classnames";
import { CharacterInformation } from "./info/CharacterInformation";
import { TravelInformation } from "./info/TravelInformation";
import { SkillInformation } from "./info/SkillInformation";
import { InventoryInformation } from "./info/InventoryInformation";
import { GearInformation } from "./info/GearInformation";
import { DebugInformation } from "./info/DebugInformation";
import { RoomItemsInformation } from "./info/RoomItemsInformation";
import { RoomNpcsInformation } from "./info/RoomNpcsInformation";
import { SituationInformation } from "./info/SituationInformation";
import { useEffect, useState } from "react";
import { useGameSimulation } from "../context/GameSimulation.context";
import { Icon } from "@iconify/react";
import { KingdomMap } from "./info/KingdomMap";
import { CraftingInformation } from "./info/CraftingInformation";
import { useLanguageModel } from "@siocode/base";
import { ConversationInformation } from "./info/ConversationInformation";

export function InfoViews() {

    const [simulating, setSimulating] = useState(false);
    const [loadingText, setLoadingText] = useState("The game is loading the AI model, please wait ...");
    const lm = useLanguageModel();

    const sim = useGameSimulation();

    const cn = classNames(
        "w-full pb-96 max-h-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2",
        "overflow-y-auto overflow-x-hidden"
    );

    const modalCn = classNames(
        "fixed w-full h-full top-0 left-0 bg-black opacity-50 z-50 flex flex-col text-white items-center justify-center gap-2 pointer-events-none",
        {
            "hidden": !simulating
        }
    );

    const isDevmode = new URLSearchParams(window.location.search).get("devmode") === "true";

    useEffect(
        () => {
            const fn = async () => {
                const llm = await lm.create([
                    { role: "system", content: "You must just always answer with 'My answer is OK.'." },
                    { role: "user", content: "Answer with 'OK'." },
                    { role: "assistant", content: "My answer is OK." }
                ]);
                const okText = await llm.prompt("Answer with 'OK'.");
                setLoadingText("The game is working hard, please wait ...");
            };
            fn();
        },
        []
    );

    useEffect(
        () => {
            const sub = sim.simulating.subscribe(
                () => setSimulating(true)
            );
            return () => sub.unsubscribe();
        },
        []
    );

    useEffect(
        () => {
            const sub = sim.nextTurn.subscribe(
                () => setSimulating(false)
            );
            return () => sub.unsubscribe();
        },
        []
    );

    return <>
        <div className={cn}>
            <CharacterInformation />
            <SituationInformation />
            <ConversationInformation />
            <RoomNpcsInformation />
            <TravelInformation />
            <KingdomMap />
            <InventoryInformation />
            <RoomItemsInformation />
            <SkillInformation />
            <GearInformation />
            <CraftingInformation />

            {isDevmode && <DebugInformation />}
        </div>
    </>;

}