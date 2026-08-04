#!/usr/bin/env node
// Resolves <!--@include header ...--> / <!--@include footer ...--> markers in src/pages/**/*.html
// against partials/header.html and partials/footer.html, writing the assembled
// static HTML into site/**/*.html (mirroring the relative path). Also regenerates
// site/sitemap.xml from the same page list, using `git log` as the source of truth
// for <lastmod> — no more manually-edited dates going stale.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const PARTIALS_DIR = path.join(ROOT, 'partials');
const SITE_DIR = path.join(ROOT, 'site');
const SITE_URL = (fs.existsSync(path.join(ROOT, '.env'))
  ? (fs.readFileSync(path.join(ROOT, '.env'), 'utf8').match(/^SITE_URL=(.+)$/m) || [])[1]
  : null) || process.env.SITE_URL || 'https://acsacarlis.adv.br';

const NAV_SETS = {
  default: [
    ['situacoes', 'SITUACOES'], ['como-funciona', 'COMO_FUNCIONA'], ['duvidas', 'DUVIDAS'],
    ['sobre', 'SOBRE'], ['blog', 'BLOG'], ['calculadora', 'CALCULADORA'],
  ],
  empresas: [
    ['servicos', 'SERVICOS'], ['como-funciona', 'COMO_FUNCIONA'], ['duvidas', 'DUVIDAS'],
    ['sobre', 'SOBRE'], ['blog', 'BLOG'], ['calculadora', 'CALCULADORA'],
  ],
  area: [
    ['servicos', 'SERVICOS'], ['como-funciona', 'COMO_FUNCIONA'], ['duvidas', 'DUVIDAS'],
    ['sobre', 'SOBRE'], ['blog', 'BLOG'],
  ],
  hub: [
    ['areas', 'AREAS'], ['sobre', 'SOBRE'], ['duvidas', 'DUVIDAS'],
  ],
};

const DISCLAIMERS = {
  default:
`                <p class="mb-3">
                    Este site tem caráter meramente informativo, em conformidade com o Provimento nº 205/2021 do Conselho Federal da OAB e o Código de Ética e Disciplina da OAB. Não contém oferta de serviços, captação de causas, mercantilização ou promessa de resultados.
                </p>`,
  home:
`                <p class="mb-3">
                    <strong class="text-gray-400">Aviso Legal:</strong> Este site tem caráter meramente informativo, em conformidade com o Provimento nº 205/2021 do Conselho Federal da OAB e o Código de Ética e Disciplina da OAB. Não contém oferta de serviços, captação de causas, mercantilização ou promessa de resultados. As áreas de atuação, situações e perguntas apresentadas são exemplos genéricos, não constituindo aconselhamento jurídico. Cada caso exige análise individualizada, e as informações aqui veiculadas não substituem a consulta a um advogado.
                </p>`,
  'blog-article':
`                <p class="mb-3">
                    <strong class="text-gray-400">Aviso Legal:</strong> Este artigo tem caráter meramente informativo, em conformidade com o Provimento nº 205/2021 do Conselho Federal da OAB e o Código de Ética e Disciplina da OAB. Não contém oferta de serviços, captação de causas, mercantilização ou promessa de resultados. As informações aqui veiculadas são gerais, não constituem aconselhamento jurídico e não substituem a consulta a um advogado. Cada caso exige análise individualizada.
                </p>`,
  calculadora:
`                <p class="mb-3">
                    <strong class="text-gray-400">Aviso Legal:</strong> Esta calculadora tem caráter meramente informativo e estimativo, em conformidade com o Provimento nº 205/2021 do Conselho Federal da OAB e o Código de Ética e Disciplina da OAB. Não contém oferta de serviços, captação de causas, mercantilização ou promessa de resultados. Os valores calculados são aproximados, podem conter erros e não consideram particularidades do caso concreto. Este resultado não constitui aconselhamento jurídico e não substitui a consulta a um advogado. Cada caso exige análise individualizada.
                </p>`,
};

function navClass(item, active, isMobile, isLast) {
  const isActive = item === active;
  if (!isMobile) {
    return isActive ? 'text-marsala font-semibold' : 'hover:text-marsala transition';
  }
  if (isActive) return 'py-3 px-2 text-marsala font-semibold';
  return isLast
    ? 'py-3 px-2 text-gray-700 font-medium hover:text-marsala transition'
    : 'py-3 px-2 text-gray-700 font-medium border-b border-gray-100 hover:text-marsala transition';
}

function parseAttrs(str) {
  const attrs = {};
  const re = /(\w+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(str))) attrs[m[1]] = m[2];
  return attrs;
}

const HEADER_FILES = { default: 'header.html', empresas: 'header-empresas.html', area: 'header-area.html', hub: 'header-hub.html' };
const FOOTER_FILES = { default: 'footer.html', empresas: 'footer-empresas.html', area: 'footer-area.html', hub: 'footer-hub.html' };

