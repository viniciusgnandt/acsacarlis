#!/bin/sh
# ============================================
# Entrypoint - Substitui placeholders no HTML
# com valores das variáveis de ambiente
# ============================================
set -e

HTML_DIR="/usr/share/nginx/html"

# Defaults seguros caso variáveis não estejam definidas
GADS_ENABLED="${GADS_ENABLED:-false}"
GADS_ID="${GADS_ID:-}"
GADS_LABEL="${GADS_LABEL:-}"
GTM_ID="${GTM_ID:-}"
SITE_URL="${SITE_URL:-https://www.acsacarlis.adv.br}"

# Monta bloco do Google Ads se habilitado e com ID válido
if [ "$GADS_ENABLED" = "true" ] && [ -n "$GADS_ID" ] && [ "$GADS_ID" != "AW-XXXXXXXXXX" ]; then
    GADS_SNIPPET="<script async src=\"https://www.googletagmanager.com/gtag/js?id=${GADS_ID}\"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GADS_ID}');window.__GADS_SEND_TO__='${GADS_ID}/${GADS_LABEL}';</script>"
    echo "[entrypoint] Google Ads habilitado: $GADS_ID"
else
    GADS_SNIPPET="<!-- Google Ads desabilitado (defina GADS_ENABLED=true e GADS_ID no .env) -->"
    echo "[entrypoint] Google Ads desabilitado"
fi

# Monta bloco do GTM se ID fornecido
if [ -n "$GTM_ID" ] && [ "$GTM_ID" != "GTM-XXXXXXX" ]; then
    GTM_SNIPPET="<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');</script>"
    echo "[entrypoint] GTM habilitado: $GTM_ID"
else
    GTM_SNIPPET="<!-- GTM desabilitado -->"
fi

# Substitui placeholders usando | como delimitador (URLs têm /)
# Escapa caracteres especiais com awk antes de passar ao sed
escape_sed() {
    printf '%s' "$1" | sed -e 's/[\/&|]/\\&/g'
}

GADS_SNIPPET_ESC=$(escape_sed "$GADS_SNIPPET")
GTM_SNIPPET_ESC=$(escape_sed "$GTM_SNIPPET")
SITE_URL_ESC=$(escape_sed "$SITE_URL")

GADS_ID_ESC=$(escape_sed "$GADS_ID")
GADS_LABEL_ESC=$(escape_sed "$GADS_LABEL")

# Processa todas as páginas HTML do site (index + blog), não só a home
find "$HTML_DIR" -name "*.html" -type f | while read -r HTML_FILE; do
    # Cria backup imutável do HTML original na primeira execução
    if [ ! -f "$HTML_FILE.original" ]; then
        cp "$HTML_FILE" "$HTML_FILE.original"
    fi

    # Sempre parte do original para permitir trocar variáveis sem rebuild
    cp "$HTML_FILE.original" "$HTML_FILE"

    sed -i \
        -e "s|__GADS_SNIPPET__|${GADS_SNIPPET_ESC}|g" \
        -e "s|__GTM_SNIPPET__|${GTM_SNIPPET_ESC}|g" \
        -e "s|__SITE_URL__|${SITE_URL_ESC}|g" \
        -e "s|__GADS_ID__|${GADS_ID_ESC}|g" \
        -e "s|__GADS_LABEL__|${GADS_LABEL_ESC}|g" \
        "$HTML_FILE"
done

echo "[entrypoint] Configuração aplicada. Iniciando nginx..."

# Repassa o controle ao processo principal
exec "$@"
