# Internals of The Crooked Tankard

> This document contains **technical language**.
>
> It describes the internal details of how the game works, and how the AI is used in the game.

## AI Task Summary Table

The following table summarizes how _AI is used_ in the game to _generate content_.

| Task | Description | Status | Source |
| --- | --- | --- | --- |
| **Generate Item Name** | Given the characteristics of an item, and a general name, generate a new concrete name for the item (e.g. `Household Item` -> `Wooden Bucket`) | **Deployed** | [ItemDetailGenerator.tsx](../packages/app-game/src/ai/ItemDetailGenerator.tsx) |
| **Interpret Command** | Given the user's text command, and the available actions, parse the command into a game action | **Working, but not deployed** | [CommandInterpreter.tsx](../packages/app-game/src/ai/CommandInterpreter.tsx) |
| **Generate Location Name** | Given the characteristics of a location, and a general name, generate a new concrete name for the location (e.g. `Forest` -> `Misty Woods`) | **Deployed** | [WorldNodeDetailGenerator2.tsx](../packages/app-game/src/ai/WorldNodeDetailGenerator2.tsx) |
| **Generate Location Name (old)** | Older version of the location name generator | **Working, but not deployed** | [WorldNodeDetailGenerator.tsx](../packages/app-game/src/ai/WorldNodeDetailGenerator.tsx) |
| **Trade Responder** | Given the outcome of a trade (accepted / declined), generate a message to the player | **Deployed** | [NpcTradeResponder2.tsx](../packages/app-game/src/ai/NpcTradeResponder2.tsx) |
| **Trade Responder (old)** | Given the items and gold involved in a trade, decide whether to accept the trade, and generate a response message | **Not working, not deployed** | [NpcTradeResponder.tsx](../packages/app-game/src/ai/NpcTradeResponder.tsx) |
| **Ask Responder** | Given the knowledge of an NPC, generate a reply message to a user question | **Deployed** | [NpcAskResponder.tsx](../packages/app-game/src/ai/NpcAskResponder.tsx) |
| **Quest Describer** | Given the conditions and rewards of a quest, generate a fitting description | **Deployed** | [QuestDescriber.tsx](../packages/app-game/src/ai/QuestDescriber.tsx) |
| **Event Narrator** | Given a list of game events in a turn, generate a narration for the turn | **Deployed** | [EventNarrator2.tsx](../packages/app-game/src/ai/EventNarrator2.tsx) |
| **Event Narrator (old)** | Given a single game event, generate a narration for it | **Working, but not deployed** | [EventNarrator.tsx](../packages/app-game/src/ai/EventNarrator.tsx) |
| **Turn Headline Writer** | Given the narration of a turn, generate a headline for the turn | **Deployed** | [TurnHeadlineWriter.tsx](../packages/app-game/src/ai/TurnHeadlineWriter.tsx) |
| **Weapon Specializer** | Given a name, and a specialized weapon type, generate a new name for the weapon (e.g. `Icy Staff` + `crossbow` type -> `Icy Crossbow`) | **Deployed** | [WeaponSpecializer.tsx](../packages/app-game/src/ai/WeaponSpecializer.tsx) |
| **Wearable Specializer** | Given a name, and a specialized wearable type, generate a new name for the wearable (e.g. `Jade Necklace` + `belt` type -> `Jade Belt`) | **Deployed** | [WearableSpecializer.tsx](../packages/app-game/src/ai/WearableSpecializer.tsx) |
| **Effect Namer** | Given an item effect, generate a name for the effect | **Deployed** | [EffectNamer.tsx](../packages/app-game/src/ai/EffectNamer.tsx) |
| **Crafting Generator** | Given the input items, and "prototypes" of the output, generate the concrete output items of a crafting action | **Deployed** | [CraftingGenerator.tsx](../packages/app-game/src/ai/CraftingGenerator.tsx) |

## The Game Loop

The game is divided into _turns_. Each turn consists of _events_, and in each turn, the _first event_ is the _action taken by the player_.

After an action is taken, the UI is _locked_, and the _game simulation_ begins. This produces further events, and potential chain reactions. Each turn ends with an _end turn event_.