function renderHeader(attrs) {
  const variant = HEADER_FILES[attrs.variant] ? attrs.variant : 'default';
  let tpl = fs.readFileSync(path.join(PARTIALS_DIR, HEADER_FILES[variant]), 'utf8');
  const home = attrs.home || '';
  const prefix = attrs.prefix || '';
  const active = attrs.active || '';
  const logoHref = attrs.logoHref || '/';
  const waLabel = attrs.waLabel || 'WhatsApp';

  const subLabel = attrs.subLabel ? ' • ' + attrs.subLabel : '';

  tpl = tpl.split('{{HOME}}').join(home);
  tpl = tpl.split('{{PREFIX}}').join(prefix);
  tpl = tpl.split('{{LOGO_HREF}}').join(logoHref);
  tpl = tpl.split('{{HEADER_WA_LABEL}}').join(waLabel);
  tpl = tpl.split('{{HEADER_SUBLABEL}}').join(subLabel);

  if (variant === 'area') {
    tpl = tpl.split('{{AREA_SLUG}}').join(attrs.areaSlug || '');
    tpl = tpl.split('{{AREA_LABEL}}').join(attrs.areaLabel || '');
    tpl = tpl.split('{{WA_TEXT}}').join(attrs.waText || '');
  }

  const navSet = NAV_SETS[variant];
  navSet.forEach(([item, key], idx) => {
    const isLast = idx === navSet.length - 1;
    tpl = tpl.split(`{{NAV_${key}_D}}`).join(navClass(item, active, false, isLast));
    tpl = tpl.split(`{{NAV_${key}_M}}`).join(navClass(item, active, true, isLast));
  });
  return tpl;
}

function renderFooter(attrs) {
  const variant = FOOTER_FILES[attrs.variant] ? attrs.variant : 'default';
  let tpl = fs.readFileSync(path.join(PARTIALS_DIR, FOOTER_FILES[variant]), 'utf8');
  const prefix = attrs.prefix || '';
  const disclaimerKey = attrs.disclaimer || 'default';
  tpl = tpl.split('{{PREFIX}}').join(prefix);
  tpl = tpl.replace('{{FOOTER_DISCLAIMER}}', DISCLAIMERS[disclaimerKey] || DISCLAIMERS.default);

  if (variant === 'area') {
    tpl = tpl.split('{{WA_TEXT}}').join(attrs.waText || '');
    tpl = tpl.split('{{FOOTER_TAGLINE}}').join(attrs.footerTagline || '');
  }
  return tpl;
}

function renderScripts() {
  return fs.readFileSync(path.join(PARTIALS_DIR, 'scripts.html'), 'utf8');
}

const RENDERERS = { header: renderHeader, footer: renderFooter, scripts: renderScripts };

function processFile(srcPath, destPath) {
  let html = fs.readFileSync(srcPath, 'utf8');
  const includeRe = /<!--@include\s+(header|footer|scripts)\s*([^>]*)-->/g;
  html = html.replace(includeRe, (match, type, attrStr) => {
    const attrs = parseAttrs(attrStr);
    return RENDERERS[type](attrs);
  });
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, html);
  console.log('Built', path.relative(ROOT, destPath));
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.name.endsWith('.html')) {
      const rel = path.relative(PAGES_DIR, full);
      processFile(full, path.join(SITE_DIR, rel));
      out.push(rel.split(path.sep).join('/'));
    }
  }
}

// --- Sitemap ---------------------------------------------------------------
// Priority/changefreq follow the site's existing convention: home > primary
// paid landing (/trabalhista/) and calculator > area hub pages / sobre / empresas
// > blog indexes > individual blog articles. 404 is excluded.
function urlFor(rel) {
  if (rel === 'index.html') return '';
  if (rel.endsWith('/index.html')) return rel.slice(0, -'index.html'.length);
  return rel;
}

function priorityFor(rel) {
  if (rel === 'index.html') return { priority: '1.0', changefreq: 'monthly' };
  if (rel === 'calculadora-trabalhista.html') return { priority: '0.9', changefreq: 'monthly' };
  if (rel === 'trabalhista/index.html') return { priority: '0.9', changefreq: 'monthly' };
  if (rel === 'sobre.html' || rel === 'empresas.html') return { priority: '0.8', changefreq: 'monthly' };
  if (rel === 'trabalhista/blog/index.html') return { priority: '0.8', changefreq: 'weekly' };
  if (/\/blog\/index\.html$/.test(rel) || rel === 'blog-empresas/index.html') return { priority: '0.7', changefreq: 'weekly' };
  if (/^[a-z-]+\/index\.html$/.test(rel)) return { priority: '0.8', changefreq: 'monthly' }; // area hubs
  return { priority: '0.7', changefreq: 'monthly' }; // individual blog articles
}

function lastmodFor(srcRelPath) {
  try {
    const out = execSync(`git log -1 --format=%cs -- "${srcRelPath}"`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    return out || null;
  } catch {
    return null;
  }
}

function buildSitemap(relPaths) {
  const entries = relPaths
    .filter((rel) => rel !== '404.html')
    .map((rel) => {
      const loc = `${SITE_URL}/${urlFor(rel)}`;
      const { priority, changefreq } = priorityFor(rel);
      const lastmod = rel === 'index.html' ? null : lastmodFor(path.join('src', 'pages', rel));
      return { loc, lastmod, changefreq, priority };
    });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((e) => [
      '    <url>',
      `        <loc>${e.loc}</loc>`,
      e.lastmod ? `        <lastmod>${e.lastmod}</lastmod>` : null,
      `        <changefreq>${e.changefreq}</changefreq>`,
      `        <priority>${e.priority}</priority>`,
      '    </url>',
    ].filter(Boolean).join('\n')),
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(SITE_DIR, 'sitemap.xml'), xml);
  console.log(`Built sitemap.xml (${entries.length} URLs)`);
}

const pageList = [];
walk(PAGES_DIR, pageList);
buildSitemap(pageList);
