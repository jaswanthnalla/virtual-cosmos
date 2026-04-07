import { useState, useRef, useEffect } from 'react';

export default function ChatPanel({ chatRooms, currentUserId, onSendMessage, isOpen, onClose }) {
  const [activeRoom, setActiveRoom] = useState(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const rooms = Array.from(chatRooms.entries());

  useEffect(() => {
    if (rooms.length === 0) {
      setActiveRoom(null);
    } else if (!activeRoom || !chatRooms.has(activeRoom)) {
      setActiveRoom(rooms[0][0]);
    }
  }, [chatRooms, rooms, activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom, chatRooms]);

  if (!isOpen) return null;

  const currentRoom = activeRoom ? chatRooms.get(activeRoom) : null;

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed && activeRoom) {
      onSendMessage(activeRoom, trimmed);
      setInput('');
    }
  };

  return (
    <div className="fixed top-12 right-0 bottom-14 w-80 z-20 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800 text-sm">Chat</h2>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Room tabs */}
      {rooms.length > 0 && (
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {rooms.map(([roomId, room]) => (
            <button
              key={roomId}
              onClick={() => setActiveRoom(roomId)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeRoom === roomId
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-green-400" />
              {room.peerUsername}
            </button>
          ))}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">No active connections</p>
            <p className="text-xs text-gray-400 mt-1">Move closer to another user to start chatting</p>
          </div>
        ) : currentRoom ? (
          <>
            {/* Chat start message */}
            <div className="text-center py-2">
              <p className="text-xs font-semibold text-gray-800">
                This is the beginning of your chat history with <span className="text-blue-600">@{currentRoom.peerUsername}</span>.
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Send messages, links, and more.
              </p>
            </div>

            {currentRoom.messages.map((msg, i) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[80%]">
                    {!isOwn && (
                      <span className="text-[10px] text-gray-400 font-medium ml-1 mb-0.5 block">
                        {msg.senderName}
                      </span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-300 mt-0.5 block px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : null}
      </div>

      {/* Message input */}
      {currentRoom && (
        <form onSubmit={handleSend} className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message the group..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white disabled:text-gray-400 flex items-center justify-center transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          {/* Formatting toolbar */}
          <div className="flex items-center gap-1 mt-2 px-1">
            {['smile', 'paperclip', 'image', 'bold', 'italic', 'link', 'code'].map((icon, i) => (
              <button
                key={i}
                type="button"
                className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <div className="w-3.5 h-3.5 rounded-sm bg-current opacity-30" />
              </button>
            ))}
          </div>
        </form>
      )}
    </div>
  );
}
