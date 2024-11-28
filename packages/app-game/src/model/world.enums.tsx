/** The type of an item */
export const WORLD_ITEM_TYPE = [
    "weapon",
    "armor",
    "helmet",
    "boots",
    "wearable",
    "consumable",
    "food",
    "drink",
    "material",
    "household",
    "artifact",
];

/** The type of an item */
export type WorldItemType =
    | "weapon"
    | "armor"
    | "helmet"
    | "boots"
    | "wearable"
    | "consumable"
    | "food"
    | "drink"
    | "material"
    | "household"
    | "artifact";

/** Descriptions for Item Type */
export const WORLD_ITEM_TYPE_DESCRIPTIONS = {
    weapon: `Items used for combat, wielded in one or both hands to attack foes.`,
    armor: `Protective gear worn on the torso, offering defense against attacks.`,
    helmet: `Headgear providing protection and sometimes magical enhancements.`,
    boots: `Footwear that can improve movement or provide additional defense.`,
    wearable: `Accessories worn on the body, often for enhancing attributes or abilities.`,
    consumable: `Items that can be used once, providing various effects when consumed.`,
    food: `Edible items that restore health or provide sustenance.`,
    drink: `Beverages that quench thirst and may provide temporary boosts.`,
    material: `Raw or crafted items used for creating or enhancing other objects.`,
    household: `A household item, such as decoration or tools.`,
    artifact: `A rare artifact, valuable for those who collect such items.`,
};

/** Display values for Item Type */
export const WORLD_ITEM_TYPE_DISPLAYS = {
    weapon: `Weapon`,
    armor: `Armor`,
    helmet: `Helmet`,
    boots: `Boots`,
    wearable: `Wearable`,
    consumable: `Consumable`,
    food: `Food`,
    drink: `Drink`,
    material: `Material`,
    household: `Household`,
    artifact: `Artifact`,
};
/** The rarity and power level of an item */
export const WORLD_ITEM_TIER = [
    "garbage",
    "common",
    "rare",
    "epic",
    "legendary",
];

/** The rarity and power level of an item */
export type WorldItemTier =
    | "garbage"
    | "common"
    | "rare"
    | "epic"
    | "legendary";

/** Descriptions for Item Tier */
export const WORLD_ITEM_TIER_DESCRIPTIONS = {
    garbage: `Useless and discarded items, with no value or purpose.`,
    common: `Easily found and widely available, with minimal special properties.`,
    rare: `Uncommon items, often possessing unique traits or enhancements.`,
    epic: `Highly sought after, with powerful abilities and distinctive features.`,
    legendary: `Extremely rare and shrouded in legend, possessing extraordinary power.`,
};

/** Display values for Item Tier */
export const WORLD_ITEM_TIER_DISPLAYS = {
    garbage: `Garbage`,
    common: `Common`,
    rare: `Rare`,
    epic: `Epic`,
    legendary: `Legendary`,
};
/** The type of weapon used in combat */
export const WORLD_WEAPON_TYPE = [
    "sword",
    "axe",
    "knife",
    "dagger",
    "bow",
    "crossbow",
    "staff",
];

/** The type of weapon used in combat */
export type WorldWeaponType =
    | "sword"
    | "axe"
    | "knife"
    | "dagger"
    | "bow"
    | "crossbow"
    | "staff";

/** Descriptions for Weapon Type */
export const WORLD_WEAPON_TYPE_DESCRIPTIONS = {
    sword: `A balanced, sharp-edged blade suited for close combat.`,
    axe: `A heavy, bladed weapon designed for powerful strikes.`,
    knife: `A small, versatile blade, often used for stealth or quick attacks.`,
    dagger: `A double-edged blade, ideal for precise strikes and close-quarters combat.`,
    bow: `A ranged weapon that fires arrows, requiring skill and precision.`,
    crossbow: `A mechanical ranged weapon that fires bolts, offering high power.`,
    staff: `A long, wooden weapon often used by mages or monks for casting spells.`,
};

/** Display values for Weapon Type */
export const WORLD_WEAPON_TYPE_DISPLAYS = {
    sword: `Sword`,
    axe: `Axe`,
    knife: `Knife`,
    dagger: `Dagger`,
    bow: `Bow`,
    crossbow: `Crossbow`,
    staff: `Staff`,
};
/** The type of wearable accessories */
export const WORLD_WEARABLE_TYPE = [
    "necklace",
    "ring",
    "bracelet",
    "belt",
    "trinket",
];

/** The type of wearable accessories */
export type WorldWearableType =
    | "necklace"
    | "ring"
    | "bracelet"
    | "belt"
    | "trinket";

/** Descriptions for Wearable Type */
export const WORLD_WEARABLE_TYPE_DESCRIPTIONS = {
    necklace: `Jewelry worn around the neck, often enchanted or decorative.`,
    ring: `A small band worn on the finger, sometimes magical in nature.`,
    bracelet: `A decorative or enchanted item worn on the wrist.`,
    belt: `A strap worn around the waist, occasionally providing special effects.`,
    trinket: `A small, unique item with minor magical properties.`,
};

/** Display values for Wearable Type */
export const WORLD_WEARABLE_TYPE_DISPLAYS = {
    necklace: `Necklace`,
    ring: `Ring`,
    bracelet: `Bracelet`,
    belt: `Belt`,
    trinket: `Trinket`,
};
/** When an effect of a wearable item is activated */
export const WORLD_WEARABLE_EFFECT_ACTIVATION = [
    "when-attacking",
    "when-defending",
];

/** When an effect of a wearable item is activated */
export type WorldWearableEffectActivation = "when-attacking" | "when-defending";

/** Descriptions for Wearable Effect Activation */
export const WORLD_WEARABLE_EFFECT_ACTIVATION_DESCRIPTIONS = {
    "when-attacking": `The effect is activated when attacking an enemy.`,
    "when-defending": `The effect is activated when defending against an enemy.`,
};

/** Display values for Wearable Effect Activation */
export const WORLD_WEARABLE_EFFECT_ACTIVATION_DISPLAYS = {
    "when-attacking": `When Attacking`,
    "when-defending": `When Defending`,
};
/** The type of effect provided by a wearable item */
export const WORLD_WEARABLE_EFFECT_TYPE = ["heal", "damage", "destroy-item"];

/** The type of effect provided by a wearable item */
export type WorldWearableEffectType = "heal" | "damage" | "destroy-item";

/** Descriptions for Wearable Effect Type */
export const WORLD_WEARABLE_EFFECT_TYPE_DESCRIPTIONS = {
    heal: `The item heals you.`,
    damage: `The item deals damage to your enemy.`,
    "destroy-item": `The item destroys an item of your enemy.`,
};

/** Display values for Wearable Effect Type */
export const WORLD_WEARABLE_EFFECT_TYPE_DISPLAYS = {
    heal: `Heal`,
    damage: `Damage`,
    "destroy-item": `Destroy Item`,
};
/** The type of effect provided by a consumable item */
export const WORLD_CONSUMABLE_EFFECT_TYPE = [
    "heal",
    "damage-self",
    "damage-enemy",
    "destroy-enemy-item",
    "create-item",
    "restore-hunger",
    "restore-thirst",
    "learn-skill",
];

/** The type of effect provided by a consumable item */
export type WorldConsumableEffectType =
    | "heal"
    | "damage-self"
    | "damage-enemy"
    | "destroy-enemy-item"
    | "create-item"
    | "restore-hunger"
    | "restore-thirst"
    | "learn-skill";

