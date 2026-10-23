import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import sharp from 'sharp';

const ROOT = process.cwd();

const PRIMARY_ROUTES = [
  { file: 'index.html', path: '/' },
  { file: 'about/index.html', path: '/about/' },
  { file: 'work/index.html', path: '/work/' },
  { file: 'engineering/index.html', path: '/engineering/' },
  { file: 'music/index.html', path: '/music/' },
  { file: 'contact/index.html', path: '/contact/' }
];

async function createRuntimeDom(relFile, { urlPath = '/', reducedMotion = false } = {}) {
  const html = await fs.readFile(path.join(ROOT, relFile), 'utf8');
  const scriptSrc = await fs.readFile(path.join(ROOT, 'assets/js/wealth.js'), 'utf8');

  const logs = { errors: [], warnings: [] };
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('error', (...args) => logs.errors.push(args.join(' ')));
  virtualConsole.on('warn', (...args) => logs.warnings.push(args.join(' ')));
  virtualConsole.on('jsdomError', (err) => logs.errors.push(err.message));

  const dom = new JSDOM(html, {
    url: `https://ochenjoshua.netlify.app${urlPath}`,
    runScripts: 'dangerously',
    virtualConsole,
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = (query) => ({
        matches: query.includes('prefers-reduced-motion: reduce') ? reducedMotion : query.includes('pointer: fine'),
        media: query,
        addEventListener() {},
        removeEventListener() {}
      });
      window.HTMLCanvasElement.prototype.getContext = () => ({
        fillStyle: '',
        setTransform() {},
        clearRect() {},
        fillRect() {}
      });
      // Silence fetch in unit runtime to test graceful offline degradation
      window.fetch = async () => ({ ok: false, status: 404 });
      window.HTMLMediaElement.prototype.play = async function () {};
      window.HTMLMediaElement.prototype.pause = function () {};
    }
  });

  // Execute deferred runtime bundle & fire DOMContentLoaded
  dom.window.eval(scriptSrc);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded', { bubbles: true }));

  return { dom, doc: dom.window.document, win: dom.window, logs };
}

test('1. Zero browser console errors/warnings across all 6 routes when executing wealth.js', async () => {
  for (const r of PRIMARY_ROUTES) {
    const { logs, dom } = await createRuntimeDom(r.file, { urlPath: r.path });
    try {
      assert.deepEqual(logs.errors, [], `Unexpected console errors on ${r.path}`);
      assert.deepEqual(logs.warnings, [], `Unexpected console warnings on ${r.path}`);
    } finally {
      dom.window.close();
    }
  }
});

