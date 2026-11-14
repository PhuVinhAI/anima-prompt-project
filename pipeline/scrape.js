const fs = require('fs');
const path = require('path');

const BASE = 'https://tags.latent.moe';
const PAGE_SIZE = 48;
const CONCURRENCY = 4;
const DELAY_MS = 120;
const RETRIES = 3;

const args = process.argv.slice(2);
const limitArg = args.indexOf('--limit');
const LIMIT = limitArg >= 0 ? parseInt(args[limitArg + 1], 10) : Infinity;
const onlyArg = args.indexOf('--only');
const ONLY = onlyArg >= 0 ? args[onlyArg + 1] : null;

const tree = JSON.parse(fs.readFileSync(path.join(__dirname, 'groups.json'), 'utf8'));
const SECTIONS = {
  appearance: 'Appearance',
  body: 'Body',
  action: 'Pose & action',
  scene: 'Scene & setting',
  composition: 'Composition & style',
  objects: 'Objects',
  creatures: 'Creatures',
  people: 'People & relationships',
  mature: 'Mature',
  fandom: 'Franchises & brands',
  meta: 'Metadata',
};

const cacheDir = path.join(__dirname, 'cache');
fs.mkdirSync(cacheDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let active = 0;
let started = 0;
async function gate() {
  while (active >= CONCURRENCY) await sleep(50);
  active++;
  started++;
  await sleep(DELAY_MS);
}
function release() { active--; }

async function fetchText(url) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) anima-prompt-project/1.0',
          accept: 'text/html',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (attempt === RETRIES) throw e;
      await sleep(600 * attempt);
    }
  }
}

function rscText(html) {
  const parts = [];
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let m;
  while ((m = re.exec(html))) {
    try { parts.push(JSON.parse(m[1])); } catch {}
  }
  return parts.join('');
}

function extractTags(html) {
  const txt = rscText(html);
  const out = [];
  const seen = new Set();
  const re = /"name":"([^"]+)","category":(\d+),"postCount":(\d+),"isDeprecated":(true|false)/g;
  let m;
  while ((m = re.exec(txt))) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push({ name: m[1], category: +m[2], posts: +m[3], deprecated: m[4] === 'true' });
  }
  return out;
}

const cacheFile = (slug) => path.join(cacheDir, slug.replace(/\//g, '__') + '.json');

async function scrapeNode(node) {
  const cf = cacheFile(node.slug);
  if (fs.existsSync(cf)) {
    try { return JSON.parse(fs.readFileSync(cf, 'utf8')); } catch {}
  }
  const expected = node.tags || 0;
  const pages = Math.max(1, Math.ceil(expected / PAGE_SIZE)) + 1;
  const tags = [];
  const seen = new Set();
  let lastPageCount = 0;
  for (let p = 1; p <= pages; p++) {
    await gate();
    let html;
    try {
      html = await fetchText(`${BASE}/en/g/${node.slug}${p > 1 ? `?page=${p}` : ''}`);
    } finally {
      release();
    }
    const pageTags = extractTags(html);
    lastPageCount = pageTags.length;
    for (const t of pageTags) {
      if (!seen.has(t.name)) { seen.add(t.name); tags.push(t); }
    }
    if (tags.length >= expected) break;
    if (pageTags.length === 0) break;
  }
  const result = { slug: node.slug, expected, fetched: tags.length, tags };
  fs.writeFileSync(cf, JSON.stringify(result));
  return result;
}

function collectNodes() {
  const leaves = [];
  const roots = [];
  for (const s of tree.sections) {
    for (const r of s.roots) {
      roots.push({ section: s.section, node: r });
      if (!r.children || !r.children.length) {
        leaves.push({ section: s.section, node: r, parent: null });
      } else {
        for (const c of r.children) {
          leaves.push({ section: s.section, node: c, parent: r });
        }
      }
    }
  }
  return { leaves, roots };
}

async function main() {
  const { leaves, roots } = collectNodes();
  let todo = leaves.map((x) => x.node);
  if (ONLY) todo = todo.filter((n) => n.slug === ONLY || n.slug.startsWith(ONLY + '/'));
  if (LIMIT !== Infinity) todo = todo.slice(0, LIMIT);

  // roots with children but direct tags need an aggregate scrape too
  const extraRoots = roots
    .filter(({ node }) => node.children && node.children.length && node.directTags > 0)
    .map(({ node }) => node);
  todo = [...new Map([...todo, ...extraRoots].map((n) => [n.slug, n])).values()];

  console.log(`Scraping ${todo.length} nodes (${leaves.length} leaves total)`);
  const results = new Map();
  let done = 0;
  const workers = [];
  const queue = [...todo];
  async function worker(id) {
    while (queue.length) {
      const n = queue.shift();
      try {
        const r = await scrapeNode(n);
        results.set(n.slug, r);
        if (r.fetched !== r.expected) {
          console.log(`MISMATCH ${n.slug}: expected ${r.expected}, got ${r.fetched}`);
        }
      } catch (e) {
        console.log(`FAIL ${n.slug}: ${e.message}`);
        results.set(n.slug, { slug: n.slug, expected: n.tags, fetched: 0, tags: [], error: e.message });
      }
      done++;
      if (done % 25 === 0 || done === todo.length) console.log(`progress ${done}/${todo.length}`);
    }
  }
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker(i));
  await Promise.all(workers);

  fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify([...results.values()]));
  console.log(`Wrote results.json (${results.size} nodes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
