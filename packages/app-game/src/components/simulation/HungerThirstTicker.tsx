import { useEffect } from "react";
import { useGameSimulation } from "../../context/GameSimulation.context";
import { IGameEvent, useHistory } from "../../context/History.context";
import { usePlayer } from "../../context/Player.context";

const THRESHOLDS = {
    hunger: {
        slightlyHungry: 1 * 60 * 60,
        hungry: 4 * 60 * 60,
        starving: 12 * 60 * 60,
        starvationDeath: 48 * 60 * 60
    },
    thirst: {
        slightlyThirsty: 30 * 60,
        thirsty: 2 * 60 * 60,
        dehydrated: 6 * 60 * 60,
        dehydrationDeath: 36 * 60 * 60
    }
};

export function HungerThirstTicker() {
    const player = usePlayer();
    const history = useHistory();
    const sim = useGameSimulation();

    const onTick = async (now: any) => {

        const R: Array<IGameEvent> = [];

        const hunger = player.getPlayerHunger();
        const thirst = player.getPlayerThirst();
        const health = player.getPlayerHealth();

        const timeSinceLastMeal = now - hunger.lastMealTime;

        if (timeSinceLastMeal > THRESHOLDS.hunger.starving) {
            if (hunger.status !== "starving") {
                hunger.status = "starving";
                R.push(
                    history.changeHunger(hunger)
                );
            }
        } else if (timeSinceLastMeal > THRESHOLDS.hunger.hungry) {
            if (hunger.status !== "hungry") {
                hunger.status = "hungry";
                R.push(
                    history.changeHunger(hunger)
                );
            }
        } else if (timeSinceLastMeal > THRESHOLDS.hunger.slightlyHungry) {
            if (hunger.status !== "slightly-hungry") {
                hunger.status = "slightly-hungry";
                R.push(
                    history.changeHunger(hunger)
                );
            }
        }

        if (timeSinceLastMeal > THRESHOLDS.hunger.starvationDeath) {
            health.points = 0;
            health.status = "dead";
            player.updatePlayerHealth(health);
            R.push(
                history.die("You have died of starvation.")
            );
        }

        const timeSinceLastDrink = now - thirst.lastDrinkTime;

        if (timeSinceLastDrink > THRESHOLDS.thirst.dehydrated) {
            if (thirst.status !== "dehydrated") {
                thirst.status = "dehydrated";
                R.push(
                    history.changeThirst(thirst)
                );
            }
        } else if (timeSinceLastDrink > THRESHOLDS.thirst.thirsty) {
            if (thirst.status !== "thirsty") {
                thirst.status = "thirsty";
                R.push(
                    history.changeThirst(thirst)
                );
            }
        } else if (timeSinceLastDrink > THRESHOLDS.thirst.slightlyThirsty) {
            if (thirst.status !== "slightly-thirsty") {
                thirst.status = "slightly-thirsty";
                R.push(
                    history.changeThirst(thirst)
                );
            }
        }

        if (timeSinceLastDrink > THRESHOLDS.thirst.dehydrationDeath) {
            health.points = 0;
            health.status = "dead";
            player.updatePlayerHealth(health);
            R.push(
                history.changeHealth(health)
            );
            R.push(
                history.die("You have died of dehydration.")
            );
        }

        console.log("[HungerThirstTicker]", "Hunger", hunger, "Thirst", thirst, "Health", health, "Time", now, "Time since last meal", timeSinceLastMeal, "Time since last drink", timeSinceLastDrink);

        return R;
    }

    useEffect(
        () => {
            sim.addTickProcessor(onTick);
        },
        []
    );

    return <></>;
}