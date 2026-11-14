const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const tree = JSON.parse(fs.readFileSync(path.join(__dirname, 'groups.json'), 'utf8'));
const results = new Map(JSON.parse(fs.readFileSync(path.join(__dirname, 'results.json'), 'utf8')).map((r) => [r.slug, r]));

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

const outDir = path.join(BASE_DIR, 'tags');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const tagLine = (t) => `${t.deprecated ? '~' : ''}${t.name}`;

function directTagsOf(root) {
  const children = root.children || [];
  if (!children.length) return results.get(root.slug)?.tags || [];
  if (!(root.directTags > 0)) return [];
  const childNames = new Set(children.flatMap((c) => (results.get(c.slug)?.tags || []).map((t) => t.name)));
  return (results.get(root.slug)?.tags || []).filter((t) => !childNames.has(t.name));
}

const index = [];
for (const s of tree.sections) {
  for (const root of s.roots) {
    const children = root.children || [];
    const lines = [`# ${root.title} · ${s.section} · ${root.tags} tags`, ''];
    for (const c of children) {
      lines.push(`## ${c.title}`);
      for (const t of (results.get(c.slug)?.tags || [])) lines.push(tagLine(t));
      lines.push('');
    }
    const direct = directTagsOf(root);
    if (direct.length) {
      if (children.length) lines.push(`## Other`);
      for (const t of direct) lines.push(tagLine(t));
      lines.push('');
    }
    if (!children.length && direct.length === 0) continue;

    const dir = path.join(outDir, s.section);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${root.slug}.md`), lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
    index.push({ section: s.section, title: root.title, slug: root.slug, tags: root.tags });
  }
}

const bySection = {};
for (const r of index) (bySection[r.section] ||= []).push(r);
const readme = [
  '# Latent Tags — anime prompt reference',
  '',
  'Snapshot 2026-08-16, tag data © Danbooru contributors. Source: https://tags.latent.moe/en/g/<group>',
  '',
  'Format: one tag per line, most popular first. `~tag` = deprecated. Headings are Danbooru wiki tag groups.',
  '',
  'Lookup: `grep -rn "^silver_hair$" tags` finds a tag and its group file.',
  '',
];
for (const [sec, rows] of Object.entries(bySection)) {
  readme.push(`## ${SECTIONS[sec] || sec}`, '');
  for (const r of rows) readme.push(`- [${r.title}](${sec}/${r.slug}.md) ${r.tags}`);
  readme.push('');
}
fs.writeFileSync(path.join(outDir, 'README.md'), readme.join('\n'));

console.log(`Wrote ${index.length} group files to ${outDir}`);
