import classNames from "classnames";
import { EquipActionSlot, usePlayerActions } from "../../context/PlayerActions.context";
import { INonPlayerCharacter, IWorldItem } from "../../context/World.context";
import { Icon } from "@iconify/react";
import { aiDisplayNpc } from "../../ai/display";

export function NpcActions(
    props: {
        value: INonPlayerCharacter;
        talk?: boolean;
        attack?: boolean;
    }
) {

    const actions = usePlayerActions();

    const onTalk = () => {
        // TODO
        actions.talk(props.value, "");
    };
    const onAttack = () => {
        // TODO
        actions.attack(props.value);
    };

    const onDebug = () => {
        navigator.clipboard.writeText(
            aiDisplayNpc(props.value)
        );
    }

    const buttonCn = classNames(
        "dark:text-neutral-200 text-neutral-800 hover:dark:text-white hover:text-black p-2 rounded-full border border-2 border-neutral-500"
    );

    return <>
        <div className="flex flex-row justify-center items-center gap-2">
            {
                props.talk && <button className={buttonCn} onClick={onTalk}>
                    <Icon icon="mdi:chat" />
                </button>
            }
            {
                props.attack && <button className={buttonCn} onClick={onAttack}>
                    <Icon icon="mdi:sword" />
                </button>
            }
        </div>
    </>;
}