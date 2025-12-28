
import React, { useState, useRef, useEffect } from 'react';
import { Search, Github, Terminal, Wallet, LogOut, ChevronDown, Copy, ExternalLink, Check, User } from 'lucide-react';
import { useStacks } from '../context/StacksContext';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const { userData, connectWallet, disconnectWallet, isConnecting, networkName, switchNetwork, networkMismatch } = useStacks();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyAddress = () => {
    if (userData) {
      navigator.clipboard.writeText(userData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Terminal className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-lg font-bold tracking-tighter text-zinc-100 hidden lg:block">
            Stacks<span className="text-zinc-500">Playground</span>
          </h1>
        </div>

        <div className="flex-1 max-w-md relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
          <input
            type="text"
            placeholder="Search primitives..."
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0" ref={menuRef}>
          {/* Network Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => switchNetwork('testnet')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                networkName === 'testnet'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Testnet
            </button>
            <button
              onClick={() => switchNetwork('mainnet')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                networkName === 'mainnet'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Mainnet
            </button>
          </div>

          {/* Network Mismatch Warning */}
          {networkMismatch && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <span className="text-[11px] text-amber-400">
                Your wallet is on {networkMismatch.current}, but you selected {networkMismatch.selected}. 
                <button 
                  onClick={disconnectWallet}
                  className="ml-2 underline hover:text-amber-300"
                >
                  Switch wallet
                </button>
              </span>
            </div>
          )}

          <a
            href="https://github.com/stacks-network"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:block"
          >
            <Github className="w-5 h-5" />
          </a>

          {!userData ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-zinc-100 hover:bg-white text-black text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-white/5 disabled:opacity-60"
            >
              {isConnecting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                <>
                  <Wallet className="w-3.5 h-3.5" />
                  Connect Wallet
                </>
              )}
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 pl-2 pr-2 py-1.5 rounded-xl transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:bg-zinc-700 transition-colors">
                  <User className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="flex flex-col items-start pr-2">
                  <span className="text-xs font-mono text-zinc-200 leading-none">
                    {userData.address.slice(0, 5)}...{userData.address.slice(-4)}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${isMenuOpen ? 'rotate-180 text-zinc-200' : ''}`} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-5 border-b border-zinc-800/50 bg-white/[0.02]">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">STX Balance</span>
                        <span className="text-2xl font-bold text-zinc-100 tracking-tight">{userData.stxBalance} STX</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Principal ID</span>
                      <div className="flex items-center gap-2 bg-black/40 border border-zinc-800/80 rounded-xl px-3 py-2">
                        <span className="text-[11px] font-mono text-zinc-400 truncate flex-1">{userData.address}</span>
                        <button onClick={copyAddress} className="text-zinc-500 hover:text-zinc-100 transition-colors p-1 hover:bg-zinc-800 rounded-md">
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <a 
                      href={`https://explorer.hiro.so/address/${userData.address}?chain=${networkName}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 px-4 py-3 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-all group"
                    >
                      <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      View on Stacks Explorer
                    </a>
                    <button 
                      onClick={disconnectWallet}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
                    >
                      <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
