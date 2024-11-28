import { useEffect, useRef } from "react";
import { IPlayerCharacter, IPlayerContext, IPlayerHunger, IPlayerSkills, IPlayerThirst, PlayerProvider } from "../context/Player.context";
import { BehaviorSubject, Subject } from "rxjs";
import { ICharacterGear, ICharacterHealth, ICharacterInventory, INonPlayerCharacter, useWorld } from "../context/World.context";
import { useHistory } from "../context/History.context";
import { WORLD_PLAYER_SKILL_DESCRIPTIONS, WORLD_PLAYER_SKILL_DISPLAYS, WorldPlayerSitutation, WorldPlayerSkill } from "../model/world.enums";
import { aiDisplayGearShort } from "../ai/display";
import { useGameLayout } from "../context/GameLayout.context";

export function GamePlayer(
    props: {
        children?: any
    }
) {

    const layout = useGameLayout();

    const playerCharacter = useRef(
        new BehaviorSubject<IPlayerCharacter>({
            name: "Unnamed Hero",
            characterClass: "knight"
        })
    );

    const playerHealth = useRef(
        new BehaviorSubject<ICharacterHealth>({
            status: "healthy",
            points: 100,
            max: 100
        })
    );

    const playerLocation = useRef(
        new BehaviorSubject(null)
    );

    const playerGear = useRef(
        new BehaviorSubject<ICharacterGear>({})
    );

    const playerInventory = useRef(
        new BehaviorSubject<ICharacterInventory>({
            gold: 0,
            items: []
        })
    );

    const playerHunger = useRef(
        new BehaviorSubject<IPlayerHunger>({
            status: "slightly-hungry",
            lastMealTime: 0,
            lastMeal: null
        })
    );

    const playerThirst = useRef(
        new BehaviorSubject<IPlayerThirst>({
            status: "thirsty",
            lastDrinkTime: 0,
            lastDrink: null
        })
    );

    const playerSkills = useRef(
        new BehaviorSubject<IPlayerSkills>({
            skills: []
        })
    );

    const spawned = useRef(
        new Subject<void>()
    );

    const situation = useRef(
        new BehaviorSubject<WorldPlayerSitutation>("wandering")
    );

    const inCombatWith = useRef(
        new BehaviorSubject<INonPlayerCharacter | null>(null)
    );

    const inConversationWith = useRef(
        new BehaviorSubject<INonPlayerCharacter | null>(null)
    );

    const world = useWorld();
    const history = useHistory();

    const contextValue: IPlayerContext = {
        spawned: spawned.current.asObservable(),
        playerCharacter: playerCharacter.current.asObservable(),
        getPlayerCharacter: () => playerCharacter.current.value,
        playerHealth: playerHealth.current.asObservable(),
        getPlayerHealth: () => playerHealth.current.value,
        playerLocation: playerLocation.current.asObservable(),
        getPlayerLocation: () => playerLocation.current.value,
        playerGear: playerGear.current.asObservable(),
        getPlayerGear: () => playerGear.current.value,
        playerInventory: playerInventory.current.asObservable(),
        getPlayerInventory: () => playerInventory.current.value,
        playerHunger: playerHunger.current.asObservable(),
        getPlayerHunger: () => playerHunger.current.value,
        playerThirst: playerThirst.current.asObservable(),
        getPlayerThirst: () => playerThirst.current.value,
        playerSkills: playerSkills.current.asObservable(),
        getPlayerSkills: () => playerSkills.current.value,
        playerSituation: situation.current.asObservable(),
        getPlayerSituation: () => situation.current.value,
        inCombatWith: inCombatWith.current.asObservable(),
        getInCombatWith: () => inCombatWith.current.value,
        inConversationWith: inConversationWith.current.asObservable(),
        getInConversationWith: () => inConversationWith.current.value,

        updatePlayerCharacter: (character: IPlayerCharacter) => playerCharacter.current.next(character),
        updatePlayerHealth: (h: ICharacterHealth) => {
            playerHealth.current.next(h);
            if (h.points <= 0) {
                layout.changeLayout("game-over");
                console.log("[GamePlayer]", "Player has died");
            }
        },
        updatePlayerLocation: (location) => playerLocation.current.next(location),
        updatePlayerGear: (gear: ICharacterGear) => {
            playerGear.current.next(gear);
        },
        updatePlayerHunger: (hunger: IPlayerHunger) => playerHunger.current.next(hunger),
        updatePlayerThirst: (thirst: IPlayerThirst) => playerThirst.current.next(thirst),
        addGold: (amount) => {
            const current = playerInventory.current.value;
            current.gold += amount;
            playerInventory.current.next(current);
        },
        spendGold: (amount) => {
            const current = playerInventory.current.value;
            if (current.gold < amount) {
                return false;
            }
            current.gold -= amount;
            playerInventory.current.next(current);

            return true;
        },
        addItem: (item) => {
            const current = playerInventory.current.value;
            if (!current.items.some(i => i.id === item.id)) {
                current.items.push(item);
            }
            playerInventory.current.next(current);
        },
        removeItem: (item) => {
            const current = playerInventory.current.value;
            const index = current.items.findIndex(i => i.id === item.id);
            if (index === -1) {
                return false;
            }
            current.items.splice(index, 1);
            playerInventory.current.next(current);

            return true;
        },
        learnSkill: (skill: WorldPlayerSkill) => {
            const current = playerSkills.current.value;
            if (!current.skills.find(s => s === skill)) {
                current.skills.push(skill);
            }
            playerSkills.current.next(current);
        },
        changeSituation: (s: WorldPlayerSitutation) => {
            situation.current.next(s);
        },
        startCombat: (npc) => {
            inCombatWith.current.next(npc);
        },
        endCombat: () => {
            inCombatWith.current.next(null);
        },
        startConversation: (npc) => {
            inConversationWith.current.next(npc);
        },
        endConversation: () => {
            inConversationWith.current.next(null);
        },
        updateInCombatWith: (npc) => {
            inCombatWith.current.next(npc);
        },
        updateInConversationWith: (npc) => {
            inConversationWith.current.next(npc);
        },
    };

    const spawnInitialPlayer_Legacy = () => {
        console.warn("[GamePlayer]", "Spawning initial player character with legacy data");

        contextValue.addGold(10);
        const playerWeapon = world.createItem(
            "Rusty Knife",
            "weapon",
            "common",
        );
        playerWeapon.weapon = {
            weaponType: "knife",
            damage: 1
        };
        contextValue.addItem(playerWeapon);

        const playerArmor = world.createItem(
            "Peasant's Clothes",
            "armor",
            "common"
        );
        playerArmor.armor = {
            defense: 1
        };

        const playerBoots = world.createItem(
            "Leather Boots",
            "boots",
            "common"
        );
        playerBoots.boots = {
            defense: 1
        };

        const playerNecklace = world.createItem(
            "Necklace",
            "wearable",
            "common"
        );
        playerNecklace.wearable = {
            wearableType: "necklace",
            defense: 1
        };

        contextValue.updatePlayerGear({
            armor: playerArmor,
            helmet: null,
            boots: playerBoots,
            weapon: null,
            wearable: playerNecklace
        });

        contextValue.learnSkill("wield-sword");
        contextValue.learnSkill("wield-axe");
        contextValue.learnSkill("wield-knife");
        contextValue.learnSkill("wield-dagger");

    };

    const spawnInitialPlayer = () => {

        const cc = JSON.parse(
            localStorage.getItem("game.character") || "null"
        );

        if (!cc) {
            spawnInitialPlayer_Legacy();
        } else {

            contextValue.updatePlayerCharacter({
                name: cc.name,
                characterClass: cc.characterClass
            });

            if (cc.inventoryGold) {
                contextValue.addGold(cc.inventoryGold);
            } else {
                contextValue.addGold(10);
            }

            let playerWeapon = null;

            if (cc.characterClass === "knight") {
                playerWeapon = world.generateItems("weapon.common.simple-sword")[0];
            } else if (cc.characterClass === "archer") {
                playerWeapon = world.generateItems("weapon.common.simple-bow")[0];
            } else if (cc.characterClass === "mage") {
                playerWeapon = world.generateItems("weapon.common.simple-staff")[0];
            }
            contextValue.addItem(playerWeapon);

            const playerArmor = world.generateItems("armor.common.simple-clothing")[0];

            const playerBoots = world.generateItems("boots.common.simple-boots")[0];

            contextValue.updatePlayerGear({
                armor: playerArmor,
                helmet: null,
                boots: playerBoots,
                weapon: null,
                wearable: null
            });

            if (cc.characterClass === "knight") {
                contextValue.learnSkill("wield-sword");
                contextValue.learnSkill("wield-axe");
                contextValue.learnSkill("wield-knife");
                contextValue.learnSkill("wield-dagger");
            } else if (cc.characterClass === "archer") {
                contextValue.learnSkill("wield-bow");
                contextValue.learnSkill("wield-crossbow");
                contextValue.learnSkill("wield-dagger");
                contextValue.learnSkill("wield-knife");
            } else if (cc.characterClass === "mage") {
                contextValue.learnSkill("wield-staff");
                contextValue.learnSkill("wield-dagger");
                contextValue.learnSkill("wield-knife");
            }

            contextValue.updatePlayerHealth({
                status: "injured",
                points: 40,
                max: 100
            });

        }

        history.wakeUp(playerLocation.current.value);

    };

    useEffect(
        () => {
            const sub = world.nodesGenerated.subscribe(
                (allNodes) => {
                    if (allNodes) {
                        const candidates = allNodes.filter(n => n.type === "room" && n.room?.roomType === "bedroom" && n.ancestor && n.ancestor.type === "building" && n.ancestor.labels.includes("tavern"));
                        const startingNode = candidates[Math.floor(Math.random() * candidates.length)];

                        startingNode.name = "Dark Room";
                        startingNode.humidity = "dry";
                        startingNode.temperature = "cool";
                        startingNode.details = {
                            description: "This is a dark room, and you can't remember how you got here, or who you are."
                        };

                        const startingTavern = startingNode.outEdges[0].to;
                        startingTavern.name = "The Crooked Tankard";
                        startingTavern.details = {
                            description: "The Crooked Tankard is a welcoming place for all."
                        };
                        startingTavern.humidity = "normal";
                        startingTavern.temperature = "mild";

                        playerLocation.current.next(startingNode);
                        console.log("[GamePlayer]", "Starting location set to", startingNode);
                        spawnInitialPlayer();

                        spawned.current.next();
                    }
                }
            );
            return () => sub.unsubscribe();
        },
        []
    );

    return <>
        <PlayerProvider value={contextValue}>
            {props.children}
        </PlayerProvider>
    </>;
}