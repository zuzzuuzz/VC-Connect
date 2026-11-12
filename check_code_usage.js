const fs = require("fs");
const content = fs.readFileSync("D:/Antigravity/velourcare-ortho-cloud/public/assets/index-5EUXN9UG.js", "utf8");

// search for t("cases.create.chooseClient") or similar
const regex = /cases\.create\.chooseClient|chooseClient/g;
let match;
while ((match = regex.exec(content)) !== null) {
  // check if it's outside i18n
  const snippet = content.substring(Math.max(0, match.index - 100), Math.min(content.length, match.index + 200));
  if (!snippet.includes("{\"titleCreate\"") && !snippet.includes("\"stepPatient\"")) {
    console.log("=== Found code usage at", match.index, "===");
    console.log(snippet);
  }
}
