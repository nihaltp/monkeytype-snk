import * as fs from "node:fs";
import * as path from "node:path";
import { parseOutputsOption } from "./outputsOptions";
import * as githubAction from "./github-action";

(async () => {
  try {
    const userName = githubAction.getInput("monkeytype_user_name");
    const monkeytypeApeKey = githubAction.getInput("monkeytype_ape_key");
    const outputsRaw = [
      ...githubAction.getInput("outputs").split("\n"),
      //
      // legacy
      githubAction.getInput("gif_out_path"),
      githubAction.getInput("svg_out_path"),
    ]
      .map((x) => x.trim())
      .filter(Boolean);

    const outputs = parseOutputsOption(outputsRaw);

    const { generateContributionSnake } = await import(
      "./generateContributionSnake"
    );
    const results = await generateContributionSnake(userName, outputs, { monkeytypeApeKey });

    outputs.forEach((out, i) => {
      const result = results[i];
      if (out?.filename && result) {
        console.log(`💾 writing to ${out?.filename}`);
        fs.mkdirSync(path.dirname(out?.filename), { recursive: true });
        fs.writeFileSync(out?.filename, result);
      }
    });
  } catch (e: any) {
    githubAction.setFailed(`Action failed with "${e.message}"`);
  }
})();
