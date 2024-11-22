export interface IIdeaGeneratorPromptExample {
    userMessage: string;
    assistantMessage: string;
}

export interface IIdeaGeneratorPrompts {
    take(n: number): Array<IIdeaGeneratorPromptExample>;
}

const EXAMPLES: Array<IIdeaGeneratorPromptExample> = [

    {
        userMessage: `Notes:

OrganizationUnitService {
    listAll () -> List<OrganizationUnit>
    getById (id: string) -> OrganizationUnit
}

Task:

Title: Turn it into a Java interface
Prompt: Create the FULL CODE of a Java interface from my notes.`,
        assistantMessage: `Here is the completed transformation:

\`\`\`
package com.example;

import java.util.List;
import com.example.model.*;

public interface OrganizationUnitService {
    List<OrganizationUnit> listAll();
    OrganizationUnit getById(String id);
}
\`\`\``
    },
    {
        userMessage: `Notes:

OrganizationUnitService {
    listAll () -> List<OrganizationUnit>
    getById (id: string) -> OrganizationUnit
}

Task:

Title: Extend with EmployeeService
Prompt: Design the EmployeeService and add it to my notes.`,
        assistantMessage: `Here is the completed transformation:

\`\`\`
OrganizationUnitService {
    listAll () -> List<OrganizationUnit>
    getById (id: string) -> OrganizationUnit
}

EmployeeService {
    listAll () -> List<Employee>
    getById (id: string) -> Employee
}
\`\`\``
    },
    {
        userMessage: `Notes:

OrganizationUnitService {
    listAll () -> List<OrganizationUnit>
    getById (id: string) -> OrganizationUnit
}

Task:

Title: Design e-commerce backend
Prompt: Design a novel backend for an e-commerce application.`,
        assistantMessage: `Here is the completed transformation:

\`\`\`
CategoryService {
    listAll () -> List<Category>
    getById (id: string) -> Category
}

ProductService {
    listAll () -> List<Product>
    getById (id: string) -> Product
}

OrderService {
    listMyOrders () -> List<Order>
    createOrder (order: Order) -> Order
    getOrderStatus (id: string) -> OrderStatus
}
\`\`\``
    },

    {
        userMessage: `Notes:

* Metals
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
    * Fish

Task:

Title: Create a mind map
Prompt: Use PlantUML to create a mind map from my notes.`,
        assistantMessage: `Here is the completed transformation:

\`\`\`
@startmindmap
* Metals
** Iron
** Aluminum
** Copper
* Wood
** Logs
** Planks
** Sticks
* Food
** Meat
** Vegetables
** Fruits
** Fungi
** Fish
@endmindmap
\`\`\``
    },
    {
        userMessage: `Notes:

* Metals
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
    * Fish

Task:

Title: Come up with recipes for these items
Prompt: Think about possible combinations of these items to create new items.`,
        assistantMessage: `Here is the completed transformation:

\`\`\`
* Iron + Sticks = Iron Axe
* Aluminum + Planks = Aluminum Table
* Copper + Aluminum = Heat Sink
* Meat + Vegetables = Stew
* Fruits + Fruits = Fruit Salad
* Vegetables + Fish = Fish Soup
* Fungi + Logs = Mushroom House
* Vegetables + Sticks = Fishing Rod
\`\`\``
    }

];

function getUserLikedExamples() {
    const liked = JSON.parse(
        localStorage.getItem("artifacts.liked") || "[]"
    );
    return liked.map(
        art => ({
            userMessage: `Notes:\n\n${art.idea.userInput}\n\nTask:\n\nTitle: ${art.idea.title}\nPrompt: ${art.idea.prompt}`,
            assistantMessage: `Here is the completed transformation:\n\n\`\`\`\n${art.artifact.text}\n\`\`\``
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

export class IdeaGeneratorPrompts implements IIdeaGeneratorPrompts {

    constructor() { }

    take(n: number): Array<IIdeaGeneratorPromptExample> {
        // Shuffle the array
        let shuffled = [...EXAMPLES];
        shuffled.push(
            ...getUserLikedExamples()
        );
        shuffled = shuffleArray(shuffled);
        return shuffled.slice(0, n);
    }

}