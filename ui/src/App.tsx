
import React, { Suspense } from 'react';
import { StacksProvider } from './context/StacksContext';

const PlaygroundLayout = React.lazy(() => import('./components/PlaygroundLayout'));

function App() {
  return (
    <StacksProvider>
      <Suspense fallback={<div className="text-center text-sm text-zinc-500 py-10">Loading playground...</div>}>
        <PlaygroundLayout />
      </Suspense>
    </StacksProvider>
  );
}

export default App;
