import fs from 'node:fs/promises';
import path from 'node:path';
import {
  SITE,
  NAV_ITEMS,
  PRESS_BIO_PARAGRAPHS,
  PROJECTS,
  ENGINEERING_CAPABILITIES,
  CODE_SAMPLES,
  VERIFIED_REPOS
} from './site-data.mjs';

const ROOT = process.cwd();

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const W_MONOGRAM_SVG = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <path d="M10 17H18.2L24.8 44L31.6 20H35.4L42.2 44L48.8 17H57L45.4 51H39.6L33.5 30.2L27.4 51H21.6L10 17Z" fill="#C9A869"/>
  <circle cx="33.5" cy="9.5" r="1.8" fill="#C9A869"/>
</svg>`;

function buildJsonLd(routePath, pageTitle, pageDescription) {
  const canonicalUrl = `${SITE.canonicalOrigin}${routePath}`;
  const personId = `${SITE.canonicalOrigin}/#person`;
  const websiteId = `${SITE.canonicalOrigin}/#website`;

  const personNode = {
    '@type': 'Person',
    '@id': personId,
    name: SITE.legalName,
    alternateName: [SITE.publicName, 'Joshua Ochen'],
    nationality: SITE.nationality,
    jobTitle: SITE.roles,
    award: 'Youngest Self-Made Teenage Billionaire 2026 Uganda',
    description:
      'Self-Made Billionaire and Youngest Self-Made Teenage Billionaire 2026 Uganda — Ugandan entrepreneur, software engineer, technology innovator, and DJ based in Kampala, Uganda.',
    url: `${SITE.canonicalOrigin}/`,
    email: `mailto:${SITE.verifiedEmail}`,
    homeLocation: {
      '@type': 'Place',
      name: SITE.location
    },
    knowsAbout: [
      'Software Engineering',
      'Business Automation',
      'Web Application Architecture',
      'Kotlin Android Development',
      'Python Scripting',
      'DJing and Audio Engineering'
    ],
    sameAs: [SITE.verifiedGithub]
  };

  const websiteNode = {
    '@type': 'WebSite',
    '@id': websiteId,
    name: `${SITE.publicName} — ${SITE.legalName}`,
    alternateName: 'Wealth Official Digital Profile',
    url: `${SITE.canonicalOrigin}/`,
    publisher: { '@id': personId },
    inLanguage: 'en'
  };

  const webPageNode = {
    '@type': routePath === '/about/' ? 'AboutPage' : routePath === '/contact/' ? 'ContactPage' : 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: { '@id': websiteId },
    about: { '@id': personId },
    inLanguage: 'en'
  };

  const graph = [personNode, websiteNode, webPageNode];

  if (routePath !== '/') {
    const labelMap = {
      '/about/': 'About',
      '/work/': 'Work',
      '/engineering/': 'Engineering',
      '/music/': 'Music',
      '/contact/': 'Contact'
    };
    if (labelMap[routePath]) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE.canonicalOrigin}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: labelMap[routePath],
            item: canonicalUrl
          }
        ]
      });
    }
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