/** Descriptions for Consumable Effect Type */
export const WORLD_CONSUMABLE_EFFECT_TYPE_DESCRIPTIONS = {
    heal: `The item heals you.`,
    "damage-self": `The item damages you.`,
    "damage-enemy": `The item damages your enemy.`,
    "destroy-enemy-item": `The item destroys an item of your enemy.`,
    "create-item": `The item creates a new item in your inventory.`,
    "restore-hunger": `The item restores your hunger level.`,
    "restore-thirst": `The item restores your thirst level.`,
    "learn-skill": `The item teaches you a new skill.`,
};

/** Display values for Consumable Effect Type */
export const WORLD_CONSUMABLE_EFFECT_TYPE_DISPLAYS = {
    heal: `Heal`,
    "damage-self": `Damage Self`,
    "damage-enemy": `Damage Enemy`,
    "destroy-enemy-item": `Destroy Enemy Item`,
    "create-item": `Create Item`,
    "restore-hunger": `Restore Hunger`,
    "restore-thirst": `Restore Thirst`,
    "learn-skill": `Learn Skill`,
};
/** The race or species of a non-player character */
export const WORLD_NPC_RACE = ["human", "elf", "dwarf", "orc", "animal"];

/** The race or species of a non-player character */
export type WorldNpcRace = "human" | "elf" | "dwarf" | "orc" | "animal";

/** Descriptions for Npc Race */
export const WORLD_NPC_RACE_DESCRIPTIONS = {
    human: `The most common race, known for versatility and adaptability.`,
    elf: `A graceful, long-lived race with a deep connection to nature.`,
    dwarf: `A stout, sturdy race known for mining and craftsmanship.`,
    orc: `A strong, warrior-like race with a fearsome reputation.`,
    animal: `Non-humanoid creatures, varying greatly in appearance and behavior.`,
};

/** Display values for Npc Race */
export const WORLD_NPC_RACE_DISPLAYS = {
    human: `Human`,
    elf: `Elf`,
    dwarf: `Dwarf`,
    orc: `Orc`,
    animal: `Animal`,
};
/** The stance of the NPC towards the player character */
export const WORLD_NPC_STANCE = ["friendly", "neutral", "hostile"];

/** The stance of the NPC towards the player character */
export type WorldNpcStance = "friendly" | "neutral" | "hostile";

/** Descriptions for Npc Stance */
export const WORLD_NPC_STANCE_DESCRIPTIONS = {
    friendly: `They don't necessarily like the player, but they engage in conversation and trade with them.`,
    neutral: `They don't care about the player, they are just there.`,
    hostile: `They attack the player on sight.`,
};

/** Display values for Npc Stance */
export const WORLD_NPC_STANCE_DISPLAYS = {
    friendly: `Friendly`,
    neutral: `Neutral`,
    hostile: `Hostile`,
};
/** Traits defining the personality of a non-player character */
export const WORLD_NPC_PERSONALITY_TRAIT = [
    "kind",
    "cruel",
    "brave",
    "cowardly",
    "honest",
    "deceptive",
    "generous",
    "greedy",
    "patient",
    "impatient",
    "loyal",
    "treacherous",
    "curious",
    "apathetic",
    "optimistic",
    "pessimistic",
    "humble",
    "arrogant",
    "diligent",
    "lazy",
    "empathetic",
    "selfish",
    "forgiving",
    "vengeful",
    "cheerful",
    "gloomy",
    "adventurous",
    "cautious",
    "disciplined",
    "undisciplined",
    "compassionate",
    "indifferent",
];

/** Traits defining the personality of a non-player character */
export type WorldNpcPersonalityTrait =
    | "kind"
    | "cruel"
    | "brave"
    | "cowardly"
    | "honest"
    | "deceptive"
    | "generous"
    | "greedy"
    | "patient"
    | "impatient"
    | "loyal"
    | "treacherous"
    | "curious"
    | "apathetic"
    | "optimistic"
    | "pessimistic"
    | "humble"
    | "arrogant"
    | "diligent"
    | "lazy"
    | "empathetic"
    | "selfish"
    | "forgiving"
    | "vengeful"
    | "cheerful"
    | "gloomy"
    | "adventurous"
    | "cautious"
    | "disciplined"
    | "undisciplined"
    | "compassionate"
    | "indifferent";

/** Descriptions for Npc Personality Trait */
export const WORLD_NPC_PERSONALITY_TRAIT_DESCRIPTIONS = {
    kind: `Compassionate and helpful, showing genuine care for others.`,
    cruel: `Enjoys causing pain and suffering, lacking empathy.`,
    brave: `Faces danger with courage and resolve.`,
    cowardly: `Easily frightened and avoids risky situations.`,
    honest: `Truthful and forthright, values integrity.`,
    deceptive: `Manipulative and skilled at hiding the truth.`,
    generous: `Willing to give freely, often at personal cost.`,
    greedy: `Desires wealth and possessions, often at the expense of others.`,
    patient: `Calm and able to endure hardship without frustration.`,
    impatient: `Easily frustrated, dislikes waiting or delays.`,
    loyal: `Devoted and faithful, stands by allies no matter the cost.`,
    treacherous: `Untrustworthy and likely to betray others for personal gain.`,
    curious: `Eager to learn and explore new things.`,
    apathetic: `Lacks interest or enthusiasm, indifferent to most situations.`,
    optimistic: `Tends to see the bright side, expects positive outcomes.`,
    pessimistic: `Focuses on the negative, expects the worst to happen.`,
    humble: `Modest and unassuming, does not boast about achievements.`,
    arrogant: `Overly proud and self-important, often looks down on others.`,
    diligent: `Hardworking and attentive, puts in effort to complete tasks.`,
    lazy: `Avoids work and seeks the easiest path, often idle.`,
    empathetic: `Feels and understands the emotions of others deeply.`,
    selfish: `Prioritizes personal gain over the needs of others.`,
    forgiving: `Willing to let go of past wrongs and offer second chances.`,
    vengeful: `Holds grudges and seeks retribution for perceived slights.`,
    cheerful: `Maintains a positive demeanor, spreading joy to those around.`,
    gloomy: `Often downcast, focusing on life's hardships and struggles.`,
    adventurous: `Thrives on excitement and seeks out thrilling experiences.`,
    cautious: `Careful and risk-averse, tends to overthink actions.`,
    disciplined: `Strictly follows routines and rules, has strong self-control.`,
    undisciplined: `Struggles with self-control, often inconsistent in actions.`,
    compassionate: `Deeply caring and empathetic toward others' suffering.`,
    indifferent: `Detached, often unbothered by the needs or feelings of others.`,
};

