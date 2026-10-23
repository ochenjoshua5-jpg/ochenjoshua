/* ==========================================================================
   SINGLE SOURCE OF TRUTH — WEALTH / OCHEN JOSHUA DIGITAL PROFILE
   Strictly verified facts & repository evidence only. Zero fabricated claims.
   ========================================================================== */

// TODO [PENDING-CLIENT-INPUT]: Update CANONICAL_ORIGIN if connecting a custom domain (e.g. https://ochenjoshua.com) and run `npm run build`.
export const SITE = {
  canonicalOrigin: 'https://ochenjoshua.netlify.app',
  publicName: 'Wealth',
  legalName: 'Ochen Joshua',
  nationality: 'Ugandan',
  location: 'Kampala, Uganda',
  coordinates: '00°18′49″N 32°34′52″E',
  roles: ['Entrepreneur', 'Software Engineer', 'Technology Innovator', 'DJ'],
  positioning: 'Wealth — Ugandan Entrepreneur, Software Engineer, Technology Innovator & DJ.',
  tagline: 'BUILD. OWN. INNOVATE. BECOME WEALTH.',
  philosophy:
    'Wealth is built by creating value, owning what you build, solving real problems, and thinking beyond geography.',
  verifiedEmail: 'ochenjoshua5@gmail.com',
  verifiedGithub: 'https://github.com/ochenjoshua5-jpg',
  githubHandle: 'ochenjoshua5-jpg',
  buildDate: '2026-10-23'
};

export const NAV_ITEMS = [
  { label: 'Home', href: '/', num: '01' },
  { label: 'About', href: '/about/', num: '02' },
  { label: 'Work', href: '/work/', num: '03' },
  { label: 'Engineering', href: '/engineering/', num: '04' },
  { label: 'Music', href: '/music/', num: '05' },
  { label: 'Contact', href: '/contact/', num: '06' }
];

export const PRESS_BIO_PARAGRAPHS = [
  'Ochen Joshua — also written Joshua Ochen and known publicly as Wealth — is a Ugandan entrepreneur, software engineer, technology innovator, and DJ based in Kampala, Uganda. Operating at the intersection of software architecture, venture building, and sound culture, he builds practical digital products designed to solve real operational problems and scale beyond geographic borders.',
  "Self-taught in software development from age sixteen while studying physics at St. Mary's College Kisubi (SMACK), Ochen began by shipping utility systems for schools, clinics, and local shops — student management tools, patient tracking workflows, and inventory software built directly for everyday operators. That early foundation shaped his core conviction: enduring wealth is built by creating tangible value, owning what you build, and engineering systems that buy people back their time.",
  'Today, through Apex Automation Solutions in Kampala, Ochen Joshua focuses on AI-assisted customer support workflows, WhatsApp business automation, and lead-qualification pipelines for growing businesses. Alongside his commercial venture work, he builds open-source audio and web software — including OJ MUSIC, a thirteen-module Kotlin and Jetpack Compose Android client supporting lossless FLAC playback, and OJ Music Downloader, a serverless Progressive Web App. Whether architecting software or curating sound behind the decks in Uganda as Wealth, his standard remains constant: disciplined execution, ownership, and global ambition.'
];

