const fs = require("fs");
const content = fs.readFileSync("D:/Antigravity/velourcare-ortho-cloud/public/assets/index-5EUXN9UG.js", "utf8");

function showContext(phrase) {
  let idx = 0;
  while ((idx = content.indexOf(phrase, idx)) !== -1) {
    console.log("=== MATCH FOR:", phrase, "AT", idx, "===");
    console.log(content.substring(Math.max(0, idx - 400), Math.min(content.length, idx + 400)));
    idx += phrase.length;
  }
}

showContext("chooseClient");
showContext("chooseResidency");