/** Display values for Npc Personality Trait */
export const WORLD_NPC_PERSONALITY_TRAIT_DISPLAYS = {
    kind: `Kind`,
    cruel: `Cruel`,
    brave: `Brave`,
    cowardly: `Cowardly`,
    honest: `Honest`,
    deceptive: `Deceptive`,
    generous: `Generous`,
    greedy: `Greedy`,
    patient: `Patient`,
    impatient: `Impatient`,
    loyal: `Loyal`,
    treacherous: `Treacherous`,
    curious: `Curious`,
    apathetic: `Apathetic`,
    optimistic: `Optimistic`,
    pessimistic: `Pessimistic`,
    humble: `Humble`,
    arrogant: `Arrogant`,
    diligent: `Diligent`,
    lazy: `Lazy`,
    empathetic: `Empathetic`,
    selfish: `Selfish`,
    forgiving: `Forgiving`,
    vengeful: `Vengeful`,
    cheerful: `Cheerful`,
    gloomy: `Gloomy`,
    adventurous: `Adventurous`,
    cautious: `Cautious`,
    disciplined: `Disciplined`,
    undisciplined: `Undisciplined`,
    compassionate: `Compassionate`,
    indifferent: `Indifferent`,
};
/** The background story of a non-player character */
export const WORLD_NPC_BACKGROUND = [
    "peasant",
    "noble",
    "merchant",
    "blacksmith",
    "healer",
    "scholar",
    "soldier",
    "orphan",
    "hunter",
    "priest",
    "criminal",
    "farmer",
    "entertainer",
    "sailor",
    "herbalist",
    "beggar",
    "explorer",
    "artisan",
    "exiled",
    "witch",
    "wanderer",
    "miner",
    "diplomat",
    "gladiator",
    "librarian",
    "spy",
    "fisherman",
    "innkeeper",
    "alchemist",
    "nomad",
    "farmer-child",
    "thief",
    "artist",
    "herbal-healer",
    "monk",
    "gravedigger",
    "black-market-dealer",
    "escaped-slave",
    "deserter",
    "merchant-apprentice",
];

/** The background story of a non-player character */
export type WorldNpcBackground =
    | "peasant"
    | "noble"
    | "merchant"
    | "blacksmith"
    | "healer"
    | "scholar"
    | "soldier"
    | "orphan"
    | "hunter"
    | "priest"
    | "criminal"
    | "farmer"
    | "entertainer"
    | "sailor"
    | "herbalist"
    | "beggar"
    | "explorer"
    | "artisan"
    | "exiled"
    | "witch"
    | "wanderer"
    | "miner"
    | "diplomat"
    | "gladiator"
    | "librarian"
    | "spy"
    | "fisherman"
    | "innkeeper"
    | "alchemist"
    | "nomad"
    | "farmer-child"
    | "thief"
    | "artist"
    | "herbal-healer"
    | "monk"
    | "gravedigger"
    | "black-market-dealer"
    | "escaped-slave"
    | "deserter"
    | "merchant-apprentice";

/** Descriptions for Npc Background */
export const WORLD_NPC_BACKGROUND_DESCRIPTIONS = {
    peasant: `Born and raised in a rural village, they have spent most of their life toiling in the fields. Their hands are calloused, and they know the value of hard work. They have little, but they appreciate the simple things in life.`,
    noble: `Raised in the luxury of a noble family, they are accustomed to fine clothing, formal gatherings, and the politics of high society. They hold a sense of entitlement but may struggle with the practicalities of everyday life.`,
    merchant: `A skilled trader who has spent years traveling between towns and cities. They are shrewd and observant, always on the lookout for a good deal or potential profit. They are well-versed in negotiation and have a silver tongue.`,
    blacksmith: `With strong arms and a steady hand, they have forged weapons, tools, and armor for many years. They take pride in their craft, and their face often bears a layer of soot. They are practical and straightforward in their speech.`,
    healer: `A compassionate individual who has dedicated their life to tending to the sick and injured. They are gentle but firm, often calm in the face of crisis. They carry a deep understanding of herbs and medicine.`,
    scholar: `An avid reader and thinker, they have spent years studying ancient texts and learning about the world’s history. They are well-spoken and enjoy intellectual debates, but may be socially awkward or dismissive of those less educated.`,
    soldier: `Hardened by years of battle, they carry the weight of war on their shoulders. Disciplined and loyal, they follow orders without question, but their eyes show the fatigue of witnessing countless conflicts.`,
    orphan: `They grew up without parents, learning to fend for themselves from a young age. Resourceful and resilient, they often keep their guard up, trusting few. Their childhood was harsh, and it has shaped them into a survivor.`,
    hunter: `Skilled in tracking and archery, they have spent much of their life in the wilderness. They are quiet and observant, preferring the company of nature to crowded cities. They are quick on their feet and have sharp instincts.`,
    priest: `A devoted follower of their faith, they provide guidance and spiritual support to the community. They speak with a calm, reassuring voice and often offer words of wisdom. Their demeanor is serene, but they may struggle with doubt.`,
    criminal: `Having lived a life on the wrong side of the law, they are street-smart and cunning. They have connections in the underground world and know how to manipulate situations to their advantage. They are always looking for the next score.`,
    farmer: `A hardworking individual, they are familiar with the cycles of planting and harvest. Their life revolves around the land and the seasons. They are pragmatic and speak plainly, valuing honesty and integrity.`,
    entertainer: `Whether a bard, dancer, or acrobat, they have spent their life performing for others. They are charismatic and enjoy being the center of attention, often masking their own troubles behind a smile or a joke.`,
    sailor: `With skin weathered by sun and salt, they have spent years at sea. They are used to a life of adventure and hardship, often speaking in nautical terms. They have a relaxed attitude but are ready to fight when danger arises.`,
    herbalist: `Living close to nature, they have a deep knowledge of plants and their medicinal properties. They are often found foraging in the woods or brewing potions. They have a mystical air about them, and some believe they possess magical abilities.`,
    beggar: `Once a person of better fortune, they have fallen on hard times and now live on the streets. They are desperate but not without pride, trying to maintain a shred of dignity despite their circumstances. They know the city’s hidden corners well.`,
    explorer: `Driven by a thirst for adventure, they have traveled far and wide, seeking out uncharted lands and hidden treasures. They are bold and fearless, often regaling others with tales of their exploits. Their spirit is restless, always seeking the next discovery.`,
    artisan: `A skilled craftsman, they take pride in creating beautiful works of art, be it pottery, paintings, or sculptures. They are meticulous and patient, often lost in thought as they perfect their creations. They have a deep appreciation for beauty.`,
    exiled: `Banished from their homeland for reasons they may or may not speak about, they are haunted by their past. They are a wanderer now, looking for a place to belong. There is a sense of sorrow and regret in their demeanor.`,
    witch: `Living on the outskirts of society, they are feared and respected for their knowledge of the dark arts. They have a mysterious, otherworldly presence and are often shunned by the superstitious. They carry secrets few dare to uncover.`,
    wanderer: `A nomadic soul with no fixed home, drifting from place to place in search of new experiences and people. They are adaptable and know how to survive on the road.`,
    miner: `Spent most of their life deep underground, extracting precious metals and stones. Their hands are rough, and they speak in a gruff, straightforward manner.`,
    diplomat: `Skilled in the art of negotiation and persuasion, they have spent years brokering peace and alliances between warring factions. They are eloquent and tactful.`,
    gladiator: `A fierce warrior trained in the arena, fighting for glory and survival. They are strong, disciplined, and unafraid of death, accustomed to the roar of the crowd.`,
    librarian: `Spent years tending to ancient books and scrolls, surrounded by the scent of old paper. They are knowledgeable, introverted, and value the power of knowledge.`,
    spy: `Trained in espionage and deception, they are masters of disguise and information gathering. They are secretive, observant, and trust very few people.`,
    fisherman: `A life spent at sea or by the river, casting nets and hauling in the day’s catch. They are patient and resilient, often speaking in slow, measured tones.`,
    innkeeper: `Owns and runs a bustling tavern, greeting travelers with a smile and a warm meal. They are social and good listeners, often hearing the latest gossip.`,
    alchemist: `A seeker of knowledge in the mystical arts of transformation and potion-making. They are curious, experimental, and sometimes eccentric.`,
    nomad: `Belongs to a wandering tribe, constantly on the move with their people and belongings. They value freedom and live in tune with the natural world.`,
    "farmer-child": `Grew up on a farm, learning the ways of the land from a young age. They are strong, used to hard work, and have a deep connection to nature.`,
    thief: `Grew up on the streets, learning to steal to survive. They are quick, nimble, and have a sharp eye for valuable items. They are always watching their surroundings.`,
    artist: `Devoted their life to creating beauty, be it painting, sculpture, or music. They are passionate and often sensitive, viewing the world through a unique lens.`,
    "herbal-healer": `Spent years living in the wilderness, gathering herbs and creating remedies. They are quiet and calm, with a deep knowledge of plants and their uses.`,
    monk: `Lives a life of solitude and meditation, dedicated to spiritual growth and self-discipline. They speak with a calm, measured voice and often offer words of wisdom.`,
    gravedigger: `Spent years burying the dead, often working alone in silence. They are somber and introspective, with a unique perspective on life and death.`,
    "black-market-dealer": `Knows the ins and outs of the underground economy, dealing in forbidden or rare items. They are shrewd, secretive, and well-connected in the criminal world.`,
    "escaped-slave": `Fled a life of servitude and now seeks freedom above all else. They are wary of authority and often carry the scars, both physical and emotional, of their past.`,
    deserter: `Once a soldier who abandoned their post, now on the run or trying to start a new life. They are haunted by their decision and may struggle with guilt or shame.`,
    "merchant-apprentice": `Trained under a successful merchant, learning the art of trade and negotiation. They are eager to prove themselves and have a good head for business.`,
};

