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

1. **Foto da advogada**: salve como `site/assets/img/acsa-carlis.jpg`.
2. **Logo**: já está em `site/assets/img/logo.png` (e `favicon.png`).
3. **Crie o `.env`**: copie o template e preencha:
   ```bash
   cp .env.example .env
   ```
   Edite `SITE_URL`. Na fase 2 (Google Ads), preencha `GADS_ID`, `GADS_LABEL` e mude `GADS_ENABLED=true`.
4. **Número de WhatsApp**: já configurado para `5511945071408`. Caso mude, edite em `site/index.html`.
5. **E-mail**: substitua `contato@acsacarlis.adv.br` no rodapé.

---

## Variáveis de ambiente (`.env`)

| Variável         | Descrição                                                | Quando preencher        |
|------------------|----------------------------------------------------------|-------------------------|
| `GADS_ID`        | ID da conta Google Ads (ex: `AW-1234567890`)             | Fase 2 — campanhas      |
| `GADS_LABEL`     | Label da conversão de WhatsApp                            | Fase 2 — campanhas      |
| `GADS_ENABLED`   | `true` para injetar o snippet, `false` para desativar     | Fase 2                  |
| `GTM_ID`         | (Opcional) ID do Google Tag Manager                       | Se usar GTM             |
| `SITE_URL`       | URL canônica usada em meta tags e schema.org              | Antes do primeiro deploy|
| `CONTAINER_NAME` | Nome do container                                         | Opcional                |
| `IMAGE_TAG`      | Tag da imagem Docker                                      | Opcional                |
| `HOST_PORT`      | Porta no host se expor sem reverse proxy                  | Opcional                |

O entrypoint do container (`docker-entrypoint.sh`) injeta os snippets no HTML em runtime, então **trocar variáveis no `.env` exige apenas reiniciar** (sem rebuild):

```bash
docker compose restart
```

### Como obter `GADS_ID` e `GADS_LABEL`

1. Google Ads → **Ferramentas e configurações** → **Conversões** → **+ Nova ação de conversão**
2. Escolha **Site**, defina como categoria "Lead" (clique no WhatsApp).
3. Após criar, clique em **Configurar tag** → "Tag do Google".
4. O `AW-XXXXXXXXXX` é o ID da conta; o segundo código é o `GADS_LABEL`.

---

## Rodando local com Docker

```bash
cp .env.example .env   # ajuste os valores antes
docker compose up -d --build
```

Sem `ports` exposto por padrão (uso atrás de reverse proxy / Traefik). Para acesso direto, descomente o bloco `ports` em `docker-compose.yml` (usa `HOST_PORT` do `.env`, default `8080`).

Para parar:

```bash
docker compose down
```

**Trocou o `.env`?** Não precisa rebuild, só reinicie:
```bash
docker compose restart
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
