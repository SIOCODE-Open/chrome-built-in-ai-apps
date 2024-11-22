export function CardTitle(
    props: {
        children?: any
    }
) {
    return <>
        <div className="text-sm text-neutral-500 uppercase">
            {props.children}
        </div>
    </>
}