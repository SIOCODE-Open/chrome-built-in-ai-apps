import { useEffect, useRef, useState } from "react";
import { ICharacterHealth } from "../../context/World.context";
import { WORLD_PLAYER_HEALTH_DESCRIPTIONS } from "../../model/world.enums";

function HealthBar(
    props: {
        points: number,
        max: number
    }
) {

    const containerRef = useRef<HTMLDivElement>(null);

    const [greenWidth, setGreenWidth] = useState(0);
    const [redWidth, setRedWidth] = useState(0);

    useEffect(
        () => {
            if (!containerRef.current) {
                console.error("HealthBar: containerRef is null");
                return;
            }

            const containerWidth = containerRef.current.clientWidth;
            const gw = (props.points / props.max) * containerWidth;
            const rw = containerWidth - gw;

            setGreenWidth(gw);
            setRedWidth(rw);
        },
        [props.points, props.max]
    );

    return <div className="relative w-full h-6" ref={containerRef}>

        <div className="absolute top-0 left-0 h-full rounded-l-full bg-green-500"
            style={{ width: greenWidth }}>
        </div>
        <div className="absolute top-0 right-0 h-full rounded-r-full bg-red-500"
            style={{ width: redWidth }}>
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center">
            <span className="text-xs font-bold text-white">{props.points} / {props.max}</span>
        </div>

    </div>

}

export function HealthTooltip(
    props: {
        value: ICharacterHealth
    }
) {
    const h = props.value;
    const { status, points, max } = h;

    return <>
        <HealthBar points={points} max={max} />
        <span className="text-xs font-normal italic text-left">{WORLD_PLAYER_HEALTH_DESCRIPTIONS[status]}</span>
    </>;
}