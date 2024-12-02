import { INonPlayerCharacter, IWorldNode } from "../../context/World.context";
import { LocationActions } from "../actions/LocationActions";
import { NpcActions } from "../actions/NpcActions";
import { LocationTooltip } from "../tooltips/LocationTooltip";
import { NpcTooltip } from "../tooltips/NpcTooltip";

export function createLocationLabel(
    loc: IWorldNode,
    opts: any = {
    }
) {
    return {
        id: loc.id,
        label: <>
            {loc.name}
        </>,
        color: "neutral",
        tooltip: <LocationTooltip value={loc} />,
        actions: <LocationActions value={loc} navigate />
    }
}