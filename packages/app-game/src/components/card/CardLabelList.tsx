import classNames from "classnames"
import { useState } from "react";
import { TooltipText } from "../TooltipText";
import { ActionText } from "../ActionText";

function Label(labelProps: {
    color: "green" | "orange" | "red" | "blue" | "purple" | "neutral" | "black",
    children: any,
    tooltip?: any,
    actions?: any
}) {

    const [tooltipVisible, setTooltipVisible] = useState(false);

    const cn = classNames(
        "flex flex-row justify-start items-center gap-1 text-xs px-2 py-1 uppercase rounded-full font-bold",
        {
            "bg-green-500 text-white": labelProps.color === "green",
            "bg-orange-500 text-white": labelProps.color === "orange",
            "bg-red-500 text-white": labelProps.color === "red",
            "bg-blue-500 text-white": labelProps.color === "blue",
            "bg-purple-500 text-white": labelProps.color === "purple",
            "bg-neutral-500 text-white": labelProps.color === "neutral",
            "bg-black text-white": labelProps.color === "black",
        }
    );

    const tooltipCn = classNames(
        "w-64 absolute z-10 top-8 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 bg-white rounded-lg p-2 flex flex-col justify-start items-start gap-2 shadow-sm",
        "pointer-events-none",
        {
            "hidden": !tooltipVisible,
        }
    );

    return <>
        <TooltipText tooltip={labelProps.tooltip}>
            <ActionText actions={labelProps.actions}>
                <div className={cn}>
                    {labelProps.children}
                </div>
            </ActionText>
        </TooltipText>
    </>;
}


export function CardLabelList(
    props: {
        value: Array<{
            color: "green" | "orange" | "red" | "blue" | "purple" | "neutral" | "black",
            label: string,
            tooltip?: any,
            actions?: any
        }>
    }
) {

    if (props.value.length === 0) {
        return <></>;
    }

    return <>
        <div className="flex flex-row gap-2 flex-wrap">
            {
                props.value.map(
                    (label, index) => (
                        <Label color={label.color} key={index} tooltip={label.tooltip} actions={label.actions}>
                            {label.label}
                        </Label>
                    )
                )
            }
        </div>
    </>
}