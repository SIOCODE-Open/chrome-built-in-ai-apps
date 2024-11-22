import { createRoot } from "react-dom/client";
import { AppGame } from "./components/AppGame";

const root = createRoot(document.getElementById("root"));
root.render(
    <AppGame />
);