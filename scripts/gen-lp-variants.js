#!/usr/bin/env node
// One-off script: generates themed landing-page variants of trabalhista/index.html
// for the 5 new paid ad groups. Same proven conversion structure (multi-CTA),
// only hero H1/paragraph + meta/schema/OG swapped per theme, and conversion
// event names suffixed so GA4 can compare performance per landing page.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'pages', 'trabalhista', 'index.html');
const base = fs.readFileSync(SRC, 'utf8');

const pages = [
  {
    slug: 'justa-causa',
    suffix: '_justa_causa',
    title: 'Demissão por Justa Causa: Saiba Seus Direitos | Dra. Acsa Carlis - OAB/SP 436184',
    description: 'Foi demitido por justa causa e acha que não teve motivo? Advogada trabalhista explica como contestar e quais direitos você pode ter. Fale agora.',
    keywords: 'justa causa trabalho, contestar justa causa, demissão por justa causa direitos, entrar com ação trabalhista, advogada trabalhista mogi das cruzes',
    ogTitle: 'Demissão por Justa Causa? Saiba Seus Direitos - Dra. Acsa Carlis',
    ogDescription: 'Advogada trabalhista explica como contestar uma justa causa e quais direitos você pode ter.',
    h1: 'Foi demitido por justa causa? Nem sempre é definitivo',
    heroP: 'A Dra. Acsa Carlis atua na área trabalhista em Mogi das Cruzes, Região do Alto Tietê e em todo o estado de São Paulo, incluindo casos de contestação de justa causa. Fale com a advogada e entenda se há motivos para reverter a sua situação.',
  },
  {
    slug: 'assedio-moral',
    suffix: '_assedio_moral',
    title: 'Sofreu Assédio Moral no Trabalho? | Dra. Acsa Carlis - OAB/SP 436184',
    description: 'Sofreu assédio moral, xingamentos ou humilhações no trabalho? Advogada trabalhista explica seus direitos e como buscar reparação. Fale agora.',
    keywords: 'assédio moral no trabalho, dano moral trabalhista, xingamento no trabalho, sofri assédio no trabalho, advogada trabalhista mogi das cruzes',
    ogTitle: 'Sofreu Assédio Moral no Trabalho? - Dra. Acsa Carlis',
    ogDescription: 'Advogada trabalhista explica seus direitos em casos de assédio moral e dano moral no trabalho.',
    h1: 'Sofreu assédio moral ou dano moral no trabalho?',
    heroP: 'A Dra. Acsa Carlis atua na área trabalhista em Mogi das Cruzes, Região do Alto Tietê e em todo o estado de São Paulo, incluindo casos de assédio moral e dano moral no ambiente de trabalho. Fale com a advogada e entenda como buscar reparação.',
  },
  {
    slug: 'fgts-horas-extras',
    suffix: '_fgts_horas_extras',
    title: 'FGTS Não Depositado ou Horas Extras Não Pagas? | Dra. Acsa Carlis',
    description: 'Empresa não depositou o FGTS ou não pagou suas horas extras? Advogada trabalhista explica como cobrar o que é seu por direito. Fale agora.',
    keywords: 'empresa não depositou fgts, horas extras não pagas, trabalho sem carteira assinada, advogada trabalhista mogi das cruzes',
    ogTitle: 'FGTS Não Depositado ou Horas Extras Não Pagas? - Dra. Acsa Carlis',
    ogDescription: 'Advogada trabalhista explica como cobrar FGTS não depositado e horas extras não pagas.',
    h1: 'FGTS não depositado ou horas extras não pagas?',
    heroP: 'A Dra. Acsa Carlis atua na área trabalhista em Mogi das Cruzes, Região do Alto Tietê e em todo o estado de São Paulo, incluindo cobrança de FGTS, horas extras e reconhecimento de vínculo empregatício. Fale com a advogada e entenda o que é seu por direito.',
  },
  {
    slug: 'aviso-previo-rescisao',
    suffix: '_aviso_previo_rescisao',
    title: 'Aviso Prévio e Rescisão: Receba Todos os Seus Direitos | Dra. Acsa Carlis',
    description: 'Foi demitido e a empresa não pagou tudo certo (FGTS, aviso prévio, férias, 13º)? Advogada trabalhista confere sua rescisão. Fale agora.',
    keywords: 'aviso prévio trabalhista, rescisão indireta, cálculo de rescisão, verbas rescisórias, pedir demissão e receber direitos, advogada trabalhista mogi das cruzes',
    ogTitle: 'Sua Rescisão Está Certa? - Dra. Acsa Carlis',
    ogDescription: 'Advogada trabalhista confere aviso prévio, verbas rescisórias e rescisão indireta.',
    h1: 'A empresa não pagou tudo o que devia na sua rescisão?',
    heroP: 'A Dra. Acsa Carlis atua na área trabalhista em Mogi das Cruzes, Região do Alto Tietê e em todo o estado de São Paulo, incluindo conferência de verbas rescisórias, aviso prévio e rescisão indireta. Fale com a advogada e confira se está tudo certo.',
  },
  {
    slug: 'acidente-trabalho',
    suffix: '_situacoes_gerais',
    title: 'Acidente de Trabalho ou Demissão: Conheça Seus Direitos | Dra. Acsa Carlis',
    description: 'Sofreu acidente de trabalho, foi demitido ou tem dúvidas trabalhistas? Advogada trabalhista em Mogi das Cruzes explica seus direitos. Fale agora.',
    keywords: 'acidente de trabalho direitos, fui demitido o que fazer, advogado trabalhista perto de mim, advogada trabalhista mogi das cruzes',
    ogTitle: 'Acidente de Trabalho ou Demissão? Saiba Seus Direitos - Dra. Acsa Carlis',
    ogDescription: 'Advogada trabalhista explica seus direitos em casos de acidente de trabalho e demissão.',
    h1: 'Acidente de trabalho, demissão ou dúvidas trabalhistas?',
    heroP: 'A Dra. Acsa Carlis atua na área trabalhista em Mogi das Cruzes, Região do Alto Tietê e em todo o estado de São Paulo. Fale com a advogada e entenda os seus direitos no seu caso específico.',
  },
];

