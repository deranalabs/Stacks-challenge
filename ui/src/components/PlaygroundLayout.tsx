import React, { useMemo, useState } from 'react';
import Header from './Header';
import { ViewOwnerCard, SetOwnerCard } from './ContractSection';
import { ClarityAssistantCard } from './AISection';
import ComponentCard from './ComponentCard';
import { useStacks } from '../context/StacksContext';

const Badge = ({
  label,
  variant = 'default',
}: {
  label: string;
  variant?: 'default' | 'outline' | 'success';
}) => {
  const styles = {
    default: 'bg-zinc-900 border-zinc-800 text-zinc-300',
    outline: 'bg-transparent border-zinc-700 text-zinc-400',
    success: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
  }[variant];

  return (
    <span
      className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-widest border ${styles}`}
    >
      {label}
    </span>
  );
};

const EventStreamCard = () => {
  const { networkName } = useStacks();
  return (
    <ComponentCard
      title="Event Stream"
      description={`Real-time blockchain events from ${networkName} network.`}
      category="Monitoring"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-zinc-100">Network Status</p>
            <p className="text-[11px] text-zinc-500">{networkName.toUpperCase()}</p>
          </div>
          <span className="px-3 py-1 text-xs rounded-full border border-emerald-500/40 text-emerald-400">
            Active
          </span>
        </div>
        <div className="text-center py-8 text-zinc-500">
          <p className="text-sm">No events yet</p>
          <p className="text-[11px] mt-1">Interact with the contract to see events</p>
        </div>
      </div>
    </ComponentCard>
  );
};

const WebhookStatusCard = () => {
  const { networkName } = useStacks();
  return (
    <ComponentCard
      title="Webhook Status"
      description={`Monitor Hiro Chainhook for ${networkName} network events.`}
      category="Monitoring"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-zinc-100">Hiro Chainhook</p>
            <p className="text-[11px] text-zinc-500">{networkName}-playground-webhook</p>
          </div>
          <span className="px-3 py-1 text-xs rounded-full border border-emerald-500/40 text-emerald-400">
            Healthy
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-black/30 border border-zinc-800 rounded-xl p-3">
            <p className="text-[10px] uppercase text-zinc-500">Latency</p>
            <p className="text-xl font-semibold text-zinc-100">42ms</p>
          </div>
          <div className="bg-black/30 border border-zinc-800 rounded-xl p-3">
            <p className="text-[10px] uppercase text-zinc-500">Delivery</p>
            <p className="text-xl font-semibold text-zinc-100">99.9%</p>
          </div>
        </div>
        <div className="text-center py-2">
          <p className="text-[11px] text-zinc-500">Webhook URL: {import.meta.env.VITE_CHAINHOOK_WEBHOOK_URL || 'Not configured'}</p>
        </div>
      </div>
    </ComponentCard>
  );
};

const Hero = () => {
  const { networkName, userData } = useStacks();
  const mode = networkName;
  const badges = useMemo(
    () => [
      { label: `${mode.toUpperCase()} MODE`, variant: 'default' },
      { label: 'Network Operational', variant: 'success' as const },
    ],
    [mode],
  );
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => (
          <Badge
            key={badge.label}
            label={badge.label}
            variant={badge.variant as 'default'}
          />
        ))}
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
          Build faster on Stacks.
        </h2>
        <p className="text-zinc-400 max-w-2xl">
          A minimalist workspace to explore Stacks.js primitives, interact with
          Clarity contracts, and monitor chain activity in real-time.
        </p>
        {userData && (
          <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Connected Wallet</p>
              <p className="text-[11px] text-zinc-500">{userData.address}</p>
              <p className="text-sm font-mono text-emerald-400">{userData.stxBalance} STX</p>
            </div>
            <Badge label={mode.toUpperCase()} variant="success" />
          </div>
        )}
      </div>
    </section>
  );
};

const PlaygroundLayout: React.FC = () => {
  const { networkName } = useStacks();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-black text-white">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="container mx-auto px-6 py-12 space-y-10">
        <Hero />
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ViewOwnerCard />
          <SetOwnerCard />
          <EventStreamCard />
        </section>
        <section className="grid gap-6 md:grid-cols-2">
          <WebhookStatusCard />
          <ClarityAssistantCard />
        </section>
      </main>
      <footer className="border-t border-zinc-900 py-6 text-xs text-zinc-500 text-center">
        © {new Date().getFullYear()} Stacks Ecosystem — {networkName.toUpperCase()} Network
      </footer>
    </div>
  );
};

export default PlaygroundLayout;
