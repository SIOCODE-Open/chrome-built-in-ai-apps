import { Icon } from "@iconify/react";
import classNames from "classnames";
import { useEffect, useState } from "react";

export function GameTutorialWizard(
    opts: {
        onFinished: () => void
    }
) {

    const [failedChecks, setFailedChecks] = useState<any[]>([]);
    const [longProgress, setLongProgress] = useState("");

    const onFinishWizard = async () => {

        // Perform checks to see if window.ai API is available
        // We also check if the AI API allows us to use it

        if (!("ai" in window)) {
            setFailedChecks(
                [
                    ...failedChecks,
                    <>
                        <p>Built-in AI is not available in this browser.</p>
                        <p>Please check your browser settings, or try again using another browser.</p>
                    </>
                ]
            );
            return;
        }

        const ai = window.ai as any;

        if (!("languageModel" in ai)) {
            setFailedChecks(
                [
                    ...failedChecks,
                    <>
                        <p>Prompt API is not available.</p>
                        <p>Please check your browser settings, or try again using another browser.</p>
                    </>
                ]
            );
            return;
        }

        const lm = ai.languageModel as any;

        if (!("capabilities" in lm)) {
            setFailedChecks(
                [
                    ...failedChecks,
                    <>
                        <p>Prompt API is not available.</p>
                        <p>Please check your browser settings, or try again using another browser.</p>
                    </>
                ]
            );
            return;
        }

        const lmCaps = await lm.capabilities();

        const available = lmCaps.available;
        // const available = "no" as any;

        if (available === "readily") {

            localStorage.setItem("game.wizard.finished", "true");

            // We are good to go
            opts.onFinished();

        } else if (available === "after-download") {

            // Download the AI model

            setLongProgress("Downloading built-in AI model ...");

            try {

                const llm = await lm.create();
                setLongProgress("");

                localStorage.setItem("game.wizard.finished", "true");

                // We are good to go
                opts.onFinished();

            } catch (e) {
                setFailedChecks(
                    [
                        ...failedChecks,
                        <>
                            <p>Failed to download the AI model.</p>
                            <p>Please try reloading the page, or try again using another browser.</p>
                        </>
                    ]
                );
            }

        } else {
            setFailedChecks(
                [
                    ...failedChecks,
                    <>
                        <p>AI model is not available.</p>
                        <p>Please try using another browser, or another device.</p>
                    </>
                ]
            );
        }

    }

    useEffect(
        () => {
            const finished = localStorage.getItem("game.wizard.finished");
            if (finished === "true") {
                // Immediately finish the wizard
                opts.onFinished();
            } else {
                // Perform checks
                onFinishWizard();
            }
        },
        []
    );

    return <div className="flex flex-col w-screen h-screen justify-center items-center dark:bg-neutral-800 bg-neutral-100 dark:text-white text-black gap-2">

        {
            failedChecks.length > 0 && <>
                <div className="flex flex-row justify-start items-center gap-2">
                    <Icon icon="mdi:alert" className="text-2xl" />
                    <h1 className="text-2xl font-bold">
                        Sorry, something went wrong.
                    </h1>
                </div>
                {
                    failedChecks.map((fc, idx) => <span key={idx} className="text-red-500 font-bold">
                        {fc}
                    </span>)
                }
            </>
        }
        {
            longProgress.length > 0 && <>
                <div className="flex flex-row justify-start items-center gap-2">
                    <Icon icon="mdi:gears" className="text-2xl animate-spin" />
                    <h1 className="text-2xl font-bold">
                        {longProgress}
                    </h1>
                </div>
            </>
        }
        {
            failedChecks.length === 0 && longProgress.length === 0 && <>
                <div className="flex flex-row justify-start items-center gap-2">
                    <Icon icon="mdi:gears" className="text-2xl animate-spin" />
                    <h1 className="text-2xl font-bold">
                        Checking system requirements ...
                    </h1>
                </div>
            </>
        }

    </div>;

}