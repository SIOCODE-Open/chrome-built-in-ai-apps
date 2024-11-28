// ActionAttackProcessor.tsx
import { useEffect } from "react";
import { usePlayer } from "../../context/Player.context";
import { useWorld, IWorldItem, IWearableItemEffect } from "../../context/World.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { AttackDamageCalculator } from "../../model/AttackDamageCalculator";

export function ActionAttackProcessor(props: any) {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "action-attack") {
            return R;
        }

        console.log("[ActionAttackProcessor]", "Processing action-attack event", ev);

        const currentLocation = player.getPlayerLocation();
        const playerGear = player.getPlayerGear();
        const target = ev.details.npc;
        const inCombatWith = player.getInCombatWith();
        const currentSituation = player.getPlayerSituation();
        const foeGear = target.gear;
        const gear = player.getPlayerGear();
        const playerHealth = player.getPlayerHealth();

        // Are we in combat with them?
        if (currentSituation !== "combat") {

            // Are we in the same location?
            if (currentLocation.id !== target.location.id) {
                R.push(
                    history.noop("You want to attack " + target.name + ", but they are not here.")
                );
                return R;
            }

            R.push(
                history.changeSituation("combat")
            );
            player.changeSituation("combat");
            player.startCombat(target);
        } else if (inCombatWith.id !== target.id) {
            R.push(
                history.noop("You are already in combat with someone else.")
            );
            return R;
        }

        // TODO: Better damage calculation (hunger, status effects, etc.)

        const hitRoll = Math.random();

        let isMiss = hitRoll < 0.2;
        let isCritical = hitRoll > 0.9;

        let dmg = isMiss ? 0 : isCritical ? 2 : 1;
        if (playerGear.weapon) {
            dmg *= playerGear.weapon.weapon.damage;
        }

        dmg = new AttackDamageCalculator().calculate(dmg, target);

        target.health.points -= dmg;
        if (dmg > 0) {
            R.push(
                history.inflictDamage(target, dmg)
            );
        } else {
            R.push(
                history.noop("You attack, but miss, inflicting no damage.")
            );
        }

        // Activate effects
        const npcWhenDefendingEffects = [
            ...(foeGear?.weapon?.weapon?.effects || []),
            ...(foeGear?.armor?.armor?.effects || []),
            ...(foeGear?.wearable?.wearable?.effects || []),
            ...(foeGear?.boots?.boots?.effects || []),
            ...(foeGear?.helmet?.helmet?.effects || []),
        ].filter(
            (effect) => effect.activation === "when-defending"
        ) as Array<IWearableItemEffect>;
        const playerWhenAttackingEffects = [
            ...(gear.weapon?.weapon?.effects || []),
            ...(gear.armor?.armor?.effects || []),
            ...(gear.wearable?.wearable?.effects || []),
            ...(gear.boots?.boots?.effects || []),
            ...(gear.helmet?.helmet?.effects || []),
        ].filter(
            (effect) => effect.activation === "when-attacking"
        ) as Array<IWearableItemEffect>;

        for (const eff of playerWhenAttackingEffects) {

            if (eff.type === "damage") {
                // Direct damage to enemy
                target.health.points -= eff.value;
                R.push(
                    history.inflictDamage(target, eff.value)
                );
            } else if (eff.type === "heal") {
                // Heal player
                playerHealth.points += eff.value;
                R.push(
                    history.changeHealth(playerHealth)
                );
            } else if (eff.type === "destroy-item") {
                // Destroy random item of foe
                const gearKeys = Object.keys(foeGear);
                const gearKey = gearKeys[Math.floor(Math.random() * gearKeys.length)];
                const gearItem = foeGear[gearKey];
                if (gearItem) {
                    R.push(
                        history.noop("You destroy " + gearItem.name + " of " + target.name + " due to item effect " + eff.name)
                    );
                    foeGear[gearKey] = undefined;
                }
            }

        }

        for (const eff of npcWhenDefendingEffects) {

            if (eff.type === "damage") {
                // Direct damage to player
                playerHealth.points -= eff.value;
                R.push(
                    history.takeDamage(target, eff.value)
                );
            } else if (eff.type === "heal") {
                // Heal enemy
                target.health.points += eff.value;
            } else if (eff.type === "destroy-item") {
                // Destroy random item of player
                const gearKeys = Object.keys(gear);
                const gearKey = gearKeys[Math.floor(Math.random() * gearKeys.length)];
                const gearItem = gear[gearKey];
                if (gearItem) {
                    R.push(
                        history.loseItem(gearItem, "Destroyed by " + target.name + " due to item effect " + eff.name)
                    );
                    gear[gearKey] = undefined;
                }
            }

        }

        if (target.health.points < target.health.max / 2 && target.health.points > 0) {
            target.health.status = "injured";
            player.updateInCombatWith(target);
        }

        if (target.health.points <= 0) {
            target.health.status = "dead";
            R.push(
                history.defeatNpc(target)
            );
            currentLocation.npcs = currentLocation.npcs.filter((npc) => npc.id !== target.id);
        }

        if (target.health.points > 0) {
            // Enemy attacks as well
            R.push(
                history.npcAttack(target)
            );
        }

        player.updatePlayerLocation(currentLocation);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}
