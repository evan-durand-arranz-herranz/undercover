import { useState } from "react";
import { createSoloGame, checkWinCondition } from "../utils/soloGame";
import RoleReveal from "../components/RoleReveal";
import VotePanel from "../components/VotePanel";
import VoteResult from "../components/VoteResult";
import GameOver from "../components/GameOver";
import { Silhouette } from "../components/ui";
import "./SoloGame.css";

export default function SoloGame({ players: playerNames, includeWhite, onBack }) {
  const [game, setGame] = useState(() => createSoloGame(playerNames, includeWhite));
  const [voteResult, setVoteResult] = useState(null);
  const [showRole, setShowRole] = useState(true);

  const currentPlayer = game.players[game.currentRevealIndex];
  const alivePlayers = game.players.filter((p) => !p.eliminated);

  const handleRoleAcknowledged = () => {
    const next = game.currentRevealIndex + 1;
    if (next >= game.players.length) {
      setGame({ ...game, phase: "discussion", currentRevealIndex: 0 });
    } else {
      setShowRole(false);
      setTimeout(() => {
        setGame({ ...game, currentRevealIndex: next });
        setShowRole(true);
      }, 400);
    }
  };

  const handleVoteSubmit = (targetId) => {
    const eliminatedPlayer = game.players.find((p) => p.id === targetId) || null;
    const updatedPlayers = eliminatedPlayer
      ? game.players.map((p) => (p.id === targetId ? { ...p, eliminated: true } : p))
      : game.players;

    setVoteResult({
      eliminatedId: targetId,
      eliminatedName: eliminatedPlayer?.name,
      eliminatedRole: eliminatedPlayer?.role,
      eliminatedWord: eliminatedPlayer?.word,
      isTie: false,
    });

    setGame({ ...game, players: updatedPlayers, phase: "vote-result" });
  };

  const handleAfterVoteResult = () => {
    const win = checkWinCondition(game.players);
    if (win.over) {
      setGame({ ...game, phase: "game-over", winner: win.winner });
    } else {
      setGame({ ...game, phase: "discussion", roundNumber: game.roundNumber + 1 });
      setVoteResult(null);
    }
  };

  const handleRestart = () => {
    setGame(createSoloGame(playerNames, includeWhite));
    setVoteResult(null);
    setShowRole(true);
  };

  // ── Role reveal ──
  if (game.phase === "role-reveal") {
    return (
      <RoleReveal
        player={currentPlayer}
        playerIndex={game.currentRevealIndex}
        totalPlayers={game.players.length}
        visible={showRole}
        onAcknowledge={handleRoleAcknowledged}
      />
    );
  }

  // ── Discussion ──
  if (game.phase === "discussion") {
    return (
      <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto' }}>
        <div style={{ padding: '64px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="mono-label">TOUR {game.roundNumber} · DISCUSSION</div>
          <div className="mono-num" style={{ fontSize: 11, color: 'var(--accent)' }}>● EN DIRECT</div>
        </div>

        <div style={{ padding: '14px 20px 0' }}>
          <h1 className="title-serif" style={{ fontSize: 36, lineHeight: 1, margin: 0 }}>Discussion</h1>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            Chacun donne un indice sur son mot à l'oral.
          </div>
        </div>

        {/* Player grid */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="mono-label" style={{ marginBottom: 10 }}>
            AGENTS · {alivePlayers.length}/{game.players.length}
          </div>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {game.players.map((p) => (
              <div key={p.id} style={{
                position: 'relative',
                background: p.eliminated ? 'var(--paper-3)' : 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: 8, padding: '12px 8px 10px',
                textAlign: 'center', opacity: p.eliminated ? 0.55 : 1,
              }}>
                <Silhouette size={32} color={p.eliminated ? 'var(--muted)' : 'var(--ink)'} bg="transparent" />
                <div style={{
                  fontFamily: 'var(--serif)', fontSize: 13, marginTop: 4,
                  color: p.eliminated ? 'var(--muted)' : 'var(--ink)',
                  textDecoration: p.eliminated ? 'line-through' : 'none',
                }}>{p.name}</div>
                {p.eliminated && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <div className="stamp stamp-red" style={{ transform: 'rotate(-12deg)', fontSize: 9, padding: '1px 4px' }}>
                      ÉLIM.
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn-accent" onClick={() => setGame({ ...game, phase: "vote" })}>
            Passer au vote
            <span style={{ fontSize: 14 }}>→</span>
          </button>
          <button className="btn-ghost" style={{ padding: '12px' }} onClick={onBack}>Abandonner</button>
        </div>
      </div>
    );
  }

  // ── Vote ──
  if (game.phase === "vote") {
    return (
      <VotePanel
        players={game.players}
        onVoteComplete={handleVoteSubmit}
        isSolo={true}
      />
    );
  }

  // ── Vote result ──
  if (game.phase === "vote-result" && voteResult) {
    return (
      <VoteResult
        result={voteResult}
        players={game.players}
        onContinue={handleAfterVoteResult}
      />
    );
  }

  // ── Game over ──
  if (game.phase === "game-over") {
    return (
      <GameOver
        winner={game.winner}
        players={game.players}
        wordPair={game.wordPair}
        onRestart={handleRestart}
        onHome={onBack}
      />
    );
  }

  return null;
}
