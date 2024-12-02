import { useLanguageModel } from "@siocode/base";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useGameSimulation } from "../context/GameSimulation.context";
import { Icon } from "@iconify/react";

const LOADING_TEXTS = `
    Common items are worth less gold, than rare items.

Everyone values items a little bit differently.

Kitchens may contain ingredients for food, drinks and potions.

You can cook food, drinks and potions, but only in a kitchen.

You can settle down anywhere to do some crafting.

You can assemble materials and household items to create new things.

You can refine your equipment using materials to make them better.

You can break any material, gear or household item into pieces.

You can carefully disassemble gear, or household items into useful bits.

You can smelt any item into more useful materials, but only in a forge.

You may find a pharmacist in a pharmacy, who sells healing potions.

Look for the alchemist's guild for potion ingredients, or equipment.

If you are a mage, make sure to visit a mage tower.

Some villages are extra-prepared, and may have an armory stuffed with gear.

Be careful in the wilderness, as dangerous animals live there!

You may sometimes stumble upon dungeons, make sure to be prepared for the fight!

If you're getting too cold in the mountains, look for a mining base for a couple of friendly faces!

If you're looking for locations, people or items, don't be afraid to ask around!

Settle down, and rest if you're wounded.

You must occasionally eat, so you don't starve to death!

You must occasionally drink, so you don't die of thirst!

Don't go to the swamp. You will die. You have been warned.
`.split("\n").map((x) => x.trim()).filter((x) => x.length > 0);

export function LoadingModal() {

    const [simulating, setSimulating] = useState(false);
    const [loadingText, setLoadingText] = useState("The game is loading the AI model, please wait ...");
    const [loadingTime, setLoadingTime] = useState<string>("0.0");
    const [subtitle, setSubtitle] = useState<string>(
        LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]
    );
    const loadingStartedAtRef = useRef<number>(
        Date.now()
    );
    const loadingTimerUpdateIntervalRef = useRef<number>(0);
    const subtitleChangeIntervalRef = useRef<number>(0);

    const lm = useLanguageModel();
    const sim = useGameSimulation();

    const onChangeSubtitle = () => {
        setSubtitle(
            LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]
        );
    };

    const modalCn = classNames(
        "fixed w-full h-full top-0 left-0 bg-black opacity-50 z-50 flex flex-col text-white items-center justify-center gap-2 select-none pointer-events-auto",
        {
            "hidden": !simulating
        }
    );

    useEffect(
        () => {
            loadingTimerUpdateIntervalRef.current = window.setInterval(
                () => {
                    setLoadingTime((0.001 * (Date.now() - loadingStartedAtRef.current)).toFixed(1));
                },
                100
            );
            subtitleChangeIntervalRef.current = window.setInterval(
                onChangeSubtitle,
                10000
            );
        },
        []
    );

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
                () => {
                    setSimulating(true);
                    loadingStartedAtRef.current = Date.now();
                    if (loadingTimerUpdateIntervalRef.current) {
                        window.clearInterval(loadingTimerUpdateIntervalRef.current);
                    }
                    if (subtitleChangeIntervalRef.current) {
                        window.clearInterval(subtitleChangeIntervalRef.current);
                    }
                    setLoadingTime("0.0");
                    setSubtitle(
                        LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]
                    );
                    loadingTimerUpdateIntervalRef.current = window.setInterval(
                        () => {
                            setLoadingTime((0.001 * (Date.now() - loadingStartedAtRef.current)).toFixed(1));
                        },
                        100
                    );
                    subtitleChangeIntervalRef.current = window.setInterval(
                        onChangeSubtitle,
                        10000
                    );
                }
            );
            return () => sub.unsubscribe();
        },
        []
    );

    useEffect(
        () => {
            const sub = sim.nextTurn.subscribe(
                () => {
                    setSimulating(false);
                    window.clearInterval(loadingTimerUpdateIntervalRef.current);
                }
            );
            return () => sub.unsubscribe();
        },
        []
    );

    return <div className={modalCn}>
        <Icon className="text-2xl animate-spin" icon="mdi:gear" />
        <p className="text-sm font-bold">
            {loadingText}
        </p>
        <p className="text-xs italic">
            {loadingTime}s
        </p>
        <Icon icon="mdi:lightbulb-on" className="text-2xl animate-pulse" />
        <p className="text-xs italic">
            {subtitle}
        </p>
    </div>;

}