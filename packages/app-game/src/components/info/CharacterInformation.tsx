import { useEffect, useReducer, useState } from "react";
import { IPlayerCharacter, IPlayerHunger, IPlayerThirst, usePlayer } from "../../context/Player.context";
import { Card } from "../Card";
import { CardInfoTable } from "../card/CardInfoTable";
import { CardLabelList } from "../card/CardLabelList";
import { CardTitle } from "../card/CardTitle";
import { WORLD_PLAYER_CLASS_DESCRIPTIONS, WORLD_PLAYER_CLASS_DISPLAYS, WORLD_PLAYER_HEALTH_DESCRIPTIONS, WORLD_PLAYER_HEALTH_DISPLAYS, WORLD_PLAYER_HUNGER_DESCRIPTIONS, WORLD_PLAYER_HUNGER_DISPLAYS, WORLD_PLAYER_THIRST_DESCRIPTIONS, WORLD_PLAYER_THIRST_DISPLAYS, WorldPlayerClass, WorldPlayerHealth, WorldPlayerHunger, WorldPlayerThirst } from "../../model/world.enums";
import { TooltipText } from "../TooltipText";
import { ICharacterHealth } from "../../context/World.context";
import { HealthTooltip } from "../tooltips/HealthTooltip";

export function CharacterInformation(props: any) {

    const [character, setCharacter] = useState<IPlayerCharacter>(null);
    const [health, setHealth] = useState<ICharacterHealth>(null);
    const [hunger, setHunger] = useState<IPlayerHunger>(null);
    const [thirst, setThirst] = useState<IPlayerThirst>(null);
    const [labels, setLabels] = useState<Array<any>>([]);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const player = usePlayer();

    useEffect(
        () => {
            const subs = [
                player.playerCharacter.subscribe(
                    character => {
                        setCharacter(character);
                        forceUpdate();
                    }
                ),
                player.playerHealth.subscribe(
                    health => {
                        setHealth(health);
                        forceUpdate();
                    }
                ),
                player.playerHunger.subscribe(
                    hunger => {
                        setHunger(hunger);
                        forceUpdate();
                    }
                ),
                player.playerThirst.subscribe(
                    thirst => {
                        setThirst(thirst);
                        forceUpdate();
                    }
                ),
            ];
            return () => subs.forEach(s => s.unsubscribe());
        },
        []
    );

    const displayHealth = (h: ICharacterHealth) => {
        const { status } = h;
        return <TooltipText tooltip={<HealthTooltip value={h} />}>
            {WORLD_PLAYER_HEALTH_DISPLAYS[status]}
        </TooltipText>;
    };

    const displayHunger = (status: WorldPlayerHunger) => {
        return <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_PLAYER_HUNGER_DESCRIPTIONS[status]}</span>}>
            {WORLD_PLAYER_HUNGER_DISPLAYS[status]}
        </TooltipText>;
    };

    const displayThirst = (status: WorldPlayerThirst) => {
        return <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_PLAYER_THIRST_DESCRIPTIONS[status]}</span>}>
            {WORLD_PLAYER_THIRST_DISPLAYS[status]}
        </TooltipText>;
    };

    const displayClass = (characterClass: WorldPlayerClass) => {
        return <TooltipText tooltip={<span className="text-xs font-normal italic text-left">{WORLD_PLAYER_CLASS_DESCRIPTIONS[characterClass]}</span>}>
            {WORLD_PLAYER_CLASS_DISPLAYS[characterClass]}
        </TooltipText>;
    };

    return <>
        {
            character && health && hunger && thirst && <Card>
                <CardTitle>You</CardTitle>
                <CardInfoTable value={{
                    "Name": character.name,
                    "Class": displayClass(character.characterClass),
                    "Health": displayHealth(health),
                    "Hunger": displayHunger(hunger.status),
                    "Thirst": displayThirst(thirst.status)
                }} />
                <CardLabelList value={labels} />
            </Card>
        }
    </>;
}