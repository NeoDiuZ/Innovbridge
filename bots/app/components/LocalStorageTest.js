'use client';
import { useEffect, useState } from 'react';

export default function LocalStorageTest() {
  const [storageItems, setStorageItems] = useState({});
  const [testKey, setTestKey] = useState('');
  const [testValue, setTestValue] = useState('');

  useEffect(() => {
    // Get all localStorage items
    const items = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      items[key] = localStorage.getItem(key);
    }
    setStorageItems(items);
  }, []);

  const handleSetItem = () => {
    if (testKey) {
      localStorage.setItem(testKey, testValue);
      // Update the displayed items
      setStorageItems(prev => ({
        ...prev,
        [testKey]: testValue
      }));
    }
  };

  const handleClearItem = (key) => {
    localStorage.removeItem(key);
    // Update the displayed items
    const newItems = { ...storageItems };
    delete newItems[key];
    setStorageItems(newItems);
  };

  const handleClearAll = () => {
    localStorage.clear();
    setStorageItems({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">localStorage Test</h2>
      
      <div className="mb-4">
        <div className="flex mb-2">
          <input
            type="text"
            placeholder="Key"
            value={testKey}
            onChange={(e) => setTestKey(e.target.value)}
            className="border rounded p-2 mr-2 flex-1"
          />
          <input
            type="text"
            placeholder="Value"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            className="border rounded p-2 mr-2 flex-1"
          />
          <button
            onClick={handleSetItem}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Set
          </button>
        </div>
        <button
          onClick={handleClearAll}
          className="bg-red-500 text-white px-4 py-2 rounded w-full"
        >
          Clear All
        </button>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Current localStorage Items:</h3>
        {Object.keys(storageItems).length === 0 ? (
          <p className="text-gray-500">No items in localStorage</p>
        ) : (
          <ul className="border rounded divide-y">
            {Object.entries(storageItems).map(([key, value]) => (
              <li key={key} className="p-2 flex justify-between items-center">
                <div>
                  <span className="font-medium">{key}:</span> {value}
                </div>
                <button
                  onClick={() => handleClearItem(key)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 