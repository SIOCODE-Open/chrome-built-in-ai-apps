import classNames from "classnames";
import { createRef, useEffect, useState } from "react";

export function TooltipText(
    props: {
        children: any;
        tooltip?: any;
    }
) {

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const tooltipDivRef = createRef<HTMLDivElement>();

    const tooltipCn = classNames(
        "w-64 absolute z-10 top-8 left-0 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 bg-white rounded-lg p-2 flex flex-col justify-start items-start gap-2 shadow-sm",
        "pointer-events-none",
        {
            "opacity-0": !tooltipVisible,
        }
    );

    const onTooltipMouseEnter = () => {
        setTooltipVisible(true);
    };
    const onTooltipMouseLeave = () => {
        setTooltipVisible(false);
    };

    const onTooltipRectUpdate = () => {
        // Check if the tooltip is out of window bounds on X axis
        if (tooltipDivRef.current) {
            const tooltipRect = tooltipDivRef.current.getBoundingClientRect();
            console.log(tooltipRect.right, window.innerWidth - 30);
            if (tooltipRect.right > window.innerWidth - 30) {
                // Move the tooltip to the left by the difference
                tooltipDivRef.current.style.transform = `translateX(-${(tooltipRect.right - window.innerWidth) + 30}px)`;
            }
        }

    };

    useEffect(
        () => {
            if (tooltipDivRef.current) {
                const observer = new ResizeObserver(onTooltipRectUpdate);
                observer.observe(tooltipDivRef.current);

                return () => observer.disconnect();
            }
        },
        []
    );

    return <>
        <div className="relative"
            onMouseEnter={onTooltipMouseEnter}
            onMouseLeave={onTooltipMouseLeave}>
            {props.children}
            {
                props.tooltip && <div className={tooltipCn} ref={tooltipDivRef}>
                    {props.tooltip}
                </div>
            }
        </div>
    </>;
}