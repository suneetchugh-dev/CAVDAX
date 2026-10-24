import React, { useState, useEffect } from 'react';
import {
  Github, Search, Plus, Check,
  X, RefreshCw, Lock, Globe
} from 'lucide-react';
import { playClick, playApprovalChime } from '../utils/soundFx';

/**
 * ConnectRepoModal.jsx — GitHub Repository Connection Modal
 *
 * Minimalist, production-grade repository connector:
 * - Lists authenticated user's real GitHub repositories via /api/github/repos.
 * - Allows linking public repository URLs.
 * - Zero sample/demo placeholder clutter.
 * - Zero pulsing dots or unnecessary tags.
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

  useEffect(() => {
    if (!isOpen) return;

    if (user?.login) {
      fetchUserRepos();
    } else {
      setRepos([]);
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
      hasAdrs: false
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

  const filteredRepos = repos.filter(r =>
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
                Link a repository to generate an enclosed causal verification graph.
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {user ? (
            <>
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search your repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/5 text-xs text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                />
              </div>

              {/* Repository List */}
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>Your Repositories</span>
                  {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
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
                              <span className="text-xs font-bold text-slate-950 dark:text-white truncate block">
                                {repo.full_name}
                              </span>
                              {repo.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans truncate mt-0.5">
                                  {repo.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {isConnected ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1 bg-slate-200/60 dark:bg-white/10">
                                <Check className="w-3 h-3 text-slate-800 dark:text-slate-200" />
                                <span>Linked</span>
                              </span>
                              {onDisconnectRepo && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    playClick();
                                    onDisconnectRepo(repo.id);
                                  }}
                                  className="px-2 py-1 rounded-md text-[11px] font-mono text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-300/80 dark:border-white/10 transition-colors cursor-pointer"
                                  title="Disconnect repository"
                                >
                                  Disconnect
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSelectRepo(repo)}
                              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 shadow-xs"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Connect</span>
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                      {isLoading ? 'Loading repositories...' : 'No repositories found.'}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Unauthenticated Prompt */
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-center space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                Sign in with GitHub to view and connect your private and public repositories.
              </p>
              <a
                href="/api/auth/github"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-mono font-semibold hover:opacity-90 transition-opacity"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Connect with GitHub</span>
              </a>
            </div>
          )}

          {/* Manual URL Link */}
          <form onSubmit={handleConnectCustom} className="pt-3 border-t border-slate-200 dark:border-white/10">
            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">
              Link Public Repository URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. github.com/owner/repository"
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
      </div>
    </div>
  );
}
