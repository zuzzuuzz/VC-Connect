const fs = require("fs");
const content = fs.readFileSync("D:/Antigravity/velourcare-ortho-cloud/public/assets/TimeDifference-C0Up6Tht.js", "utf8");

console.log("=== Setup around index 51000 - 53000 ===");
console.log(content.substring(50000, 52600));
