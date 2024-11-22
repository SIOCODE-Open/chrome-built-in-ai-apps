import { IWorldItem } from "../context/World.context";

export class ArmorDefenseGenerator {

    generate(item: IWorldItem): number {

        const isLegendary = item.tier === "legendary";
        const isEpic = item.tier === "epic";
        const isRare = item.tier === "rare";

        let defBase = 1;
        let defRnd = 100;
        if (isLegendary) {
            defBase = 100;
            defRnd = 500;
        } else if (isEpic) {
            defBase = 50;
            defRnd = 250;
        } else if (isRare) {
            defBase = 25;
            defRnd = 125;
        }

        const def = defBase + Math.floor(Math.random() * defRnd);

        return def;

    }

    generateAtLeast(item: IWorldItem, minDmg: number): number {
        let generated = this.generate(item);
        while (generated < minDmg) {
            generated = this.generate(item);
        }
        return generated;
    }

}