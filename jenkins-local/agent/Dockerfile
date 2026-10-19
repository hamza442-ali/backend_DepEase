FROM node:22-bookworm-slim AS node
FROM jenkins/inbound-agent:jdk21
USER root
RUN apt-get update && apt-get install -y --no-install-recommends git python3 python3-venv ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
RUN mkdir -p /home/jenkins/.npm /home/jenkins/.cache/pip && chown -R jenkins:jenkins /home/jenkins/.npm /home/jenkins/.cache
USER jenkins
