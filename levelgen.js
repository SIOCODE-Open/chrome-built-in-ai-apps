const fs = require("fs");

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

const dotPath = "level.dot";

let DOT = "graph G {\n";

const nVillages = 5;
const nStreetPerVillage = 2;
const nTavernPerStreet = 1;
const nHousePerStreet = 1;
const nRoomPerTavern = 1;
const nRoomPerHouse = 1;
const nForestNodes = 20;

// Generate forest first
let forestNodes = [];
let forestEdges = [];

// Create nodes
for (let i = 0; i < nForestNodes; i++) {
    forestNodes.push(`forest_${i}`);
}

// Create 1-4 random edges for each node
for (const node of forestNodes) {
    const nEdges = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < nEdges; i++) {
        let target = forestNodes[Math.floor(Math.random() * forestNodes.length)];
        while (target === node || forestEdges.some(([source, t]) => (source === node && t === target) || (source === target && t === node))) {
            target = forestNodes[Math.floor(Math.random() * forestNodes.length)];
        }
        forestEdges.push([node, target]);
        // forestEdges.push([target, node]);
    }
}

// Ensure that the graph is connected
while (true) {
    let visited = new Set();
    let stack = [forestNodes[0]];
    while (stack.length > 0) {
        const current = stack.pop();
        if(visited.has(current)) {
            continue;
        }
        visited.add(current);
        for (const [source, target] of forestEdges) {
            if (source === current) {
                stack.push(target);
            }
        }
    }
    if (visited.size === forestNodes.length) {
        break;
    }

    // Remove a random edge, and add a new one
    const edgeIndex = Math.floor(Math.random() * forestEdges.length);
    const [source, target] = forestEdges[edgeIndex];
    forestEdges.splice(edgeIndex, 1);
    let newTarget = forestNodes[Math.floor(Math.random() * forestNodes.length)];
    while (newTarget === source || forestEdges.some(([s, t]) => (s === source && t === newTarget) || (s === newTarget && t === source))) {
        newTarget = forestNodes[Math.floor(Math.random() * forestNodes.length)];
    }
    forestEdges.push([source, newTarget]);
}

// Shuffle nodes
forestNodes = shuffleArray(forestNodes);


// Add nodes to DOT
for (const node of forestNodes) {
    DOT += `    ${node};\n`;
}

// Add edges to DOT
for (const [source, target] of forestEdges) {
    DOT += `    ${source} -- ${target};\n`;
}

let villageNodes = [];
let streetNodes = [];
let tavernNodes = [];
let houseNodes = [];
let roomNodes = [];
let villageEdges = [];

// Create villages
for (let i = 0; i < nVillages; i++) {
    const forestNode = forestNodes[i % nForestNodes];
    const villageNode = `village_${i}`;
    // villageNodes.push(villageNode);

    // Create streets
    for (let j = 0; j < nStreetPerVillage; j++) {
        const streetNode = `street_${i}_${j}`;
        streetNodes.push(streetNode);
        if (j === 0 || Math.random() < 0.2) {
            villageEdges.push([forestNode, streetNode]);
        }

        for (let jj = j + 1; jj < nStreetPerVillage; jj++) {
            if (jj !== j) {
                const target = `street_${i}_${jj}`;
                villageEdges.push([streetNode, target]);
            }
        }
    }
}

// Shuffle nodes
villageNodes = shuffleArray(villageNodes);

// Add nodes to DOT
for (const node of villageNodes) {
    DOT += `    ${node};\n`;
}

for (const node of streetNodes) {
    DOT += `    ${node};\n`;
}

for (const node of tavernNodes) {
    DOT += `    ${node};\n`;
}

for (const node of houseNodes) {
    DOT += `    ${node};\n`;
}

for (const node of roomNodes) {
    DOT += `    ${node};\n`;
}

// Add edges to DOT
for (const [source, target] of villageEdges) {
    DOT += `    ${source} -- ${target};\n`;
}

DOT += `\n}`;

fs.writeFileSync(dotPath, DOT);