export const PROJECTS = [
  {
    id: 'apex-automation',
    index: '01',
    name: 'Apex Automation Solutions',
    status: 'In Development',
    statusSlug: 'in-development',
    featured: true,
    summary:
      'Custom business automation venture founded in Kampala to replace repetitive manual customer replies, missed inquiries, and disconnected spreadsheets with structured software workflows.',
    problemSolved:
      'Small and medium business operators lose hours daily answering repetitive WhatsApp inquiries manually, dropping warm leads, and copying records across spreadsheets.',
    targetUser:
      'Founders, clinics, hospitality teams, property operators, and growing service businesses in Uganda and beyond.',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Python', 'WhatsApp API Workflows', 'n8n / LLM Pipelines'],
    repoUrl: 'https://github.com/ochenjoshua5-jpg/apexautomationsolutions',
    repoLabel: 'github.com/ochenjoshua5-jpg/apexautomationsolutions',
    imageWebp: '/public/work-apex.webp',
    imageFallback: '/public/work-apex.jpg',
    imageAlt:
      'Apex Automation Solutions pipeline architecture showing WhatsApp and web intake feeding AI qualification triage and CRM dispatch sync'
  },
  {
    id: 'oj-music-android',
    index: '02',
    name: 'OJ MUSIC (Android Client & Desktop Launcher)',
    status: 'Live',
    statusSlug: 'live',
    featured: true,
    summary:
      'Open-source hybrid Android music client engineered across a modular 13-module Gradle codebase with lossless FLAC playback, synchronized lyrics, device-local AES-256-GCM credential encryption, and a custom C/Python desktop installer.',
    problemSolved:
      'Unifies streaming discovery and high-resolution local FLAC playback in an ad-free, zero-telemetry Android experience with automated desktop APK packaging and ADB installation.',
    targetUser:
      'Audiophiles, Android power users, and music listeners who value lossless sound and zero tracking.',
    stack: ['Kotlin', 'Jetpack Compose', 'Android SDK', 'Gradle 13-Module', 'C', 'Python'],
    repoUrl: 'https://github.com/ochenjoshua5-jpg/joshua',
    repoLabel: 'github.com/ochenjoshua5-jpg/joshua',
    imageWebp: '/public/work-ojmusic.webp',
    imageFallback: '/public/work-ojmusic.jpg',
    imageAlt:
      'OJ MUSIC Android application screenshots showing the quick picks home screen, lossless FLAC full player interface, and synchronized lyrics screen'
  },
  {
    id: 'oj-music-downloader',
    index: '03',
    name: 'OJ Music Downloader',
    status: 'Prototype',
    statusSlug: 'prototype',
    featured: true,
    summary:
      'Installable Progressive Web App and Netlify serverless API prototype for converting stream links into offline MP3 audio tracks with live progress telemetry and local history persistence.',
    problemSolved:
      'Provides a fast, mobile-friendly browser interface with automatic fallback between upstream extraction workers when preparing offline audio tracks.',
    targetUser:
      'DJs, commuters, and listeners curating offline personal reference tracks.',
    stack: ['JavaScript ES2022', 'HTML5', 'CSS3', 'Service Worker PWA', 'Netlify Functions'],
    repoUrl: 'https://github.com/ochenjoshua5-jpg/oj-music-downloader',
    repoLabel: 'github.com/ochenjoshua5-jpg/oj-music-downloader',
    imageWebp: '/public/work-downloader.webp',
    imageFallback: '/public/work-downloader.jpg',
    imageAlt:
      'OJ Music Downloader Progressive Web App technical overview showing URL input, stream verification progress bar, and Netlify serverless architecture'
  },
  {
    id: 'wealth-digital-profile',
    index: '04',
    name: 'Wealth Digital Profile System',
    status: 'Live',
    statusSlug: 'live',
    featured: false,
    summary:
      'Multi-route static brand architecture for Wealth (Ochen Joshua) engineered with zero client framework overhead, self-hosted subset typography, structured Schema.org graphs, and a Web Audio FFT sound deck.',
    problemSolved:
      'Establishes an authoritative, fast-loading primary identity hub linking Ochen Joshua and Wealth across search engines, press, collaborators, and engineering peers.',
    targetUser:
      'Collaborators, founders, journalists, investors, and engineering peers worldwide.',
    stack: ['Semantic HTML5', 'CSS Custom Properties', 'Web Audio API', 'Schema.org JSON-LD', 'Netlify'],
    repoUrl: 'https://github.com/ochenjoshua5-jpg/ochenjoshua',
    repoLabel: 'github.com/ochenjoshua5-jpg/ochenjoshua'
  },
  {
    id: 'whatsapp-lead-engine',
    index: '05',
    name: 'WhatsApp Support & Lead-Qualification Engine',
    status: 'Prototype',
    statusSlug: 'prototype',
    featured: false,
    summary:
      'End-to-end automated conversational intake, qualification, and follow-up prototype built inside the Apex workflow lab for high-volume WhatsApp business channels.',
    problemSolved:
      'Captures inbound prospect intent immediately, answers common operational questions, and routes qualified leads without manual copy-paste.',
    targetUser:
      'Owner-operated service businesses handling daily customer inquiries over WhatsApp.',
    stack: ['Python', 'WhatsApp API Integration', 'OpenAI API', 'Webhook Routing'],
    repoUrl: null,
    repoLabel: 'Internal prototype (Apex Lab)'
  },
  {
    id: 'kampala-ops-tools',
    index: '06',
    name: 'Foundational Operations Systems (School · Clinic · Retail)',
    status: 'Prototype',
    statusSlug: 'prototype',
    featured: false,
    summary:
      'Early custom operational tools built between ages sixteen and eighteen in Kampala covering student record management, clinic patient tracking, and shop inventory logging.',
    problemSolved:
      'Replaced paper ledgers and error-prone manual record keeping for local operators with straightforward digital workflows.',
    targetUser:
      'Local schools, community clinics, and independent shop owners in Kampala.',
    stack: ['Python', 'Relational Data Modeling', 'Web Forms', 'Local Reporting'],
    repoUrl: null,
    repoLabel: 'Early client & learning builds (Kampala)'
  }
];

