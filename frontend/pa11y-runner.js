import pa11y from "pa11y";
import fs from "fs/promises";

const run = async () => {
  const results = await pa11y("http://localhost:3000", {
    chromeLaunchConfig: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    },
    standard: "WCAG2AA",
    includeNotices: true,
    includeWarnings: true
  });

  const htmlReport = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>WCAG Accessibility Report</title>
      </head>
      <body>
        <h1>WCAG Accessibility Report</h1>
        <pre>${JSON.stringify(results, null, 2)}</pre>
      </body>
    </html>
  `;

  await fs.writeFile("wcag-report.html", htmlReport);
  console.log("WCAG report generated: wcag-report.html");
};

run();
