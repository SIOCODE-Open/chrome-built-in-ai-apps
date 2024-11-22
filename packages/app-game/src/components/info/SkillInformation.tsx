import { useEffect, useReducer, useState } from "react";
import { Card } from "../Card";
import { CardInfoTable } from "../card/CardInfoTable";
import { CardLabelList } from "../card/CardLabelList";
import { CardTitle } from "../card/CardTitle";
import { usePlayer } from "../../context/Player.context";
import { WORLD_PLAYER_SKILL_DESCRIPTIONS, WORLD_PLAYER_SKILL_DISPLAYS } from "../../model/world.enums";

export function SkillInformation(props: any) {

    const [skills, setSkills] = useState([]);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const player = usePlayer();

    useEffect(
        () => {
            const subs = [
                player.playerSkills.subscribe(
                    skills => {
                        setSkills(skills.skills);
                        forceUpdate();
                    }
                ),
            ];
            return () => subs.forEach(s => s.unsubscribe());
        },
        []
    );

    const skillLabels = [];
    for (const skill of skills) {
        skillLabels.push({
            color: "neutral",
            label: WORLD_PLAYER_SKILL_DISPLAYS[skill],
            tooltip: <>
                <span className="text-xs font-normal italic text-left">
                    {WORLD_PLAYER_SKILL_DESCRIPTIONS[skill]}
                </span>
            </>
        });
    }

    return <>
        <Card>
            <CardTitle>Skills</CardTitle>
            <CardInfoTable value={{
                "Number of skills": skills.length,
            }} />
            <CardLabelList value={skillLabels} />
        </Card>
    </>;
}