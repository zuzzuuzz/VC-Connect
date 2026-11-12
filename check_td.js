const fs = require("fs");
const content = fs.readFileSync("D:/Antigravity/velourcare-ortho-cloud/public/assets/TimeDifference-C0Up6Tht.js", "utf8");

function showContext(phrase) {
  let idx = 0;
  while ((idx = content.indexOf(phrase, idx)) !== -1) {
    console.log("=== MATCH FOR:", phrase, "AT", idx, "===");
    console.log(content.substring(Math.max(0, idx - 400), Math.min(content.length, idx + 600)));
    idx += phrase.length;
  }
}

showContext("chooseResidency");
showContext("chooseClient");
