import { INonPlayerCharacter, IWorldItem } from "../context/World.context";
import { WorldNpcTradeOpinion } from "./world.enums";

export class TradeEvaluator {

    constructor() { }

    evaluate(
        offer: { gold: number, items: Array<IWorldItem> },
        want: { gold: number, items: Array<IWorldItem> },
        npc: INonPlayerCharacter
    ): WorldNpcTradeOpinion {

        for (const item of [...offer.items, ...want.items]) {
            if (item.id in npc.itemValueOpinions) {
                continue;
            }

            const roll = Math.random();
            npc.itemValueOpinions[item.id] = Math.ceil(Math.max(0, item.tradeValue + (roll * 0.2 - 0.1) * item.tradeValue));
        }

        let tradeSum = offer.gold - want.gold;

        for (const item of offer.items) {
            tradeSum += npc.itemValueOpinions[item.id];
        }
        for (const item of want.items) {
            tradeSum -= npc.itemValueOpinions[item.id];
        }

        if (tradeSum > 100) {
            return "no-brainer";
        }
        if (tradeSum >= 0) {
            return "acceptable";
        }
        if (tradeSum > -100) {
            return "bad";
        }
        return "insulting";

    }

}