/** Display values for Npc Background */
export const WORLD_NPC_BACKGROUND_DISPLAYS = {
    peasant: `Peasant`,
    noble: `Noble`,
    merchant: `Merchant`,
    blacksmith: `Blacksmith`,
    healer: `Healer`,
    scholar: `Scholar`,
    soldier: `Soldier`,
    orphan: `Orphan`,
    hunter: `Hunter`,
    priest: `Priest`,
    criminal: `Criminal`,
    farmer: `Farmer`,
    entertainer: `Entertainer`,
    sailor: `Sailor`,
    herbalist: `Herbalist`,
    beggar: `Beggar`,
    explorer: `Explorer`,
    artisan: `Artisan`,
    exiled: `Exiled`,
    witch: `Witch`,
    wanderer: `Wanderer`,
    miner: `Miner`,
    diplomat: `Diplomat`,
    gladiator: `Gladiator`,
    librarian: `Librarian`,
    spy: `Spy`,
    fisherman: `Fisherman`,
    innkeeper: `Innkeeper`,
    alchemist: `Alchemist`,
    nomad: `Nomad`,
    "farmer-child": `Farmer Child`,
    thief: `Thief`,
    artist: `Artist`,
    "herbal-healer": `Herbal Healer`,
    monk: `Monk`,
    gravedigger: `Gravedigger`,
    "black-market-dealer": `Black Market Dealer`,
    "escaped-slave": `Escaped Slave`,
    deserter: `Deserter`,
    "merchant-apprentice": `Merchant Apprentice`,
};
/** The gender of a non-player character */
export const WORLD_NPC_GENDER = ["male", "female"];

/** The gender of a non-player character */
export type WorldNpcGender = "male" | "female";

/** Descriptions for Npc Gender */
export const WORLD_NPC_GENDER_DESCRIPTIONS = {
    male: `He is a man.`,
    female: `She is a woman.`,
};

/** Display values for Npc Gender */
export const WORLD_NPC_GENDER_DISPLAYS = {
    male: `Male`,
    female: `Female`,
};
/** The age category of a non-player character */
export const WORLD_NPC_AGE = ["young-adult", "adult", "middle-aged", "elderly"];

/** The age category of a non-player character */
export type WorldNpcAge = "young-adult" | "adult" | "middle-aged" | "elderly";

/** Descriptions for Npc Age */
export const WORLD_NPC_AGE_DESCRIPTIONS = {
    "young-adult": `Typically in their late teens to early twenties, full of energy and ambition.`,
    adult: `In the prime of their life, experienced and capable.`,
    "middle-aged": `Past their youth, often more wise and reflective.`,
    elderly: `Advanced in age, with many years of experience and a slower pace.`,
};

/** Display values for Npc Age */
export const WORLD_NPC_AGE_DISPLAYS = {
    "young-adult": `Young Adult`,
    adult: `Adult`,
    "middle-aged": `Middle Aged`,
    elderly: `Elderly`,
};
/** The action that a non-player character can take */
export const WORLD_NPC_ACTION = ["talk", "attack"];

/** The action that a non-player character can take */
export type WorldNpcAction = "talk" | "attack";

/** Descriptions for Npc Action */
export const WORLD_NPC_ACTION_DESCRIPTIONS = {
    talk: `I say something.`,
    attack: `I attack the player.`,
};

/** Display values for Npc Action */
export const WORLD_NPC_ACTION_DISPLAYS = {
    talk: `Talk`,
    attack: `Attack`,
};
/** The temperature of a world node */
export const WORLD_NODE_TEMPERATURE = [
    "freezing",
    "cold",
    "cool",
    "mild",
    "warm",
    "hot",
    "scorching",
];

/** The temperature of a world node */
export type WorldNodeTemperature =
    | "freezing"
    | "cold"
    | "cool"
    | "mild"
    | "warm"
    | "hot"
    | "scorching";

/** Descriptions for Node Temperature */
export const WORLD_NODE_TEMPERATURE_DESCRIPTIONS = {
    freezing: `Extremely cold, ice and snow are common.`,
    cold: `Chilly, requires warm clothing for comfort.`,
    cool: `Mildly cold, a refreshing breeze is felt.`,
    mild: `Pleasantly temperate, neither hot nor cold.`,
    warm: `Comfortably warm, typical of spring or summer.`,
    hot: `Very warm, can cause discomfort without shade.`,
    scorching: `Extremely hot, the heat is intense and oppressive.`,
};

/** Display values for Node Temperature */
export const WORLD_NODE_TEMPERATURE_DISPLAYS = {
    freezing: `Freezing`,
    cold: `Cold`,
    cool: `Cool`,
    mild: `Mild`,
    warm: `Warm`,
    hot: `Hot`,
    scorching: `Scorching`,
};
/** The humidity level of a world node */
export const WORLD_NODE_HUMIDITY = ["dry", "normal", "humid", "wet"];

/** The humidity level of a world node */
export type WorldNodeHumidity = "dry" | "normal" | "humid" | "wet";

/** Descriptions for Node Humidity */
export const WORLD_NODE_HUMIDITY_DESCRIPTIONS = {
    dry: `Very low moisture, arid conditions.`,
    normal: `Balanced moisture, typical humidity levels.`,
    humid: `High moisture, feels damp or sticky.`,
    wet: `Saturated with moisture, rain or mist is common.`,
};

/** Display values for Node Humidity */
export const WORLD_NODE_HUMIDITY_DISPLAYS = {
    dry: `Dry`,
    normal: `Normal`,
    humid: `Humid`,
    wet: `Wet`,
};
/** Type of a location node */
export const WORLD_NODE_AREA_TYPE = [
    "root",
    "wilderness",
    "settlement",
    "street",
    "building",
    "room",
];