After an end turn event is received, the UI is _unlocked_, and _updated_.

See [`WorldHistoryHappening`](../packages/app-game/src/model/world.enums.tsx) for the types of events that can happen in the game.

See the [`simulation`](../packages/app-game/src/components/simulation/) folder for the simulation logic.

## Locations in the world

The game level is a _graph_ of _nodes_ ([`IWorldNode`](../packages/app-game/src/context/World.context.tsx)). Each node represents a _location_ in the game world.

There are also _edges_ ([`IWorldEdge`](../packages/app-game/src/context/World.context.tsx)) between the nodes, representing _paths_ between locations. Each _edge_ has a _distance_ associated with it. For close locations (like a room in a building) the distance is a small number, for far locations (like a city to a forest) the distance is a large number.

Each location has an _area type_ (see [`WorldNodeAreaType`](../packages/app-game/src/model/world.enums.tsx)), which determines the _type of location_ it is.

Locations also have a random generated _humidity_ (see [`WorldNodeHumidity`](../packages/app-game/src/model/world.enums.tsx)), and _temperature_ (see [`WorldNodeTemperature`](../packages/app-game/src/model/world.enums.tsx)).

Based on the _area type_ of a location node, it may be further _specialized_. See [`WorldNodeWildernessType`](../packages/app-game/src/model/world.enums.tsx), [`WorldNodeSettlementType`](../packages/app-game/src/model/world.enums.tsx), [`WorldNodeStreetType`](../packages/app-game/src/model/world.enums.tsx), [`WorldNodeBuildingType`](../packages/app-game/src/model/world.enums.tsx) and [`WorldNodeRoomType`](../packages/app-game/src/model/world.enums.tsx).

Locations may contain _items_, that can be looted from the place. They may also contain NPCs, who the player can interact with.

You can _travel_ to another location, if there is a direct path between the current location and the target location.

The [`WorldGenerator2`](../packages/app-game/src/components/world2/WorldGenerator2.tsx) component is responsible for generating the world graph:

* First, we generate the `root` node, called _The Middle of Nowhere_. This is a _scorching hot_ and _dry_ volcanic area, connecting top-level wilderness locations.
* Then, we iteratively apply `populatorType: "children"` _populators_ to create new and new child nodes. This creates longer roads and chains of wilderness, but also populates villages, buildings, rooms, etc.
* Then, we apply all remaining `populatorType: "children"` rules to finish _unfinished buildings, rooms, etc_. We now have all nodes ready.
* Finally, we apply `populatorType: <> "children"` rules to place items and NPCs in the world.

Which populators are applied to which nodes is determined by the _generation rules_, which are created separately from populators.

See [`.projor/data/populators`](../.projor/data/populators) for the populators, and [`.projor/data/generation-rules`](../.projor/data/rules) for the generation rules.

## Non Player Characters

NPCs are _characters_ in the game that are _not controlled by the player_.

They have a _race_ (see [`WorldNpcRace`](../packages/app-game/src/model/world.enums.tsx)), but most NPCs are _human_ or _animal_.

They also have a _stance_ (see [`WorldNpcStance`](../packages/app-game/src/model/world.enums.tsx)), which determines their _attitude_ towards the player. They can be _friendly_, _neutral_, or _hostile_.

The player can _talk to_ friendly NPCs. During talking, the player may _ask questions_, offer _trades_, or _offer their help_ (which generates quests).

NPCs can trade items that they have in their inventory. The starting characteristics of an NPC are defined in `populatorType: "npc"` populators.

## Items

Items are _objects_ in the game that can be _picked up_ and _used_ by the player.

Each item has a _type_ (see [`WorldItemType`](../packages/app-game/src/model/world.enums.tsx)), which determines what the item is, and what it can be used for.

Items also have a _tier_ (see [`WorldItemTier`](../packages/app-game/src/model/world.enums.tsx)), which determines the _quality_ of the item. Higher tier items are _better_ than lower tier items, and have _better stats_ and _effects_. They also are valued _more_ by NPCs.

The characteristics of an item are defined in `populatorType: "item"` populators.
