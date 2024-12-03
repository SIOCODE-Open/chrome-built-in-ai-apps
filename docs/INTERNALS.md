# Internals of The Crooked Tankard

> This document contains **technical language**.
>
> It describes the internal details of how the game works, and how the AI is used in the game.

## AI Task Summary Table

The following table summarizes how _AI is used_ in the game to _generate content_.

| Task | Description | Status | Source |
| --- | --- | --- | --- |
| Generate item name | Given the characteristics of an item, and a general name, generate a new concrete name for the item (e.g. `Household Item` -> `Wooden Bucket`) | **Deployed** | [ItemDetailGenerator.tsx](../packages/app-game/src/ai/ItemDetailGenerator.tsx) |

## The Game Loop

The game is divided into _turns_. Each turn consists of _events_, and in each turn, the _first event_ is the _action taken by the player_.

After an action is taken, the UI is _locked_, and the _game simulation_ begins. This produces further events, and potential chain reactions. Each turn ends with an _end turn event_.

After an end turn event is received, the UI is _unlocked_, and _updated_.

