import { useState } from 'react';

const EMOJI_LIST = [
  { emoji: '\u{1F44D}', label: 'Thumbs Up' },
  { emoji: '\u{1F44F}', label: 'Clap' },
  { emoji: '\u{2764}\u{FE0F}', label: 'Heart' },
  { emoji: '\u{1F602}', label: 'Laugh' },
  { emoji: '\u{1F389}', label: 'Party' },
  { emoji: '\u{1F44B}', label: 'Wave' },
  { emoji: '\u{1F525}', label: 'Fire' },
  { emoji: '\u{1F914}', label: 'Thinking' },
];

export default function BottomToolbar({
  onToggleChat,
  isChatOpen,
  connectionCount,
  onSendReaction,
  onToggleHand,
  isHandRaised,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    });
  };

  const handleReaction = (emoji) => {
    onSendReaction(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 h-14 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex items-center justify-between px-4">
      {/* Share toast */}
      {showShareToast && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-fade-in">
          Link copied to clipboard!
        </div>
      )}

      {/* Left tools */}
      <div className="flex items-center gap-1">
        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center w-14 h-11 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Copy link to share"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="text-[10px] mt-0.5 font-medium">Share</span>
        </button>

        {/* Invite */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center w-14 h-11 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors relative"
          title="Invite others"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          <span className="text-[10px] mt-0.5 font-medium">Invite</span>
          <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Move (always active) */}
        <button
          className="flex flex-col items-center justify-center w-14 h-11 rounded-lg bg-blue-50 text-blue-600 transition-colors"
          title="Move mode active (WASD/Arrow keys)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 9l-3 3 3 3" />
            <path d="M9 5l3-3 3 3" />
            <path d="M15 19l-3 3-3-3" />
            <path d="M19 9l3 3-3 3" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
          <span className="text-[10px] mt-0.5 font-medium">Move</span>
        </button>

        {/* Hand Raise */}
        <button
          onClick={() => onToggleHand(!isHandRaised)}
          className={`flex flex-col items-center justify-center w-14 h-11 rounded-lg transition-colors ${
            isHandRaised
              ? 'bg-yellow-50 text-yellow-600'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 11V6a2 2 0 0 0-4 0v4" />
            <path d="M14 10V4a2 2 0 0 0-4 0v6" />
            <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
            <path d="M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
          <span className="text-[10px] mt-0.5 font-medium">Hand</span>
        </button>

        {/* React (emoji picker) */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`flex flex-col items-center justify-center w-14 h-11 rounded-lg transition-colors ${
              showEmojiPicker
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
            title="Send reaction"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            <span className="text-[10px] mt-0.5 font-medium">React</span>
          </button>

          {/* Emoji picker dropdown */}
          {showEmojiPicker && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 flex gap-1 animate-fade-in">
              {EMOJI_LIST.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleReaction(item.emoji)}
                  className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-xl transition-transform hover:scale-125"
                  title={item.label}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleChat}
          className={`flex flex-col items-center justify-center w-14 h-11 rounded-lg transition-colors relative ${
            isChatOpen
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
          title="Toggle chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-[10px] mt-0.5 font-medium">Chat</span>
          {connectionCount > 0 && (
            <div className="absolute top-0.5 right-1.5 min-w-[16px] h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-[9px] text-white font-bold">{connectionCount}</span>
            </div>
          )}
        </button>

        <button
          className="flex flex-col items-center justify-center w-14 h-11 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Apps"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="text-[10px] mt-0.5 font-medium">Apps</span>
        </button>
      </div>
    </div>
  );
}
