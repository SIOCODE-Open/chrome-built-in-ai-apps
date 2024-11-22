import { useEffect, useState } from "react";
import { INonPlayerCharacter, IWorldItem, IWorldNode } from "../../context/World.context";
import { usePlayer } from "../../context/Player.context";
import { Card } from "../Card";
import { CardTitle } from "../card/CardTitle";
import classNames from "classnames";
import { WorldPlayerConversationAction, WorldPlayerNpcInteractionType } from "../../model/world.enums";
import { Icon } from "@iconify/react";
import { ItemTooltip } from "../tooltips/ItemTooltip";
import { ItemActions } from "../actions/ItemActions";
import { CardLabelList } from "../card/CardLabelList";
import { aiDisplayNpc, aiDisplayTrade } from "../../ai/display";
import { NpcAskResponder } from "../../ai/NpcAskResponder";
import { useLanguageModel } from "@siocode/base";
import { LocationTooltip } from "../tooltips/LocationTooltip";
import { NpcTooltip } from "../tooltips/NpcTooltip";
import { NpcTradeResponder } from "../../ai/NpcTradeResponder";
import { usePlayerActions } from "../../context/PlayerActions.context";
import { createItemLabel } from "../labels/ItemLabel";
import { createNpcLabel } from "../labels/NpcLabel";

