import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AppConfig,
  UserSession,
  showConnect as stacksShowConnect,
  connect as stacksConnect,
} from '@stacks/connect';
import { networkFromName, type StacksNetwork } from '@stacks/network';

type SupportedNetwork = 'testnet' | 'mainnet';

type WalletUser = {
  address: string;
  stxBalance: string;
};

type StacksContextValue = {
  userData: WalletUser | null;
  isConnecting: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  network: StacksNetwork;
  networkName: SupportedNetwork;
  switchNetwork: (target: SupportedNetwork) => void;
  networkMismatch: { current: SupportedNetwork; selected: SupportedNetwork } | null;
};

const defaultNetwork =
  (import.meta.env.VITE_STACKS_NETWORK as SupportedNetwork) || 'testnet';

const resolveApiBase = (network: SupportedNetwork) => {
  if (import.meta.env.VITE_STACKS_API_URL) {
    return import.meta.env.VITE_STACKS_API_URL;
  }
  return network === 'mainnet'
    ? 'https://api.hiro.so'
    : 'https://api.testnet.hiro.so';
};

const buildNetwork = (name: SupportedNetwork): StacksNetwork =>
  networkFromName(name) as StacksNetwork;

const detectNetworkFromAddress = (address: string): SupportedNetwork => {
  if (address.startsWith('SP') || address.startsWith('SM')) {
    return 'mainnet';
  } else if (address.startsWith('ST') || address.startsWith('SN')) {
    return 'testnet';
  }
  // Fallback to default
  return defaultNetwork;
};

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const StacksContext = createContext<StacksContextValue | undefined>(undefined);

export const StacksProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<WalletUser | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkName, setNetworkName] = useState<SupportedNetwork>(
    defaultNetwork === 'mainnet' ? 'mainnet' : 'testnet',
  );
  const [networkMismatch, setNetworkMismatch] = useState<{ current: SupportedNetwork; selected: SupportedNetwork } | null>(null);

  const network = useMemo(() => buildNetwork(networkName), [networkName]);

  const fetchBalance = useCallback(async (address: string) => {
    try {
      const apiBase = resolveApiBase(networkName);
      const url = `${apiBase}/extended/v1/address/${address}/balances`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch balance');
      const data = await response.json();
      const stx = Number(data?.stx?.balance ?? 0) / 1_000_000;
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              stxBalance: stx.toFixed(4),
            }
          : prev,
      );
    } catch {
      // Unable to fetch STX balance
    }
  }, [networkName]);

  const hydrateUser = useCallback(
    (session: UserSession, explicitAddress?: string) => {
      const data = session.loadUserData();
      const address =
        explicitAddress ||
        data.profile?.stxAddress?.[networkName] ||
        data.profile?.stxAddress?.mainnet ||
        data.profile?.stxAddress?.testnet;
      if (address) {
        // Detect network from address and update if different
        const detectedNetwork = detectNetworkFromAddress(address);
        if (detectedNetwork !== networkName) {
          setNetworkName(detectedNetwork);
          setNetworkMismatch(null);
        }
        setUserData({
          address,
          stxBalance: '…',
        });
        fetchBalance(address);
      } else {
        // No STX address found in user session/profile
      }
    },
    [fetchBalance, networkName],
  );

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      hydrateUser(userSession);
      setIsConnecting(false);
    } else if (userSession.isSignInPending()) {
      userSession
        .handlePendingSignIn()
        .then(() => hydrateUser(userSession))
        .finally(() => setIsConnecting(false));
    }
  }, [hydrateUser]);

  const connectWallet = useCallback(() => {
    const open = stacksShowConnect ?? stacksConnect;
    if (!open) {
      return;
    }
    setIsConnecting(true);
    try {
      const result = open({
        userSession,
        appDetails: {
          name: 'Stacks Playground',
          icon: `${window.location.origin}/icon.svg`,
        },
        onFinish: async (payload: any) => {
          const session = payload?.userSession ?? userSession;
          try {
            if (session.isSignInPending()) {
              await session.handlePendingSignIn();
            }
            hydrateUser(session);
          } catch {
            // handlePendingSignIn failed
          } finally {
            setIsConnecting(false);
          }
        },
        onCancel: () => {
          setIsConnecting(false);
        },
      });
      // Handle connect() promise if it returns one
      if (result && typeof result.then === 'function') {
        result
          .then(async (payload: any) => {
            // If session not yet signed in, use payload addresses to hydrate
            if (!userSession.isUserSignedIn() && !userSession.isSignInPending()) {
              // Find STX address (starts with 'S')
              let stxAddress: string | undefined;
              if (payload?.addresses && Array.isArray(payload.addresses)) {
                for (const addrObj of payload.addresses) {
                  const addr = addrObj?.address;
                  if (addr && addr.startsWith('S')) {
                    stxAddress = addr;
                    break;
                  }
                }
              }
              if (stxAddress) {
                // Detect network from address and update if different
                const detectedNetwork = detectNetworkFromAddress(stxAddress);
                if (detectedNetwork !== networkName) {
                  setNetworkName(detectedNetwork);
                  setNetworkMismatch(null);
                }
                setUserData({ address: stxAddress, stxBalance: '…' });
                fetchBalance(stxAddress);
              }
              setIsConnecting(false);
              return;
            }
            // After connect() resolves, userSession should contain auth data
            if (userSession.isUserSignedIn()) {
              hydrateUser(userSession, payload?.addresses?.[0]?.address);
            } else if (userSession.isSignInPending()) {
              await userSession.handlePendingSignIn();
              hydrateUser(userSession, payload?.addresses?.[0]?.address);
            }
            setIsConnecting(false);
          })
          .catch(() => {
            setIsConnecting(false);
          });
      }
    } catch {
      setIsConnecting(false);
    }
  }, [hydrateUser]);

  const disconnectWallet = useCallback(() => {
    userSession.signUserOut();
    setUserData(null);
    setNetworkMismatch(null);
  }, []);

  const switchNetwork = useCallback((target: SupportedNetwork) => {
    if (target === networkName) {
      setNetworkMismatch(null);
      return;
    }
    // Check if current address matches target network
    if (userData) {
      const currentNetwork = detectNetworkFromAddress(userData.address);
      if (currentNetwork !== target) {
        setNetworkMismatch({ current: currentNetwork, selected: target });
        return;
      }
    }
    setNetworkName(target);
    setNetworkMismatch(null);
  }, [networkName, userData]);

  const value: StacksContextValue = {
    userData,
    isConnecting,
    connectWallet,
    disconnectWallet,
    network,
    networkName,
    switchNetwork,
    networkMismatch,
  };

  return (
    <StacksContext.Provider value={value}>{children}</StacksContext.Provider>
  );
};

export const useStacks = () => {
  const context = useContext(StacksContext);
  if (!context) {
    throw new Error('useStacks must be used within a StacksProvider');
  }
  return context;
};
