const fs = require("fs");
const content = fs.readFileSync("D:/Antigravity/velourcare-ortho-cloud/public/assets/TimeDifference-C0Up6Tht.js", "utf8");

const regex = /filterOptions\b|\.residencyTypes|\.clients\b|\.caseTypes|\.deliveryTimes|\.categories|\.categoryTypes/g;
const matches = new Set();
let m;
while ((m = regex.exec(content)) !== null) {
  matches.add(content.substring(Math.max(0, m.index - 50), Math.min(content.length, m.index + 100)));
}
for (const str of matches) {
  console.log("---", str.replace(/\n/g, " "));
}
