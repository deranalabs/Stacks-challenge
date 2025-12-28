
import React, { useMemo, useState } from 'react';
import { Search, UserPlus, Info } from 'lucide-react';
import ComponentCard from './ComponentCard';
import { useStacks } from '../context/StacksContext';
import {
  PostConditionMode,
  cvToJSON,
  standardPrincipalCV,
  fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import type { FinishedTxData } from '@stacks/connect';

const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const envName = import.meta.env.VITE_CONTRACT_NAME;
const defaultIdentifier =
  import.meta.env.VITE_CONTRACT_IDENTIFIER ||
  (envAddress && envName
    ? `${envAddress}.${envName}`
    : 'ST1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG19Q0YD2Q.hello-world');

const parseContractIdentifier = (identifier: string) => {
  const [contractAddress, contractName] = identifier.split('.');
  if (!contractAddress || !contractName) {
    return null;
  }
  return { contractAddress, contractName };
};

export const ViewOwnerCard: React.FC = () => {
  const { network, userData } = useStacks();
  const [contractId, setContractId] = useState(defaultIdentifier);
  const [result, setResult] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callViewOwner = async () => {
    const parsed = parseContractIdentifier(contractId);
    if (!parsed) {
      setError('Invalid contract identifier');
      return;
    }
    setIsCalling(true);
    setError(null);
    try {
      const response = await fetchCallReadOnlyFunction({
        ...parsed,
        functionName: 'get-owner',
        functionArgs: [],
        network,
        senderAddress: userData?.address ?? parsed.contractAddress,
      });
      const ownerValue = (cvToJSON(response as any).value ?? '') as unknown;
      const ownerString =
        typeof ownerValue === 'string'
          ? ownerValue
          : typeof ownerValue === 'object'
            ? JSON.stringify(ownerValue)
            : String(ownerValue);
      setResult(ownerString);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch owner');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <ComponentCard
      title="View Owner"
      description="Call a read-only Clarity function to fetch the current owner of a contract."
      category="Contracts"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">Contract Identifier</label>
          <div className="relative group">
            <input
              type="text"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[13px] font-mono text-zinc-300 focus:outline-none focus:border-zinc-700 transition-all"
            />
          </div>
        </div>

        <button
          onClick={callViewOwner}
          disabled={isCalling}
          className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isCalling ? (
            <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              Call get-owner
            </>
          )}
        </button>

        {error ? (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[11px] text-red-400">
            {error}
          </div>
        ) : (
          <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-600 uppercase">Owner</span>
            <span className="text-xs font-mono text-zinc-100">
              {result ? `${result.slice(0, 8)}…${result.slice(-4)}` : 'unknown'}
            </span>
          </div>
        )}
      </div>
    </ComponentCard>
  );
};

export const SetOwnerCard: React.FC = () => {
  const { userData, network } = useStacks();
  const [newOwner, setNewOwner] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const contract = useMemo(() => parseContractIdentifier(defaultIdentifier), []);

  const handleExecute = async () => {
    if (!userData) return;
    if (!contract) {
      setError('Contract identifier missing. Check VITE_CONTRACT_* envs.');
      return;
    }
    if (!newOwner.startsWith('S')) {
      setError('Enter a valid Stacks principal (SP/SN).');
      return;
    }
    setStatus('loading');
    setError(null);
    
    try {
      await openContractCall({
        ...contract,
        functionName: 'set-owner',
        functionArgs: [standardPrincipalCV(newOwner)],
        network,
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (payload: FinishedTxData) => {
          setStatus('success');
          setTxId(payload.txId);
          setTimeout(() => setStatus('idle'), 4000);
        },
        onCancel: () => setStatus('idle'),
      });
    } catch (e) {
      console.error(e);
      setError('Transaction failed. Check console for details.');
      setStatus('error');
    }
  };

  return (
    <ComponentCard
      title="Set Owner"
      description="Update contract state by executing a public function via Leather or Xverse."
      category="Contracts"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">New Principal</label>
          <input
            type="text"
            placeholder="SP..."
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[13px] font-mono text-zinc-300 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <div className="text-[11px] text-zinc-500 font-mono">
          Target: {contract ? `${contract.contractAddress}.${contract.contractName}` : '—'}
        </div>

        {!userData ? (
          <div className="flex items-center gap-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px] text-amber-500/80 leading-snug">
            <Info className="w-4 h-4 shrink-0" />
            Connect wallet to execute transactions on-chain.
          </div>
        ) : (
          <button
            onClick={handleExecute}
            disabled={status === 'loading'}
            className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              status === 'success' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-zinc-100 hover:bg-white text-black'
            }`}
          >
            {status === 'loading' ? (
               <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            ) : status === 'success' ? (
              'Transaction Submitted'
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                Execute set-owner
              </>
            )}
          </button>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[11px] text-red-400">
            {error}
          </div>
        )}

        {txId && (
          <a
            href={`https://explorer.hiro.so/txid/${txId}?chain=${import.meta.env.VITE_STACKS_NETWORK || 'testnet'}`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-emerald-400 underline"
          >
            View transaction →
          </a>
        )}
      </div>
    </ComponentCard>
  );
};
