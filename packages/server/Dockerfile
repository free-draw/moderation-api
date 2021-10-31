FROM node:16-alpine3.14

# Set working directory to /app
WORKDIR /app

# Install pnpm
RUN npm install --global pnpm

# Copy package-related files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --prod

# Copy source files
COPY . .

# Ensure the app knows we're running in production
ENV NODE_ENV=production

# Define any additional environment variables
ENV HOST=0.0.0.0 PORT=80
EXPOSE 80/tcp

# Run!
CMD npm run start