/** Type of a location node */
export type WorldNodeAreaType =
    | "root"
    | "wilderness"
    | "settlement"
    | "street"
    | "building"
    | "room";

/** Descriptions for Node Area Type */
export const WORLD_NODE_AREA_TYPE_DESCRIPTIONS = {
    root: `The end of the world, a huge volcano.`,
    wilderness: `An area of untamed nature, with forests, rivers, and wildlife.`,
    settlement: `Entrance to the streets of a town or village.`,
    street: `A paved road or path, often lined with buildings and shops.`,
    building: `The main place and entrance of a building.`,
    room: `A room inside a building.`,
};

/** Display values for Node Area Type */
export const WORLD_NODE_AREA_TYPE_DISPLAYS = {
    root: `Root`,
    wilderness: `Wilderness`,
    settlement: `Settlement`,
    street: `Street`,
    building: `Building`,
    room: `Room`,
};
/** Type of settlement */
export const WORLD_NODE_SETTLEMENT_TYPE = ["village", "town"];

/** Type of settlement */
export type WorldNodeSettlementType = "village" | "town";

/** Descriptions for Node Settlement Type */
export const WORLD_NODE_SETTLEMENT_TYPE_DESCRIPTIONS = {
    village: `A small community of homes and shops, often surrounded by farmland.`,
    town: `A larger settlement with more amenities and services, such as a market or inn.`,
};

/** Display values for Node Settlement Type */
export const WORLD_NODE_SETTLEMENT_TYPE_DISPLAYS = {
    village: `Village`,
    town: `Town`,
};
/** Type of wilderness */
export const WORLD_NODE_WILDERNESS_TYPE = [
    "forest",
    "mountain",
    "river",
    "lake",
    "cave",
    "swamp",
    "desert",
    "tundra",
];

/** Type of wilderness */
export type WorldNodeWildernessType =
    | "forest"
    | "mountain"
    | "river"
    | "lake"
    | "cave"
    | "swamp"
    | "desert"
    | "tundra";

/** Descriptions for Node Wilderness Type */
export const WORLD_NODE_WILDERNESS_TYPE_DESCRIPTIONS = {
    forest: `A dense forest with towering trees and undergrowth.`,
    mountain: `A rugged mountain range with steep cliffs and rocky terrain.`,
    river: `A flowing river with clear water and banks of pebbles.`,
    lake: `A calm lake with still waters and a peaceful atmosphere.`,
    cave: `A dark system of underground tunnels and chambers.`,
    swamp: `A marshy area with murky water and tangled vegetation.`,
    desert: `A vast expanse of sand dunes and scorching heat.`,
    tundra: `A frozen wasteland of ice and snow, with biting winds.`,
};

/** Display values for Node Wilderness Type */
export const WORLD_NODE_WILDERNESS_TYPE_DISPLAYS = {
    forest: `Forest`,
    mountain: `Mountain`,
    river: `River`,
    lake: `Lake`,
    cave: `Cave`,
    swamp: `Swamp`,
    desert: `Desert`,
    tundra: `Tundra`,
};
/** Type of street */
export const WORLD_NODE_STREET_TYPE = ["village-street", "town-street"];

/** Type of street */
export type WorldNodeStreetType = "village-street" | "town-street";

/** Descriptions for Node Street Type */
export const WORLD_NODE_STREET_TYPE_DESCRIPTIONS = {
    "village-street": `Street of a village.`,
    "town-street": `Street of a town.`,
};

/** Display values for Node Street Type */
export const WORLD_NODE_STREET_TYPE_DISPLAYS = {
    "village-street": `Village Street`,
    "town-street": `Town Street`,
};
/** Type of building */
export const WORLD_NODE_BUILDING_TYPE = [
    "house",
    "blacksmith",
    "tavern",
    "town-hall",
    "church",
    "farm",
    "store",
];

/** Type of building */
export type WorldNodeBuildingType =
    | "house"
    | "blacksmith"
    | "tavern"
    | "town-hall"
    | "church"
    | "farm"
    | "store";

/** Descriptions for Node Building Type */
export const WORLD_NODE_BUILDING_TYPE_DESCRIPTIONS = {
    house: `House of a family or individual.`,
    blacksmith: `A workshop where metal is forged and crafted.`,
    tavern: `A place to eat, drink, and socialize with other travelers.`,
    "town-hall": `The administrative center, and official place of gathering.`,
    church: `A place of worship and spiritual reflection.`,
    farm: `A place where crops are grown and animals are raised.`,
    store: `A generic or specialized store for buying and selling goods.`,
};

/** Display values for Node Building Type */
export const WORLD_NODE_BUILDING_TYPE_DISPLAYS = {
    house: `House`,
    blacksmith: `Blacksmith`,
    tavern: `Tavern`,
    "town-hall": `Town Hall`,
    church: `Church`,
    farm: `Farm`,
    store: `Store`,
};
/** Type of room */
export const WORLD_NODE_ROOM_TYPE = [
    "bedroom",
    "kitchen",
    "hall",
    "workshop",
    "storage",
    "store",
];

/** Type of room */
export type WorldNodeRoomType =
    | "bedroom"
    | "kitchen"
    | "hall"
    | "workshop"
    | "storage"
    | "store";

/** Descriptions for Node Room Type */
export const WORLD_NODE_ROOM_TYPE_DESCRIPTIONS = {
    bedroom: `A room for sleeping and resting.`,
    kitchen: `A room for preparing and cooking food.`,
    hall: `A large, open space.`,
    workshop: `A space for crafting and creating items.`,
    storage: `A room for storing goods and supplies.`,
    store: `A place to buy and sell goods.`,
};

/** Display values for Node Room Type */
export const WORLD_NODE_ROOM_TYPE_DISPLAYS = {
    bedroom: `Bedroom`,
    kitchen: `Kitchen`,
    hall: `Hall`,
    workshop: `Workshop`,
    storage: `Storage`,
    store: `Store`,
};
/** The class of the player character */
export const WORLD_PLAYER_CLASS = ["knight", "archer", "mage"];

/** The class of the player character */
export type WorldPlayerClass = "knight" | "archer" | "mage";

/** Descriptions for Player Class */
export const WORLD_PLAYER_CLASS_DESCRIPTIONS = {
    knight: `A noble warrior skilled in combat and defense. Has the skills to wield any kind of melee weapon.`,
    archer: `A skilled marksman who excels at ranged combat. Has the skills to wield ranged weapons, knives and daggers.`,
    mage: `A wielder of arcane magic, capable of casting powerful spells. Has the skills to wield staves, knives and daggers.`,
};

/** Display values for Player Class */
export const WORLD_PLAYER_CLASS_DISPLAYS = {
    knight: `Knight`,
    archer: `Archer`,
    mage: `Mage`,
};
/** The health status of a player character */
export const WORLD_PLAYER_HEALTH = [
    "healthy",
    "injured",
    "sick",
    "poisoned",
    "cursed",
    "dead",
];

/** The health status of a player character */
export type WorldPlayerHealth =
    | "healthy"
    | "injured"
    | "sick"
    | "poisoned"
    | "cursed"
    | "dead";

