import { INonPlayerCharacter } from "../../context/World.context";
import { NpcActions } from "../actions/NpcActions";
import { NpcTooltip } from "../tooltips/NpcTooltip";

export function createNpcLabel(
    npc: INonPlayerCharacter,
    opts: any = {
        actions: [],
        onCancel: () => { },
        slot: null,
    }
) {
    const { actions } = opts;
    return {
        id: npc.id,
        label: <>
            {npc.name}
        </>,
        color: npc.stance === "friendly"
            ? "blue"
            : npc.stance === "neutral"
                ? "neutral"
                : npc.stance === "hostile"
                    ? "red"
                    : "black",
        count: 1,
        tooltip: <>
            <NpcTooltip value={npc} />
        </>,
        actions: <NpcActions value={npc}
            talk={actions.includes("talk")}
            attack={actions.includes("attack")}
        />
    }
}