const OLD_TITLE = 'Advogada Trabalhista em Mogi das Cruzes e Região | Dra. Acsa Carlis - OAB/SP 436184';
const OLD_DESC = 'Dra. Acsa Carlis - Advogada com atuação em Direito do Trabalho em Mogi das Cruzes e Região, e em São Paulo. Informações sobre demissão, horas extras, rescisão e assédio moral.';
const OLD_KEYWORDS = 'advogada trabalhista mogi das cruzes, advogado trabalhista são paulo, direito do trabalho mogi, rescisão indireta, horas extras, assédio moral, advogada trabalhista região alto tietê';
const OLD_CANONICAL = '__SITE_URL__/trabalhista/';
const OLD_OG_TITLE = 'Dra. Acsa Carlis - Advogada Trabalhista em Mogi das Cruzes e Região';
const OLD_OG_DESC = 'Advogada com atuação em Direito do Trabalho em Mogi das Cruzes e Região. Informações de contato disponíveis.';
const OLD_H1 = 'Teve um problema no trabalho? Entenda os seus direitos';
const OLD_HERO_P = 'A Dra. Acsa Carlis atua na área trabalhista em Mogi das Cruzes, Região do Alto Tietê e em todo o estado de São Paulo. Este espaço reúne informações sobre temas do Direito do Trabalho e os canais de contato do escritório.';

let created = 0;
for (const p of pages) {
  let html = base;
  const newCanonical = `__SITE_URL__/trabalhista/${p.slug}.html`;

  html = html.replace(`<title>${OLD_TITLE}</title>`, `<title>${p.title}</title>`);
  html = html.replace(`content="${OLD_DESC}">`, `content="${p.description}">`);
  html = html.replace(`content="${OLD_KEYWORDS}">`, `content="${p.keywords}">`);
  html = html.split(`href="${OLD_CANONICAL}"`).join(`href="${newCanonical}"`);
  html = html.replace(`content="${OLD_OG_TITLE}">`, `content="${p.ogTitle}">`);
  html = html.replace(`content="${OLD_OG_DESC}">`, `content="${p.ogDescription}">`);
  html = html.split(`content="${OLD_CANONICAL}">`).join(`content="${newCanonical}">`);
  html = html.replace(`content="Dra. Acsa Carlis - Advogada Trabalhista">`, `content="${p.ogTitle}">`);
  html = html.replace(`content="Advogada com atuação em Direito do Trabalho em Mogi das Cruzes e Região.">`, `content="${p.ogDescription}">`);

  // Schema.org url + description
  html = html.replace(`"description": "Advogada com atuação em Direito do Trabalho em Mogi das Cruzes e Região, e em São Paulo.",`, `"description": "${p.ogDescription}",`);
  html = html.replace(`"url": "${OLD_CANONICAL}",`, `"url": "${newCanonical}",`);

  // Hero H1 + paragraph
  html = html.replace(OLD_H1, p.h1);
  html = html.replace(OLD_HERO_P, p.heroP);

  // Namespace conversion tracking so GA4 can compare landing pages
  html = html.split(`trackConversion('hero_whatsapp')`).join(`trackConversion('hero_whatsapp${p.suffix}')`);
  html = html.split(`trackConversion('situacoes_whatsapp')`).join(`trackConversion('situacoes_whatsapp${p.suffix}')`);
  html = html.split(`trackConversion('servicos_whatsapp')`).join(`trackConversion('servicos_whatsapp${p.suffix}')`);
  html = html.split(`trackConversion('cta_final_whatsapp')`).join(`trackConversion('cta_final_whatsapp${p.suffix}')`);

  const destPath = path.join(ROOT, 'src', 'pages', 'trabalhista', `${p.slug}.html`);
  fs.writeFileSync(destPath, html);
  console.log('Created', path.relative(ROOT, destPath));
  created++;
}
console.log(`\n${created} landing pages generated.`);