/** Descriptions for Player Health */
export const WORLD_PLAYER_HEALTH_DESCRIPTIONS = {
    healthy: `In good physical condition, free from injury or illness.`,
    injured: `Suffering from wounds or physical trauma, in need of healing.`,
    sick: `Afflicted by illness or disease, weakened and in need of rest.`,
    poisoned: `Affected by toxins or venom, suffering from harmful effects.`,
    cursed: `Under a malevolent enchantment, suffering from supernatural afflictions.`,
    dead: `No longer living, the spirit has departed from the body.`,
};

/** Display values for Player Health */
export const WORLD_PLAYER_HEALTH_DISPLAYS = {
    healthy: `Healthy`,
    injured: `Injured`,
    sick: `Sick`,
    poisoned: `Poisoned`,
    cursed: `Cursed`,
    dead: `Dead`,
};
/** The hunger level of a player character */
export const WORLD_PLAYER_HUNGER = [
    "full",
    "slightly-hungry",
    "hungry",
    "starving",
];

/** The hunger level of a player character */
export type WorldPlayerHunger =
    | "full"
    | "slightly-hungry"
    | "hungry"
    | "starving";

/** Descriptions for Player Hunger */
export const WORLD_PLAYER_HUNGER_DESCRIPTIONS = {
    full: `Satiated and content, with no immediate need for food.`,
    "slightly-hungry": `Feeling a bit peckish, could use a snack or light meal.`,
    hungry: `Feeling hungry, you could use a good meal to satisfy your appetite.`,
    starving: `Starving and weak, in urgent need of food.`,
};

/** Display values for Player Hunger */
export const WORLD_PLAYER_HUNGER_DISPLAYS = {
    full: `Full`,
    "slightly-hungry": `Slightly Hungry`,
    hungry: `Hungry`,
    starving: `Starving`,
};
/** The thirst level of a player character */
export const WORLD_PLAYER_THIRST = [
    "hydrated",
    "slightly-thirsty",
    "thirsty",
    "dehydrated",
];

/** The thirst level of a player character */
export type WorldPlayerThirst =
    | "hydrated"
    | "slightly-thirsty"
    | "thirsty"
    | "dehydrated";

/** Descriptions for Player Thirst */
export const WORLD_PLAYER_THIRST_DESCRIPTIONS = {
    hydrated: `Well-hydrated and comfortable, with no immediate need for water.`,
    "slightly-thirsty": `Feeling a bit parched, could use a drink to quench your thirst.`,
    thirsty: `Feeling thirsty, you could use a refreshing drink to hydrate.`,
    dehydrated: `Dehydrated and weak, in urgent need of water.`,
};

/** Display values for Player Thirst */
export const WORLD_PLAYER_THIRST_DISPLAYS = {
    hydrated: `Hydrated`,
    "slightly-thirsty": `Slightly Thirsty`,
    thirsty: `Thirsty`,
    dehydrated: `Dehydrated`,
};
/** Skills are required to be able to perform actions in the game */
export const WORLD_PLAYER_SKILL = [
    "wield-sword",
    "wield-axe",
    "wield-bow",
    "wield-crossbow",
    "wield-knife",
    "wield-dagger",
    "wield-staff",
];

/** Skills are required to be able to perform actions in the game */
export type WorldPlayerSkill =
    | "wield-sword"
    | "wield-axe"
    | "wield-bow"
    | "wield-crossbow"
    | "wield-knife"
    | "wield-dagger"
    | "wield-staff";

/** Descriptions for Player Skill */
export const WORLD_PLAYER_SKILL_DESCRIPTIONS = {
    "wield-sword": `The ability to wield a sword as a weapon.`,
    "wield-axe": `The ability to wield an axe as a weapon.`,
    "wield-bow": `The ability to wield a bow as a weapon.`,
    "wield-crossbow": `The ability to wield a crossbow as a weapon.`,
    "wield-knife": `The ability to wield a knife as a weapon.`,
    "wield-dagger": `The ability to wield a dagger as a weapon.`,
    "wield-staff": `The ability to wield a staff as a weapon.`,
};

/** Display values for Player Skill */
export const WORLD_PLAYER_SKILL_DISPLAYS = {
    "wield-sword": `Wield Sword`,
    "wield-axe": `Wield Axe`,
    "wield-bow": `Wield Bow`,
    "wield-crossbow": `Wield Crossbow`,
    "wield-knife": `Wield Knife`,
    "wield-dagger": `Wield Dagger`,
    "wield-staff": `Wield Staff`,
};
/** The equipment slots available for the player character */
export const WORLD_PLAYER_EQUIP_SLOT = [
    "helmet",
    "armor",
    "boots",
    "weapon",
    "wearable",
];

/** The equipment slots available for the player character */
export type WorldPlayerEquipSlot =
    | "helmet"
    | "armor"
    | "boots"
    | "weapon"
    | "wearable";

/** Descriptions for Player Equip Slot */
export const WORLD_PLAYER_EQUIP_SLOT_DESCRIPTIONS = {
    helmet: `Slot for helmets.`,
    armor: `Slot for chest armor.`,
    boots: `Slot for boots.`,
    weapon: `Slot for weapons.`,
    wearable: `Slot for wearable accessories.`,
};

/** Display values for Player Equip Slot */
export const WORLD_PLAYER_EQUIP_SLOT_DISPLAYS = {
    helmet: `Helmet`,
    armor: `Armor`,
    boots: `Boots`,
    weapon: `Weapon`,
    wearable: `Wearable`,
};
/** The player is always exactly in one of these situations */
export const WORLD_PLAYER_SITUTATION = [
    "wandering",
    "combat",
    "conversation",
    "settled",
];

/** The player is always exactly in one of these situations */
export type WorldPlayerSitutation =
    | "wandering"
    | "combat"
    | "conversation"
    | "settled";

/** Descriptions for Player Situtation */
export const WORLD_PLAYER_SITUTATION_DESCRIPTIONS = {
    wandering: `The player is wandering around, looting, traveling, etc.`,
    combat: `The player is in combat, fighting against an enemy.`,
    conversation: `The player is in a conversation with an NPC`,
    settled: `The player is currently settled, ready to do work requiring focus, or rest.`,
};

/** Display values for Player Situtation */
export const WORLD_PLAYER_SITUTATION_DISPLAYS = {
    wandering: `Wandering`,
    combat: `Combat`,
    conversation: `Conversation`,
    settled: `Settled`,
};
/** Action, that can be taken by the player while wandering */
export const WORLD_PLAYER_WANDERING_ACTION = [
    "pick-up",
    "drop",
    "equip",
    "unequip",
    "move",
    "look-around",
    "settle-down",
    "talk",
    "trade",
    "attack",
    "use-item",
    "eat",
    "drink",
    "unpack",
];

/** Action, that can be taken by the player while wandering */
export type WorldPlayerWanderingAction =
    | "pick-up"
    | "drop"
    | "equip"
    | "unequip"
    | "move"
    | "look-around"
    | "settle-down"
    | "talk"
    | "trade"
    | "attack"
    | "use-item"
    | "eat"
    | "drink"
    | "unpack";

/** Descriptions for Player Wandering Action */
export const WORLD_PLAYER_WANDERING_ACTION_DESCRIPTIONS = {
    "pick-up": `Pick up an item from the current location`,
    drop: `Drop an item from the inventory at the current location`,
    equip: `Equip an item from the inventory`,
    unequip: `Unequip an item and put it back into the inventory`,
    move: `Move to a different location`,
    "look-around": `Look for paths, items and NPCs at this location`,
    "settle-down": `Settle down at the current location`,
    talk: `Talk to an NPC at the current location`,
    trade: `Trade with an NPC at the current location`,
    attack: `Attack an NPC at the current location`,
    "use-item": `Use an item from the inventory`,
    eat: `Eat food from the inventory`,
    drink: `Drink a beverage from the inventory`,
    unpack: `Unpack the contents of a container at the current location`,
};

