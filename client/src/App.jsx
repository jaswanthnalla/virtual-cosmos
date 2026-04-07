import { useState } from 'react';
import { SocketProvider } from './context/SocketContext';
import GameView from './components/GameView';
import UsernameInput from './components/UsernameInput';

export default function App() {
  const [username, setUsername] = useState(null);

  return (
    <SocketProvider>
      {!username ? (
        <UsernameInput onJoin={setUsername} />
      ) : (
        <GameView username={username} />
      )}
    </SocketProvider>
  );
}
