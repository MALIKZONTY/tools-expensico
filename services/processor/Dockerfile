# Build from the repository root:
#   docker build -f services/processor/Dockerfile -t expensico-processor .
FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     libreoffice-writer-nogui libreoffice-calc-nogui libreoffice-impress-nogui \
     ghostscript \
     fonts-dejavu-core fonts-liberation2 fonts-crosextra-carlito fonts-crosextra-caladea fonts-noto-core \
     ca-certificates tini \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/processing-contract ./packages/processing-contract
COPY services/processor ./services/processor
RUN pnpm install --filter processor... --prod --frozen-lockfile

# Run as an unprivileged user; jobs live in a private temp directory.
RUN useradd --create-home --uid 10001 processor && mkdir -p /tmp/expensico-jobs && chown processor /tmp/expensico-jobs
USER processor
ENV NODE_ENV=production TMP_DIR=/tmp/expensico-jobs PORT=8080
EXPOSE 8080
WORKDIR /app/services/processor
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "src/server.ts"]
