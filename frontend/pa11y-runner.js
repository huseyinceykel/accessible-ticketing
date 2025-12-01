import pa11y from 'pa11y';
import fs from 'fs';

const run = async () => {
  const results = await pa11y('http://localhost:3000', {
    chromeLaunchConfig: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    reporter: 'html'
  });

  fs.writeFileSync('wcag-report.html', results);
};

run();
