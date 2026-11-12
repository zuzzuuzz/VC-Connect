const fs = require("fs");
const content = fs.readFileSync("D:/Antigravity/velourcare-ortho-cloud/public/assets/TimeDifference-C0Up6Tht.js", "utf8");

const idx = content.indexOf("function It(");
const idx2 = content.indexOf("const It=");
const idx3 = content.indexOf("It=");
console.log("It search:", idx, idx2, idx3);

// Let's find It definition
const regex = /const It\s*=|function It\s*\(/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log("Match at", m.index, ":");
  console.log(content.substring(m.index, m.index + 800));
}
