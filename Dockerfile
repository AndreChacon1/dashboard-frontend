FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html ./
COPY src ./src
RUN npm run build
FROM debian:bookworm-slim
COPY --from=build /app/dist /var/www/html
RUN apt-get update && apt-get install -y --no-install-recommends nginx libnginx-mod-stream fail2ban iptables bash && rm -rf /var/lib/apt/lists/*
COPY security/nginx.conf /etc/nginx/nginx.conf
COPY security/jail.local /etc/fail2ban/jail.local
COPY security/*conf /tmp/lab-config/
RUN cp /tmp/lab-config/http-flood.conf /etc/fail2ban/filter.d/ && if [ -f /tmp/lab-config/ldaps-connections.conf ]; then cp /tmp/lab-config/ldaps-connections.conf /etc/fail2ban/filter.d/; fi
COPY security/entrypoint.sh /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["bash", "/entrypoint.sh"]
