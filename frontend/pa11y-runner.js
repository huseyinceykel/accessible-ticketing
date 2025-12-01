import pa11y from "pa11y";
import htmlReporter from "pa11y-reporter-html";
import fs from "fs";

(async () => {
  const results = await pa11y("http://localhost:3000", {
    chromeLaunchConfig: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  const html = await htmlReporter.results(results);
  fs.writeFileSync("wcag-report.html", html);
})();
