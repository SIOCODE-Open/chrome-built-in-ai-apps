export interface IBrainstormGeneratorPromptExample {
    userMessage: string;
    assistantMessage: string;
}

export interface IBrainstormGeneratorPrompts {
    take(n: number): Array<IBrainstormGeneratorPromptExample>;
}

const EXAMPLES: Array<IBrainstormGeneratorPromptExample> = [

    {
        userMessage: `OrganizationUnitService {
    listAll () -> List<OrganizationUnit>
    getById (id: string) -> OrganizationUnit
}`,
        assistantMessage: `Title: Turn it into a Java interface
Prompt: Create the code of a Java interface from my notes.`
    },

    {
        userMessage: `OrganizationUnitService {
    listAll () -> List<OrganizationUnit>
    getById (id: string) -> OrganizationUnit
}`,
        assistantMessage: `Title: Extend with EmployeeService
Prompt: Design the EmployeeService and add it to my notes.`
    },

    {
        userMessage: `OrganizationUnitService {
    listAll () -> List<OrganizationUnit>
    getById (id: string) -> OrganizationUnit
}`,
        assistantMessage: `Title: Design e-commerce backend
Prompt: Design a novel backend for an e-commerce application.`
    },

    {
        userMessage: `OrganizationUnitService {
    listAll () -> List<OrganizationUnit>
    getById (id: string) -> OrganizationUnit
}`,
        assistantMessage: `Title: Review and iterate design
Prompt: Perform a review on the design, and make suggestions for the next iteration.`
    },

    {
        userMessage: `* Metals
    * Iron
    * Aluminum
    * Copper
* Wood
    * Logs
    * Planks
    * Sticks
* Food
    * Meat
    * Vegetables
    * Fruits
    * Fungi
    * Fish`,
        assistantMessage: `Title: Create a mind map
Prompt: Use PlantUML to create a mind map from my notes.`
    },

    {
        userMessage: `* Metals
    * Iron
    * Aluminum
    * Copper
* Wood
    * Logs
    * Planks
    * Sticks
* Food
    * Meat
    * Vegetables
    * Fruits
    * Fungi
    * Fish`,
        assistantMessage: `Title: Write and article about in-game items
Prompt: Write an article using Markdown to introduce the items available in the game.`
    },

    {
        userMessage: `* Metals
    * Iron
    * Aluminum
    * Copper
* Wood
    * Logs
    * Planks
    * Sticks
* Food
    * Meat
    * Vegetables
    * Fruits
    * Fungi
    * Fish`,
        assistantMessage: `Title: Come up with recipes for these items
Prompt: Think about possible combinations of these items to create new items.`
    },
];

function getUserLikedExamples() {
    const liked = JSON.parse(
        localStorage.getItem("brainstorm.liked") || "[]"
    );
    return liked.map(
        idea => ({
            userMessage: idea.userInput,
            assistantMessage: `Title: ${idea.title}\nPrompt: ${idea.prompt}`
        })
    );
}

// Properly shuffle the array using Fisher-Yates algorithm
function shuffleArray(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

export class BrainstormGeneratorPrompts implements IBrainstormGeneratorPrompts {

    constructor() { }

    take(n: number): Array<IBrainstormGeneratorPromptExample> {
        // Shuffle the array
        let shuffled = [...EXAMPLES];
        shuffled.push(
            ...getUserLikedExamples()
        );
        shuffled = shuffleArray(shuffled);
        return shuffled.slice(0, n);
    }

}