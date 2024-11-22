import { ICharacterGear } from "../context/World.context";

export class AttackDamageCalculator {

    calculate(
        baseDamage: number,
        defender: {
            gear: ICharacterGear;
        }
    ): number {

        let armor = defender.gear.armor?.armor?.defense ?? 0;
        armor += defender.gear.helmet?.helmet?.defense ?? 0;
        armor += defender.gear.boots?.boots?.defense ?? 0;
        armor += defender.gear.wearable?.wearable?.defense ?? 0;

        return Math.max(1, baseDamage - armor);

    }

}