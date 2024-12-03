const { zip } = require("zip-a-folder");
const path = require("path");

console.log(`Creating zip for brainstorm ...`);
zip(path.join(__dirname, "./public"), path.join(__dirname, "./brainstorm.zip"));
console.log(`Zip created for brainstorm`);
