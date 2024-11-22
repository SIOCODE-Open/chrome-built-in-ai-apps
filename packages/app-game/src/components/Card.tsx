import classNames from "classnames"

export function Card(
    props: {
        children?: any
    }
) {
    const cn = classNames(
        "flex flex-col justify-start items-start",
        "gap-2 p-2",
        "border dark:border-neutral-700 border-neutral-300 rounded-lg",
    );

    return <div className={cn}>
        {props.children}
    </div>
}