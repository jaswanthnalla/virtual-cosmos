import { useState } from 'react';

export default function UsernameInput({ onJoin }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length >= 2) {
      onJoin(trimmed);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center z-50">
      {/* Floating shapes background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 200 + 50 + 'px',
              height: Math.random() * 200 + 50 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: ['#4a90d9', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6'][
                Math.floor(Math.random() * 5)
              ],
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 10 + 10 + 's',
            }}
          />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl shadow-orange-200/40 border border-orange-100"
      >
        <div className="text-center mb-6">
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Virtual Cosmos
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Enter your name to join the space
          </p>
        </div>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name..."
          maxLength={20}
          autoFocus
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
        />

        <button
          type="submit"
          disabled={username.trim().length < 2}
          className="w-full mt-4 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm"
        >
          Enter Space
        </button>

        <p className="text-gray-400 text-xs text-center mt-4">
          Use WASD or Arrow keys to move around
        </p>
      </form>
    </div>
  );
}
