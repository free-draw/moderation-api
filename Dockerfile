FROM node:14.2.0-alpine3.11
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN "npm" "install" "--production"
COPY . .
ENV NODE_ENV=production
CMD "npm" "start"