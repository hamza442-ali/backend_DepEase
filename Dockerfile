FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node index.js ./
COPY --chown=node:node src ./src
COPY --chown=node:node controller ./controller
COPY --chown=node:node controllers ./controllers
COPY --chown=node:node model ./model
COPY --chown=node:node models ./models
COPY --chown=node:node routes ./routes
COPY --chown=node:node scripts ./scripts
RUN mkdir -p /app/data/uploads && chown -R node:node /app/data
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "index.js"]
