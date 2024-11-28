import classNames from "classnames";
import { Card } from "../Card";
import { CardTitle } from "../card/CardTitle";
import { usePlayer } from "../../context/Player.context";
import { IWorldNode, useWorld } from "../../context/World.context";
import { usePlayerActions } from "../../context/PlayerActions.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { CommandInterpreter } from "../../ai/CommandInterpreter";
import { useLanguageModel } from "@siocode/base";
import { useCommand } from "../../context/Command.context";
import { useEffect, useRef, useState } from "react";
import { aiDisplayEvent } from "../../ai/display";
import { EventNarrator } from "../../ai/EventNarrator";
import * as worldenums from "../../model/world.enums";
import { LocationTooltip } from "../tooltips/LocationTooltip";
import { CardInfoTable } from "../card/CardInfoTable";
import { useGameSimulation } from "../../context/GameSimulation.context";

function DebugTeleport(
    props: any
) {

    const [hasTypeFilter, setHasTypeFilter] = useState("");
    const [hasWildernessTypeFilter, setHasWildernessTypeFilter] = useState("");
    const [hasSettlementTypeFilter, setHasSettlementTypeFilter] = useState("");
    const [hasBuildingTypeFilter, setHasBuildingTypeFilter] = useState("");
    const [hasRoomTypeFilter, setHasRoomTypeFilter] = useState("");
    const [hasStreetTypeFilter, setHasStreetTypeFilter] = useState("");
    const [hasLabelFilter, setHasLabelFilter] = useState("");
    const [filterResult, setFilterResult] = useState([]);

    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const filterNode = (node: IWorldNode) => {
        if (hasTypeFilter && hasTypeFilter.length > 0 && node.type !== hasTypeFilter) return false;
        if (hasWildernessTypeFilter && hasWildernessTypeFilter.length) {
            if (!node.wilderness) return false;
            if (node.wilderness.wildernessType !== hasWildernessTypeFilter) return false;
        }
        if (hasSettlementTypeFilter && hasSettlementTypeFilter.length) {
            if (!node.settlement) return false;
            if (node.settlement.settlementType !== hasSettlementTypeFilter) return false;
        }
        if (hasBuildingTypeFilter && hasBuildingTypeFilter.length) {
            if (!node.building) return false;
            if (node.building.buildingType !== hasBuildingTypeFilter) return false;
        }
        if (hasRoomTypeFilter && hasRoomTypeFilter.length) {
            if (!node.room) return false;
            if (node.room.roomType !== hasRoomTypeFilter) return false;
        }
        if (hasStreetTypeFilter && hasStreetTypeFilter.length) {
            if (!node.street) return false;
            if (node.street.streetType !== hasStreetTypeFilter) return false;
        }
        if (hasLabelFilter && hasLabelFilter.length) {
            if (!node.labels.includes(hasLabelFilter)) return false;
        }
        return true;
    };

    const walkNodes = (root: IWorldNode, predicate: (node: IWorldNode) => boolean) => {

        if (!root) {
            return [];
        }

        const queue = [root];
        const visited = new Set([root.id]);
        const result = [];

        while (queue.length > 0) {
            const current = queue.shift();
            if (predicate(current)) {
                result.push(current);
            }

            for (const edge of current.outEdges) {
                if (!visited.has(edge.to.id)) {
                    visited.add(edge.to.id);
                    queue.push(edge.to);
                }
            }
        }

        return result;
    };

    const selectCn = classNames(
        "w-full rounded-full px-2 py-1 text-sm border border-neutral-300 text-black",
        "outline-none ring-none focus:outline-none focus:ring-none active:outline-none active:ring-none"
    );

    const inputCn = classNames(
        "w-full rounded-full px-2 py-1 text-sm border border-neutral-300 text-black",
        "outline-none ring-none focus:outline-none focus:ring-none active:outline-none active:ring-none"
    );

    const typeFilter = <select value={hasTypeFilter} onChange={e => setHasTypeFilter(e.target.value)} className={selectCn}>
        <option value="">Node type ...</option>
        {
            worldenums.WORLD_NODE_AREA_TYPE.map(
                (areaType, index) => <option key={index} value={areaType}>{areaType}</option>
            )
        }
    </select>;

    const wildernessTypeFilter = <select value={hasWildernessTypeFilter} onChange={e => setHasWildernessTypeFilter(e.target.value)} className={selectCn}>
        <option value="">Wilderness type ...</option>
        {
            worldenums.WORLD_NODE_WILDERNESS_TYPE.map(
                (wildernessType, index) => <option key={index} value={wildernessType}>{wildernessType}</option>
            )
        }
    </select>;

    const settlementTypeFilter = <select value={hasSettlementTypeFilter} onChange={e => setHasSettlementTypeFilter(e.target.value)} className={selectCn}>
        <option value="">Settlement type ...</option>
        {
            worldenums.WORLD_NODE_SETTLEMENT_TYPE.map(
                (settlementType, index) => <option key={index} value={settlementType}>{settlementType}</option>
            )
        }
    </select>;

    const buildingTypeFilter = <select value={hasBuildingTypeFilter} onChange={e => setHasBuildingTypeFilter(e.target.value)} className={selectCn}>
        <option value="">Building type ...</option>
        {
            worldenums.WORLD_NODE_BUILDING_TYPE.map(
                (buildingType, index) => <option key={index} value={buildingType}>{buildingType}</option>
            )
        }
    </select>;

    const roomTypeFilter = <select value={hasRoomTypeFilter} onChange={e => setHasRoomTypeFilter(e.target.value)} className={selectCn}>
        <option value="">Room type ...</option>
        {
            worldenums.WORLD_NODE_ROOM_TYPE.map(
                (roomType, index) => <option key={index} value={roomType}>{roomType}</option>
            )
        }
    </select>;

    const streetTypeFilter = <select value={hasStreetTypeFilter} onChange={e => setHasStreetTypeFilter(e.target.value)} className={selectCn}>
        <option value="">Street type ...</option>
        {
            worldenums.WORLD_NODE_STREET_TYPE.map(
                (streetType, index) => <option key={index} value={streetType}>{streetType}</option>
            )
        }
    </select>;

    const labelFilter = <input type="text" placeholder="Label" value={hasLabelFilter} onChange={e => setHasLabelFilter(e.target.value)} className={inputCn} />;

    const firstTenResults = filterResult.slice(0, 10);

    const onTeleportToNode = (node: IWorldNode) => {
        player.updatePlayerLocation(node);
        history.noop("You activate magical DEVELOPER SUPERPOWERS, and teleport to a distant location.")
        history.arrive(node);
        sim.start();
    };

    const resultTable = {};
    const resultTooltips = {};
    for (const node of firstTenResults) {
        resultTable[node.id] = <button onClick={() => onTeleportToNode(node)}>Teleport</button>;
        resultTooltips[node.id] = <LocationTooltip value={node} />;
    };

    useEffect(
        () => {
            const result = walkNodes(player.getPlayerLocation(), filterNode);
            setFilterResult(result);
        },
        [hasTypeFilter, hasWildernessTypeFilter, hasSettlementTypeFilter, hasBuildingTypeFilter, hasRoomTypeFilter, hasStreetTypeFilter, hasLabelFilter]
    );

    useEffect(
        () => {
            const subs = [
                player.playerLocation.subscribe(
                    (newLoc) => {
                        const result = walkNodes(newLoc, filterNode);
                        setFilterResult(result);
                    }
                )
            ];
            return () => {
                subs.forEach(sub => sub.unsubscribe());
            };
        },
        []
    );

    return <>
        {typeFilter}
        {wildernessTypeFilter}
        {settlementTypeFilter}
        {buildingTypeFilter}
        {roomTypeFilter}
        {streetTypeFilter}
        {labelFilter}
        <CardInfoTable value={resultTable} tooltips={resultTooltips} />
    </>

}

export function DebugInformation(props: any) {

    const player = usePlayer();
    const world = useWorld();
    const actions = usePlayerActions();
    const history = useHistory();
    const lm = useLanguageModel();
    const commander = useCommand();

    return <>
        <Card>
            <CardTitle>Debug</CardTitle>

            <DebugTeleport />
        </Card>
    </>;
}