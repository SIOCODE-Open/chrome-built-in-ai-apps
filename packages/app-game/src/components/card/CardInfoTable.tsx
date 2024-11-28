import { TooltipText } from "../TooltipText"

export function CardInfoTable(
    props: {
        value: Record<string, any>
        tooltips?: Record<string, any>
    }
) {
    return <>
        <div className="w-full flex flex-col justify-start items-start gap-1">
            {
                props.tooltips && Object.keys(props.value).map(
                    (key, index) => (
                        <div key={index} className="w-full grid grid-cols-2 gap-1">
                            <div className="text-sm font-normal text-left uppercase text-neutral-500">
                                <TooltipText tooltip={props.tooltips[key]}>
                                    {key}
                                </TooltipText>
                            </div>
                            <div className="text-sm font-bold text-right text-black">{props.value[key]}</div>
                        </div>
                    )
                )
            }
            {
                !props.tooltips && Object.keys(props.value).map(
                    (key, index) => (<div className="w-full grid grid-cols-2 gap-1" key={index}>
                        <div className="text-sm font-normal text-left uppercase text-neutral-500">{key}</div>
                        <div className="text-sm font-bold text-right">{props.value[key]}</div>
                    </div>)
                )
            }
        </div>
    </>
}