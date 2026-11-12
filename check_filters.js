const fs = require("fs");
const content = fs.readFileSync("D:/Antigravity/velourcare-ortho-cloud/public/assets/TimeDifference-C0Up6Tht.js", "utf8");

const regex = /filter[-_]options|filterOptions|residencyTypes|residency_types/gi;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log("Match at", m.index, ":", content.substring(Math.max(0, m.index - 100), Math.min(content.length, m.index + 200)));
}
