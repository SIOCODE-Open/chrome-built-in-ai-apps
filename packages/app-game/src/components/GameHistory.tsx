import { useRef } from "react";
import { HistoryProvider, IGameEvent, IGameTime, IHistoryContext } from "../context/History.context";
import { Subject } from "rxjs";
import { WORLD_HISTORY_HAPPENING_DESCRIPTIONS, WORLD_PLAYER_WANDERING_ACTION_DESCRIPTIONS } from "../model/world.enums";

const secondToGameTime = (seconds: number): IGameTime => {
    const days = Math.floor(seconds / 60 / 60 / 24);
    seconds -= days * 60 * 60 * 24;
    const hours = Math.floor(seconds / 60 / 60);
    seconds -= hours * 60 * 60;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return {
        day: days,
        hour: hours,
        minute: minutes,
        second: seconds
    };
};

const gameTimeToSecond = (time: IGameTime): number => {
    return time.second + time.minute * 60 + time.hour * 60 * 60 + time.day * 60 * 60 * 24;
};

export function GameHistory(props: { children?: any }) {

    const eventId = useRef(0);

    const eventPublished = useRef(
        new Subject<IGameEvent>()
    );

    const epoch = useRef<IGameTime>(
        {
            day: 1,
            hour: 8,
            minute: 12,
            second: 15
        }
    );

    const now = useRef<number>(0);

    const ticked = useRef(
        new Subject<IGameTime>()
    );

    const cleared = useRef(
        new Subject<void>()
    );

    const turnEnded = useRef(
        new Subject<{ events: Array<IGameEvent>, endTurnEvent: IGameEvent }>()
    );

    const recentEvents = useRef<Array<IGameEvent>>([]);
    const thisTurnEvents = useRef<Array<IGameEvent>>([]);
    const allTurns = useRef<Array<{ events: Array<IGameEvent>, endTurnEvent: IGameEvent }>>([]);

    const contextValue: IHistoryContext = {
        eventPublished: eventPublished.current.asObservable(),
        ticked: ticked.current.asObservable(),
        turnEnded: turnEnded.current.asObservable(),
        epoch: () => epoch.current,
        now: () => {
            const epochT = epoch.current.second + epoch.current.minute * 60 + epoch.current.hour * 60 * 60 + epoch.current.day * 60 * 60 * 24;
            const nowT = now.current;
            return secondToGameTime(nowT + epochT);
        },
        t: () => now.current,
        publish: (origin, happening, notes, details) => {
            const event: IGameEvent = {
                id: eventId.current++,
                origin,
                time: contextValue.now(),
                happening,
                notes,
                details
            };
            eventPublished.current.next(event);

            recentEvents.current.push(event);
            recentEvents.current = recentEvents.current.slice(-4);

            thisTurnEvents.current.push(event);

            return event;
        },
        advanceTime: (deltaSeconds) => {
            now.current += deltaSeconds;
            ticked.current.next(contextValue.now());
            return contextValue.now();
        },
        getRecentEvents: () => recentEvents.current,
        getThisTurnEvents: () => thisTurnEvents.current,
        getAllTurns: () => allTurns.current,

        wakeUp: (where) => contextValue.publish(
            "story-teller",
            "wake-up",
            "You wake up in a dark room. You can't remember how you got here. In fact, you can't event remember who you are.",
            { location: where }
        ),
        actionLookAround: (where) => contextValue.publish(
            "player",
            "action-look-around",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-look-around"],
            { location: where }
        ),
        actionPickUp: (what) => contextValue.publish(
            "player",
            "action-pick-up",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-pick-up"],
            { item: what }
        ),
        actionDrop: (what) => contextValue.publish(
            "player",
            "action-drop",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-drop"],
            { item: what }
        ),
        actionEquip: (slot, what) => contextValue.publish(
            "player",
            "action-equip",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-equip"],
            { slot, item: what }
        ),
        actionUnequip: (slot, what) => contextValue.publish(
            "player",
            "action-unequip",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-unequip"],
            { slot, item: what }
        ),
        actionMove: (from, to, through) => contextValue.publish(
            "player",
            "action-move",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-move"],
            { from, to, through }
        ),
        actionSettle: (where) => contextValue.publish(
            "player",
            "action-settle-down",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-settle-down"],
            { location: where }
        ),
        actionTalk: (who, message) => contextValue.publish(
            "player",
            "action-talk",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-talk"],
            { npc: who, message }
        ),
        actionUseItem: (what) => contextValue.publish(
            "player",
            "action-use-item",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-use-item"],
            { item: what }
        ),
        actionFlee: () => contextValue.publish(
            "player",
            "action-flee",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-flee"],
            {}
        ),
        actionBuy: (from, what, cost) => contextValue.publish(
            "player",
            "action-buy",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-buy"],
            { npc: from, item: what, cost }
        ),
        actionSell: (to, what, cost) => contextValue.publish(
            "player",
            "action-sell",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-sell"],
            { npc: to, item: what, cost }
        ),
        actionLeave: () => contextValue.publish(
            "player",
            "action-leave",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-leave"],
            {}
        ),
        actionWork: () => contextValue.publish(
            "player",
            "action-work",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-work"],
            {}
        ),
        actionEat: (what) => contextValue.publish(
            "player",
            "action-eat",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-eat"],
            { item: what }
        ),
        actionDrink: (what) => contextValue.publish(
            "player",
            "action-drink",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-drink"],
            { item: what }
        ),
        actionHitTheRoad: (where) => contextValue.publish(
            "player",
            "action-hit-the-road",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-hit-the-road"],
            { location: where }
        ),
        actionAttack: (who) => contextValue.publish(
            "player",
            "action-attack",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-attack"],
            { npc: who }
        ),
        actionUnpack: (what) => contextValue.publish(
            "player",
            "action-unpack",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-unpack"],
            { item: what }
        ),
        actionCraft: (type, location, ingredients, tools) => contextValue.publish(
            "player",
            "action-craft",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-craft"],
            { craftingType: type, location, ingredients, tools }
        ),
        actionTrade: (npc, offered, want) => contextValue.publish(
            "player",
            "action-trade",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-trade"],
            { npc, offered, want }
        ),
        actionRest: () => contextValue.publish(
            "player",
            "action-rest",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-rest"],
            {}
        ),
        actionBeginQuest: () => contextValue.publish(
            "player",
            "action-begin-quest",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-begin-quest"],
            {}
        ),
        actionHandInQuest: () => contextValue.publish(
            "player",
            "action-hand-in-quest",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-hand-in-quest"],
            {}
        ),
        actionTellSecret: () => contextValue.publish(
            "player",
            "action-tell-secret",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["action-tell-secret"],
            {}
        ),
        actionOfferHelp: () => contextValue.publish(
            "player",
            "noop",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["noop"],
            {}
        ),

        npcTalk: (who, message) => contextValue.publish(
            "story-teller",
            "npc-talk",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["npc-talk"],
            { npc: who, message }
        ),
        npcAttack: (who) => contextValue.publish(
            "story-teller",
            "npc-attack",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["npc-attack"],
            { npc: who }
        ),

        getGold: (amount, notes) => contextValue.publish(
            "story-teller",
            "get-gold",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["get-gold"],
            { amount, notes }
        ),
        spendGold: (amount, notes) => contextValue.publish(
            "story-teller",
            "spend-gold",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["spend-gold"],
            { amount, notes }
        ),
        getItem: (item, notes) => contextValue.publish(
            "story-teller",
            "get-item",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["get-item"],
            { item, notes }
        ),
        loseItem: (item, notes) => contextValue.publish(
            "story-teller",
            "lose-item",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["lose-item"],
            { item, notes }
        ),
        changeHealth: (health) => contextValue.publish(
            "story-teller",
            "change-health",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["change-health"],
            { health }
        ),
        changeHunger: (hunger) => contextValue.publish(
            "story-teller",
            "change-hunger",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["change-hunger"],
            { hunger }
        ),
        changeThirst: (thirst) => contextValue.publish(
            "story-teller",
            "change-thirst",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["change-thirst"],
            { thirst }
        ),
        inflictDamage: (on, amount) => contextValue.publish(
            "story-teller",
            "inflict-damage",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["inflict-damage"],
            { npc: on, amount }
        ),
        takeDamage: (from, amount) => contextValue.publish(
            "story-teller",
            "take-damage",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["take-damage"],
            { npc: from, amount }
        ),
        takeDamageFromWorld: (amount) => contextValue.publish(
            "story-teller",
            "take-damage-from-world",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["take-damage-from-world"],
            { amount }
        ),
        arrive: (where) => contextValue.publish(
            "story-teller",
            "arrive",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["arrive"],
            { location: where }
        ),
        learnSkill: (skill) => contextValue.publish(
            "story-teller",
            "learn-skill",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["learn-skill"],
            { skill }
        ),
        discoverPath: (edge) => contextValue.publish(
            "story-teller",
            "discover-path",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["discover-path"],
            { edge, from: edge.from, to: edge.to }
        ),
        discoverItem: (item) => contextValue.publish(
            "story-teller",
            "discover-item",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["discover-item"],
            { item }
        ),
        discoverNpc: (npc) => contextValue.publish(
            "story-teller",
            "discover-npc",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["discover-npc"],
            { npc }
        ),
        noop: (notes) => contextValue.publish(
            "story-teller",
            "noop",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["noop"],
            { notes }
        ),
        consumeInventoryItem: (item) => contextValue.publish(
            "story-teller",
            "consume-inventory-item",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["consume-inventory-item"],
            { item }
        ),
        consumeLocationItem: (item, where) => contextValue.publish(
            "story-teller",
            "consume-location-item",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["consume-location-item"],
            { item, location: where }
        ),
        equipItem: (item, slot) => contextValue.publish(
            "story-teller",
            "equip-item",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["equip-item"],
            { item, slot }
        ),
        unequipItem: (item, slot) => contextValue.publish(
            "story-teller",
            "unequip-item",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["unequip-item"],
            { item, slot }
        ),
        unpackedItem: (item) => contextValue.publish(
            "story-teller",
            "unpacked-item",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["unpacked-item"],
            { item }
        ),
        changeSituation: (situation) => contextValue.publish(
            "story-teller",
            "change-situation",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["change-situation"],
            { situation }
        ),
        craftedItem: (item, notes) => contextValue.publish(
            "story-teller",
            "crafted-item",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["crafted-item"],
            { item, notes }
        ),
        startCombat: (npc) => contextValue.publish(
            "story-teller",
            "start-combat",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["start-combat"],
            { npc }
        ),
        startConversation: (npc) => contextValue.publish(
            "story-teller",
            "start-conversation",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["start-conversation"],
            { npc }
        ),
        defeatNpc: (npc) => contextValue.publish(
            "story-teller",
            "defeat-npc",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["defeat-npc"],
            { npc }
        ),
        die: (notes) => contextValue.publish(
            "story-teller",
            "die",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["die"],
            { notes }
        ),
        flee: (notes) => contextValue.publish(
            "story-teller",
            "flee",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["flee"],
            { notes }
        ),
        failFlee: (notes) => contextValue.publish(
            "story-teller",
            "fail-flee",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["fail-flee"],
            { notes }
        ),
        finishQuest: (quest, notes) => contextValue.publish(
            "story-teller",
            "finish-quest",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["finish-quest"],
            { quest, notes }
        ),
        beginQuest: (quest, notes) => contextValue.publish(
            "story-teller",
            "begin-quest",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["begin-quest"],
            { quest, notes }
        ),
        offeredQuest: (quest) => contextValue.publish(
            "story-teller",
            "offered-quest",
            WORLD_HISTORY_HAPPENING_DESCRIPTIONS["offered-quest"],
            { quest }
        ),

        endTurn: (turnNumber, notes, headline) => {
            const events = [...thisTurnEvents.current];

            const endTurnEvent = contextValue.publish(
                "world",
                "end-turn",
                notes,
                { turnNumber, events, notes, headline }
            );

            allTurns.current.push({ events, endTurnEvent });

            turnEnded.current.next({ events, endTurnEvent });

            thisTurnEvents.current = [];

            return endTurnEvent;
        }
    };

    return <>
        <HistoryProvider value={contextValue}>
            {props.children}
        </HistoryProvider>
    </>
}