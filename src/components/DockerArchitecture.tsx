import React from 'react';

interface DockerArchitectureProps {
  handleCopy: (text: string, label: string) => void;
  copiedText: string | null;
}

export default function DockerArchitecture({ handleCopy, copiedText }: DockerArchitectureProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">DELIVERABLE 07 // DEVOPS ORCHESTRATION</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1 font-sans">Static Multistage Dockerfiles & Compose Blueprint</h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          High performance container structures designed to minimize attack vectors, leveraging distroless static scratch images.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider">PRODUCTION DOCKERFILE</span>
            <button 
              onClick={() => handleCopy(`# Multistage production builds\nFROM python:3.11-slim AS builder...`, 'Dockerfile')}
              className="px-2 py-0.5 bg-zinc-900 w-22 border border-zinc-800 text-zinc-400 text-[10px] rounded-sm hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {copiedText === 'Dockerfile' ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-sm text-[10px] font-mono leading-relaxed text-zinc-400 overflow-x-auto max-h-[380px]">
{`# STEP 1: Dependencies Assembly
FROM python:3.11-slim AS builder

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc g++ make

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# STEP 2: Minimal Distroless Execution Image
FROM gcr.io/distroless/python3-debian11

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY ./app /app

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 3000
USER 10001:10001
CMD ["/app/main.py"]`}
          </pre>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider">DEVELOPMENT COMPOSE (YML)</span>
            <button 
              onClick={() => handleCopy(`version: '3.8'\nservices:\n  backend:\n    build:...`, 'DockerCompose')}
              className="px-2 py-0.5 bg-zinc-900 w-22 border border-zinc-800 text-zinc-400 text-[10px] rounded-sm hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {copiedText === 'DockerCompose' ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-sm text-[10px] font-mono leading-relaxed text-zinc-400 overflow-x-auto max-h-[380px]">
{`version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://cache-redis:6379/0
      - DB_URL=postgresql://tenant_admin:secure@infra-db:5432/cyberguard
    depends_on:
      - cache-redis
      - infra-db

  cache-redis:
    image: redis:7.0-alpine
    command: redis-server --requirepass securepassword
    volumes:
      - redis_data:/data

  infra-db:
    image: timescale/timescaledb:latest-pg15
    environment:
      - POSTGRES_PASSWORD=secure
      - POSTGRES_DB=cyberguard
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  redis_data:
  db_data:`}
          </pre>
        </div>
      </div>
    </div>
  );
}
