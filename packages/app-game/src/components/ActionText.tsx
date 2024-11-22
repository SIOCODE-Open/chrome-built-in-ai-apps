import classNames from "classnames";
import { createRef, useEffect, useReducer, useRef, useState } from "react";

export function ActionText(
    props: {
        actions: any;
        children?: any;
    }
) {

    const containerRef = useRef<HTMLDivElement>();
    const [isVisible, setIsVisible] = useState(false);
    const visibleRef = useRef(false);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);
    const [visibleX, setVisibleX] = useState(0);
    const [visibleY, setVisibleY] = useState(0);
    const visibleCoordsRef = useRef({ x: 0, y: 0 });
    const hideTimeoutRef = useRef<any>(null);

    const mouseMovedRef = useRef(
        (e: MouseEvent) => {

            if (!containerRef.current) {
                console.warn("MOVED No container ref");
                window.removeEventListener("mousemove", mouseMovedRef.current);
                return;
            }

            if (!visibleRef.current) {
                return;
            }

            const distance = Math.sqrt(
                Math.pow(e.clientX - visibleCoordsRef.current.x, 2) +
                Math.pow(e.clientY - visibleCoordsRef.current.y, 2)
            );

            if (distance > 250) {
                setIsVisible(false);
                visibleRef.current = false;
            };

        }
    );

    const mouseClickedRef = useRef(
        (e: MouseEvent) => {

            if (!containerRef.current) {
                console.warn("CLICKED No container ref");
                window.removeEventListener("click", mouseClickedRef.current);
                return;
            }

            // See if click was inside the container
            const isInside = containerRef.current.contains(e.target as Node);

            if (visibleRef.current) {
                if (!isInside) {
                    setIsVisible(false);
                    visibleRef.current = false;
                    if (hideTimeoutRef.current) {
                        clearTimeout(hideTimeoutRef.current);
                    }
                    forceUpdate();
                }
            } else {
                if (isInside) {
                    setIsVisible(true);
                    visibleRef.current = true;
                    const newX = (e.clientX + ((window.innerWidth - e.clientX) < 100 ? (-100) : 10));
                    const newY = (e.clientY - 20);
                    visibleCoordsRef.current = { x: newX, y: newY };
                    setVisibleX(newX);
                    setVisibleY(newY);
                    if (hideTimeoutRef.current) {
                        clearTimeout(hideTimeoutRef.current);
                    }
                    hideTimeoutRef.current = setTimeout(() => {
                        setIsVisible(false);
                        visibleRef.current = false;
                    }, 10000);
                    console.log("Setting visible");
                    forceUpdate();
                }
            };

        }
    );

    const actionsCn = classNames(
        "fixed z-20 top-0 left-0 flex flex-row justify-start items-center gap-2",
        "p-2 rounded-full shadow-sm dark:bg-neutral-800 bg-white",
        "border border-neutral-200 dark:border-neutral-700",
        {
            "hidden": !isVisible,
        }
    );

    const actionsStyle = {
        top: visibleY,
        left: visibleX
    };

    useEffect(
        () => {
            window.addEventListener("mousemove", mouseMovedRef.current);
            return () => window.removeEventListener("mousemove", mouseMovedRef.current);
        },
        []
    );

    useEffect(
        () => {
            window.addEventListener("click", mouseClickedRef.current);
            return () => window.removeEventListener("click", mouseClickedRef.current);
        },
        []
    );

    return <>
        <div ref={containerRef} className="relative">
            {props.children}
        </div>
        <div className={actionsCn} style={actionsStyle}>
            {props.actions}
        </div>
    </>;

}