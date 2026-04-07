export default function ConnectionIndicator({ count }) {
  if (count === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-20 bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <span className="text-sm text-gray-300">
        <span className="text-white font-semibold">{count}</span>{' '}
        {count === 1 ? 'connection' : 'connections'}
      </span>
    </div>
  );
}
