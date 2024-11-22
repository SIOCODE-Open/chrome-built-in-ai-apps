import { shuffleArray } from "../utils/shuffleArray";

export type KeywordType = "medieval" | "fantasy";

const fantasyKeywords: string[] = [
    "Aether", "Arcanum", "Astral", "Aurora", "Bane", "Blaze", "Celestia", "Chimera", "Conjure", "Cosmos",
    "Cryptic", "Daemon", "Druidic", "Elysian", "Emberfall", "Empyrean", "Enigma", "Ethereal", "Fae", "Feywild",
    "Galadriel", "Glimmer", "Griffin", "Hex", "Illusion", "Incantation", "Inferno", "Iridescent", "Jotun", "Kismet",
    "Luminous", "Lycan", "Maelstrom", "Mana", "Mirage", "Mystic", "Nebula", "Nymph", "Oracle", "Pandemonium",
    "Phoenix", "Phylactery", "Pixie", "Prismatic", "Quasar", "Runic", "Saga", "Shadowbane", "Shapeshifter", "Solstice",
    "Spectral", "Sprite", "Starlight", "Summoner", "Sylvan", "Tempest", "Thaumaturge", "Tidecaller", "Transcendent", "Valkyrie",
    "Verdant", "Voidwalker", "Wisp", "Wraith", "Zephyr", "Ziggurat", "Abyss", "Arcadia", "Auric", "Basilisk",
    "Blightwood", "Chrysalis", "Conflux", "Coven", "Crystalline", "Doppelganger", "Drake", "Eclipse", "Ephemeral", "Frostveil",
    "Galewind", "Hallow", "Infernal", "Loreweaver", "Lunar", "Moonshade", "Necrotic", "Oblivion", "Onyx", "Portal",
    "Pyromancer", "Revenant", "Sable", "Stargazer", "Talisman", "Twilight", "Umbra", "Vortex", "Whisper", "Wyrmling"
];

const medievalKeywords: string[] = [
    "Abbey", "Acre", "Aegis", "Alehouse", "Armory", "Banner", "Baron", "Battlement", "Blacksmith", "Borough",
    "Brigand", "Butcher", "Castle", "Catapult", "Chancellor", "Chapel", "Charter", "Church", "Citadel", "Cloister",
    "Cobbler", "Court", "Crusade", "Dame", "Dungeon", "Earl", "Estuary", "Fief", "Fort", "Gauntlet",
    "Guild", "Hall", "Harbormaster", "Herald", "Homestead", "Hovel", "Infirmary", "Ironclad", "Joust", "Keep",
    "Knight", "Lancet", "Lance", "Lantern", "Lord", "Manor", "Market", "Merchant", "Mill", "Minstrel",
    "Monastery", "Moat", "Noble", "Outpost", "Page", "Paladin", "Peasant", "Pike", "Plow", "Portcullis",
    "Priory", "Quarry", "Quiver", "Rampart", "Regent", "Rook", "Scroll", "Serf", "Shepherd", "Siege",
    "Squire", "Stables", "Steeple", "Stocks", "Tavern", "Throne", "Torch", "Tower", "Trebuchet", "Vassal",
    "Vicar", "Village", "Viscount", "Watchtower", "Wheat", "Whetstone", "Woodsman", "Yeoman", "Yoke", "Zealot"
];


export class InspirationKeywords {

    take(
        n: number,
        classes: KeywordType[]
    ): string[] {
        var available = [];
        if (classes.includes("fantasy")) {
            available.push(...fantasyKeywords);
        }
        if (classes.includes("medieval")) {
            available.push(...medievalKeywords);
        }
        available = shuffleArray(available);
        return available.slice(0, n);
    }

    format(
        n: number,
        classes: KeywordType[]
    ): string {
        return `Here are ${n} keywords for inspiration and variety: ${this.take(n, classes).join(", ")}`;
    }

}