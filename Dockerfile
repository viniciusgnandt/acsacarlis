FROM node:20-alpine AS build

WORKDIR /build

COPY package.json package-lock.json* ./
RUN npm install --no-fund --no-audit

COPY tailwind.config.js ./
COPY src/ ./src/
COPY site/ ./site/
RUN npm run build:css

FROM nginx:1.27-alpine

LABEL maintainer="Dra. Acsa Carlis - Advocacia Trabalhista"
LABEL description="Landing page institucional - acsacarlis.adv.br"

# Remove configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia configuração customizada
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copia arquivos estáticos (com tailwind.css já compilado)
COPY --from=build /build/site/ /usr/share/nginx/html/

# Copia entrypoint que injeta variáveis de ambiente no HTML
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Permissões (entrypoint roda como root e precisa escrever no index.html)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod 644 /usr/share/nginx/html/index.html

EXPOSE 80

# Healthcheck simples
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
