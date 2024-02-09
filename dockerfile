FROM node:gallium-alpine

ENV NODE_ENV=production

ENV PORT=8000

WORKDIR /usr/app

COPY . .

RUN yarn

EXPOSE 8000

CMD ["yarn", "start"]