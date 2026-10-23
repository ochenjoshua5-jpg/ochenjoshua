import fs from 'node:fs/promises';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const ROOT = process.cwd();
const FONTS_OUT = path.join(ROOT, 'assets', 'fonts');
const PUBLIC_OUT = path.join(ROOT, 'public');
const TTF_DIR = path.join(ROOT, 'raw-screenshots', 'fonts');

const WOFF2_COPIES = [
  ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2', 'cormorant-400.woff2'],
  ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2', 'cormorant-400-italic.woff2'],
  ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2', 'cormorant-600.woff2'],
  ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2', 'cormorant-600-italic.woff2'],
  ['@fontsource/inter/files/inter-latin-400-normal.woff2', 'inter-400.woff2'],
  ['@fontsource/inter/files/inter-latin-500-normal.woff2', 'inter-500.woff2'],
  ['@fontsource/inter/files/inter-latin-600-normal.woff2', 'inter-600.woff2'],
  ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', 'jetbrains-400.woff2'],
  ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2', 'jetbrains-500.woff2']
];

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E2C78E"/>
      <stop offset="50%" stop-color="#C9A869"/>
      <stop offset="100%" stop-color="#9A7B42"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="#0A0A0B"/>
  <rect x="6" y="6" width="116" height="116" rx="19" fill="none" stroke="url(#gold)" stroke-width="2" stroke-opacity="0.68"/>
  <path d="M25 38H38.5L49.5 81.5L60.8 43H67.2L78.5 81.5L89.5 38H103L84.2 94H74.6L64 59.5L53.4 94H43.8L25 38Z" fill="url(#gold)"/>
  <circle cx="64" cy="24" r="2.6" fill="#C9A869"/>
</svg>`;

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOgSvg({ eyebrow, line1, line2, accentLine, routeLabel }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="82%" cy="22%" r="65%">
      <stop offset="0%" stop-color="#C9A869" stop-opacity="0.16"/>
      <stop offset="45%" stop-color="#1C1C1F" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0A0A0B" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E2C78E" stop-opacity="0.9"/>
      <stop offset="55%" stop-color="#C9A869" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#8B6E3B" stop-opacity="0.35"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="#0A0A0B"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Architectural frame hairlines -->
  <rect x="32" y="32" width="1136" height="566" fill="none" stroke="#FFFFFF" stroke-opacity="0.09" stroke-width="1"/>
  <line x1="76" y1="126" x2="1124" y2="126" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1"/>
  <line x1="76" y1="528" x2="1124" y2="528" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1"/>
  <line x1="76" y1="126" x2="216" y2="126" stroke="#C9A869" stroke-width="2"/>

  <!-- Subtle large architectural W watermark -->
  <path d="M845 162H902L949 348L997 184H1024L1072 348L1119 162H1164L1086 402H1046L1010.5 256L975 402H935L845 162Z"
        fill="none" stroke="#C9A869" stroke-opacity="0.10" stroke-width="2"/>

  <!-- Top bar identity -->
  <rect x="76" y="64" width="40" height="40" rx="8" fill="#1C1C1F" stroke="url(#goldStroke)" stroke-width="1.4"/>
  <text x="96" y="91" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="24" fill="#C9A869">W</text>
  <text x="132" y="89" font-family="JetBrains Mono" font-weight="500" font-size="14" letter-spacing="4" fill="#F7F5F1">WEALTH</text>
  <text x="234" y="89" font-family="JetBrains Mono" font-weight="400" font-size="13" letter-spacing="2" fill="#B8B8BC">/ OCHEN JOSHUA</text>

  <text x="1124" y="89" text-anchor="end" font-family="JetBrains Mono" font-weight="400" font-size="12" letter-spacing="3" fill="#C9A869">${escapeXml(routeLabel)}</text>

  <!-- Eyebrow -->
  <text x="76" y="192" font-family="JetBrains Mono" font-weight="500" font-size="13" letter-spacing="4" fill="#C9A869">${escapeXml(eyebrow)}</text>

  <!-- Editorial Headline -->
  <text x="76" y="286" font-family="Cormorant Garamond" font-weight="600" font-size="72" fill="#F7F5F1">${escapeXml(line1)}</text>
  <text x="76" y="366" font-family="Cormorant Garamond" font-weight="600" font-size="72" fill="#F7F5F1">${escapeXml(line2)}</text>
  <text x="76" y="446" font-family="Cormorant Garamond" font-style="italic" font-weight="400" font-size="56" fill="#C9A869">${escapeXml(accentLine)}</text>

  <!-- Bottom ledger -->
  <text x="76" y="566" font-family="JetBrains Mono" font-weight="500" font-size="12" letter-spacing="3.2" fill="#F7F5F1">BUILD. OWN. INNOVATE. BECOME WEALTH.</text>
  <text x="1124" y="566" text-anchor="end" font-family="Inter" font-weight="400" font-size="14" fill="#B8B8BC">Ugandan Entrepreneur · Software Engineer · DJ</text>
</svg>`;
}

function buildApexDiagramSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>
    <radialGradient id="ag" cx="50%" cy="15%" r="75%">
      <stop offset="0%" stop-color="#C9A869" stop-opacity="0.14"/>
      <stop offset="55%" stop-color="#1C1C1F" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#0A0A0B"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="800" fill="#0A0A0B"/>
  <rect width="1280" height="800" fill="url(#ag)"/>
  <rect x="44" y="44" width="1192" height="712" rx="18" fill="#121215" stroke="#FFFFFF" stroke-opacity="0.1"/>
  <line x1="44" y1="118" x2="1236" y2="118" stroke="#FFFFFF" stroke-opacity="0.08"/>
  <circle cx="84" cy="81" r="6" fill="#C9A869"/>
  <circle cx="106" cy="81" r="6" fill="#3A3A40"/>
  <circle cx="128" cy="81" r="6" fill="#3A3A40"/>
  <text x="160" y="86" font-family="JetBrains Mono" font-size="14" letter-spacing="2.5" fill="#F7F5F1">APEX AUTOMATION SOLUTIONS // PIPELINE ARCHITECTURE</text>
  <text x="1194" y="86" text-anchor="end" font-family="JetBrains Mono" font-size="13" fill="#C9A869">KAMPALA · ACTIVE BUILD</text>

  <!-- Node 1 -->
  <rect x="92" y="206" width="332" height="236" rx="14" fill="#1C1C1F" stroke="#C9A869" stroke-opacity="0.55" stroke-width="1.5"/>
  <text x="120" y="252" font-family="JetBrains Mono" font-size="11.5" letter-spacing="2.2" fill="#C9A869">01 // INBOUND SIGNAL</text>
  <text x="120" y="296" font-family="Cormorant Garamond" font-weight="600" font-size="27" fill="#F7F5F1">WhatsApp &amp; Web Intake</text>
  <text x="120" y="340" font-family="Inter" font-size="14.5" fill="#B8B8BC">24/7 inquiry capture, intent</text>
  <text x="120" y="366" font-family="Inter" font-size="14.5" fill="#B8B8BC">routing &amp; conversation state.</text>
  <text x="120" y="410" font-family="JetBrains Mono" font-size="11.5" fill="#E2C78E">WEBHOOK · REST API · STATE</text>

  <!-- Connector 1 -->
  <line x1="424" y1="324" x2="474" y2="324" stroke="#C9A869" stroke-width="2"/>
  <polygon points="474,324 462,317 462,331" fill="#C9A869"/>

  <!-- Node 2 -->
  <rect x="474" y="206" width="332" height="236" rx="14" fill="#1C1C1F" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5"/>
  <text x="502" y="252" font-family="JetBrains Mono" font-size="11.5" letter-spacing="2.2" fill="#C9A869">02 // REASONING ENGINE</text>
  <text x="502" y="296" font-family="Cormorant Garamond" font-weight="600" font-size="27" fill="#F7F5F1">AI Qualification &amp; Triage</text>
  <text x="502" y="340" font-family="Inter" font-size="14.5" fill="#B8B8BC">Domain-grounded responses,</text>
  <text x="502" y="366" font-family="Inter" font-size="14.5" fill="#B8B8BC">lead scoring &amp; booking logic.</text>
  <text x="502" y="410" font-family="JetBrains Mono" font-size="11.5" fill="#E2C78E">PYTHON · LLM PROMPTS · N8N</text>

  <!-- Connector 2 -->
  <line x1="806" y1="324" x2="856" y2="324" stroke="#C9A869" stroke-width="2"/>
  <polygon points="856,324 844,317 844,331" fill="#C9A869"/>

  <!-- Node 3 -->
  <rect x="856" y="206" width="332" height="236" rx="14" fill="#1C1C1F" stroke="#C9A869" stroke-opacity="0.55" stroke-width="1.5"/>
  <text x="884" y="252" font-family="JetBrains Mono" font-size="11.5" letter-spacing="2.2" fill="#C9A869">03 // EXECUTION &amp; SYNC</text>
  <text x="884" y="296" font-family="Cormorant Garamond" font-weight="600" font-size="27" fill="#F7F5F1">CRM &amp; Dispatch Sync</text>
  <text x="884" y="340" font-family="Inter" font-size="14.5" fill="#B8B8BC">Automated scheduling, owner</text>
  <text x="884" y="366" font-family="Inter" font-size="14.5" fill="#B8B8BC">handoff &amp; structured records.</text>
  <text x="884" y="410" font-family="JetBrains Mono" font-size="11.5" fill="#E2C78E">SHEETS · CRM · ALERTS</text>

  <!-- Bottom telemetry bar -->
  <rect x="92" y="510" width="1096" height="176" rx="14" fill="#0E0E11" stroke="#FFFFFF" stroke-opacity="0.09"/>
  <text x="128" y="560" font-family="JetBrains Mono" font-size="12" letter-spacing="3" fill="#C9A869">PROBLEM SOLVED</text>
  <text x="128" y="604" font-family="Cormorant Garamond" font-style="italic" font-size="30" fill="#F7F5F1">Replacing manual WhatsApp replies, missed leads &amp; fragmented spreadsheets.</text>
  <text x="128" y="646" font-family="Inter" font-size="15" fill="#B8B8BC">Founded in Kampala by Ochen Joshua (Wealth) · github.com/ochenjoshua5-jpg/apexautomationsolutions</text>
