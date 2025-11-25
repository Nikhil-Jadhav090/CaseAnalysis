import React from 'react';

export default function TabGroup({ tabs, activeTab, onTabChange }) {
  return (
    <div className="border-b border-gray-600">
      <nav className="-mb-px flex gap-2" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => onTabChange(index)}
            className={`
              px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 
              ${activeTab === index
                ? 'text-purple-400 border-purple-400'
                : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-400'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}