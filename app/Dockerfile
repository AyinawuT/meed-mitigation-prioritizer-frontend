FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY . .

RUN npm ci

# Vite's config requires these values during the frontend build.
ENV NODE_ENV=production
ENV PORT=8000
ENV BASE_PATH=/

# Build the frontend package, then the API package inside this npm workspace.
RUN npm run build --workspace=@workspace/hiap
RUN npm run build --workspace=@workspace/api-server

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

COPY --from=build /app /app

# Runtime defaults for the container; Kubernetes can override them.
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["npm", "run", "start", "--workspace=@workspace/api-server"]