</svg>`;
}

function buildDownloaderSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>
    <radialGradient id="dg" cx="25%" cy="20%" r="75%">
      <stop offset="0%" stop-color="#C9A869" stop-opacity="0.14"/>
      <stop offset="60%" stop-color="#1C1C1F" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#0A0A0B"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="800" fill="#0A0A0B"/>
  <rect width="1280" height="800" fill="url(#dg)"/>
  <rect x="44" y="44" width="1192" height="712" rx="18" fill="#121215" stroke="#FFFFFF" stroke-opacity="0.1"/>
  <line x1="44" y1="118" x2="1236" y2="118" stroke="#FFFFFF" stroke-opacity="0.08"/>
  <text x="88" y="86" font-family="JetBrains Mono" font-size="14" letter-spacing="2.5" fill="#F7F5F1">OJ MUSIC DOWNLOADER // SERVERLESS PWA PROTOTYPE</text>
  <text x="1194" y="86" text-anchor="end" font-family="JetBrains Mono" font-size="13" fill="#C9A869">PROTOTYPE · OPEN SOURCE</text>

  <!-- App UI window -->
  <rect x="116" y="176" width="640" height="492" rx="16" fill="#19191D" stroke="#C9A869" stroke-opacity="0.45" stroke-width="1.4"/>
  <text x="156" y="232" font-family="JetBrains Mono" font-size="12" letter-spacing="3" fill="#C9A869">AUDIO EXTRACTION CLIENT</text>
  <text x="156" y="286" font-family="Cormorant Garamond" font-weight="600" font-size="44" fill="#F7F5F1">Stream-to-MP3 Studio Utility</text>

  <rect x="156" y="328" width="560" height="62" rx="10" fill="#0D0D0F" stroke="#FFFFFF" stroke-opacity="0.14"/>
  <text x="182" y="365" font-family="JetBrains Mono" font-size="14" fill="#B8B8BC">https://www.youtube.com/watch?v=...</text>
  <rect x="572" y="338" width="134" height="42" rx="8" fill="#C9A869"/>
  <text x="639" y="364" text-anchor="middle" font-family="Inter" font-weight="600" font-size="14" fill="#0A0A0B">EXTRACT</text>

  <text x="156" y="446" font-family="JetBrains Mono" font-size="12" fill="#B8B8BC">PIPELINE STATE · VERIFYING STREAM &amp; TRANSCODING</text>
  <rect x="156" y="466" width="560" height="10" rx="5" fill="#0D0D0F"/>
  <rect x="156" y="466" width="412" height="10" rx="5" fill="#C9A869"/>

  <rect x="156" y="516" width="560" height="108" rx="10" fill="#111114" stroke="#FFFFFF" stroke-opacity="0.08"/>
  <text x="184" y="556" font-family="Inter" font-weight="600" font-size="15.5" fill="#F7F5F1">Offline-Ready PWA Manifest + Service Worker</text>
  <text x="184" y="590" font-family="Inter" font-size="14" fill="#B8B8BC">Local recent-history store + primary &amp; fallback serverless APIs.</text>

  <!-- Right architecture stack -->
  <rect x="804" y="176" width="380" height="492" rx="16" fill="#141418" stroke="#FFFFFF" stroke-opacity="0.1"/>
  <text x="840" y="232" font-family="JetBrains Mono" font-size="12" letter-spacing="3" fill="#C9A869">TECHNICAL STACK</text>
  <text x="840" y="288" font-family="Inter" font-weight="600" font-size="19" fill="#F7F5F1">JavaScript ES2022 + HTML5</text>
  <text x="840" y="320" font-family="Inter" font-size="14" fill="#B8B8BC">Zero-framework DOM &amp; progress state</text>

  <line x1="840" y1="354" x2="1148" y2="354" stroke="#FFFFFF" stroke-opacity="0.08"/>
  <text x="840" y="396" font-family="Inter" font-weight="600" font-size="19" fill="#F7F5F1">Netlify Serverless API</text>
  <text x="840" y="428" font-family="Inter" font-size="14" fill="#B8B8BC">URL validation + dual upstream failover</text>

  <line x1="840" y1="462" x2="1148" y2="462" stroke="#FFFFFF" stroke-opacity="0.08"/>
  <text x="840" y="504" font-family="Inter" font-weight="600" font-size="19" fill="#F7F5F1">Service Worker Shell</text>
  <text x="840" y="536" font-family="Inter" font-size="14" fill="#B8B8BC">Installable mobile &amp; desktop web app</text>

  <text x="840" y="624" font-family="JetBrains Mono" font-size="12" fill="#C9A869">github.com/ochenjoshua5-jpg/</text>
  <text x="840" y="646" font-family="JetBrains Mono" font-size="12" fill="#C9A869">oj-music-downloader</text>
</svg>`;
}

