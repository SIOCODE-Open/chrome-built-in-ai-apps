import { useLanguageModel } from "@siocode/base";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useGameSimulation } from "../context/GameSimulation.context";
import { Icon } from "@iconify/react";

export function LoadingModal() {

    const [simulating, setSimulating] = useState(false);
    const [loadingText, setLoadingText] = useState("The game is loading the AI model, please wait ...");
    const [loadingTime, setLoadingTime] = useState<string>("0.0");
    const loadingStartedAtRef = useRef<number>(
        Date.now()
    );
    const loadingTimerUpdateIntervalRef = useRef<number>(0);

    const lm = useLanguageModel();
    const sim = useGameSimulation();

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
                    setLoadingTime("0.0");
                    loadingTimerUpdateIntervalRef.current = window.setInterval(
                        () => {
                            setLoadingTime((0.001 * (Date.now() - loadingStartedAtRef.current)).toFixed(1));
                        },
                        100
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
    </div>;

}