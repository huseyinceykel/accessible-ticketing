/* eslint-disable */

const pa11y = require("pa11y");
const fs = require("fs");

const urls = [
  { name: "home", url: "http://localhost:3000" },
  { name: "events", url: "http://localhost:3000/events" },
  { name: "event-detail", url: "http://localhost:3000/events/1" },
  { name: "profile", url: "http://localhost:3000/profile" },
  { name: "admin", url: "http://localhost:3000/admin" },
  { name: "test-broken", url: "http://localhost:3000/a11y-test" } // Test doğru çalışıyor mu? Hata sayfası
];

(async () => {
  for (const page of urls) {
    console.log(`\n🔍 Testing ${page.url} ...`);

    try {
      const results = await pa11y(page.url, {
        standard: "WCAG2AA",
        timeout: 120000,
        chromeLaunchConfig: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      });

      const html = `
        <html>
        <head><title>WCAG Report - ${page.name}</title></head>
        <body>
          <h1>WCAG Report - ${page.name}</h1>
          <pre>${JSON.stringify(results, null, 2)}</pre>
        </body>
        </html>
      `;

      fs.writeFileSync(`wcag-${page.name}.html`, html);
      console.log(`📄 Report created: wcag-${page.name}.html`);
    } catch (err) {
      console.error(`❌ Error testing ${page.url}`);
      console.error(err);
    }
  }

  console.log("\n🎉 All WCAG tests completed!");
})();
