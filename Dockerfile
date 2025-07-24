FROM node:20 AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@10
RUN pnpm install

COPY . .

RUN pnpm run build

FROM node:20

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

RUN npm install -g pnpm@10 && pnpm install --prod

EXPOSE 3000

CMD ["pnpm", "run", "start"]
