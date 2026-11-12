const fs = require("fs");
const path = require("path");

const dir = "D:/Antigravity/velourcare-ortho-cloud/public/assets";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), "utf8");
  if (content.includes("chooseResidency") && !content.includes("\"stepPatient\"")) {
    console.log("Found chooseResidency in:", file);
  }
  if (content.includes("clientDropdownOptions") || content.includes("useClients") || content.includes("residencyType")) {
    console.log("Found client/residency keyword in:", file);
  }
}
