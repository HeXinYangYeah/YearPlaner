FROM node:20-alpine

WORKDIR /app
COPY zhuange-cloudrun/package.json ./
COPY zhuange-cloudrun/server.js ./

ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80

CMD ["node", "server.js"]
