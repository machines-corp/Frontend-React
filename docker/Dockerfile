FROM node:20-alpine

WORKDIR /app

# Yarn clásico v1
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Usa el lockfile para instalaciones determinísticas
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Luego copia el resto del código
COPY . .

EXPOSE 5173

# Dev server (Vite)
CMD ["yarn", "dev", "--host"]