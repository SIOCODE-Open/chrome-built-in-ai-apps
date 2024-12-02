import { AppLanguageModel } from "@siocode/base/src/components/AppLanguageModel";
import classNames from "classnames";
import { useEffect, useReducer, useState } from "react";
import { NameGenerator } from "../ai/NameGenerator";
import { ICharacterCreationDetails, useCharacterCreation } from "../context/CharacterCreation.context";
import { WORLD_PLAYER_CLASS, WORLD_PLAYER_CLASS_DISPLAYS, WorldPlayerClass } from "../model/world.enums";

export function CharacterCreationScreen(
    props: {
        onFinished: () => void;
    }
) {

    const [newCharacterName, setNewCharacterName] = useState("");
    const [newCharacterClass, setNewCharacterClass] = useState("knight");
    const [newCharacterInventoryGold, setNewCharacterInventoryGold] = useState(0);
    const [newCharacterInventoryItems, setNewCharacterInventoryItems] = useState([]);
    const [newCharacterGear, setNewCharacterGear] = useState({});
    const [newCharacterSkills, setNewCharacterSkills] = useState([]);

    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const cc = useCharacterCreation();

    const rootDivCn = classNames(
        "flex flex-col gap-2 w-screen h-screen justify-center items-center",
        "bg-white dark:bg-neutral-900 text-black dark:text-white",
        "overflow-hidden"
    );

    const onFinish = () => {

        cc.updateDetails({
            name: newCharacterName,
            characterClass: newCharacterClass as WorldPlayerClass,
            inventoryGold: newCharacterInventoryGold,
            inventoryItems: newCharacterInventoryItems,
            gear: newCharacterGear,
            skills: newCharacterSkills
        });

        cc.finalizeDetails(cc.getDetails());

        props.onFinished();
    };

    useEffect(
        () => {
            const d = cc.getDetails();
            setNewCharacterName(d.name);
            setNewCharacterClass(d.characterClass);
            setNewCharacterInventoryGold(d.inventoryGold);
            setNewCharacterInventoryItems(d.inventoryItems);
            setNewCharacterGear(d.gear);
            setNewCharacterSkills(d.skills);

            forceUpdate();
        },
        []
    );

    return <div className={rootDivCn}>

        <h1 className="text-3xl font-bold text-center">Character Creation</h1>

        <div className="grid grid-cols-2 gap-2">

            <div className="h-full flex flex-row justify-start items-center text-sm text-neutral-500 italic">Name</div>
            <input type="text"
                value={newCharacterName}
                onChange={e => setNewCharacterName(e.target.value)}
                className="appearance-none w-full p-2 border border-neutral-300 rounded-full bg-transparent" />

            <div className="h-full flex flex-row justify-start items-center text-sm text-neutral-500 italic">Class</div>
            <select value={newCharacterClass}
                onChange={e => setNewCharacterClass(e.target.value)}
                className="appearance-none w-full p-2 border border-neutral-300 rounded-full bg-transparent">
                {
                    WORLD_PLAYER_CLASS.map(
                        c => <option key={c} value={c}>
                            {WORLD_PLAYER_CLASS_DISPLAYS[c]}
                        </option>
                    )
                }
            </select>

        </div>

        <button onClick={onFinish}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-2">
            Finish & start playing game
        </button>

    </div>;

}