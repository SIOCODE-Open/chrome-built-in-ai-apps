import { IWorldItem } from "../context/World.context";

export class WeaponDamageGenerator {

    generate(item: IWorldItem): number {

        const isLegendary = item.tier === "legendary";
        const isEpic = item.tier === "epic";
        const isRare = item.tier === "rare";

        let dmgBase = 1;
        let dmgRnd = 100;
        if (isLegendary) {
            dmgBase = 100;
            dmgRnd = 500;
        } else if (isEpic) {
            dmgBase = 50;
            dmgRnd = 250;
        } else if (isRare) {
            dmgBase = 25;
            dmgRnd = 125;
        }

        const dmg = dmgBase + Math.floor(Math.random() * dmgRnd);

        return dmg;

    }

    generateAtLeast(item: IWorldItem, minDmg: number): number {
        let generated = this.generate(item);
        let tries = 0;
        while (generated < minDmg) {
            generated = this.generate(item);
            if (tries++ > 100) {
                generated = minDmg + 1;
                break;
            }
        }
        return generated;
    }

}