/** Display values for Player Wandering Action */
export const WORLD_PLAYER_WANDERING_ACTION_DISPLAYS = {
    "pick-up": `Pick Up`,
    drop: `Drop`,
    equip: `Equip`,
    unequip: `Unequip`,
    move: `Move`,
    "look-around": `Look Around`,
    "settle-down": `Settle Down`,
    talk: `Talk`,
    trade: `Trade`,
    attack: `Attack`,
    "use-item": `Use Item`,
    eat: `Eat`,
    drink: `Drink`,
    unpack: `Unpack`,
};
/** Action, that can be taken by the player while settled */
export const WORLD_PLAYER_SETTLED_ACTION = [
    "hit-the-road",
    "work",
    "rest",
    "eat",
    "drink",
    "use-item",
    "unpack",
    "craft",
];

/** Action, that can be taken by the player while settled */
export type WorldPlayerSettledAction =
    | "hit-the-road"
    | "work"
    | "rest"
    | "eat"
    | "drink"
    | "use-item"
    | "unpack"
    | "craft";

/** Descriptions for Player Settled Action */
export const WORLD_PLAYER_SETTLED_ACTION_DESCRIPTIONS = {
    "hit-the-road": `Hit the road and start wandering again`,
    work: `Work on a task that requires focus (e.g. crafting)`,
    rest: `Rest and recover health`,
    eat: `Eat food from the inventory`,
    drink: `Drink a beverage from the inventory`,
    "use-item": `Use an item from the inventory`,
    unpack: `Unpack the contents of a container`,
    craft: `Engage in the combination of tools and materials`,
};

/** Display values for Player Settled Action */
export const WORLD_PLAYER_SETTLED_ACTION_DISPLAYS = {
    "hit-the-road": `Hit The Road`,
    work: `Work`,
    rest: `Rest`,
    eat: `Eat`,
    drink: `Drink`,
    "use-item": `Use Item`,
    unpack: `Unpack`,
    craft: `Craft`,
};
/** Action, that can be taken by the player while encountering something */
export const WORLD_PLAYER_ENCOUNTER_ACTION = [
    "attack",
    "talk",
    "trade",
    "flee",
];

/** Action, that can be taken by the player while encountering something */
export type WorldPlayerEncounterAction = "attack" | "talk" | "trade" | "flee";

/** Descriptions for Player Encounter Action */
export const WORLD_PLAYER_ENCOUNTER_ACTION_DESCRIPTIONS = {
    attack: `Attack the encountered entity`,
    talk: `Talk to the encountered entity`,
    trade: `Trade with the encountered entity`,
    flee: `Flee from the encountered entity`,
};

/** Display values for Player Encounter Action */
export const WORLD_PLAYER_ENCOUNTER_ACTION_DISPLAYS = {
    attack: `Attack`,
    talk: `Talk`,
    trade: `Trade`,
    flee: `Flee`,
};
/** Action, that can be taken by the player while in combat */
export const WORLD_PLAYER_COMBAT_ACTION = ["attack", "use-item"];

/** Action, that can be taken by the player while in combat */
export type WorldPlayerCombatAction = "attack" | "use-item";

/** Descriptions for Player Combat Action */
export const WORLD_PLAYER_COMBAT_ACTION_DESCRIPTIONS = {
    attack: `Attack the enemy`,
    "use-item": `Use an item from the inventory`,
};

/** Display values for Player Combat Action */
export const WORLD_PLAYER_COMBAT_ACTION_DISPLAYS = {
    attack: `Attack`,
    "use-item": `Use Item`,
};
/** Action, that can be taken by the player while in a conversation */
export const WORLD_PLAYER_CONVERSATION_ACTION = ["talk", "leave"];

/** Action, that can be taken by the player while in a conversation */
export type WorldPlayerConversationAction = "talk" | "leave";

/** Descriptions for Player Conversation Action */
export const WORLD_PLAYER_CONVERSATION_ACTION_DESCRIPTIONS = {
    talk: `Talk to the NPC`,
    leave: `Leave the conversation`,
};

/** Display values for Player Conversation Action */
export const WORLD_PLAYER_CONVERSATION_ACTION_DISPLAYS = {
    talk: `Talk`,
    leave: `Leave`,
};
/** The type of crafting performed by the player */
export const WORLD_PLAYER_CRAFTING_TYPE = [
    "disassemble",
    "smelt",
    "break",
    "assemble",
    "refine",
    "cook",
];

/** The type of crafting performed by the player */
export type WorldPlayerCraftingType =
    | "disassemble"
    | "smelt"
    | "break"
    | "assemble"
    | "refine"
    | "cook";

/** Descriptions for Player Crafting Type */
export const WORLD_PLAYER_CRAFTING_TYPE_DESCRIPTIONS = {
    disassemble: `Carefully take apart an item to extract its components.`,
    smelt: `Melt down items to extract materials.`,
    break: `Break an item into smaller pieces.`,
    assemble: `Combine components to create a new item.`,
    refine: `Improve the quality of an item by refining its components.`,
    cook: `Combine ingredients to create food, drink or consumables.`,
};

/** Display values for Player Crafting Type */
export const WORLD_PLAYER_CRAFTING_TYPE_DISPLAYS = {
    disassemble: `Disassemble`,
    smelt: `Smelt`,
    break: `Break`,
    assemble: `Assemble`,
    refine: `Refine`,
    cook: `Cook`,
};
/** A possible type of interaction during a conversation between an NPC and the player */
export const WORLD_PLAYER_NPC_INTERACTION_TYPE = ["ask", "trade", "offer-help"];

/** A possible type of interaction during a conversation between an NPC and the player */
export type WorldPlayerNpcInteractionType = "ask" | "trade" | "offer-help";

/** Descriptions for Player Npc Interaction Type */
export const WORLD_PLAYER_NPC_INTERACTION_TYPE_DESCRIPTIONS = {
    ask: `The player asks the NPC for information.`,
    trade: `The player offers a trade to the NPC.`,
    "offer-help": `The player offers help to the NPC.`,
};

/** Display values for Player Npc Interaction Type */
export const WORLD_PLAYER_NPC_INTERACTION_TYPE_DISPLAYS = {
    ask: `Ask`,
    trade: `Trade`,
    "offer-help": `Offer Help`,
};
/** Type of all events that are possible throughout the game */
export const WORLD_HISTORY_HAPPENING = [
    "wake-up",
    "end-turn",
    "action-look-around",
    "action-pick-up",
    "action-drop",
    "action-equip",
    "action-unequip",
    "action-move",
    "action-settle-down",
    "action-talk",
    "action-attack",
    "action-use-item",
    "action-flee",
    "action-buy",
    "action-sell",
    "action-leave",
    "action-rest",
    "action-work",
    "action-eat",
    "action-drink",
    "action-hit-the-road",
    "action-unpack",
    "action-craft",
    "action-trade",
    "npc-talk",
    "npc-attack",
    "get-gold",
    "spend-gold",
    "get-item",
    "lose-item",
    "change-health",
    "change-hunger",
    "change-thirst",
    "change-situation",
    "inflict-damage",
    "take-damage",
    "take-damage-from-world",
    "flee",
    "fail-flee",
    "arrive",
    "learn-skill",
    "discover-path",
    "discover-item",
    "discover-npc",
    "noop",
    "consume-inventory-item",
    "consume-location-item",
    "equip-item",
    "unequip-item",
    "unpacked-item",
    "crafted-item",
    "start-combat",
    "start-conversation",
    "defeat-npc",
    "die",
];

