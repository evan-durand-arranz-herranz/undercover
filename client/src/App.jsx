import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Home from "./pages/Home";
import SoloSetup from "./pages/SoloSetup";
import SoloGame from "./pages/SoloGame";
import MultiLobby from "./pages/MultiLobby";
import MultiGame from "./pages/MultiGame";
import "./index.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export default function App() {
  const [screen, setScreen] = useState("home"); // home | solo-setup | solo-game | multi-lobby | multi-game
  const [soloConfig, setSoloConfig] = useState(null); // { players, includeWhite }
  const [multiRoom, setMultiRoom] = useState(null);

  const socketRef = useRef(null);

  // Init socket once
  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // When game starts in multi, switch to game screen
    socket.on("room-updated", (room) => {
      setMultiRoom(room);
      if (room.phase !== "lobby" && screen === "multi-lobby") {
        setScreen("multi-game");
      }
      // If host restarts, go back to lobby
      if (room.phase === "lobby" && screen === "multi-game") {
        setScreen("multi-lobby");
      }
    });

    return () => socket.disconnect();
  }, []); // eslint-disable-line

  // Listen for phase changes to auto-switch multi screens
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleRoomUpdate = (room) => {
      setMultiRoom(room);
      if (room.phase !== "lobby" && screen === "multi-lobby") {
        setScreen("multi-game");
      }
      if (room.phase === "lobby" && screen === "multi-game") {
        setScreen("multi-lobby");
      }
    };

    socket.on("room-updated", handleRoomUpdate);
    return () => socket.off("room-updated", handleRoomUpdate);
  }, [screen]);

  const handleSelectMode = (mode) => {
    if (mode === "solo") setScreen("solo-setup");
    else setScreen("multi-lobby");
  };

  const handleSoloStart = (players, includeWhite) => {
    setSoloConfig({ players, includeWhite });
    setScreen("solo-game");
  };

  return (
    <>
      {screen === "home" && (
        <Home onSelectMode={handleSelectMode} />
      )}

      {screen === "solo-setup" && (
        <SoloSetup
          onStart={handleSoloStart}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "solo-game" && soloConfig && (
        <SoloGame
          players={soloConfig.players}
          includeWhite={soloConfig.includeWhite}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "multi-lobby" && (
        <MultiLobby
          socket={socketRef.current}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "multi-game" && multiRoom && (
        <MultiGame
          socket={socketRef.current}
          initialRoom={multiRoom}
          onHome={() => setScreen("home")}
        />
      )}
    </>
  );
}
