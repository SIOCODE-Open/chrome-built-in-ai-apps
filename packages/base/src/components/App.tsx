import classNames from "classnames";
import { AppLanguageModel } from "./AppLanguageModel";
import { Header } from "./Header";

export interface IAppProps {
    children?: any;
    headerMiddle?: any;
    headerRight?: any;
    contentClassName?: string;
}

export function App(
    props: IAppProps
) {

    const rootDivCn = classNames(
        "flex flex-col w-screen h-screen justify-stretch items-stretch",
        "overflow-hidden"
    );

    const contentDivCn = props.contentClassName || classNames(
        "flex flex-col justify-center items-center grow overflow-hidden",
    );

    return <>
        <AppLanguageModel>

            <div className={rootDivCn}>

                {<Header middle={props.headerMiddle} right={props.headerRight} />}

                <div className={contentDivCn}>
                    {props.children}
                </div>

            </div>

        </AppLanguageModel>
    </>
}