export function ConversationInformation() {

    const [playerInventory, setPlayerInventory] = useState({
        gold: 0,
        items: []
    });
    const [inConversationWith, setInConversationWith] = useState<INonPlayerCharacter | null>(null);

    const [conversationAction, setConversationAction] = useState<WorldPlayerNpcInteractionType | null>(null);

    const [thinking, setThinking] = useState(false);

    const [askSomethingInput, setAskSomethingInput] = useState("");
    const [askResponse, setAskResponse] = useState("");
    const [askPositive, setAskPositive] = useState(false);
    const [askMentions, setAskMentions] = useState<any[]>([]);

    const [tradeOfferedGold, setTradeOfferedGold] = useState(0);
    const [tradeOfferedItems, setTradeOfferedItems] = useState<IWorldItem[]>([]);
    const [tradeWantGold, setTradeWantGold] = useState(0);
    const [tradeWantItems, setTradeWantItems] = useState<IWorldItem[]>([]);
    const [tradeResponse, setTradeResponse] = useState("");
    const [tradePositive, setTradePositive] = useState(false);

    const [offerHelpResponse, setOfferHelpResponse] = useState("");
    const [offerHelpPositive, setOfferHelpPositive] = useState(false);

    const player = usePlayer();
    const lm = useLanguageModel();
    const actions = usePlayerActions();

    useEffect(
        () => {
            const sub = player.inConversationWith.subscribe(
                npc => {
                    setInConversationWith(npc);
                    setConversationAction(null);
                }
            );
            return () => sub.unsubscribe();
        },
        []
    );

    useEffect(
        () => {
            const sub = player.playerInventory.subscribe(setPlayerInventory);
            return () => sub.unsubscribe();
        },
        []
    );

    if (!inConversationWith) {
        return <></>;
    }

    const buttonClass = classNames(
        "bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold px-2 py-1 rounded-full text-xs"
    );

    const inputClass = classNames(
        "border border-neutral-400 rounded-full px-4 py-1 w-full text-xs",
        "outline-none ring-none focus:outline-none focus:ring-none active:outline-none active:ring-none"
    );

    const selectClass = classNames(
        "border border-neutral-400 rounded-full px-4 py-1 w-full text-xs",
        "outline-none ring-none focus:outline-none focus:ring-none active:outline-none active:ring-none"
    );

    const onAskSomething = () => {
        setConversationAction("ask");
        setAskSomethingInput("");
        setAskResponse("");
        setAskPositive(false);
        setAskMentions([]);
    };

    const onTrade = () => {
        setConversationAction("trade");
        setTradeOfferedGold(0);
        setTradeOfferedItems([]);
        setTradeWantGold(0);
        setTradeWantItems([]);
        setTradeResponse("");
        setTradePositive(false);
    };

    const onOfferHelp = async () => {
        setConversationAction("offer-help");
        setThinking(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setThinking(false);
        setOfferHelpResponse("I am afraid there's no way you can help me right now. Check back later.");
        setOfferHelpPositive(false);
    };

    const onSendAsk = async () => {
        setThinking(true);
        const responder = new NpcAskResponder(lm);
        const response = await responder.prompt({
            npc: inConversationWith,
            message: askSomethingInput
        });
        setThinking(false);
        setAskResponse(response.message);
        setAskPositive(response.type === "positive");
        setAskMentions(response.mentions);

        // FIXME: Remove debug code
        const situationPrompt = aiDisplayNpc(inConversationWith) + "\n\nThe player asked the following: " + askSomethingInput;
        navigator.clipboard.writeText(situationPrompt);
    };
    const onSendTrade = async () => {
        setThinking(true);
        const responder = new NpcTradeResponder(lm);
        const response = await responder.prompt({
            npc: inConversationWith,
            offered: { gold: tradeOfferedGold, items: tradeOfferedItems },
            want: { gold: tradeWantGold, items: tradeWantItems }
        });
        setThinking(false);
        setTradeResponse(response.message);
        setTradePositive(response.type === "positive");

        // FIXME: Remove debug code
        const situationPrompt = aiDisplayNpc(inConversationWith) + "\n\nThe player proposed the following trade:\n" + aiDisplayTrade(
            { gold: tradeOfferedGold, items: tradeOfferedItems },
            { gold: tradeWantGold, items: tradeWantItems }
        );
        navigator.clipboard.writeText(situationPrompt);
    };

    const onFinalizeTrade = async () => {
        if (tradePositive) {
            actions.trade(
                inConversationWith,
                { gold: tradeOfferedGold, items: tradeOfferedItems },
                { gold: tradeWantGold, items: tradeWantItems }
            );
            setConversationAction(null);
        }
    };

    const tradeOfferedItemLabels = [];
    const tradeWantItemLabels = [];

    if (conversationAction === "trade") {
        // FIXME: Deduplicate big for loop
        for (const item of tradeOfferedItems) {
            const found = tradeOfferedItemLabels.find(
                i => i.id === item.id
            );

            if (!found) {
                tradeOfferedItemLabels.push(
                    createItemLabel(
                        item,
                        { actions: ["cancel"], onCancel: () => setTradeOfferedItems(tradeOfferedItems.filter(i => i.id !== item.id)) }
                    )
                );
            } else {
                found.count++;
                found.label = <>
                    ({found.count}) {item.name}
                </>
            }
        }


        for (const item of tradeWantItems) {
            const found = tradeWantItemLabels.find(
                i => i.id === item.id
            );

            if (!found) {
                tradeWantItemLabels.push(
                    createItemLabel(
                        item,
                        { actions: ["cancel"], onCancel: () => setTradeWantItems(tradeWantItems.filter(i => i.id !== item.id)) }
                    )
                );
            } else {
                found.count++;
                found.label = <>
                    ({found.count}) {item.name}
                </>
            }
        }
    }

    const askMentionLabels = [];

    if (conversationAction === "ask" && askMentions.length > 0) {
        for (const mention of askMentions) {
            if (mention.type === "location") {
                const possibleLocations = [
                    inConversationWith.knowledge.find(k => k.location && k.location.id === mention.id),
                    inConversationWith.knowledge.map(k => k.itemLocation)
                        .find(l => l && l.id === mention.id),
                    inConversationWith.knowledge.map(k => k.npcLocation)
                        .find(l => l && l.id === mention.id),
                    inConversationWith.location,
                ] as Array<IWorldNode | null>;
                const locKnowledge = possibleLocations.find(l => l && l.id === mention.id);
                if (locKnowledge) {
                    askMentionLabels.push({
                        id: mention.id,
                        label: <>
                            {locKnowledge.name}
                        </>,
                        color: "neutral",
                        tooltip: <LocationTooltip value={locKnowledge} />
                    });
                } else {
                    console.log("No location knowledge found for", mention.id, possibleLocations);
                }
            } else if (mention.type === "npc") {
                const possibleNpcs = [
                    inConversationWith.knowledge.find(k => k.npc && k.npc.id === mention.id),
                    inConversationWith.location.npcs.find(n => n.id === mention.id),
                    inConversationWith,
                ] as Array<INonPlayerCharacter | null>;
                const npcKnowledge = possibleNpcs.find(n => n && n.id === mention.id) as INonPlayerCharacter;
                if (npcKnowledge) {
                    askMentionLabels.push(
                        createNpcLabel(
                            npcKnowledge,
                            { actions: ["talk", "attack"] }
                        )
                    );
                } else {
                    console.log("No npc knowledge found for", mention.id, possibleNpcs);
                }
            } else if (mention.type === "item") {
                const possibleItems = [
                    inConversationWith.knowledge.find(k => k.item && k.item.id === mention.id),
                    inConversationWith.inventory.items.find(i => i.id === mention.id),
                    inConversationWith.gear?.weapon,
                    inConversationWith.gear?.armor,
                    inConversationWith.gear?.helmet,
                    inConversationWith.gear?.boots,
                    inConversationWith.gear?.wearable,
                    inConversationWith.location.items.find(i => i.id === mention.id),
                ] as Array<IWorldItem | null>;
                const itemKnowledge = possibleItems.find(i => i && i.id === mention.id);
                if (itemKnowledge) {
                    askMentionLabels.push(
                        createItemLabel(
                            itemKnowledge,
                            { actions: [] }
                        )
                    );
                } else {
                    console.log("No item knowledge found for", mention.id, possibleItems);
                }
            }
        }
    }

    const onSelectTradeOfferedItem = (item: IWorldItem) => {
        setTradeOfferedItems([...tradeOfferedItems, item]);
    };

    const onSelectTradeWantItem = (item: IWorldItem) => {
        setTradeWantItems([...tradeWantItems, item]);
    };

    return <>
        <Card>
            <CardTitle>Conversation</CardTitle>
            <div className="flex flex-row flex-wrap justify-start items-center gap-2">

                <button className={buttonClass}
                    onClick={onAskSomething}>
                    Ask something
                </button>

                <button className={buttonClass}
                    onClick={onTrade}>
                    Trade
                </button>

                <button className={buttonClass}
                    onClick={onOfferHelp}>
                    Offer help
                </button>

            </div>

            {
                conversationAction === "ask" && <>
                    <CardTitle>Ask something</CardTitle>
                    <div className="flex flex-row justify-stretch w-full items-center gap-2">

                        <input type="text"
                            className={classNames(inputClass, "grow")}
                            value={askSomethingInput}
                            onChange={(e) => setAskSomethingInput(e.target.value)} />
                        <button className={buttonClass}
                            onClick={onSendAsk}>
                            Ask
                        </button>
                    </div>
                </>
            }

            {
                conversationAction === "trade" && <>
                    <CardTitle>Trade</CardTitle>
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <div className="flex flex-col justify-start items-start gap-2">
                            <CardTitle>Your offer</CardTitle>
                            <div className="flex flex-row justify-start items-center gap-2">
                                <span className="text-xs text-neutral-500 text-left">Gold</span>
                                <input type="number"
                                    className={inputClass}
                                    value={tradeOfferedGold}
                                    onChange={(e) => setTradeOfferedGold(parseInt(e.target.value))} />
                            </div>
                            <select className={selectClass}
                                onChange={(e) => {
                                    const item = playerInventory.items.find(i => `${i.id}` === e.target.value);
                                    if (item) {
                                        onSelectTradeOfferedItem(item);
                                    }
                                }}>
                                <option value="">Select item</option>
                                {
                                    playerInventory.items.filter(
                                        item => !tradeOfferedItems.find(i => i.id === item.id)
                                    ).map(
                                        item => <option key={item.id} value={item.id}>{item.name}</option>
                                    )
                                }
                            </select>
                            <CardLabelList value={tradeOfferedItemLabels} />
                        </div>
                        <div className="flex flex-col justify-start items-start gap-2">
                            <CardTitle>You want</CardTitle>
                            <div className="flex flex-row justify-start items-center gap-2">
                                <span className="text-xs text-neutral-500 text-left">Gold</span>
                                <input type="number"
                                    className={inputClass}
                                    value={tradeWantGold}
                                    onChange={(e) => setTradeWantGold(parseInt(e.target.value))} />
                            </div>
                            <select className={selectClass}
                                onChange={(e) => {
                                    const item = inConversationWith.inventory.items.find(i => `${i.id}` === e.target.value);
                                    if (item) {
                                        onSelectTradeWantItem(item);
                                    }
                                }}>
                                <option value="">Select item</option>
                                {
                                    inConversationWith.inventory.items.filter(
                                        item => !tradeWantItems.find(i => i.id === item.id)
                                    ).map(
                                        item => <option key={item.id} value={item.id}>{item.name}</option>
                                    )
                                }
                            </select>
                            <CardLabelList value={tradeWantItemLabels} />
                        </div>
                    </div>
                    <button className={classNames(buttonClass, "w-full text-center")}
                        onClick={onSendTrade}>
                        Offer
                    </button>
                </>
            }


            {
                thinking && <div className="flex flex-row w-full justify-center items-center">
                    <Icon icon="mdi:gear" className="text-2xl text-neutral-500 animate-spin" />
                </div>
            }

            {
                !thinking && conversationAction === "ask" && askResponse.length > 0 && <>
                    <CardTitle>Response</CardTitle>
                    <div className="flex flex-row w-full justify-stretch items-center gap-2 rounded bg-neutral-200 p-2">
                        <Icon icon={askPositive ? "mdi:thumb-up" : "mdi:thumb-down"} className={classNames("w-16 h-16 text-2xl", { "text-green-500": askPositive, "text-red-500": !askPositive })} />
                        <p className="text-xs italic grow">
                            {askResponse}
                        </p>
                    </div>
                    <CardTitle>They mention ...</CardTitle>
                    <CardLabelList value={askMentionLabels} />
                </>
            }

            {
                !thinking && conversationAction === "trade" && tradeResponse.length > 0 && <>
                    <CardTitle>Response</CardTitle>
                    <div className="flex flex-row w-full justify-stretch items-center gap-2 rounded bg-neutral-200 p-2">
                        <Icon icon={tradePositive ? "mdi:thumb-up" : "mdi:thumb-down"} className={classNames("w-16 h-16 text-2xl", { "text-green-500": tradePositive, "text-red-500": !tradePositive })} />
                        <p className="text-xs italic grow">
                            {tradeResponse}
                        </p>
                    </div>
                    {
                        tradePositive && <button className={classNames(buttonClass, "w-full text-center")}
                            onClick={onFinalizeTrade}>
                            Shake hands
                        </button>
                    }
                </>
            }

            {
                !thinking && conversationAction === "offer-help" && offerHelpResponse.length > 0 && <>
                    <CardTitle>Response</CardTitle>
                    <div className="flex flex-row w-full justify-stretch items-center gap-2 rounded bg-neutral-200 p-2">
                        <Icon icon={offerHelpPositive ? "mdi:thumb-up" : "mdi:thumb-down"} className={classNames("w-16 h-16 text-2xl", { "text-green-500": offerHelpPositive, "text-red-500": !offerHelpPositive })} />
                        <p className="text-xs italic grow">
                            {offerHelpResponse}
                        </p>
                    </div>
                </>
            }
        </Card>
    </>;

}