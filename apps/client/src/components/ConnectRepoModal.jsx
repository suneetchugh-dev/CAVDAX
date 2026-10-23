import React, { useState, useEffect } from 'react';
import {
  Github, GitBranch, Search, Plus, Check, AlertCircle,
  ExternalLink, X, RefreshCw, Lock, Globe, Sparkles
} from 'lucide-react';
import { playClick, playApprovalChime } from '../utils/soundFx';

/**
 * ConnectRepoModal.jsx — GitHub Repository Connection Modal
 *
 * Implements Section 5.3 of FUTURE_ROADMAP.md:
 * - Lists user's accessible GitHub repositories via /api/github/repos.
 * - Supports public & private repo linking.
 * - Provides sample enterprise repos for sandbox evaluation without OAuth.
 * - Saves connected repos to state & localStorage (cavdax_connected_repos).
 */
export default function ConnectRepoModal({
  isOpen,
  onClose,
  user,
  onConnectRepo,
  connectedRepoIds = []
}) {
  const [repos, setRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customRepoUrl, setCustomRepoUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Sample production repos for quick evaluation
  const SAMPLE_REPOS = [
    {
      id: 'sample-checkout-service',
      name: 'checkout-service',
      full_name: 'acmecorp/checkout-service',
      owner: 'acmecorp',
      private: true,
      default_branch: 'main',
      description: 'Distributed payment orchestration and PCI-DSS compliance pipeline',
      isSample: true
    },
    {
      id: 'sample-identity-mesh',
      name: 'identity-mesh',
      full_name: 'acmecorp/identity-mesh',
      owner: 'acmecorp',
      private: true,
      default_branch: 'main',
      description: 'Zero-trust OAuth2 / OIDC token issuance & session revocation service',
      isSample: true
    },
    {
      id: 'sample-causal-gateway',
      name: 'causal-gateway',
      full_name: 'acmecorp/causal-gateway',
      owner: 'acmecorp',
      private: false,
      default_branch: 'main',
      description: 'GraphBLAS low-latency proxy with deterministic AST verification',
      isSample: true
    }
  ];

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);

    if (user?.login) {
      fetchUserRepos();
    }
  }, [isOpen, user]);

  const fetchUserRepos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/github/repos');
      if (res.ok) {
        const data = await res.json();
        if (data.repos && Array.isArray(data.repos)) {
          setRepos(data.repos);
        } else {
          setRepos([]);
        }
      } else {
        // If 401 or token missing, fall back to empty user repos
        setRepos([]);
      }
    } catch {
      setRepos([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectRepo = (repo) => {
    playApprovalChime();
    onConnectRepo({
      id: String(repo.id),
      name: repo.name,
      full_name: repo.full_name || `${repo.owner || 'user'}/${repo.name}`,
      owner: repo.owner || (user?.login || 'user'),
      private: Boolean(repo.private),
      default_branch: repo.default_branch || 'main',
      description: repo.description || 'Connected repository workspace',
      connectedAt: Date.now(),
      hasAdrs: false // Starts in zero-ADR state for scaffolding
    });
    onClose();
  };

  const handleConnectCustom = (e) => {
    e.preventDefault();
    if (!customRepoUrl.trim()) return;

    playApprovalChime();
    let name = customRepoUrl.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    if (!name.includes('/')) name = `workspace/${name}`;
    const parts = name.split('/');

    onConnectRepo({
      id: `custom-${Date.now()}`,
      name: parts[1] || parts[0],
      full_name: name,
      owner: parts[0] || 'custom',
      private: false,
      default_branch: 'main',
      description: 'Custom linked git workspace',
      connectedAt: Date.now(),
      hasAdrs: false
    });
    setCustomRepoUrl('');
    onClose();
  };

  const filteredRepos = (repos.length > 0 ? repos : SAMPLE_REPOS).filter(r =>
    r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-mono select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shrink-0">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                Connect GitHub Repository
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                Select a repository to instantiate a dedicated FalkorDB causal tenant graph.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Status & Notice */}
        <div className="px-4 sm:px-5 pt-3 pb-2 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs font-sans">
          {user ? (
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Signed in as <strong className="font-mono text-slate-950 dark:text-white">@{user.login}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Unauthenticated Session · Showing Evaluator Repos</span>
            </div>
          )}

          {!user && (
            <a
              href="/api/auth/github"
              className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 flex items-center gap-1.5 transition-opacity"
            >
              <Github className="w-3 h-3" />
              <span>Link GitHub</span>
            </a>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search repositories by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/5 text-xs text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
            />
          </div>

          {/* Repository List */}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>{user ? 'Accessible GitHub Repositories' : 'Quick Evaluation Workspaces'}</span>
              {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredRepos.length > 0 ? (
                filteredRepos.map((repo) => {
                  const isConnected = connectedRepoIds.includes(String(repo.id));
                  return (
                    <div
                      key={repo.id}
                      className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex items-start gap-2.5">
                        <div className="mt-0.5 w-6 h-6 rounded-md bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                          {repo.private ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-950 dark:text-white truncate">
                              {repo.full_name}
                            </span>
                            {repo.isSample && (
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/30">
                                Sandbox
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans truncate mt-0.5">
                            {repo.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectRepo(repo)}
                        disabled={isConnected}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          isConnected
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 shadow-xs'
                        }`}
                      >
                        {isConnected ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Linked</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Connect</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                  No repositories found matching "{searchQuery}".
                </div>
              )}
            </div>
          </div>

          {/* Manual URL Link */}
          <form onSubmit={handleConnectCustom} className="pt-2 border-t border-slate-200 dark:border-white/10">
            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">
              Or Link Any Public Repository URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. github.com/facebook/react or org/repo"
                value={customRepoUrl}
                onChange={(e) => setCustomRepoUrl(e.target.value)}
                className="flex-1 h-8 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/5 text-xs text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
              />
              <button
                type="submit"
                disabled={!customRepoUrl.trim()}
                className="px-3 h-8 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-mono font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                <span>Add</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-sans">
          <span>Tenant key: <code className="font-mono text-slate-700 dark:text-slate-300">cavdax_tenant_&lt;repo&gt;</code></span>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="hover:underline text-slate-700 dark:text-slate-300 font-mono"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
