import { Icon } from "@iconify/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { CommandInterpreter } from "../../ai/CommandInterpreter";
import { useLanguageModel } from "@siocode/base";
import { usePlayer } from "../../context/Player.context";
import { useWorld } from "../../context/World.context";
import { usePlayerActions } from "../../context/PlayerActions.context";
import { useHistory } from "../../context/History.context";
import { useCommand } from "../../context/Command.context";

export function CommandInput(
    props: {

    }
) {

    const [textInput, setTextInput] = useState<string>("");
    const [isWorking, setIsWorking] = useState<boolean>(false);

    const commander = useCommand();
    const lm = useLanguageModel();
    const player = usePlayer();
    const world = useWorld();
    const actions = usePlayerActions();
    const history = useHistory();

    const onSendCommand = async (cmd: string) => {
        console.log("[CommandInput]", "Sending command: ", cmd);

        setIsWorking(true);

        if (cmd.trim().length === 0) {
            console.log("[CommandInput]", "No command to send");
            setTextInput("");
            setIsWorking(false);
            return;
        }

        const interpreter = new CommandInterpreter(lm);

        const interpreted = await interpreter.prompt({
            player,
            world,
            input: cmd.trim()
        });

        history.publish(
            "player",
            cmd.trim(),
        );

        if (interpreted.command === "noop") {
            console.log("[CommandInput]", "No operation");

            if (interpreted.args.message) {
                history.publish(
                    "story-teller",
                    <p className="text-sm italic">
                        {interpreted.args.message}
                    </p>,
                    {
                        happening: "noop",
                        notes: interpreted.args.message
                    }
                );
            } else {
                history.publish(
                    "story-teller",
                    <p className="text-sm italic">
                        You do nothing for a while.
                    </p>,
                    {
                        happening: "noop",
                        notes: "You do nothing for a while."
                    }
                );
            }

        } else {
            console.log("[CommandInput]", "Interpreted command", interpreted);

            if (interpreted.command === "lookAround") {
                actions.lookAround();
            } else if (interpreted.command === "move") {
                let edge = player.getPlayerLocation().outEdges.find(
                    e => e.to.id === parseInt(interpreted.args.to)
                );
                if (edge) {
                    actions.move(edge);
                }
            } else if (interpreted.command === "pickup") {
                const item = player.getPlayerLocation().items.find(
                    i => i.id === parseInt(interpreted.args.item)
                );
                if (item) {
                    actions.pickupItem(item);
                }
            } else if (interpreted.command === "drop") {
                const item = player.getPlayerInventory().items.find(
                    i => i.id === parseInt(interpreted.args.item)
                );
                if (item) {
                    actions.dropItem(item);
                }
            } else if (interpreted.command === "equip") {
                const inventoryItem = player.getPlayerInventory().items.find(
                    i => i.id === parseInt(interpreted.args.item)
                );
                const locationItem = player.getPlayerLocation().items.find(
                    i => i.id === parseInt(interpreted.args.item)
                );
                if (inventoryItem || locationItem) {
                    actions.equipItem({
                        item: inventoryItem || locationItem,
                        slot: interpreted.args.slot as any
                    });
                }
            } else if (interpreted.command === "unequip") {
                actions.unequipItem(interpreted.args.slot as any);
            }

        }

        setTextInput("");
        setIsWorking(false);
    };

    const onTextInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {

        if (event.code === "Enter" || event.code === "NumpadEnter") {
            if (event.shiftKey) {
                return;
            }
            event.preventDefault();
            console.log("Enter key pressed");
            onSendCommand(
                event.currentTarget.value
            );
        }

    };

    useEffect(
        () => {
            const sub = commander.externalInput.subscribe(
                input => {
                    setTextInput(input);
                }
            );
            return () => {
                sub.unsubscribe();
            };
        },
        []
    );

    return <>
        <div className="fixed z-10 bottom-0 left-0 w-full py-6 px-16">
            <div className="flex flex-row justify-start items-center w-full gap-4">
                <div className={classNames(
                    "absolute right-36",
                    {
                        "opacity-0": !isWorking
                    }
                )}>
                    <Icon icon="mdi:gear" className="text-2xl text-neutral-500 animate-spin" />
                </div>
                <input className="w-full border dark:border-neutral-600 border-neutral-300 dark:bg-neutral-800 bg-white shadow-sm focus:shadow-md rounded-full px-4 py-2 outline-none ring-none focus:outline-none focus:ring-none"
                    value={textInput}
                    onChange={e => { setTextInput(e.target.value); commander.publishUserInput(e.target.value); }}
                    onKeyDown={onTextInputKeydown}
                    placeholder="What do you do?"
                    maxLength={200}
                />
                <button className="px-4 py-2 bg-green-500 text-white font-bold rounded-full"
                    onClick={() => onSendCommand(textInput)}>
                    Do
                </button>
            </div>
        </div>
    </>;
}