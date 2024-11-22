import { useEffect } from "react";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { usePlayer } from "../../context/Player.context";
import { AttackDamageCalculator } from "../../model/AttackDamageCalculator";
import { IWearableItemEffect } from "../../context/World.context";

export function NpcAttackProcessor() {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const processEvent = async (ev: IGameEvent): Promise<Array<IGameEvent>> => {
        const R: Array<IGameEvent> = [];

        if (ev.happening !== "npc-attack") {
            return R;
        }

        console.log("[NpcAttackProcessor]", "Processing npc-attack event", ev);

        const currentFoe = ev.details.npc;
        const gear = player.getPlayerGear();
        const foeGear = currentFoe.gear;
        const currentLocation = player.getPlayerLocation();

        // TODO: Better damage calculation (hunger, status effects, etc.)

        const hitRoll = Math.random();

        let isMiss = hitRoll < 0.2;
        let isCritical = hitRoll > 0.9;

        let dmg = isMiss ? 0 : isCritical ? 2 : 1;
        if (currentFoe.gear && currentFoe.gear.weapon) {
            dmg *= currentFoe.gear?.weapon?.weapon.damage;
        }

        dmg = new AttackDamageCalculator().calculate(dmg, { gear });

        const playerHealth = player.getPlayerHealth();
        playerHealth.points -= dmg;

        if (dmg > 0) {
            R.push(
                history.takeDamage(currentFoe, dmg)
            );
        } else {
            R.push(
                history.noop(currentFoe.name + " attacks, but misses, dealing no damage.")
            );
        }

        // Activate effects
        const npcWhenAttackingEffects = [
            ...(foeGear?.weapon?.weapon?.effects || []),
            ...(foeGear?.armor?.armor?.effects || []),
            ...(foeGear?.wearable?.wearable?.effects || []),
            ...(foeGear?.boots?.boots?.effects || []),
            ...(foeGear?.helmet?.helmet?.effects || []),
        ].filter(
            (effect) => effect.activation === "when-attacking"
        ) as Array<IWearableItemEffect>;
        const playerWhenDefendingEffects = [
            ...(gear.weapon?.weapon?.effects || []),
            ...(gear.armor?.armor?.effects || []),
            ...(gear.wearable?.wearable?.effects || []),
            ...(gear.boots?.boots?.effects || []),
            ...(gear.helmet?.helmet?.effects || []),
        ].filter(
            (effect) => effect.activation === "when-defending"
        ) as Array<IWearableItemEffect>;

        for (const eff of playerWhenDefendingEffects) {

            if (eff.type === "damage") {
                // Direct damage to enemy
                currentFoe.health.points -= eff.value;
                R.push(
                    history.inflictDamage(currentFoe, eff.value)
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
                        history.noop("You destroy " + currentFoe.name + "'s " + gearItem.name + " due to item effect " + eff.name)
                    );
                    foeGear[gearKey] = undefined;
                }
            }

        }

        for (const eff of npcWhenAttackingEffects) {

            if (eff.type === "damage") {
                // Direct damage to player
                playerHealth.points -= eff.value;
                R.push(
                    history.takeDamage(currentFoe, eff.value)
                );
            } else if (eff.type === "heal") {
                // Heal enemy
                currentFoe.health.points += eff.value;
            } else if (eff.type === "destroy-item") {
                // Destroy random item of player
                const gearKeys = Object.keys(gear);
                const gearKey = gearKeys[Math.floor(Math.random() * gearKeys.length)];
                const gearItem = gear[gearKey];
                if (gearItem) {
                    R.push(
                        history.loseItem(gearItem, "Destroyed by " + currentFoe.name + " due to item effect " + eff.name)
                    );
                    gear[gearKey] = undefined;
                }
            }

        }

        if (currentFoe.health.points <= 0) {
            currentFoe.health.status = "dead";
            R.push(
                history.defeatNpc(currentFoe)
            );
            currentLocation.npcs = currentLocation.npcs.filter(npc => npc.id !== currentFoe.id);
        }

        if (playerHealth.points <= 0) {
            playerHealth.status = "dead";
            R.push(
                history.changeHealth(playerHealth)
            );
            R.push(
                history.die("You were defeated by " + currentFoe.name)
            );
        } else if (playerHealth.points <= 0.5 * playerHealth.max) {
            playerHealth.status = "injured";
            R.push(
                history.changeHealth(playerHealth)
            );
        }

        player.updatePlayerHealth(playerHealth);

        return R;
    };

    // Register processor
    useEffect(() => sim.addEventProcessor(processEvent), []);

    return <></>;
}