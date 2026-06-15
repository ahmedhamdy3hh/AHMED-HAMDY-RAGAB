import React from 'react';
import { Server, GitBranch } from 'lucide-react';

export default function DeploymentArchitecture() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">DELIVERABLE 06 // CLOUD ARCHITECTURE</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1 font-sans">Multi-Environment Deployment & CI/CD Pipelines</h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Declarative Kubernetes environment models, staging infrastructure, and secure code-deployment automation pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-mono text-xs font-bold text-zinc-200 flex items-center space-x-2">
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            <span>Multi-Zone Isolation Tiers</span>
          </h3>
          <p className="text-xs text-zinc-450 leading-relaxed font-sans">
            Deployments span multiple private availability zones (AZs) backed by network load balancers. 
            No internal databases or API services map to physical public subnets. High traffic endpoints pass exclusively through WAF filtering bounds.
          </p>
          <div className="p-3.5 bg-zinc-950 border border-zinc-805 rounded-sm font-mono text-xs space-y-2 text-zinc-500">
            <div>
              <strong className="text-zinc-300">API Gateway Nodes:</strong> Auto-scales dynamically between 3 to 15 host containers.
            </div>
            <div>
              <strong className="text-zinc-300">Workers Core Node Array:</strong> Provisioned on separate VM pools for secure background computations without resource contention.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-mono text-xs font-bold text-zinc-200 flex items-center space-x-2">
            <GitBranch className="h-3.5 w-3.5 text-emerald-400" />
            <span>Declarative CI/CD Deployment Target</span>
          </h3>
          <p className="text-xs text-zinc-450 leading-relaxed font-sans">
            GitHub Actions pipelines build multi-architecture container structures on every tag release, running vulnerability tests via Aquasec Trivy.
          </p>
          <pre className="p-3 bg-zinc-950 border border-zinc-805 rounded-sm text-[10px] font-mono leading-relaxed text-zinc-400 overflow-x-auto">
{`# GitHub Actions CI/CD (Simplified Block)
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code repo
        uses: actions/checkout@v4
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
      - name: Build and Push Multiarch Image
        run: docker buildx build --platform linux/amd64...`}
          </pre>
        </div>
      </div>
    </div>
  );
}
