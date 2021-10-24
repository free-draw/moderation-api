FROM node:16
RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY . .
CMD [ "pnpm", "run", "start" ]