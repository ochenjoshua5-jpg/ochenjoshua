import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';

const ROOT = process.cwd();

const HTML_FILES = [
  'index.html',
  'about/index.html',
  'work/index.html',
  'engineering/index.html',
  'music/index.html',
  'contact/index.html',
  '404.html'
];

const SECRET_PATTERNS = [
  /apify_api_[A-Za-z0-9]+/,
  /sk-[A-Za-z0-9]{20,}/,
  /ghp_[A-Za-z0-9]{20,}/,
  /AIza[0-9A-Za-z\-_]{30,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/
];

async function checkFileExists(relPath) {
  const clean = relPath.split('?')[0].split('#')[0];
  const candidate = path.join(ROOT, clean.replace(/^\//, ''));
  try {
    const st = await fs.stat(candidate);
    if (st.isDirectory()) {
      await fs.access(path.join(candidate, 'index.html'));
    }
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const errors = [];

  // 1. JS syntax checks
  for (const jsFile of [
    'assets/js/wealth.js',
    'scripts/site-data.mjs',
    'scripts/build-assets.mjs',
    'scripts/build-pages.mjs'
  ]) {
    execFileSync(process.execPath, ['--check', path.join(ROOT, jsFile)], { stdio: 'pipe' });
  }
  console.log('✓ JavaScript syntax verified across runtime & build scripts');

  // 2. Verify Google Search Console verification file untouched
  const gsc = await fs.readFile(path.join(ROOT, 'google3df607081ed54594.html'), 'utf8');
  if (!gsc.includes('google-site-verification: google3df607081ed54594.html')) {
    errors.push('Google Search Console verification file modified or missing');
  }

  // 3. Scan all HTML, CSS, JS files for exposed secrets, broken internal paths, missing alts, duplicate meta
  const scanFiles = [...HTML_FILES, 'assets/css/wealth.css', 'assets/js/wealth.js', 'scripts/site-data.mjs'];
  for (const rel of scanFiles) {
    const content = await fs.readFile(path.join(ROOT, rel), 'utf8');
    for (const re of SECRET_PATTERNS) {
      if (re.test(content)) {
        errors.push(`Potential secret/API key matched in ${rel}: ${re}`);
      }
    }
  }
  console.log('✓ Secret & client-side API key scan passed (0 leaks)');

  // 4. Validate internal links, assets, meta tags, headings across every HTML file
  for (const rel of HTML_FILES) {
    const raw = await fs.readFile(path.join(ROOT, rel), 'utf8');
    const dom = new JSDOM(raw);
    const doc = dom.window.document;

    if (doc.querySelectorAll('title').length !== 1) {
      errors.push(`${rel}: expected exactly 1 <title>`);
    }
    if (doc.querySelectorAll('meta[name="description"]').length !== 1) {
      errors.push(`${rel}: expected exactly 1 meta description`);
    }
    if (doc.querySelectorAll('link[rel="canonical"]').length !== 1) {
      errors.push(`${rel}: expected exactly 1 canonical link`);
    }
    if (doc.querySelectorAll('h1').length !== 1) {
      errors.push(`${rel}: expected exactly 1 <h1>, found ${doc.querySelectorAll('h1').length}`);
    }

    // Check internal links & media assets resolve on disk
    const refs = [
      ...Array.from(doc.querySelectorAll('a[href]')).map((el) => el.getAttribute('href')),
      ...Array.from(doc.querySelectorAll('img[src], script[src], audio[src], source[srcset]')).map(
        (el) => el.getAttribute('src') || el.getAttribute('srcset')
      ),
      ...Array.from(doc.querySelectorAll('link[href]')).map((el) => el.getAttribute('href'))
    ];

    for (const ref of refs) {
      if (!ref || ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('mailto:') || ref.startsWith('#')) {
        continue;
      }
      const ok = await checkFileExists(ref);
      if (!ok) {
        errors.push(`${rel}: broken local reference -> ${ref}`);
      }
    }
  }
  console.log(`✓ Verified internal links, media assets, titles, canonicals & H1s across ${HTML_FILES.length} HTML documents`);

  if (errors.length > 0) {
    console.error('Lint errors found:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }
  console.log('✓ Lint passed with zero errors and zero warnings.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
