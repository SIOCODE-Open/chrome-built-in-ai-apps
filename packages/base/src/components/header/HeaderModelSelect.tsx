import { ChangeEvent, useEffect, useState } from "react";
import { ILanguageModelKind, useLanguageModel } from "../../context/LanguageModel.context";
import { CLOUD_ENDPOINT_URL } from "../AppLanguageModel";
import classNames from "classnames";
import { Icon } from "@iconify/react";

export function HeaderModelSelect(
    props: any
) {

    const [kinds, setKinds] = useState<Array<ILanguageModelKind>>([]);
    const [selectedKind, setSelectedKind] = useState<string>("builtin");
    const [isPasswordSet, setIsPasswordSet] = useState<boolean>(false);
    const [enteredPassword, setEnteredPassword] = useState<string>("");
    const [isEnteringPassword, setIsEnteringPassword] = useState<boolean>(false);
    const [isCheckingPassword, setIsCheckingPassword] = useState<boolean>(false);
    const [isPasswordCheckIssue, setIsPasswordCheckIssue] = useState<boolean>(false);

    const lm = useLanguageModel();

    const dryRunPassword = async (pw: string) => {
        try {
            const response = await fetch(
                CLOUD_ENDPOINT_URL,
                {
                    method: "POST",
                    body: JSON.stringify({
                        password: pw,
                        dryRun: true
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            if (!response.ok) {
                return false;
            }
            const data = await response.json();
            if (!data.ok) {
                return false;
            }
            return true;
        } catch (err) {
            return false;
        }
    }

    useEffect(
        () => {
            const localStoragePassword = localStorage.getItem("cloud.password");
            if (!localStoragePassword || localStoragePassword === "") {
                setIsPasswordSet(false);
            } else {
                // Dry-run
                const ok = dryRunPassword(localStoragePassword);
                if (ok) {
                    setIsPasswordSet(true);
                } else {
                    localStorage.removeItem("cloud.password");
                    setIsPasswordSet(false);
                }
            }
        },
        []
    );

    useEffect(
        () => {
            setKinds(
                lm.getAvailableKinds()
            );
            setSelectedKind(
                lm.getSelectedKind().identifier
            );
        },
        []
    );

    const selectCn = classNames(
        "px-2 border dark:border-neutral-700 border-neutral-300 rounded-full",
        "bg-transparent",
        "outline-none focus:outline-none active:outline-none",
        "ring-none focus:ring-none active:ring-none",
        "text-xs",
    );

    const onChangeModel = (ev: ChangeEvent<HTMLSelectElement>) => {

        const selectedKind = kinds.find(
            (kind) => kind.identifier === ev.target.value
        );

        if (selectedKind.isCloud && !isPasswordSet) {
            ev.preventDefault();
            console.warn("Need to set password!");
            setIsEnteringPassword(true);
            return;
        }

        setSelectedKind(selectedKind.identifier);
        lm.setSelectedKind(selectedKind);

    };

    const onCheckPassword = async () => {
        setIsCheckingPassword(true);
        const ok = await dryRunPassword(enteredPassword);
        setIsCheckingPassword(false);
        if (ok) {
            localStorage.setItem("cloud.password", enteredPassword);
            setIsPasswordSet(true);
            setIsEnteringPassword(false);
            setIsPasswordCheckIssue(false);
        } else {
            setIsPasswordCheckIssue(true);
        }
    };

    return <>
        <select className={selectCn}
            onChange={onChangeModel}
            value={selectedKind}>
            {
                kinds.map(
                    (kind) => {
                        return <option key={kind.identifier} value={kind.identifier}>
                            {kind.name}
                        </option>
                    }
                )
            }
        </select>
        {
            isEnteringPassword && (
                <div className="flex flex-row justify-start items-center gap-2">
                    <input value={enteredPassword}
                        onChange={(ev) => setEnteredPassword(ev.target.value)}
                        type="password"
                        placeholder="Password"
                        className="px-2 py-1 border dark:border-neutral-700 border-neutral-300 rounded-full bg-transparent text-xs dark:text-white text-black outline-none focus:outline-none active:outline-none ring-none focus:ring-none active:ring-none"
                    />
                    {
                        !isCheckingPassword && <button onClick={onCheckPassword}
                            className="px-2 py-1 hover:bg-green-500/25 active:bg-green-500/50 dark:text-white text-black">
                            <Icon icon="mdi:check" />
                        </button>
                    }
                    {
                        isCheckingPassword && (
                            <Icon icon="mdi:loading" className="animate-spin text-lg" />
                        )
                    }
                    {
                        isPasswordCheckIssue && (
                            <Icon icon="mdi:alert" className="text-lg text-red-500" />
                        )
                    }
                </div>
            )
        }
    </>

}