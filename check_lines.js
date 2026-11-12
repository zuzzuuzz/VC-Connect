const fs = require("fs");
const content = fs.readFileSync("D:/Antigravity/velourcare-ortho-cloud/public/assets/index-_iJv3cIQ.js", "utf8");

function showLines() {
  const lines = content.split("\n");
  for (let i = 25; i <= 65 && i < lines.length; i++) {
    console.log(`Line ${i}: ${lines[i]}`);
  }
}
showLines();
