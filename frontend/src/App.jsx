import React from 'react';
import Flow from './components/Flow';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';

function App() {
  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      <header className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">AV</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
            Advanced Visual RAG Builder
          </h1>
        </div>
      </header>
      
      <main className="flex-1 relative overflow-hidden flex">
        <Sidebar />
        <div className="flex-1 relative h-full">
          <Flow />
        </div>
        <SettingsPanel />
      </main>
    </div>
  );
}

export default App;
