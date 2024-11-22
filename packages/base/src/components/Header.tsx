import classNames from "classnames";
import { HeaderModelSelect } from "./header/HeaderModelSelect";

export interface IHeaderProps {
    middle?: any;
    right?: any;
}

export function Header(
    props: any
) {

    const containerDivCn = classNames(
        "w-full h-8 grid grid-cols-3 shrink-0",
        "dark:bg-neutral-800 dark:text-white bg-neutral-100 text-black",
    );

    const leftContainerDivCn = classNames(
        "flex flex-row justify-start items-center px-2 gap-2 grow",
    );

    const middleContainerDivCn = classNames(
        "flex flex-row justify-center items-center px-2 gap-2 grow",
    );

    const rightContainerDivCn = classNames(
        "flex flex-row justify-end items-center px-2 gap-2 grow",
    );

    return <>
        <div className={containerDivCn}>
            <div className={leftContainerDivCn}>
                <HeaderModelSelect />
            </div>
            <div className={middleContainerDivCn}>
                {props.middle}
            </div>
            <div className={rightContainerDivCn}>
                {props.right}
            </div>
        </div>
    </>;
}