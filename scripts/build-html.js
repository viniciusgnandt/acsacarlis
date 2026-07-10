#!/usr/bin/env node
// Resolves <!--@include header ...--> / <!--@include footer ...--> markers in src/pages/**/*.html
// against partials/header.html and partials/footer.html, writing the assembled
// static HTML into site/**/*.html (mirroring the relative path).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const PARTIALS_DIR = path.join(ROOT, 'partials');
const SITE_DIR = path.join(ROOT, 'site');

const NAV_SETS = {
  default: [
    ['situacoes', 'SITUACOES'], ['como-funciona', 'COMO_FUNCIONA'], ['duvidas', 'DUVIDAS'],
    ['sobre', 'SOBRE'], ['blog', 'BLOG'], ['calculadora', 'CALCULADORA'],
  ],
  empresas: [
    ['servicos', 'SERVICOS'], ['como-funciona', 'COMO_FUNCIONA'], ['duvidas', 'DUVIDAS'],
    ['sobre', 'SOBRE'], ['blog', 'BLOG'], ['calculadora', 'CALCULADORA'],
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

function navClass(item, active, isMobile) {
  const isActive = item === active;
  const isLast = item === 'calculadora';
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

function renderHeader(attrs) {
  const variant = attrs.variant === 'empresas' ? 'empresas' : 'default';
  const file = variant === 'empresas' ? 'header-empresas.html' : 'header.html';
  let tpl = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf8');
  const home = attrs.home || '';
  const prefix = attrs.prefix || '';
  const active = attrs.active || '';
  const logoHref = attrs.logoHref || '/';
  const waLabel = attrs.waLabel || 'WhatsApp';

  tpl = tpl.split('{{HOME}}').join(home);
  tpl = tpl.split('{{PREFIX}}').join(prefix);
  tpl = tpl.split('{{LOGO_HREF}}').join(logoHref);
  tpl = tpl.split('{{HEADER_WA_LABEL}}').join(waLabel);

  for (const [item, key] of NAV_SETS[variant]) {
    tpl = tpl.split(`{{NAV_${key}_D}}`).join(navClass(item, active, false));
    tpl = tpl.split(`{{NAV_${key}_M}}`).join(navClass(item, active, true));
  }
  return tpl;
}

function renderFooter(attrs) {
  const variant = attrs.variant === 'empresas' ? 'empresas' : 'default';
  const file = variant === 'empresas' ? 'footer-empresas.html' : 'footer.html';
  let tpl = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf8');
  const prefix = attrs.prefix || '';
  const disclaimerKey = attrs.disclaimer || 'default';
  tpl = tpl.split('{{PREFIX}}').join(prefix);
  tpl = tpl.replace('{{FOOTER_DISCLAIMER}}', DISCLAIMERS[disclaimerKey] || DISCLAIMERS.default);
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

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith('.html')) {
      const rel = path.relative(PAGES_DIR, full);
      processFile(full, path.join(SITE_DIR, rel));
    }
  }
}

walk(PAGES_DIR);