export const ENGINEERING_CAPABILITIES = [
  {
    domain: 'Web Architecture & UI Systems',
    level: 'Building with',
    evidence:
      'Shipped across <code>ochenjoshua</code>, <code>apexautomationsolutions</code>, and <code>oj-music-downloader</code>: semantic multi-page HTML5, token-driven CSS design systems, responsive layouts, PWA service workers, and Web Audio canvas visualizers.'
  },
  {
    domain: 'Kotlin, Android & Desktop Tooling',
    level: 'Working with',
    evidence:
      'Evidenced in <code>joshua</code> (OJ MUSIC): 13-module Gradle build configuration, Jetpack Compose UI screens, FLAC playback pipeline, and a self-contained C + Python Windows APK installer (<code>launcher/build_launcher.py</code>).'
  },
  {
    domain: 'Python & Workflow Automation',
    level: 'Building with',
    evidence:
      'Applied across cross-compiler build automation scripts, webhook orchestration, WhatsApp customer support prototypes, and early school/clinic/inventory management tools.'
  },
  {
    domain: 'Serverless APIs & Integrations',
    level: 'Working with',
    evidence:
      'Evidenced in <code>oj-music-downloader/yes/functions/api/download.js</code>: Netlify serverless HTTP handlers, input sanitization, timeout control, and primary-to-fallback upstream failover.'
  },
  {
    domain: 'Applied AI Agents & Business Systems',
    level: 'Area of focus',
    evidence:
      'Active commercial R&D focus at Apex Automation Solutions — designing domain-grounded support assistants, lead qualification flows, and operational automation for African and global SMEs.'
  }
];

