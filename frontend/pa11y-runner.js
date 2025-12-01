const pa11y = require('pa11y');
const fs = require('fs');

(async () => {
  const results = await pa11y('http://localhost:3000', {
    chromeLaunchConfig: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    reporter: 'html'
  });

  fs.writeFileSync('wcag-report.html', results);
})();
