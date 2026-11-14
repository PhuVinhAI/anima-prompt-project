const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const TAGS_DIR = path.join(BASE_DIR, 'tags');
const tree = JSON.parse(fs.readFileSync(path.join(__dirname, 'groups.json'), 'utf8'));
const results = new Map(JSON.parse(fs.readFileSync(path.join(__dirname, 'results.json'), 'utf8')).map((r) => [r.slug, r]));

const problems = [];
let roots = 0;
let files = 0;
let tagLines = 0;
let leafNodes = 0;
const unique = new Set();
const cats = {};

for (const s of tree.sections) {
  for (const r of s.roots) {
    roots++;
    const children = r.children || [];
    const sources = children.length ? children : [r];
    let expected = 0;

    for (const n of sources) {
      leafNodes++;
      const res = results.get(n.slug);
      if (!res) { problems.push(`missing result: ${n.slug}`); continue; }
      if (res.fetched !== res.expected) problems.push(`result count ${n.slug}: ${res.fetched}/${res.expected}`);
      expected += res.tags.length;
      for (const t of res.tags) cats[t.category] = (cats[t.category] || 0) + 1;
    }

    if (children.length && r.directTags > 0) {
      const res = results.get(r.slug);
      if (!res) problems.push(`missing result: ${r.slug}`);
      else {
        if (res.fetched !== res.expected) problems.push(`result count ${r.slug}: ${res.fetched}/${res.expected}`);
        const childNames = new Set(sources.flatMap((n) => (results.get(n.slug)?.tags || []).map((t) => t.name)));
        const direct = res.tags.filter((t) => !childNames.has(t.name));
        expected += direct.length;
        for (const t of direct) cats[t.category] = (cats[t.category] || 0) + 1;
      }
    }

    if (!children.length && expected === 0) continue;
    const file = path.join(TAGS_DIR, s.section, `${r.slug}.md`);
    if (!fs.existsSync(file)) { problems.push(`missing file: ${file}`); continue; }
    files++;
    const text = fs.readFileSync(file, 'utf8');
    const lines = text.split('\n').filter((l) => /^~?\S+$/.test(l));
    tagLines += lines.length;
    for (const l of lines) unique.add(l.replace(/^~/, ''));
    if (lines.length !== expected) problems.push(`line count ${file}: ${lines.length}/${expected}`);
  }
}

const readme = path.join(TAGS_DIR, 'README.md');
if (!fs.existsSync(readme)) problems.push('missing tags/README.md');
else {
  const n = fs.readFileSync(readme, 'utf8').split('\n').filter((l) => /^- \[.+\]\(/.test(l)).length;
  if (n !== roots) problems.push(`tags/README.md index: ${n}/${roots}`);
}

const anima = path.join(BASE_DIR, 'anima-tags.md');
if (!fs.existsSync(anima) || fs.statSync(anima).size === 0) problems.push('missing anima-tags.md');

console.log({ roots, files, leafNodes, tagLines, uniqueTags: unique.size, categories: cats });
if (problems.length) {
  console.log('PROBLEMS:', problems);
  process.exitCode = 1;
} else {
  console.log('OK: tag data complete');
}