async function renderSvgToPng(svg, width, fontFiles) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: {
      fontFiles,
      loadSystemFonts: true
    }
  });
  return resvg.render().asPng();
}

async function main() {
  await fs.mkdir(FONTS_OUT, { recursive: true });
  await fs.mkdir(PUBLIC_OUT, { recursive: true });

  // 1. Copy subsetted WOFF2 fonts
  for (const [srcRel, outName] of WOFF2_COPIES) {
    const src = path.join(ROOT, 'node_modules', srcRel);
    const dst = path.join(FONTS_OUT, outName);
    await fs.copyFile(src, dst);
  }
  console.log(`✓ Copied ${WOFF2_COPIES.length} self-hosted WOFF2 font files to assets/fonts/`);

  // Collect TTF fonts for Resvg SVG rasterization
  let fontFiles = [];
  try {
    const entries = await fs.readdir(TTF_DIR);
    fontFiles = entries.filter((f) => f.endsWith('.ttf')).map((f) => path.join(TTF_DIR, f));
  } catch {
    fontFiles = [];
  }

  // 2. Write favicon SVG & app icons
  await fs.writeFile(path.join(ROOT, 'favicon.svg'), FAVICON_SVG, 'utf8');
  const icon512 = await renderSvgToPng(FAVICON_SVG, 512, fontFiles);
  await sharp(icon512).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC_OUT, 'icon-512.png'));
  await sharp(icon512).resize(192, 192).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC_OUT, 'icon-192.png'));
  await sharp(icon512).resize(180, 180).png({ compressionLevel: 9 }).toFile(path.join(ROOT, 'apple-touch-icon.png'));
  await sharp(icon512).resize(32, 32).png({ compressionLevel: 9 }).toFile(path.join(ROOT, 'favicon-32x32.png'));
  console.log('✓ Built custom "W" wordmark favicon & PWA app icons');

  // 3. Build 1200x630 Open Graph cards for all 6 routes
  const ogConfigs = [
    {
      file: 'og-home.png',
      eyebrow: 'UGANDAN BUILDER. GLOBAL AMBITION.',
      line1: 'I Build Technology.',
      line2: 'I Build Businesses.',
      accentLine: 'I Build Wealth.',
      routeLabel: 'WEALTH // HOME'
    },
    {
      file: 'og-about.png',
      eyebrow: 'FOUNDER DOSSIER · PHILOSOPHY · TIMELINE',
      line1: 'The Vision Is Bigger',
      line2: 'Than The Beginning.',
      accentLine: 'Ochen Joshua — Known as Wealth.',
      routeLabel: 'WEALTH // ABOUT'
    },
    {
      file: 'og-work.png',
      eyebrow: 'VENTURES · PRODUCTS · PROTOTYPES',
      line1: 'More Than One Idea.',
      line2: 'A Lifetime Of Building.',
      accentLine: 'Verified Software & Ventures.',
      routeLabel: 'WEALTH // WORK'
    },
    {
      file: 'og-engineering.png',
      eyebrow: 'ARCHITECTURE · CODE · GITHUB TELEMETRY',
      line1: 'Systems Built For',
      line2: 'Real-World Utility.',
      accentLine: 'Kotlin · Python · Web Architecture.',
      routeLabel: 'WEALTH // ENGINEERING'
    },
    {
      file: 'og-music.png',
      eyebrow: 'SOUND IDENTITY · 320 KBPS STUDIO DECK',
      line1: 'Engineer By Mind.',
      line2: 'DJ By Instinct.',
      accentLine: 'Precision Signal & Atmosphere.',
      routeLabel: 'WEALTH // MUSIC'
    },
    {
      file: 'og-contact.png',
      eyebrow: 'DIRECT DISPATCH · KAMPALA TO GLOBAL',
      line1: "Let's Build",
      line2: 'Something Enduring.',
      accentLine: 'Ventures · Engineering · Sound.',
      routeLabel: 'WEALTH // CONTACT'
    }
  ];

  for (const cfg of ogConfigs) {
    const pngBuf = await renderSvgToPng(buildOgSvg(cfg), 1200, fontFiles);
    await sharp(pngBuf)
      .resize(1200, 630)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(PUBLIC_OUT, cfg.file));
  }
  console.log(`✓ Generated ${ogConfigs.length} custom 1200×630 Open Graph cards`);

  // 4. Composite authentic OJ MUSIC screenshots from ochenjoshua5-jpg/joshua onto a 1280x800 studio plate
  const ojBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <defs>
      <radialGradient id="ojg" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#C9A869" stop-opacity="0.18"/>
        <stop offset="55%" stop-color="#1C1C1F" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#0A0A0B"/>
      </radialGradient>
    </defs>
    <rect width="1280" height="800" fill="#0A0A0B"/>
    <rect width="1280" height="800" fill="url(#ojg)"/>
    <rect x="36" y="36" width="1208" height="728" rx="18" fill="none" stroke="#FFFFFF" stroke-opacity="0.1"/>
    <text x="76" y="84" font-family="JetBrains Mono" font-size="13" letter-spacing="3" fill="#C9A869">OJ MUSIC // ANDROID 13-MODULE FLAC CLIENT</text>
    <text x="1204" y="84" text-anchor="end" font-family="JetBrains Mono" font-size="12" fill="#B8B8BC">KOTLIN · JETPACK COMPOSE · GPLv3</text>
  </svg>`;
  const ojBgBuf = await renderSvgToPng(ojBgSvg, 1280, fontFiles);

  const phoneMask = (w, h) =>
    Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="26" ry="26" fill="#fff"/></svg>`);

  const prepScreen = async (file, w, h) => {
    const raw = await sharp(path.join(ROOT, 'raw-screenshots', file))
      .resize(w, h, { fit: 'cover', position: 'top' })
      .composite([{ input: phoneMask(w, h), blend: 'dest-in' }])
      .png()
      .toBuffer();
    return raw;
  };

  const leftScreen = await prepScreen('main_screen.png', 286, 580);
  const centerScreen = await prepScreen('fullplayer.png', 316, 636);
  const rightScreen = await prepScreen('lyrics_screen.png', 286, 580);

  const ojComposite = sharp(ojBgBuf).composite([
    { input: leftScreen, left: 148, top: 148 },
    { input: rightScreen, left: 846, top: 148 },
    { input: centerScreen, left: 482, top: 116 }
  ]);
  await ojComposite.clone().webp({ quality: 84 }).toFile(path.join(PUBLIC_OUT, 'work-ojmusic.webp'));
  await ojComposite.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(PUBLIC_OUT, 'work-ojmusic.jpg'));

  // 5. Render Apex & Downloader architectural system plates (WebP + JPEG)
  const apexPng = await renderSvgToPng(buildApexDiagramSvg(), 1280, fontFiles);
  await sharp(apexPng).webp({ quality: 86 }).toFile(path.join(PUBLIC_OUT, 'work-apex.webp'));
  await sharp(apexPng).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(PUBLIC_OUT, 'work-apex.jpg'));

  const dlPng = await renderSvgToPng(buildDownloaderSvg(), 1280, fontFiles);
  await sharp(dlPng).webp({ quality: 86 }).toFile(path.join(PUBLIC_OUT, 'work-downloader.webp'));
  await sharp(dlPng).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(PUBLIC_OUT, 'work-downloader.jpg'));

  console.log('✓ Built optimized WebP + JPEG product showcase plates in public/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
