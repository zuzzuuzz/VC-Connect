const fs = require("fs");
const content = fs.readFileSync("D:/Antigravity/velourcare-ortho-cloud/public/assets/index-5EUXN9UG.js", "utf8");

const idx = content.indexOf("clientSelection");
console.log("=== clientSelection in index-5EUXN9UG.js at", idx, "===");
console.log(content.substring(Math.max(0, idx - 1000), Math.min(content.length, idx + 2000)));
