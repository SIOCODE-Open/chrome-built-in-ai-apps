import { useRef } from "react";
import { CharacterCreationProvider, ICharacterCreationContext, ICharacterCreationDetails } from "../context/CharacterCreation.context";
import { BehaviorSubject, Subject } from "rxjs";
import { NameGenerator } from "../ai/NameGenerator";

export function GameCharacterCreation(props: { children?: any }) {

    const detailsRef = useRef(
        new BehaviorSubject<ICharacterCreationDetails>({
            name: new NameGenerator().generate(),
            characterClass: "knight",
            inventoryGold: 10,
            inventoryItems: [
                {
                    name: "Rusty Knife",
                    tier: "common",
                    type: "weapon"
                }
            ],
            gear: {
                armor: {
                    name: "Peasant's Clothes",
                    tier: "common",
                    type: "armor"
                },
                boots: {
                    name: "Leather Boots",
                    tier: "common",
                    type: "boots"
                }
            },
            skills: [
                "wield-axe",
                "wield-sword",
                "wield-knife",
                "wield-dagger",
                "wield-bow",
                "wield-crossbow",
                "wield-staff"
            ]
        })
    );

    const finalizedRef = useRef(
        new Subject<ICharacterCreationDetails>()
    );

    const contextValue: ICharacterCreationContext = {
        detailsChanged: detailsRef.current,
        finished: finalizedRef.current,
        getDetails: () => detailsRef.current.value,
        updateDetails: (d: ICharacterCreationDetails) => detailsRef.current.next(d),
        finalizeDetails: (d: ICharacterCreationDetails) => {
            localStorage.setItem("game.character", JSON.stringify(d));
            finalizedRef.current.next(d);
        }
    };

    return <CharacterCreationProvider value={contextValue}>
        {props.children}
    </CharacterCreationProvider>
}