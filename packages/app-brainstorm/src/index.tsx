import { createRoot } from "react-dom/client";
import { App } from "@siocode/base";
import classNames from "classnames";
import { ScratchPad } from "./components/ScratchPad";
import { Brainstorm } from "./components/Brainstorm";
import { AppProject } from "./components/AppProject";
import { HeaderControlButtons } from "./components/header/HeaderControlButtons";

function AppContent() {

    return <>
        <ScratchPad />
        <Brainstorm />
    </>;
}

const root = createRoot(document.getElementById("root"));
root.render(
    <AppProject>
        <App headerMiddle={"Version 0.0.1"}
            headerRight={<HeaderControlButtons />}
            contentClassName="grid grid-cols-2 grow overflow-hidden">
            <AppContent />
        </App>
    </AppProject>
);