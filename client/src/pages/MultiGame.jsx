import { useState, useEffect } from "react";
import VotePanel from "../components/VotePanel";
import VoteResult from "../components/VoteResult";
import GameOver from "../components/GameOver";
import "./MultiGame.css";

export default function MultiGame({ socket, initialRoom, onHome }) {
  const [room, setRoom] = useState(initialRoom);
  const [myRole, setMyRole] = useState(null); // { role, word }
  const [voteResult, setVoteResult] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [gameOver, setGameOver] = useState(null);
  const [wordPair, setWordPair] = useState(null);

  const myId = socket?.id;
  const isHost = room?.hostId === myId;
  const me = room?.players?.find((p) => p.id === myId);
  const isEliminated = room?.eliminated?.includes(myId);
  const alivePlayers = room?.players?.filter((p) => !room.eliminated.includes(p.id)) || [];

  useEffect(() => {
    if (!socket) return;

    const onRoomUpdated = (r) => {
      setRoom(r);
      if (r.phase === "game-over") {
        setGameOver(r);
      }
    };

    const onYourRole = (data) => {
      setMyRole(data);
    };

    const onVoteResult = (data) => {
      setVoteResult(data);
      setMyVote(null);
    };

    socket.on("room-updated", onRoomUpdated);
    socket.on("your-role", onYourRole);
    socket.on("vote-result", onVoteResult);

    return () => {
      socket.off("room-updated", onRoomUpdated);
      socket.off("your-role", onYourRole);
      socket.off("vote-result", onVoteResult);
    };
  }, [socket]);

  const handleNextPhase = () => {
    socket.emit("next-phase", { code: room.code });
  };

  const handleVote = (targetId) => {
    setMyVote(targetId);
    socket.emit("vote", { code: room.code, targetId }, (res) => {
      if (!res?.success) setMyVote(null);
    });
  };

  const handleRestart = () => {
    socket.emit("restart-game", { code: room.code });
    setMyRole(null);
    setVoteResult(null);
    setMyVote(null);
    setGameOver(null);
  };

  if (!room) return null;

  // ── GAME OVER ──
  if (room.phase === "game-over" || gameOver) {
    const allPlayers = room.players.map((p) => ({
      ...p,
      eliminated: room.eliminated.includes(p.id),
      role: p.role, // visible at game over
    }));
    return (
      <GameOver
        winner={room.winner || gameOver?.winner}
        players={allPlayers}
        wordPair={wordPair}
        onRestart={isHost ? handleRestart : null}
        onHome={onHome}
      />
    );
  }

  // ── ROLE REVEAL ──
  if (room.phase === "role-reveal") {
    return (
      <div className="screen multi-game">
        <div className="container">
          <div className="mg-header animate-in">
            <div className="room-tag badge badge-grey">Room {room.code}</div>
            <h2 className="display mg-title">TON RÔLE</h2>
          </div>

          {myRole ? (
            <div className={`mg-role-card card animate-in ${myRole.role === "undercover" ? "mg-card--uc" : myRole.role === "mrwhite" ? "mg-card--white" : "mg-card--civil"}`}>
              <div className="mg-role-icon">
                {myRole.role === "civil" ? "👤" : myRole.role === "undercover" ? "🕵️" : "🃏"}
              </div>
              <div className={`badge ${myRole.role === "civil" ? "badge-teal" : myRole.role === "undercover" ? "badge-red" : "badge-gold"}`}>
                {myRole.role === "civil" ? "CIVIL" : myRole.role === "undercover" ? "UNDERCOVER" : "MR WHITE"}
              </div>
              {myRole.word ? (
                <div className="mg-word-area">
                  <span className="mg-word-label">Ton mot secret</span>
                  <div className="mg-word display">{myRole.word}</div>
                </div>
              ) : (
                <div className="mg-word-area">
                  <div className="mg-word display mg-no-word">???</div>
                  <span className="mg-word-label">Tu n'as pas de mot. Improvise !</span>
                </div>
              )}
              <p className="mg-role-hint">
                {myRole.role === "civil" && "Donne des indices sur ton mot sans le révéler."}
                {myRole.role === "undercover" && "Ton mot est légèrement différent. Bluffez !"}
                {myRole.role === "mrwhite" && "Écoute les autres et tente de deviner leur mot."}
              </p>
            </div>
          ) : (
            <div className="mg-waiting card animate-in">
              <div className="waiting-spinner" />
              <p>Distribution des rôles en cours…</p>
            </div>
          )}

          <div className="mg-players card animate-in">
            <h3 className="mg-section-title">Joueurs ({room.players.length})</h3>
            <div className="mg-player-list stagger">
              {room.players.map((p) => (
                <div key={p.id} className="mg-player-row">
                  <span className="mg-player-avatar">{p.name[0].toUpperCase()}</span>
                  <span className="mg-player-name">{p.name}</span>
                  {p.id === myId && <span className="badge badge-teal">Toi</span>}
                </div>
              ))}
            </div>
          </div>

          {isHost && myRole && (
            <button className="btn btn-primary animate-in" onClick={handleNextPhase}>
              Lancer la discussion 💬
            </button>
          )}
          {!isHost && (
            <div className="mg-host-wait card animate-in">
              <div className="waiting-spinner" />
              <p>En attente du host pour démarrer…</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DISCUSSION ──
  if (room.phase === "discussion") {
    return (
      <div className="screen multi-game">
        <div className="container">
          <div className="mg-header animate-in">
            <div className="badge badge-teal">Manche {room.roundNumber}</div>
            <h2 className="display mg-title">DISCUSSION</h2>
            <p className="mg-sub">Donnez chacun un indice sur votre mot</p>
          </div>

          {myRole && (
            <div className="mg-my-word card animate-in">
              <span className="mg-my-word-label">Ton mot</span>
              <span className="mg-my-word-value display">
                {myRole.word || "???"}
              </span>
            </div>
          )}

          <div className="mg-players card animate-in">
            <h3 className="mg-section-title">Joueurs en jeu</h3>
            <div className="mg-player-list stagger">
              {alivePlayers.map((p) => (
                <div key={p.id} className="mg-player-row">
                  <span className="mg-player-avatar">{p.name[0].toUpperCase()}</span>
                  <span className="mg-player-name">{p.name}</span>
                  {p.id === myId && <span className="badge badge-teal">Toi</span>}
                </div>
              ))}
            </div>
          </div>

          {isEliminated && (
            <div className="mg-eliminated card animate-in">
              💀 Tu as été éliminé·e — tu peux observer.
            </div>
          )}

          {isHost ? (
            <button className="btn btn-primary animate-in" onClick={handleNextPhase}>
              Passer au vote 🗳️
            </button>
          ) : (
            <div className="mg-host-wait card animate-in">
              <div className="waiting-spinner" />
              <p>Le host lancera le vote…</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VOTE ──
  if (room.phase === "vote") {
    if (isEliminated) {
      return (
        <div className="screen multi-game">
          <div className="container">
            <div className="mg-header animate-in">
              <h2 className="display mg-title">VOTE</h2>
            </div>
            <div className="mg-eliminated card animate-in">
              💀 Tu as été éliminé·e — tu observes le vote.
            </div>
            <div className="mg-host-wait card animate-in">
              <div className="waiting-spinner" />
              <p>{Object.keys(room.votes).length}/{alivePlayers.length} ont voté…</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <VotePanel
        players={room.players.map((p) => ({ ...p, eliminated: room.eliminated.includes(p.id) }))}
        isSolo={false}
        myId={myId}
        onVote={handleVote}
        votes={room.votes}
        allVoted={Object.keys(room.votes).length >= alivePlayers.length}
      />
    );
  }

  // ── VOTE RESULT ──
  if (room.phase === "result" && voteResult) {
    return (
      <>
        <VoteResult
          result={voteResult}
          players={room.players}
          onContinue={isHost ? handleNextPhase : null}
        />
        {!isHost && (
          <div style={{ padding: "0 20px 40px", maxWidth: 480, margin: "0 auto" }}>
            <div className="mg-host-wait card animate-in">
              <div className="waiting-spinner" />
              <p>En attente du host pour continuer…</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── RESULT (waiting) ──
  if (room.phase === "result") {
    return (
      <div className="screen multi-game">
        <div className="container">
          <div className="mg-host-wait card animate-in">
            <div className="waiting-spinner" />
            <p>Calcul des votes…</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
