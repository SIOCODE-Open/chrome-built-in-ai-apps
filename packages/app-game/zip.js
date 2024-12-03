const { zip } = require("zip-a-folder");
const path = require("path");

console.log(`Creating zip for game ...`);
zip(path.join(__dirname, "./public"), path.join(__dirname, "./game.zip"));
console.log(`Zip created for game`);