/** Type of all events that are possible throughout the game */
export type WorldHistoryHappening =
    | "wake-up"
    | "end-turn"
    | "action-look-around"
    | "action-pick-up"
    | "action-drop"
    | "action-equip"
    | "action-unequip"
    | "action-move"
    | "action-settle-down"
    | "action-talk"
    | "action-attack"
    | "action-use-item"
    | "action-flee"
    | "action-buy"
    | "action-sell"
    | "action-leave"
    | "action-rest"
    | "action-work"
    | "action-eat"
    | "action-drink"
    | "action-hit-the-road"
    | "action-unpack"
    | "action-craft"
    | "action-trade"
    | "npc-talk"
    | "npc-attack"
    | "get-gold"
    | "spend-gold"
    | "get-item"
    | "lose-item"
    | "change-health"
    | "change-hunger"
    | "change-thirst"
    | "change-situation"
    | "inflict-damage"
    | "take-damage"
    | "take-damage-from-world"
    | "flee"
    | "fail-flee"
    | "arrive"
    | "learn-skill"
    | "discover-path"
    | "discover-item"
    | "discover-npc"
    | "noop"
    | "consume-inventory-item"
    | "consume-location-item"
    | "equip-item"
    | "unequip-item"
    | "unpacked-item"
    | "crafted-item"
    | "start-combat"
    | "start-conversation"
    | "defeat-npc"
    | "die";

/** Descriptions for History Happening */
export const WORLD_HISTORY_HAPPENING_DESCRIPTIONS = {
    "wake-up": `You wake up in a dark room. You can't remember how you got here. In fact, you can't event remember who you are.`,
    "end-turn": `This turn has ended.`,
    "action-look-around": `You decide to take a look around, looking for details about your surroundings.`,
    "action-pick-up": `You decide to pick up an item from your current location.`,
    "action-drop": `You decide to drop an item from your inventory.`,
    "action-equip": `You decide to equip an item from your inventory.`,
    "action-unequip": `You decide to unequip an item and put it back into your inventory.`,
    "action-move": `You decide to move to a different location.`,
    "action-settle-down": `You decide to settle down at your current location.`,
    "action-talk": `You decide to talk to someone.`,
    "action-attack": `You decide to attack someone.`,
    "action-use-item": `You decide to use an item from your inventory.`,
    "action-flee": `You decide to flee from the current situation.`,
    "action-buy": `You decide to buy an item from someone.`,
    "action-sell": `You decide to sell an item to someone.`,
    "action-leave": `You decide to leave the current situation.`,
    "action-rest": `You decide to rest and recover health.`,
    "action-work": `You decide to work on a task that requires focus.`,
    "action-eat": `You decide to eat some food.`,
    "action-drink": `You decide to drink a beverage.`,
    "action-hit-the-road": `You decide to hit the road and start wandering again.`,
    "action-unpack": `You decide to unpack the contents of a container.`,
    "action-craft": `You decide to engage in the combination of tools and materials.`,
    "action-trade": `You give someone a good offer, and shake hands to perform the trade.`,
    "npc-talk": `The NPC says something.`,
    "npc-attack": `The NPC attacks you.`,
    "get-gold": `You get some gold.`,
    "spend-gold": `You spend some gold.`,
    "get-item": `You get an item.`,
    "lose-item": `You lose an item.`,
    "change-health": `Your health changes.`,
    "change-hunger": `Your hunger changes.`,
    "change-thirst": `Your thirst changes.`,
    "change-situation": `Your situation changes.`,
    "inflict-damage": `You inflict damage on someone.`,
    "take-damage": `You take damage from your foe.`,
    "take-damage-from-world": `You take damage.`,
    flee: `You successfully flee from combat.`,
    "fail-flee": `You fail to flee from combat, and your foe catches up to you.`,
    arrive: `You arrive at a new location.`,
    "learn-skill": `You learn a new skill.`,
    "discover-path": `You discover a new path.`,
    "discover-item": `You discover a new item.`,
    "discover-npc": `You discover a new NPC.`,
    noop: `Nothing happens.`,
    "consume-inventory-item": `You consume an item from your inventory.`,
    "consume-location-item": `You consume an item from your current location.`,
    "equip-item": `You equip an item as a piece of gear.`,
    "unequip-item": `You unequip an item and put it back into your inventory.`,
    "unpacked-item": `You unpacked an item from a container.`,
    "crafted-item": `You created an item with your hands.`,
    "start-combat": `You engage in combat with an enemy.`,
    "start-conversation": `You start a conversation with an NPC.`,
    "defeat-npc": `You defeat an enemy.`,
    die: `You die.`,
};

/** Display values for History Happening */
export const WORLD_HISTORY_HAPPENING_DISPLAYS = {
    "wake-up": `Wake Up`,
    "end-turn": `End Turn`,
    "action-look-around": `Action Look Around`,
    "action-pick-up": `Action Pick Up`,
    "action-drop": `Action Drop`,
    "action-equip": `Action Equip`,
    "action-unequip": `Action Unequip`,
    "action-move": `Action Move`,
    "action-settle-down": `Action Settle Down`,
    "action-talk": `Action Talk`,
    "action-attack": `Action Attack`,
    "action-use-item": `Action Use Item`,
    "action-flee": `Action Flee`,
    "action-buy": `Action Buy`,
    "action-sell": `Action Sell`,
    "action-leave": `Action Leave`,
    "action-rest": `Action Rest`,
    "action-work": `Action Work`,
    "action-eat": `Action Eat`,
    "action-drink": `Action Drink`,
    "action-hit-the-road": `Action Hit The Road`,
    "action-unpack": `Action Unpack`,
    "action-craft": `Action Craft`,
    "action-trade": `Action Trade`,
    "npc-talk": `Npc Talk`,
    "npc-attack": `Npc Attack`,
    "get-gold": `Get Gold`,
    "spend-gold": `Spend Gold`,
    "get-item": `Get Item`,
    "lose-item": `Lose Item`,
    "change-health": `Change Health`,
    "change-hunger": `Change Hunger`,
    "change-thirst": `Change Thirst`,
    "change-situation": `Change Situation`,
    "inflict-damage": `Inflict Damage`,
    "take-damage": `Take Damage`,
    "take-damage-from-world": `Take Damage From World`,
    flee: `Flee`,
    "fail-flee": `Fail Flee`,
    arrive: `Arrive`,
    "learn-skill": `Learn Skill`,
    "discover-path": `Discover Path`,
    "discover-item": `Discover Item`,
    "discover-npc": `Discover Npc`,
    noop: `Noop`,
    "consume-inventory-item": `Consume Inventory Item`,
    "consume-location-item": `Consume Location Item`,
    "equip-item": `Equip Item`,
    "unequip-item": `Unequip Item`,
    "unpacked-item": `Unpacked Item`,
    "crafted-item": `Crafted Item`,
    "start-combat": `Start Combat`,
    "start-conversation": `Start Conversation`,
    "defeat-npc": `Defeat Npc`,
    die: `Die`,
};