function renderProjectPlate(project, idx, headingTag = 'h3') {
  const reversedClass = idx % 2 === 1 ? ' is-reversed' : '';
  const statusClass =
    project.statusSlug === 'live'
      ? 'status-live'
      : project.statusSlug === 'in-development'
      ? 'status-development'
      : 'status-prototype';

  const actions = [];
  if (project.liveUrl) {
    actions.push(
      `<a href="${escapeHtml(project.liveUrl)}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">Launch Live Site &nearr;</a>`
    );
  }
  if (project.repoUrl) {
    actions.push(
      `<a href="${escapeHtml(project.repoUrl)}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">Inspect Repository &rarr;</a>`
    );
  }
  if (!actions.length) {
    actions.push(`<a href="/contact/" class="btn btn-secondary">Request Architecture Walkthrough &rarr;</a>`);
  }
  const actionHtml = actions.join('\n        ');

  return `
  <article class="project-plate${reversedClass}" data-project-status="${escapeHtml(project.statusSlug)}" data-reveal>
    <div class="project-media">
      <picture>
        <source srcset="${escapeHtml(project.imageWebp)}" type="image/webp" />
        <img
          src="${escapeHtml(project.imageFallback)}"
          alt="${escapeHtml(project.imageAlt)}"
          width="1280"
          height="800"
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
    <div class="project-body">
      <div class="project-top-line">
        <span class="project-index tabular">PROJECT // ${escapeHtml(project.index)}</span>
        <span class="status-badge ${statusClass}">${escapeHtml(project.status)}</span>
      </div>
      <${headingTag} class="project-title">${escapeHtml(project.name)}</${headingTag}>
      <p class="project-summary">${escapeHtml(project.summary)}</p>
      <div class="project-meta-list">
        <div class="project-meta-row">
          <span class="project-meta-key">Problem Solved</span>
          <span class="project-meta-val">${escapeHtml(project.problemSolved)}</span>
        </div>
        <div class="project-meta-row">
          <span class="project-meta-key">Target User</span>
          <span class="project-meta-val">${escapeHtml(project.targetUser)}</span>
        </div>
        <div class="project-meta-row">
          <span class="project-meta-key">Tech Stack</span>
          <div class="tech-pills">
            ${project.stack.map((s) => `<span class="tech-pill">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="btn-row">
        ${actionHtml}
      </div>
    </div>
  </article>`;
}

function renderLedgerProjectCard(project) {
  const statusClass =
    project.statusSlug === 'live'
      ? 'status-live'
      : project.statusSlug === 'in-development'
      ? 'status-development'
      : 'status-prototype';

  const ledgerActions = [];
  if (project.liveUrl) {
    ledgerActions.push(
      `<a href="${escapeHtml(project.liveUrl)}" class="btn btn-subtle" target="_blank" rel="noopener noreferrer">Visit Live Site &nearr;</a>`
    );
  }
  if (project.repoUrl) {
    ledgerActions.push(
      `<a href="${escapeHtml(project.repoUrl)}" class="btn btn-subtle" target="_blank" rel="noopener noreferrer">Source Repo &rarr;</a>`
    );
  }
  const footerLink = ledgerActions.length
    ? `<div class="btn-row">${ledgerActions.join('')}</div>`
    : `<span class="project-index">${escapeHtml(project.repoLabel)}</span>`;

  return `
  <article class="ledger-card" data-project-status="${escapeHtml(project.statusSlug)}" data-reveal>
    <div>
      <div class="project-top-line">
        <span class="project-index tabular">BUILD // ${escapeHtml(project.index)}</span>
        <span class="status-badge ${statusClass}">${escapeHtml(project.status)}</span>
      </div>
      <h3 class="project-title">${escapeHtml(project.name)}</h3>
      <p class="project-summary">${escapeHtml(project.summary)}</p>
      <div class="project-meta-list">
        <div class="project-meta-row">
          <span class="project-meta-key">Problem Solved</span>
          <span class="project-meta-val">${escapeHtml(project.problemSolved)}</span>
        </div>
        <div class="project-meta-row">
          <span class="project-meta-key">Target User</span>
          <span class="project-meta-val">${escapeHtml(project.targetUser)}</span>
        </div>
        <div class="project-meta-row">
          <span class="project-meta-key">Tech Stack</span>
          <div class="tech-pills">
            ${project.stack.map((s) => `<span class="tech-pill">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div>
      ${footerLink}
    </div>
  </article>`;
}

function renderShell({
  routePath,
  title,
  description,
  ogImage,
  ogImageAlt,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  includeSchema = true,
  mainHtml
}) {
  const canonicalUrl = `${SITE.canonicalOrigin}${routePath}`;
  const ogImageUrl = `${SITE.canonicalOrigin}${ogImage}`;

  const desktopNavHtml = NAV_ITEMS.map((item) => {
    const current = item.href === routePath ? ' aria-current="page"' : '';
    return `<a href="${item.href}"${current}>${escapeHtml(item.label)}</a>`;
  }).join('\n          ');

  const mobileNavHtml = NAV_ITEMS.map((item) => {
    const current = item.href === routePath ? ' aria-current="page"' : '';
    return `<a href="${item.href}"${current}><span>${item.num}</span> ${escapeHtml(item.label)}</a>`;
  }).join('\n        ');

  const schemaBlock = includeSchema
    ? `<!-- [PENDING-CLIENT-INPUT]: Add "image" URL to Person JSON-LD once a verified portrait photograph of Ochen Joshua is supplied, and expand "sameAs" once verified LinkedIn / Instagram / X URLs are provided. -->
  <script type="application/ld+json">
${buildJsonLd(routePath, title, description)}
  </script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="Ochen Joshua, Joshua Ochen, Wealth, Self-Made Billionaire, self made billionaire, Youngest Self-Made Teenage Billionaire 2026 Uganda, youngest self made teenage billionaire 2026 uganda, Ugandan Entrepreneur, Software Engineer Uganda, Technology Innovator, DJ Uganda, Apex Automation Solutions" />
  <meta name="author" content="Ochen Joshua (Wealth)" />
  <meta name="robots" content="${escapeHtml(robots)}" />
  <meta name="theme-color" content="#0A0A0B" />

  <!-- TODO [PENDING-CLIENT-INPUT]: Update canonical domain in scripts/site-data.mjs if attaching a custom domain -->
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="${routePath === '/about/' ? 'profile' : 'website'}" />
  <meta property="og:site_name" content="Wealth — Ochen Joshua" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(ogImageAlt)}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />
  <meta name="twitter:image:alt" content="${escapeHtml(ogImageAlt)}" />

  <!-- Custom "W" Wordmark Favicons & App Manifest -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />

  <!-- Preload Primary Self-Hosted Subsets (Zero Render-Blocking Font Requests) -->
  <link rel="preload" href="/assets/fonts/cormorant-600.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin />

  <link rel="stylesheet" href="/assets/css/wealth.css" />
  <script>
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('w-anim');
    }
  </script>
  ${schemaBlock}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to primary content</a>

  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="brand-mark" aria-label="Wealth — Ochen Joshua Home">
        <span class="brand-monogram">${W_MONOGRAM_SVG}</span>
        <span class="brand-text-group">
          <span class="brand-wordmark">WEALTH</span>
          <span class="brand-subname">Ochen Joshua</span>
        </span>
      </a>

      <nav class="primary-nav" aria-label="Primary navigation">
        ${desktopNavHtml}
      </nav>

      <div class="header-controls">
        <div class="kampala-telemetry tabular" aria-label="Current location and East Africa Time">
          <span class="status-beacon" aria-hidden="true"></span>
          <span data-kampala-time>KLA · EAT</span>
        </div>

        <button
          type="button"
          class="sound-pill"
          data-audio-toggle
          aria-pressed="false"
          aria-label="Toggle studio session audio"
        >
          <span class="eq-bars" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </span>
          <span class="sound-label-text" data-audio-label data-label-paused="Sound" data-label-playing="Playing">Sound</span>
        </button>

        <button
          type="button"
          id="menu-toggle"
          class="menu-toggle"
          aria-label="Open navigation menu"
          aria-expanded="false"
          aria-controls="mobile-drawer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F7F5F1" stroke-width="1.6" aria-hidden="true">
            <line x1="3" y1="7" x2="21" y2="7" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="17" x2="21" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <div id="mobile-drawer" class="mobile-drawer" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Site navigation">
    <div class="drawer-top">
      <span class="brand-wordmark">WEALTH // NAVIGATION</span>
      <button type="button" id="drawer-close" class="drawer-close" aria-label="Close navigation menu">&times;</button>
    </div>
    <nav class="drawer-links" aria-label="Mobile navigation">
      ${mobileNavHtml}
    </nav>
    <div class="drawer-footer">
      BUILD. OWN. INNOVATE. BECOME WEALTH. &middot; KAMPALA, UGANDA
    </div>
  </div>

  <main id="main-content">
    ${mainHtml}
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div>
          <a href="/" class="brand-mark" aria-label="Wealth — Ochen Joshua">
            <span class="brand-monogram">${W_MONOGRAM_SVG}</span>
            <span class="brand-text-group">
              <span class="brand-wordmark">WEALTH</span>
              <span class="brand-subname">Ochen Joshua</span>
            </span>
          </a>
          <p class="footer-tagline">BUILD. OWN. INNOVATE. BECOME WEALTH.</p>
          <p class="footer-positioning">Wealth (Ochen Joshua) — Self-Made Billionaire &amp; Youngest Self-Made Teenage Billionaire 2026 Uganda &middot; Entrepreneur, Software Engineer &amp; DJ.</p>
        </div>

        <div>
          <h2 class="footer-col-title">Architecture</h2>
          <ul class="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about/">About &amp; Founder Bio</a></li>
            <li><a href="/work/">Work &amp; Ventures</a></li>
            <li><a href="/engineering/">Software Engineering</a></li>
            <li><a href="/music/">Music &amp; DJ Identity</a></li>
            <li><a href="/contact/">Contact &amp; Inquiries</a></li>
          </ul>
        </div>

        <div>
          <h2 class="footer-col-title">Verified Presence</h2>
          <ul class="footer-links">
            <li><a href="${escapeHtml(SITE.verifiedGithub)}" target="_blank" rel="noopener noreferrer">GitHub (@ochenjoshua5-jpg)</a></li>
            <li><a href="mailto:${escapeHtml(SITE.verifiedEmail)}">${escapeHtml(SITE.verifiedEmail)}</a></li>
            <li><a href="/sitemap.xml">XML Sitemap</a></li>
          </ul>
          <!-- [PENDING-CLIENT-INPUT]: Add verified LinkedIn, Instagram, X, and SoundCloud/Mixcloud links here once supplied. -->
        </div>
      </div>

      <div class="footer-bottom">
        <span>&copy; <span id="wealth-year">2026</span> Ochen Joshua (Wealth). All rights reserved.</span>
        <span>Kampala, Uganda &middot; Built for global scale.</span>
      </div>
    </div>
  </footer>

  <!-- Hidden Netlify Form Blueprint so static deploys register form schema automatically -->
  <form name="wealth-contact" netlify netlify-honeypot="bot-field" hidden>
    <input type="text" name="name" />
    <input type="email" name="email" />
    <input type="text" name="subject" />
    <textarea name="message"></textarea>
  </form>

  <audio id="wealth-audio" src="/public/music.mp3" preload="metadata"></audio>
  <div id="wealth-toast" class="wealth-toast" role="status" aria-live="polite"></div>
  <script src="/assets/js/wealth.js" defer></script>
</body>
</html>`;
}

function buildHomePage() {
  const featuredHtml = PROJECTS.filter((p) => p.featured)
    .map((p, i) => renderProjectPlate(p, i, 'h3'))
    .join('\n');

  const mainHtml = `
    <!-- HERO -->
    <section class="hero-section surface-obsidian">
      <div class="container hero-grid">
        <div data-reveal>
          <span class="eyebrow">YOUNGEST SELF-MADE TEENAGE BILLIONAIRE &middot; 2026 UGANDA</span>
          <h1 class="display-h1">
            <span class="line">I BUILD TECHNOLOGY.</span>
            <span class="line">I BUILD BUSINESSES.</span>
            <span class="line accent-italic">I BUILD WEALTH.</span>
          </h1>
          <p class="hero-subhead">
            I’m <strong>Ochen Joshua</strong>, known as <strong>Wealth</strong> — a <strong>Self-Made Billionaire</strong> and the <strong>Youngest Self-Made Teenage Billionaire 2026 Uganda</strong>, operating as a Ugandan entrepreneur, software engineer, technology innovator, and DJ building software ventures and global products beyond borders.
          </p>
          <div class="btn-row">
            <a href="/work/" class="btn btn-primary">EXPLORE MY WORK &rarr;</a>
            <a href="/contact/" class="btn btn-secondary">LET'S BUILD SOMETHING</a>
          </div>
        </div>

        <aside class="crest-dossier" data-parallax-card aria-label="Founder identity summary" data-reveal>
          <div class="crest-top-meta">
            <span>DOSSIER // 001</span>
            <span class="tabular">00°18′49″N 32°34′52″E</span>
          </div>
          <!-- [PENDING-CLIENT-INPUT]: Replace monogram crest stage with verified portrait photograph of Ochen Joshua once supplied -->
          <div class="crest-seal-stage">
            <div class="crest-emblem">${W_MONOGRAM_SVG}</div>
            <div class="crest-name">Wealth</div>
            <div class="crest-legal">Ochen Joshua &middot; Self-Made Billionaire</div>
          </div>
          <div class="crest-specs">
            <div class="crest-spec-row">
              <span class="crest-spec-key">2026 Title</span>
              <span class="crest-spec-val">Youngest Self-Made Teenage Billionaire 2026 Uganda</span>
            </div>
            <div class="crest-spec-row">
              <span class="crest-spec-key">Roles</span>
              <span class="crest-spec-val">Entrepreneur &middot; Engineer &middot; DJ</span>
            </div>
            <div class="crest-spec-row">
              <span class="crest-spec-key">Venture Focus</span>
              <span class="crest-spec-val">Apex Automation Solutions</span>
            </div>
            <div class="crest-spec-row">
              <span class="crest-spec-key">Base</span>
              <span class="crest-spec-val">Kampala, Uganda</span>
            </div>
          </div>
          <div class="crest-audio-bar">
            <span class="project-index tabular">STUDIO SESSION // 03:31</span>
            <button type="button" class="btn btn-subtle" data-audio-toggle aria-pressed="false">
              <span data-audio-label data-label-paused="Play Session Cut" data-label-playing="Pause Session Cut">Play Session Cut</span>
            </button>
          </div>
        </aside>
      </div>
    </section>

    <!-- WORDMARK ANCHOR DIVIDER -->
    <div class="wealth-divider">
      <div class="container wealth-divider-inner tabular">
        <span class="wealth-divider-anchor">WEALTH &mdash; OCHEN JOSHUA</span>
        <span>SELF-MADE BILLIONAIRE &middot; 2026 UGANDA</span>
        <span>BUILD. OWN. INNOVATE. BECOME WEALTH.</span>
      </div>
    </div>

    <!-- VISION MANIFESTO (HIGH-CONTRAST WARM WHITE EDITORIAL SPREAD) -->
    <section class="section surface-ivory" id="vision">
      <div class="container">
        <div class="vision-layout">
          <div data-reveal>
            <span class="eyebrow">01 // VISION &amp; PHILOSOPHY</span>
            <h2 class="section-h2">THE VISION IS BIGGER THAN THE BEGINNING.</h2>
            <p class="lead-copy">
              I believe geography should not determine the scale of your ambition. From Uganda, I’m building enduring software companies, intellectual property, and global enterprises rooted in ownership and creative independence.
            </p>
          </div>

          <div class="vision-quote-block" data-reveal>
            <blockquote class="vision-pullquote">
              “I am not building for attention. I am building for ownership, impact, and the freedom to create.”
            </blockquote>
            <div class="vision-aspiration-box">
              <div class="vision-aspiration-label">2026 Milestone &mdash; Self-Made Billionaire</div>
              <p class="vision-aspiration-text">
                Youngest Self-Made Teenage Billionaire 2026 Uganda &mdash; building extraordinary companies, owning enduring assets, and scaling technology on my own terms.
              </p>
            </div>
          </div>
        </div>

        <div class="philosophy-strip" data-reveal>
          <p>
            Wealth is built by creating value, owning what you build, solving real problems, and thinking beyond geography.
          </p>
          <a href="/about/" class="btn btn-outline-dark">Read Full Founder Story &rarr;</a>
        </div>
      </div>
    </section>

    <!-- FEATURED PROJECTS PREVIEW -->
    <section class="section surface-obsidian" id="featured-work">
      <div class="container">
        <div class="section-header-row" data-reveal>
          <div>
            <span class="eyebrow">02 // SELECTED BUILDS</span>
            <h2 class="section-h2">MORE THAN ONE IDEA. A LIFETIME OF BUILDING.</h2>
            <p class="lead-copy">
              Every project listed below reflects real code, active prototypes, or open-source systems built by Ochen Joshua — documented candidly with its current status and technical stack.
            </p>
          </div>
          <a href="/work/" class="btn btn-secondary">All 6 Projects &amp; Filters &rarr;</a>
        </div>

        <div class="project-showcase-stack">
          ${featuredHtml}
        </div>
      </div>
    </section>

    <!-- DUAL DISCIPLINE BAND: ENGINEERING + DJ IDENTITY -->
    <section class="section surface-elevated">
      <div class="container hero-grid">
        <div data-reveal>
          <span class="eyebrow">03 // DUAL DISCIPLINE</span>
          <h2 class="section-h2">ENGINEER BY MIND. DJ BY INSTINCT.</h2>
          <p class="lead-copy" style="margin-bottom: 28px;">
            Software engineering trains precision, systems thinking, and structure. DJing sharpens timing, energy perception, and atmosphere. Together, code and sound shape how Wealth approaches product design — technical underneath, effortless on the surface.
          </p>
          <div class="btn-row">
            <a href="/engineering/" class="btn btn-secondary">Explore Engineering &amp; Code &rarr;</a>
            <a href="/music/" class="btn btn-subtle">Open Studio Sound Deck &rarr;</a>
          </div>
        </div>

        <div class="studio-deck" data-reveal>
          <div class="deck-track-header" style="margin-bottom: 14px;">
            <div>
              <span class="project-index">WEALTH // STUDIO AUDIO</span>
              <h3 class="deck-track-title">Session Cut 01</h3>
            </div>
            <span class="deck-timecode tabular" data-audio-time>00:00 / 03:31</span>
          </div>
          <canvas class="spectrum-canvas" data-spectrum-canvas width="560" height="84" aria-label="Audio frequency spectrum display"></canvas>
          <div class="deck-transport" style="margin-top: 18px;">
            <button type="button" class="btn btn-primary" data-audio-toggle aria-pressed="false">
              <span data-audio-label data-label-paused="Play Studio Audio" data-label-playing="Pause Studio Audio">Play Studio Audio</span>
            </button>
            <div class="volume-group">
              <label for="home-vol">VOL</label>
              <input id="home-vol" type="range" class="range-luxury" min="0" max="100" value="68" data-audio-volume />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CLOSING EXECUTIVE CTA -->
    <section class="section surface-obsidian">
      <div class="container" style="text-align: center; max-width: 820px;" data-reveal>
        <span class="eyebrow" style="justify-content: center;">04 // DIRECT COLLABORATION</span>
        <h2 class="section-h2">BUILT IN KAMPALA. ARCHITECTED FOR GLOBAL SCALE.</h2>
        <p class="lead-copy" style="margin: 0 auto 34px;">
          Open to serious conversations around custom automation systems, software engineering, venture partnerships, and creative collaborations.
        </p>
        <div class="btn-row" style="justify-content: center;">
          <a href="/contact/" class="btn btn-primary">LET'S BUILD SOMETHING &rarr;</a>
          <a href="/engineering/" class="btn btn-secondary">INSPECT GITHUB &amp; STACK</a>
        </div>
      </div>
    </section>
  `;

  return renderShell({
    routePath: '/',
    title: 'Wealth | Ochen Joshua — Self-Made Billionaire & Youngest Self-Made Teenage Billionaire 2026 Uganda',
    description:
      'Wealth (Ochen Joshua) — Self-Made Billionaire and Youngest Self-Made Teenage Billionaire 2026 Uganda. Ugandan entrepreneur, software engineer, technology innovator, and DJ building software ventures and global products from Uganda.',
    ogImage: '/public/og-home.png',
    ogImageAlt:
      'Wealth — Ochen Joshua: Self-Made Billionaire & Youngest Self-Made Teenage Billionaire 2026 Uganda.',
    mainHtml
  });
}

function buildAboutPage() {
  const bioHtml = PRESS_BIO_PARAGRAPHS.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n            ');

  const mainHtml = `
    <section class="page-hero">
      <div class="container" data-reveal>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true">/</span>
          <span>About</span>
        </nav>
        <span class="eyebrow">SELF-MADE BILLIONAIRE &middot; 2026 UGANDA</span>
        <h1 class="display-h1">
          <span class="line">Ochen Joshua &mdash;</span>
          <span class="line accent-italic">Known as Wealth.</span>
        </h1>
        <p class="lead-copy">
          Self-Made Billionaire and Youngest Self-Made Teenage Billionaire 2026 Uganda — Ugandan entrepreneur, software engineer, technology innovator, and DJ building software ventures and enduring intellectual property from Kampala.
        </p>
      </div>
    </section>

    <!-- PRESS / COLLABORATOR BIO (STRICT 150-300 WORDS) -->
    <section class="section surface-obsidian">
      <div class="container about-press-grid">
        <div data-reveal>
          <span class="eyebrow">01 // OFFICIAL FOUNDER BIO</span>
          <h2 class="section-h2">THE STORY SO FAR.</h2>
          <div id="official-press-bio" class="press-bio-prose">
            ${bioHtml}
          </div>
          <div class="press-bio-actions">
            <button
              type="button"
              class="btn btn-secondary"
              data-copy-target="#official-press-bio"
              data-copy-label="Press bio copied to clipboard"
            >
              Copy Official Bio
            </button>
            <a href="/work/" class="btn btn-subtle">View Shipped Builds &rarr;</a>
          </div>
        </div>

        <aside class="crest-dossier" aria-label="Identity factsheet" data-reveal>
          <div class="crest-top-meta">
            <span>IDENTITY LEDGER</span>
            <span>VERIFIED</span>
          </div>
          <!-- [PENDING-CLIENT-INPUT]: Supply verified portrait photo of Ochen Joshua to display in this frame -->
          <div class="crest-seal-stage">
            <div class="crest-emblem">${W_MONOGRAM_SVG}</div>
            <div class="crest-name">Ochen Joshua</div>
            <div class="crest-legal">Public Name: Wealth &middot; Self-Made Billionaire</div>
          </div>
          <div class="crest-specs">
            <div class="crest-spec-row">
              <span class="crest-spec-key">2026 Title</span>
              <span class="crest-spec-val">Youngest Self-Made Teenage Billionaire 2026 Uganda</span>
            </div>
            <div class="crest-spec-row">
              <span class="crest-spec-key">Nationality</span>
              <span class="crest-spec-val">Ugandan</span>
            </div>
            <div class="crest-spec-row">
              <span class="crest-spec-key">City</span>
              <span class="crest-spec-val">Kampala, Uganda</span>
            </div>
            <div class="crest-spec-row">
              <span class="crest-spec-key">Disciplines</span>
              <span class="crest-spec-val">Ventures &middot; Software &middot; DJ</span>
            </div>
            <div class="crest-spec-row">
              <span class="crest-spec-key">Education</span>
              <span class="crest-spec-val">SMACK, Kampala (Physics)</span>
            </div>
            <div class="crest-spec-row">
              <span class="crest-spec-key">GitHub</span>
              <span class="crest-spec-val"><a href="${escapeHtml(SITE.verifiedGithub)}" target="_blank" rel="noopener noreferrer">@ochenjoshua5-jpg</a></span>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- FOUR PILLARS PHILOSOPHY (WARM WHITE SPREAD) -->
    <section class="section surface-ivory">
      <div class="container">
        <div data-reveal>
          <span class="eyebrow">02 // OPERATING DOCTRINE</span>
          <h2 class="section-h2">BUILD. OWN. INNOVATE. BECOME WEALTH.</h2>
          <p class="lead-copy">
            Wealth is not a costume or a boast — it is an engineering and ownership discipline practiced one useful system at a time.
          </p>
        </div>

        <div class="pillars-matrix" data-reveal>
          <article class="pillar-cell">
            <div class="pillar-num tabular">PILLAR 01 // BUILD</div>
            <h3>Solve Real Operational Friction</h3>
            <p>
              Start where people lose time every day: repetitive customer messages, fragmented records, manual workflows. Useful software earns its place immediately.
            </p>
          </article>
          <article class="pillar-cell">
            <div class="pillar-num tabular">PILLAR 02 // OWN</div>
            <h3>Prioritize Equity &amp; IP Ownership</h3>
            <p>
              Writing code for a single fee trades hours for cash; owning well-architected products and companies compounds long-term independence.
            </p>
          </article>
          <article class="pillar-cell">
            <div class="pillar-num tabular">PILLAR 03 // INNOVATE</div>
            <h3>Unite Systems Precision &amp; Taste</h3>
            <p>
              Technical capability gets software running; design clarity and musical instinct make people trust and enjoy using what you build.
            </p>
          </article>
          <article class="pillar-cell">
            <div class="pillar-num tabular">PILLAR 04 // BEYOND BORDERS</div>
            <h3>Kampala Roots, Global Standard</h3>
            <p>
              Geography defines where the work begins, never its ceiling. Every repository, interface, and venture is held to an international benchmark.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- CHRONOLOGICAL TIMELINE -->
    <section class="section surface-obsidian">
      <div class="container">
        <div style="margin-bottom: 44px;" data-reveal>
          <span class="eyebrow">03 // CHRONOLOGY</span>
          <h2 class="section-h2">FROM FIRST SCRIPT TO VENTURE ARCHITECTURE.</h2>
        </div>

        <div class="timeline-track">
          <article class="timeline-row" data-reveal>
            <div class="timeline-era tabular">AGE ~16 &middot; ORIGIN</div>
            <div>
              <h3>First Lines of Python &amp; Self-Directed Study</h3>
              <p>
                Taught himself programming from tutorials, documentation, and trial-by-error debugging in Kampala — discovering that a laptop and disciplined curiosity could turn raw ideas into working tools.
              </p>
            </div>
          </article>

          <article class="timeline-row" data-reveal>
            <div class="timeline-era tabular">AGE ~17 &middot; UTILITY</div>
            <div>
              <h3>First Operational Software for Local Operators</h3>
              <p>
                Built practical management tools for local schools, clinics, and retail shops — student tracking, patient logs, and inventory records — learning firsthand that solving concrete problems creates real value.
              </p>
            </div>
          </article>

          <article class="timeline-row" data-reveal>
            <div class="timeline-era tabular">AGE ~18 &middot; SYSTEMS</div>
            <div>
              <h3>Expanding Across Full-Stack Web, Audio &amp; Mobile</h3>
              <p>
                Shifted from isolated scripts to complete applications: multi-module Android builds in Kotlin, serverless web utilities, and audio software shaped by his parallel passion as a DJ.
              </p>
            </div>
          </article>

          <article class="timeline-row" data-reveal>
            <div class="timeline-era tabular">AGE 19 &middot; 2026 UGANDA</div>
            <div>
              <h3>Self-Made Billionaire &amp; Youngest Self-Made Teenage Billionaire 2026 Uganda</h3>
              <p>
                Founded Apex Automation Solutions in Kampala to deliver AI-assisted support and WhatsApp business workflows, shipped production web and open-source audio systems on GitHub, and established Wealth as a Self-Made Billionaire brand built for global scale.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  `;

  return renderShell({
    routePath: '/about/',
    title: 'About Ochen Joshua (Wealth) — Self-Made Billionaire | Youngest Self-Made Teenage Billionaire 2026 Uganda',
    description:
      'Founder biography, philosophy, and timeline of Ochen Joshua (Wealth) — Self-Made Billionaire and Youngest Self-Made Teenage Billionaire 2026 Uganda, Ugandan entrepreneur, software engineer, technology innovator, and DJ.',
    ogImage: '/public/og-about.png',
    ogImageAlt:
      'About Wealth (Ochen Joshua) — Self-Made Billionaire & Youngest Self-Made Teenage Billionaire 2026 Uganda.',
    mainHtml
  });
}

function buildWorkPage() {
  const visualProjects = PROJECTS.filter((p) => p.featured)
    .map((p, i) => renderProjectPlate(p, i, 'h3'))
    .join('\n');
  const ledgerProjects = PROJECTS.filter((p) => !p.featured)
    .map((p) => renderLedgerProjectCard(p))
    .join('\n');

  const countAll = PROJECTS.length;
  const countLive = PROJECTS.filter((p) => p.statusSlug === 'live').length;
  const countProto = PROJECTS.filter((p) => p.statusSlug === 'prototype').length;
  const countDev = PROJECTS.filter((p) => p.statusSlug === 'in-development').length;

  const mainHtml = `
    <section class="page-hero">
      <div class="container" data-reveal>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true">/</span>
          <span>Work</span>
        </nav>
        <span class="eyebrow">PORTFOLIO &amp; VENTURE LEDGER</span>
        <h1 class="display-h1">
          <span class="line">More Than One Idea.</span>
          <span class="line accent-italic">A Lifetime of Building.</span>
        </h1>
        <p class="lead-copy">
          Filter every verified software system, active venture, and engineering prototype built by Ochen Joshua (Wealth). Every entry reports honest development status and real technical architecture.
        </p>
      </div>
    </section>

    <section class="section surface-obsidian">
      <div class="container">
        <div class="section-header-row" style="margin-bottom: 20px;">
          <h2 class="section-h2" style="margin-bottom: 0;">SHIPPED SYSTEMS &amp; ACTIVE BUILDS</h2>
          <p class="project-index tabular" data-filter-count aria-live="polite">
            Showing ${countAll} — All projects
          </p>
        </div>

        <div class="filter-bar tabular" role="group" aria-label="Filter projects by status">
          <button type="button" class="filter-btn" data-work-filter="all" aria-pressed="true">
            All (${countAll})
          </button>
          <button type="button" class="filter-btn" data-work-filter="live" aria-pressed="false">
            Live (${countLive})
          </button>
          <button type="button" class="filter-btn" data-work-filter="prototype" aria-pressed="false">
            Prototype (${countProto})
          </button>
          <button type="button" class="filter-btn" data-work-filter="in-development" aria-pressed="false">
            In Development (${countDev})
          </button>
        </div>

        <div class="project-showcase-stack">
          ${visualProjects}
        </div>

        <div class="ledger-grid">
          ${ledgerProjects}
        </div>
      </div>
    </section>

    <section class="section-tight surface-elevated">
      <div class="container section-header-row" style="margin-bottom: 0;" data-reveal>
        <div>
          <span class="eyebrow">NEXT CONVERSATION</span>
          <h2 class="section-h2" style="margin-bottom: 8px;">HAVE A REAL OPERATIONAL PROBLEM TO SOLVE?</h2>
          <p class="lead-copy">Let’s scope an automation pipeline or custom software product together.</p>
        </div>
        <a href="/contact/" class="btn btn-primary">Start a Conversation &rarr;</a>
      </div>
    </section>
  `;

  return renderShell({
    routePath: '/work/',
    title: 'Work & Projects | Wealth (Ochen Joshua) — Ventures & Software',
    description:
      'Explore verified software products, prototypes, and ventures built by Wealth (Ochen Joshua) — including Apex Automation Solutions, OJ MUSIC, and OJ Music Downloader.',
    ogImage: '/public/og-work.png',
    ogImageAlt: 'Work & Ventures by Wealth (Ochen Joshua) — Verified Software & Ventures.',
    mainHtml
  });
}

function buildEngineeringPage() {
  const capabilitiesHtml = ENGINEERING_CAPABILITIES.map(
    (c) => `
      <div class="capability-row" data-reveal>
        <h3 class="cap-domain">${escapeHtml(c.domain)}</h3>
        <span class="cap-tier">${escapeHtml(c.level)}</span>
        <p class="cap-evidence">${c.evidence}</p>
      </div>`
  ).join('\n');

  const tabsHtml = CODE_SAMPLES.map(
    (sample, i) => `
      <button
        type="button"
        role="tab"
        id="tab-${sample.id}"
        aria-controls="panel-${sample.id}"
        aria-selected="${i === 0 ? 'true' : 'false'}"
        tabindex="${i === 0 ? '0' : '-1'}"
        class="code-tab"
        data-code-tab="${sample.id}"
      >
        ${escapeHtml(sample.tabLabel)}
      </button>`
  ).join('\n');

  const panelsHtml = CODE_SAMPLES.map(
    (sample, i) => `
      <div
        role="tabpanel"
        id="panel-${sample.id}"
        aria-labelledby="tab-${sample.id}"
        class="code-panel"
        data-code-panel="${sample.id}"
        ${i === 0 ? '' : 'hidden'}
      >
        <div class="code-panel-meta">
          <span>${escapeHtml(sample.description)}</span>
          <div class="btn-row">
            <button
              type="button"
              class="btn btn-subtle"
              data-copy-target="#code-pre-${sample.id}"
              data-copy-label="Code snippet copied"
            >
              Copy Code
            </button>
            <a href="${escapeHtml(sample.repoUrl)}" class="btn btn-subtle" target="_blank" rel="noopener noreferrer">
              Source Repo &rarr;
            </a>
          </div>
        </div>
        <pre id="code-pre-${sample.id}"><code>${escapeHtml(sample.code)}</code></pre>
      </div>`
  ).join('\n');

  const reposHtml = VERIFIED_REPOS.map(
    (r) => `
      <article class="repo-row" data-repo-name="${escapeHtml(r.name)}" data-reveal>
        <h3 class="repo-name">${escapeHtml(r.name)}</h3>
        <p class="repo-desc">${escapeHtml(r.description)}</p>
        <span class="repo-lang">${escapeHtml(r.language)}</span>
        <div class="repo-link-cell tabular">
          <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">
            <span data-repo-updated>${escapeHtml(r.updated)}</span> &nearr;
          </a>
        </div>
      </article>`
  ).join('\n');

  const mainHtml = `
    <section class="page-hero">
      <div class="container" data-reveal>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true">/</span>
          <span>Engineering</span>
        </nav>
        <span class="eyebrow">SOFTWARE ARCHITECTURE &amp; REPOSITORIES</span>
        <h1 class="display-h1">
          <span class="line">Systems Built for</span>
          <span class="line accent-italic">Real-World Utility.</span>
        </h1>
        <p class="lead-copy">
          A transparent look at the languages, architectures, code excerpts, and public GitHub repositories of Ugandan software engineer Ochen Joshua (Wealth).
        </p>
      </div>
    </section>

    <!-- HONEST EVIDENCE-BACKED STACK MATRIX -->
    <section class="section surface-obsidian">
      <div class="container">
        <div style="margin-bottom: 40px;" data-reveal>
          <span class="eyebrow">01 // TECHNICAL STACK</span>
          <h2 class="section-h2">EVIDENCE-BACKED CAPABILITY MATRIX.</h2>
          <p class="lead-copy">
            Every technical area below is graded strictly against public repository commits and shipped prototypes — zero inflated credentials.
          </p>
        </div>

        <div class="capability-table">
          ${capabilitiesHtml}
        </div>
      </div>
    </section>

    <!-- REAL CODE SAMPLES -->
    <section class="section surface-elevated">
      <div class="container">
        <div style="margin-bottom: 36px;" data-reveal>
          <span class="eyebrow">02 // PRODUCTION EXCERPTS</span>
          <h2 class="section-h2">SELECTED CODE SAMPLES.</h2>
          <p class="lead-copy">
            Excerpts drawn directly from Ochen Joshua’s public repositories across Python build tooling, Web Audio DSP graphs, and serverless API handlers.
          </p>
        </div>

        <div class="code-vault" data-reveal>
          <div class="code-vault-header">
            <div class="code-tabs" role="tablist" aria-label="Code sample files">
              ${tabsHtml}
            </div>
          </div>
          ${panelsHtml}
        </div>
      </div>
    </section>

    <!-- GITHUB ACTIVITY LEDGER -->
    <section class="section surface-obsidian">
      <div class="container">
        <div class="section-header-row" data-reveal>
          <div>
            <span class="eyebrow" data-gh-sync-status>03 // GITHUB REPOSITORY LEDGER</span>
            <h2 class="section-h2" style="margin-bottom: 8px;">PUBLIC REPOSITORIES (@OCHENJOSHUA5-JPG).</h2>
            <p class="lead-copy">Pre-rendered for instant indexing and progressively synchronized with the live GitHub API.</p>
          </div>
          <a href="${escapeHtml(SITE.verifiedGithub)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
            Open GitHub Profile &rarr;
          </a>
        </div>

        <div class="repo-ledger">
          ${reposHtml}
        </div>
      </div>
    </section>
  `;

  return renderShell({
    routePath: '/engineering/',
    title: 'Engineering | Ochen Joshua (Wealth) — Architecture, Code & GitHub',
    description:
      'Software engineering stack, real code samples in Python, JavaScript, and Kotlin, and verified GitHub activity of Ugandan software engineer Ochen Joshua (Wealth).',
    ogImage: '/public/og-engineering.png',
    ogImageAlt: 'Software Engineering by Ochen Joshua (Wealth) — Systems Built For Real-World Utility.',
    mainHtml
  });
}

function buildMusicPage() {
  const mainHtml = `
    <section class="page-hero">
      <div class="container" data-reveal>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true">/</span>
          <span>Music</span>
        </nav>
        <span class="eyebrow">SOUND IDENTITY &amp; DJ CRAFT</span>
        <h1 class="display-h1">
          <span class="line">ENGINEER BY MIND.</span>
          <span class="line accent-italic">DJ BY INSTINCT.</span>
        </h1>
        <p class="lead-copy">
          Behind the code and behind the decks, the discipline is identical: read tension accurately, control transitions cleanly, and build an atmosphere people feel immediately.
        </p>
      </div>
    </section>

    <!-- STUDIO SOUND DECK (POWERED BY REAL REPO ASSET /public/music.mp3) -->
    <section class="section surface-obsidian">
      <div class="container">
        <div style="margin-bottom: 36px;" data-reveal>
          <span class="eyebrow">01 // STUDIO AUDIO SESSION</span>
          <h2 class="section-h2">LISTEN IN THE ROOM.</h2>
          <p class="lead-copy">
            Stream the 320 kbps stereo reference track directly inside the custom Wealth Web Audio deck — complete with live 36-band frequency analysis.
          </p>
        </div>

        <div class="studio-deck" data-reveal>
          <div class="deck-layout">
            <div class="vinyl-stage">
              <div id="studio-vinyl" class="vinyl-disc" aria-hidden="true">
                <div class="vinyl-label">W</div>
              </div>
            </div>

            <div class="deck-controls-stack">
              <div class="deck-track-header">
                <div>
                  <span class="project-index">WEALTH // 320 KBPS STEREO STREAM</span>
                  <h3 class="deck-track-title">Studio Reference Session 01</h3>
                </div>
                <span class="deck-timecode tabular" data-audio-time>00:00 / 03:31</span>
              </div>

              <canvas
                class="spectrum-canvas"
                data-spectrum-canvas
                width="760"
                height="84"
                aria-label="Real-time frequency spectrum visualizer"
              ></canvas>

              <div class="scrub-row">
                <label for="music-seek" class="sr-only">Seek track position</label>
                <input
                  id="music-seek"
                  type="range"
                  class="range-luxury"
                  min="0"
                  max="100"
                  step="0.1"
                  value="0"
                  data-audio-seek
                />
              </div>

              <div class="deck-transport">
                <div class="btn-row">
                  <button type="button" class="btn btn-primary" data-audio-toggle aria-pressed="false">
                    <span data-audio-label data-label-paused="Play Deck" data-label-playing="Pause Deck">Play Deck</span>
                  </button>
                  <button type="button" class="btn btn-subtle" data-audio-loop aria-pressed="false">
                    Loop Track
                  </button>
                </div>

                <div class="volume-group">
                  <label for="studio-volume">GAIN</label>
                  <input
                    id="studio-volume"
                    type="range"
                    class="range-luxury"
                    min="0"
                    max="100"
                    value="68"
                    data-audio-volume
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- [PENDING-CLIENT-INPUT]: Add verified DJ mix URLs (SoundCloud / Mixcloud / YouTube), recorded live sets, and authentic DJ booth photography here once supplied. -->
      </div>
    </section>

    <!-- WHERE MUSIC MEETS SOFTWARE ENGINEERING (WARM WHITE SPREAD) -->
    <section class="section surface-ivory">
      <div class="container vision-layout">
        <div data-reveal>
          <span class="eyebrow">02 // CODE MEETS SOUND</span>
          <h2 class="section-h2">WHY A SOFTWARE ENGINEER BUILDS FOR LISTENERS.</h2>
          <p class="lead-copy">
            For Ochen Joshua — known as Wealth in Uganda’s creative and tech circles — music is not a side distraction from engineering; it directly informs the software he ships.
          </p>
        </div>

        <div class="vision-quote-block" data-reveal>
          <p class="vision-pullquote">
            “Great software feels like a clean transition on a loud system — zero friction, zero clutter, complete control.”
          </p>
          <div class="vision-aspiration-box">
            <div class="vision-aspiration-label">Shipped Audio Software by Ochen Joshua</div>
            <p class="vision-aspiration-text" style="margin-bottom: 14px;">
              <strong>OJ MUSIC:</strong> Open-source 13-module Android client supporting lossless FLAC playback and synchronized lyrics. <strong>OJ Music Downloader:</strong> Progressive Web App studio utility for offline reference tracks.
            </p>
            <a href="/work/" class="btn btn-outline-dark">Explore Audio Builds in Work &rarr;</a>
          </div>
        </div>
      </div>
    </section>
  `;

  return renderShell({
    routePath: '/music/',
    title: 'Music & DJ Identity | Wealth (Ochen Joshua) — Engineer by Mind, DJ by Instinct',
    description:
      'DJ and sound identity of Wealth (Ochen Joshua) in Uganda — engineer by mind, DJ by instinct. Listen to the 320 kbps studio session deck and explore audio engineering work.',
    ogImage: '/public/og-music.png',
    ogImageAlt: 'Music & DJ Identity — Wealth (Ochen Joshua): Engineer By Mind. DJ By Instinct.',
    mainHtml
  });
}

function buildContactPage() {
  const mainHtml = `
    <section class="page-hero">
      <div class="container" data-reveal>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true">/</span>
          <span>Contact</span>
        </nav>
        <span class="eyebrow">DIRECT DISPATCH &amp; COLLABORATION</span>
        <h1 class="display-h1">
          <span class="line">Let’s Build</span>
          <span class="line accent-italic">Something Enduring.</span>
        </h1>
        <p class="lead-copy">
          Reach Ochen Joshua (Wealth) directly for custom business automation, software engineering collaborations, venture partnerships, press inquiries, or DJ bookings.
        </p>
      </div>
    </section>

    <section class="section surface-obsidian">
      <div class="container contact-grid">
        <div data-reveal>
          <span class="eyebrow">01 // VERIFIED CHANNELS</span>
          <h2 class="section-h2">DIRECT LINES ONLY.</h2>
          <p class="lead-copy">
            Every message goes straight to Ochen Joshua in Kampala — no middlemen, no unmonitored inbox.
          </p>

          <div class="contact-ledger">
            <div class="contact-row">
              <span class="contact-key">Direct Email</span>
              <div class="btn-row">
                <span class="contact-val"><a href="mailto:${escapeHtml(SITE.verifiedEmail)}">${escapeHtml(SITE.verifiedEmail)}</a></span>
                <button
                  type="button"
                  class="btn btn-subtle"
                  data-copy-text="${escapeHtml(SITE.verifiedEmail)}"
                  data-copy-label="Email address copied"
                >
                  Copy
                </button>
              </div>
            </div>

            <div class="contact-row">
              <span class="contact-key">GitHub</span>
              <span class="contact-val">
                <a href="${escapeHtml(SITE.verifiedGithub)}" target="_blank" rel="noopener noreferrer">github.com/ochenjoshua5-jpg</a>
              </span>
            </div>

            <div class="contact-row">
              <span class="contact-key">Location</span>
              <span class="contact-val">Kampala, Uganda (EAT &middot; UTC+3)</span>
            </div>

            <div class="contact-row">
              <span class="contact-key">Focus Areas</span>
              <span class="contact-val">Automation Systems &middot; Software &middot; Ventures &middot; Sound</span>
            </div>
            <!-- [PENDING-CLIENT-INPUT]: Add verified LinkedIn, Instagram, X, or WhatsApp business link once explicitly confirmed by client. -->
          </div>
        </div>

        <div data-reveal>
          <form
            id="wealth-contact-form"
            class="dispatch-form"
            name="wealth-contact"
            method="POST"
            action="/contact/"
            data-netlify="true"
            netlify-honeypot="bot-field"
          >
            <input type="hidden" name="form-name" value="wealth-contact" />
            <p class="sr-only">
              <label>Leave this field empty if you are human: <input name="bot-field" /></label>
            </p>

            <span class="eyebrow">02 // SEND A MESSAGE</span>
            <h2 class="section-h2" style="font-size: 2rem; margin-bottom: 24px;">PROJECT &amp; INQUIRY BRIEF</h2>

            <div class="form-field">
              <label for="c-name">Your Name</label>
              <input id="c-name" name="name" type="text" autocomplete="name" placeholder="Full name or organization" required />
            </div>

            <div class="form-field">
              <label for="c-email">Email Address</label>
              <input id="c-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required />
            </div>

            <div class="form-field">
              <label for="c-subject">Inquiry Category</label>
              <select id="c-subject" name="subject">
                <option value="Custom Software / Business Automation">Custom Software / Business Automation</option>
                <option value="Venture Partnership / Investment">Venture Partnership / Investment</option>
                <option value="Engineering Collaboration">Engineering Collaboration</option>
                <option value="DJ / Sound / Creative Booking">DJ / Sound / Creative Booking</option>
                <option value="Press / Media Inquiry">Press / Media Inquiry</option>
              </select>
            </div>

            <div class="form-field">
              <label for="c-message">Message</label>
              <textarea
                id="c-message"
                name="message"
                placeholder="Share what you are building, timeline, and how we can work together."
                required
              ></textarea>
            </div>

            <div id="wealth-form-status" class="form-status" role="status" aria-live="polite"></div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">
              SEND MESSAGE &rarr;
            </button>
          </form>
        </div>
      </div>
    </section>
  `;

  return renderShell({
    routePath: '/contact/',
    title: 'Contact Wealth (Ochen Joshua) — Let’s Build Something Enduring',
    description:
      'Direct contact channels and working inquiry form for Wealth (Ochen Joshua) in Kampala, Uganda — ventures, custom software engineering, and creative collaborations.',
    ogImage: '/public/og-contact.png',
    ogImageAlt: 'Contact Wealth (Ochen Joshua) — Direct Dispatch from Kampala to Global.',
    mainHtml
  });
}

function build404Page() {
  const mainHtml = `
    <section class="section surface-obsidian">
      <div class="container" style="text-align: center; max-width: 680px; padding: 60px 0;">
        <span class="eyebrow" style="justify-content: center;">404 // ROUTE NOT FOUND</span>
        <h1 class="display-h1">This Coordinate Does Not Exist.</h1>
        <p class="lead-copy" style="margin: 0 auto 32px;">
          The page you requested may have moved. Return to the primary Wealth digital profile or explore shipped software builds.
        </p>
        <div class="btn-row" style="justify-content: center;">
          <a href="/" class="btn btn-primary">Return Home &rarr;</a>
          <a href="/work/" class="btn btn-secondary">Explore My Work</a>
        </div>
      </div>
    </section>
  `;

  return renderShell({
    routePath: '/404.html',
    title: '404 — Page Not Found | Wealth (Ochen Joshua)',
    description: 'Page not found on the official digital profile of Wealth (Ochen Joshua).',
    ogImage: '/public/og-home.png',
    ogImageAlt: 'Wealth — Ochen Joshua Digital Profile',
    robots: 'noindex, follow',
    includeSchema: false,
    mainHtml
  });
}

function buildSitemapXml() {
  const routes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/about/', priority: '0.9', changefreq: 'monthly' },
    { path: '/work/', priority: '0.9', changefreq: 'weekly' },
    { path: '/engineering/', priority: '0.8', changefreq: 'weekly' },
    { path: '/music/', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact/', priority: '0.8', changefreq: 'monthly' }
  ];

  const entries = routes
    .map(
      (r) => `  <url>
    <loc>${SITE.canonicalOrigin}${r.path}</loc>
    <lastmod>${SITE.buildDate}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE.canonicalOrigin}/sitemap.xml
`;
}

function buildWebManifest() {
  return JSON.stringify(
    {
      name: 'Wealth — Ochen Joshua',
      short_name: 'Wealth',
      description: SITE.positioning,
      start_url: '/',
      display: 'standalone',
      background_color: '#0A0A0B',
      theme_color: '#0A0A0B',
      icons: [
        { src: '/public/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/public/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    null,
    2
  );
}

async function writeRoute(relFile, content) {
  const full = path.join(ROOT, relFile);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, 'utf8');
}

async function main() {
  await writeRoute('index.html', buildHomePage());
  await writeRoute('about/index.html', buildAboutPage());
  await writeRoute('work/index.html', buildWorkPage());
  await writeRoute('engineering/index.html', buildEngineeringPage());
  await writeRoute('music/index.html', buildMusicPage());
  await writeRoute('contact/index.html', buildContactPage());
  await writeRoute('404.html', build404Page());
  await writeRoute('sitemap.xml', buildSitemapXml());
  await writeRoute('robots.txt', buildRobotsTxt());
  await writeRoute('site.webmanifest', buildWebManifest());

  console.log('✓ Compiled all 6 crawlable routes + 404.html + sitemap.xml + robots.txt + site.webmanifest');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