export const CODE_SAMPLES = [
  {
    id: 'launcher-py',
    tabLabel: '01 · launcher/build_launcher.py',
    repoName: 'ochenjoshua5-jpg/joshua',
    repoUrl: 'https://github.com/ochenjoshua5-jpg/joshua/blob/main/launcher/build_launcher.py',
    description:
      'Self-contained Windows cross-compiler discovery and binary APK trailer packer (`[launcher.exe][apk][uint64 size]["OJMUSIC1"]`) from OJ MUSIC.',
    code: `#!/usr/bin/env python3
"""
Append the Android APK + 8-byte little-endian size footer + magic bytes
so OJ-MUSIC.exe distributes as a single self-contained binary:
  [ launcher.exe ][ apk bytes ][ 8-byte size ][ "OJMUSIC1" ]
"""
import os, shutil, struct, sys
from pathlib import Path

MAGIC = b"OJMUSIC1"

def candidate_compilers(zig_dir: Path):
    cc = os.environ.get("CC", "").strip()
    if cc:
        base = cc.split()
        yield ("$CC", base + (["-target", "x86_64-windows-gnu"] if "zig" in base[0] else []))
    if shutil.which("x86_64-w64-mingw32-gcc"):
        yield ("mingw-w64", ["x86_64-w64-mingw32-gcc"])
    if shutil.which("zig"):
        yield ("zig", ["zig", "cc", "-target", "x86_64-windows-gnu"])
    if (zig_dir / "ziglang").is_dir():
        yield ("ziglang", [sys.executable, "-m", "ziglang", "cc", "-target", "x86_64-windows-gnu"])

def pack_self_contained_installer(stub_exe: Path, apk_path: Path, out_exe: Path) -> int:
    stub_bytes = stub_exe.read_bytes()
    apk_bytes = apk_path.read_bytes()
    trailer = struct.pack("<Q", len(apk_bytes)) + MAGIC
    out_exe.write_bytes(stub_bytes + apk_bytes + trailer)
    return out_exe.stat().st_size`
  },
  {
    id: 'audio-fft-js',
    tabLabel: '02 · assets/js/wealth.js',
    repoName: 'ochenjoshua5-jpg/ochenjoshua',
    repoUrl: 'https://github.com/ochenjoshua5-jpg/ochenjoshua',
    description:
      'Zero-dependency Web Audio API FFT spectrum analyzer with device-pixel-ratio scaling and strict prefers-reduced-motion fallback.',
    code: `function initAnalyserGraph(audioElement) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }
  const ctx = new AudioCtx();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.82;

  const source = ctx.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(ctx.destination);

  return {
    ctx,
    analyser,
    bins: new Uint8Array(analyser.frequencyBinCount)
  };
}`
  },
  {
    id: 'serverless-failover-js',
    tabLabel: '03 · functions/api/download.js',
    repoName: 'ochenjoshua5-jpg/oj-music-downloader',
    repoUrl: 'https://github.com/ochenjoshua5-jpg/oj-music-downloader',
    description:
      'Serverless audio stream resolver with strict method/URL validation, environment-isolated credentials, and automatic upstream failover.',
    code: `// Environment-only credential binding (never exposed to browser bundle)
const APIFY_TOKEN = process.env.APIFY_TOKEN;

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return json({ ok: true }, 200);
  if (event.httpMethod !== 'POST') return json({ error: 'Use POST.' }, 405);

  const { url = '' } = JSON.parse(event.body || '{}');
  const target = String(url).trim();
  if (!isSafeYouTubeUrl(target)) {
    return json({ error: 'Provide a valid video URL.' }, 400);
  }

  // Primary worker with bounded timeout, automatic fallback on upstream latency
  const primary = APIFY_TOKEN ? await startPrimaryExtraction(target, APIFY_TOKEN) : null;
  if (primary?.downloadUrl) return json(primary, 200);

  const fallback = await tryFallbackResolver(target);
  if (fallback?.downloadUrl) return json(fallback, 200);

  return json({ error: 'Upstream resolvers timed out.' }, 502);
};`
  }
];

export const VERIFIED_REPOS = [
  {
    name: 'ochenjoshua',
    description: 'Official digital profile, brand architecture, and Web Audio sound deck for Wealth (Ochen Joshua).',
    language: 'HTML / CSS / JS',
    updated: '2026-10-23',
    url: 'https://github.com/ochenjoshua5-jpg/ochenjoshua'
  },
  {
    name: 'apexautomationsolutions',
    description: 'Apex Automation Solutions — custom software, WhatsApp AI agent workflows, and business automation platform.',
    language: 'HTML / JS',
    updated: '2026-10-22',
    url: 'https://github.com/ochenjoshua5-jpg/apexautomationsolutions'
  },
  {
    name: 'joshua',
    description: 'OJ MUSIC — 13-module Android music player in Kotlin & Jetpack Compose with lossless FLAC playback and desktop installer.',
    language: 'Kotlin / C / Python',
    updated: '2026-10-06',
    url: 'https://github.com/ochenjoshua5-jpg/joshua'
  },
  {
    name: 'oj-music-downloader',
    description: 'OJ Music Downloader — installable Progressive Web App and Netlify serverless stream-to-MP3 prototype.',
    language: 'JavaScript',
    updated: '2026-09-10',
    url: 'https://github.com/ochenjoshua5-jpg/oj-music-downloader'
  },
  {
    name: 'automatic-adventure',
    description: 'Iterative web interface build for OJ Music Downloader audio studio UI and offline Service Worker shell.',
    language: 'JavaScript',
    updated: '2026-09-10',
    url: 'https://github.com/ochenjoshua5-jpg/automatic-adventure'
  }
];