test('2. Unique titles, unique meta descriptions, valid canonicals, no accidental noindex, and exact OG 1200x630 dimensions', async () => {
  const titles = new Set();
  const descriptions = new Set();

  for (const r of PRIMARY_ROUTES) {
    const html = await fs.readFile(path.join(ROOT, r.file), 'utf8');
    const doc = new JSDOM(html).window.document;

    const title = doc.title.trim();
    const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim();
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
    const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
    const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

    assert.ok(title.length > 20, `Title present on ${r.path}`);
    assert.ok(desc && desc.length > 50, `Description present on ${r.path}`);
    assert.ok(!titles.has(title), `Unique title on ${r.path}: ${title}`);
    assert.ok(!descriptions.has(desc), `Unique meta description on ${r.path}`);
    titles.add(title);
    descriptions.add(desc);

    assert.equal(canonical, `https://ochenjoshua.netlify.app${r.path}`);
    assert.ok(!robots.toLowerCase().includes('noindex'), `No accidental noindex on ${r.path}`);

    const localOgPath = path.join(ROOT, new URL(ogImg).pathname.replace(/^\//, ''));
    const meta = await sharp(localOgPath).metadata();
    assert.equal(meta.width, 1200, `${localOgPath} width must be 1200`);
    assert.equal(meta.height, 630, `${localOgPath} height must be 630`);
  }
});

test('3. Exact brand identity, homepage SEO spec, verbatim Hero/Vision copy, and About 150-300 word bio', async () => {
  const homeHtml = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
  const homeDoc = new JSDOM(homeHtml).window.document;

  assert.equal(homeDoc.title, 'Wealth | Ochen Joshua — Ugandan Entrepreneur & Software Engineer');
  assert.equal(
    homeDoc.querySelector('meta[name="description"]').getAttribute('content'),
    'Wealth (Ochen Joshua) is a Ugandan entrepreneur, software engineer, technology innovator, and DJ building products, businesses, and a global personal brand from Uganda.'
  );
  assert.ok(homeDoc.body.textContent.includes('UGANDAN BUILDER. GLOBAL AMBITION.'));
  assert.ok(homeDoc.querySelector('h1').textContent.replace(/\s+/g, ' ').trim() === 'I BUILD TECHNOLOGY. I BUILD BUSINESSES. I BUILD WEALTH.');
  assert.ok(homeDoc.body.textContent.includes('THE VISION IS BIGGER THAN THE BEGINNING.'));
  assert.ok(homeDoc.body.textContent.includes('I am not building for attention. I am building for ownership, impact, and the freedom to create.'));
  assert.ok(homeDoc.body.textContent.includes('The ambition: build extraordinary companies, create lasting value, and pursue billionaire-level success on my own terms.'));
  assert.ok(homeDoc.body.textContent.includes('MORE THAN ONE IDEA. A LIFETIME OF BUILDING.'));
  assert.ok(homeDoc.body.textContent.includes('ENGINEER BY MIND. DJ BY INSTINCT.'));

  const aboutHtml = await fs.readFile(path.join(ROOT, 'about/index.html'), 'utf8');
  const aboutDoc = new JSDOM(aboutHtml).window.document;
  const bioText = aboutDoc.getElementById('official-press-bio').textContent.trim();
  const words = bioText.split(/\s+/).filter(Boolean);
  assert.ok(
    words.length >= 150 && words.length <= 300,
    `Expected press bio to be 150-300 words, actual=${words.length}`
  );
  assert.ok(bioText.slice(0, 120).includes('Ochen Joshua') && bioText.slice(0, 120).includes('Wealth'));
});

test('4. Semantic headings (single H1, no skipped heading levels) and complete descriptive image alt/dimensions', async () => {
  for (const r of PRIMARY_ROUTES) {
    const html = await fs.readFile(path.join(ROOT, r.file), 'utf8');
    const doc = new JSDOM(html).window.document;

    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    assert.equal(headings.filter((h) => h.tagName === 'H1').length, 1, `Single H1 on ${r.path}`);
    assert.equal(headings[0].tagName, 'H1', `First heading must be H1 on ${r.path}`);

    for (let i = 1; i < headings.length; i++) {
      const prev = Number(headings[i - 1].tagName[1]);
      const curr = Number(headings[i].tagName[1]);
      assert.ok(curr <= prev + 1, `Heading jump H${prev} -> H${curr} on ${r.path}`);
    }

    for (const img of doc.querySelectorAll('img')) {
      const alt = img.getAttribute('alt') || '';
      assert.ok(alt.trim().length >= 15, `Descriptive alt text required on ${r.path}`);
      assert.ok(Number(img.getAttribute('width')) > 0, `Explicit width required on ${r.path}`);
      assert.ok(Number(img.getAttribute('height')) > 0, `Explicit height required on ${r.path}`);
    }
  }
});

test('5. JSON-LD validates cleanly on every primary route with zero contradictions or fake sameAs URLs', async () => {
  for (const r of PRIMARY_ROUTES) {
    const html = await fs.readFile(path.join(ROOT, r.file), 'utf8');
    const doc = new JSDOM(html).window.document;
    const rawJson = doc.querySelector('script[type="application/ld+json"]')?.textContent;
    assert.ok(rawJson, `JSON-LD block present on ${r.path}`);

    const parsed = JSON.parse(rawJson);
    assert.equal(parsed['@context'], 'https://schema.org');
    const person = parsed['@graph'].find((n) => n['@type'] === 'Person');
    const site = parsed['@graph'].find((n) => n['@type'] === 'WebSite');
    assert.ok(person && site);
    assert.equal(person.name, 'Ochen Joshua');
    assert.ok(person.alternateName.includes('Wealth'));
    assert.equal(person.nationality, 'Ugandan');
    assert.deepEqual(person.sameAs, ['https://github.com/ochenjoshua5-jpg']);
    assert.equal(person.image, undefined, 'Unverified portrait photo must not be invented in JSON-LD');
  }
});

test('6. Interactive /work/ filter, /engineering/ keyboard tabs, mobile drawer Escape key, and prefers-reduced-motion behavior', async () => {
  // Work filter interaction + URL deep link
  const workCtx = await createRuntimeDom('work/index.html', { urlPath: '/work/?status=live' });
  const visibleLive = Array.from(workCtx.doc.querySelectorAll('[data-project-status]')).filter((el) => !el.hidden);
  assert.equal(visibleLive.length, 2, 'Deep-linked ?status=live filters to 2 live builds');

  workCtx.doc.querySelector('[data-work-filter="prototype"]').click();
  const visibleProto = Array.from(workCtx.doc.querySelectorAll('[data-project-status]')).filter((el) => !el.hidden);
  assert.equal(visibleProto.length, 3, 'Clicking Prototype shows 3 prototype builds');
  workCtx.dom.window.close();

  // Engineering code tabs keyboard navigation
  const engCtx = await createRuntimeDom('engineering/index.html', { urlPath: '/engineering/' });
  const tabs = engCtx.doc.querySelectorAll('[data-code-tab]');
  tabs[0].dispatchEvent(new engCtx.win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true', 'ArrowRight switches active code tab');
  engCtx.dom.window.close();

  // Mobile drawer open + Escape key close + reduced motion mode
  const reducedHome = await createRuntimeDom('index.html', { urlPath: '/', reducedMotion: true });
  assert.equal(
    reducedHome.doc.documentElement.classList.contains('w-anim'),
    false,
    'Reduced motion prevents w-anim scroll-hide class'
  );
  const openBtn = reducedHome.doc.getElementById('menu-toggle');
  const drawer = reducedHome.doc.getElementById('mobile-drawer');
  openBtn.click();
  assert.equal(drawer.classList.contains('is-open'), true);
  reducedHome.doc.dispatchEvent(new reducedHome.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(drawer.classList.contains('is-open'), false);
  reducedHome.dom.window.close();
});

test('7. Sitemap & robots.txt cross-validation and design system token & breakpoint verification', async () => {
  const robots = await fs.readFile(path.join(ROOT, 'robots.txt'), 'utf8');
  const sitemap = await fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const css = await fs.readFile(path.join(ROOT, 'assets/css/wealth.css'), 'utf8');

  assert.ok(robots.includes('Allow: /') && !robots.includes('Disallow: /'));
  assert.ok(robots.includes('Sitemap: https://ochenjoshua.netlify.app/sitemap.xml'));

  for (const r of PRIMARY_ROUTES) {
    assert.ok(sitemap.includes(`<loc>https://ochenjoshua.netlify.app${r.path}</loc>`), `Sitemap includes ${r.path}`);
  }

  for (const token of ['--obsidian: #0A0A0B', '--charcoal: #1C1C1F', '--warm-white: #F7F5F1', '--silver: #B8B8BC', '--champagne-gold: #C9A869']) {
    assert.ok(css.includes(token), `CSS token present: ${token}`);
  }
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
  assert.ok(css.includes('@media (max-width: 1060px)') && css.includes('@media (max-width: 720px)'));
});
