FROM nginx:1.27-alpine

LABEL maintainer="Dra. Acsa Carlis - Advocacia Trabalhista"
LABEL description="Landing page institucional - acsacarlis.adv.br"

# Remove configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia configuração customizada
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copia arquivos estáticos
COPY site/ /usr/share/nginx/html/

# Permissões
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Healthcheck simples
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
