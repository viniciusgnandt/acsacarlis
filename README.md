# Site - Dra. Acsa Carlis | Advocacia Trabalhista

Landing page institucional otimizada para captação via WhatsApp, SEO local e Google Ads.

**OAB/SP 436.184** • Mogi das Cruzes e Região do Alto Tietê.

---

## Estrutura

```
.
├── site/                    # Arquivos do site (HTML/CSS/JS/imagens)
│   ├── index.html
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/
│       ├── style.css
│       ├── script.js
│       └── img/
│           └── acsa-carlis.jpg   ← coloque aqui a foto da advogada
├── nginx/
│   └── default.conf         # Configuração do Nginx
├── Dockerfile
├── docker-compose.yml
└── .dockerignore
```

---

## Antes de subir, configure:

1. **Foto da advogada**: salve a imagem como `site/assets/img/acsa-carlis.jpg`.
2. **Número de WhatsApp**: substitua `5511945071408` em `site/index.html` pelo número real (formato internacional, sem espaços ou símbolos).
3. **Domínio**: ajuste todas as URLs `acsacarlis.adv.br` para o domínio definitivo.
4. **E-mail**: substitua `contato@acsacarlis.adv.br` no rodapé.
5. **Google Ads (fase 2)**: descomente o bloco do `gtag` no final do `index.html` e ajuste o `AW-XXXXXXXXXX` em `assets/script.js`.

---

## Rodando local com Docker

```bash
docker compose up -d --build
```

Sem `ports` exposto por padrão (uso atrás de reverse proxy / Traefik). Para acesso direto, descomente o bloco `ports` em `docker-compose.yml`.

Para parar:

```bash
docker compose down
```

---

## Deploy em VPS / Portainer

1. Suba a pasta inteira (ou faça `git clone`) na VPS.
2. Em Portainer: **Stacks → Add stack → Upload `docker-compose.yml`** (e build do Dockerfile via repositório).
3. Conecte ao seu reverse proxy (Traefik/Nginx Proxy Manager) via a network `web` ou exponha a porta 80.

---

## Checklist SEO/Performance

- [x] Meta tags (title, description, OG, Twitter)
- [x] Schema.org `Attorney` + `FAQPage`
- [x] Estrutura semântica H1/H2/H3
- [x] `robots.txt` + `sitemap.xml`
- [x] Tags `geo.region` e `geo.placename`
- [x] Mobile-first + viewport
- [x] Imagens com `alt`, `loading="lazy"` e dimensões
- [x] Compressão gzip + cache de assets
- [x] HTTPS (configure no reverse proxy)
- [x] Headers de segurança (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- [x] CTAs com tracking preparado para Google Ads

---

## Avisos OAB

O site segue as regras de publicidade da OAB (Provimento 205/2021):
- Tom informativo, sem promessa de resultados.
- Sem captação de causas ou mercantilização.
- Aviso legal e dados profissionais visíveis no rodapé.
