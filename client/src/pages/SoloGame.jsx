import { useState } from "react";
import { createSoloGame, checkWinCondition } from "../utils/soloGame";
import RoleReveal from "../components/RoleReveal";
import VotePanel from "../components/VotePanel";
import VoteResult from "../components/VoteResult";
import GameOver from "../components/GameOver";
import "./SoloGame.css";

export default function SoloGame({ players: playerNames, includeWhite, onBack }) {
  const [game, setGame] = useState(() => createSoloGame(playerNames, includeWhite));
  // phase: role-reveal | discussion | vote | vote-result | game-over
  const [voteResult, setVoteResult] = useState(null);
  const [showRole, setShowRole] = useState(true); // show role card for current player

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

  const handleVoteSubmit = (votes) => {
    // Count votes
    const counts = {};
    Object.values(votes).forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });
    const maxVotes = Math.max(...Object.values(counts));
    const eliminated = Object.keys(counts).filter((id) => counts[id] === maxVotes);

    let eliminatedId = null;
    let updatedPlayers = game.players;

    if (eliminated.length === 1) {
      eliminatedId = parseInt(eliminated[0]);
      updatedPlayers = game.players.map((p) =>
        p.id === eliminatedId ? { ...p, eliminated: true } : p
      );
    }

    const eliminatedPlayer = eliminatedId !== null
      ? game.players.find((p) => p.id === eliminatedId)
      : null;

    setVoteResult({
      eliminatedId,
      eliminatedName: eliminatedPlayer?.name,
      eliminatedRole: eliminatedPlayer?.role,
      isTie: eliminated.length > 1,
      votes,
      counts,
    });

    setGame({ ...game, players: updatedPlayers, phase: "vote-result", votes });
  };

  const handleAfterVoteResult = () => {
    const win = checkWinCondition(game.players);
    if (win.over) {
      setGame({ ...game, phase: "game-over", winner: win.winner });
    } else {
      setGame({ ...game, phase: "discussion", roundNumber: game.roundNumber + 1, votes: {} });
      setVoteResult(null);
    }
  };

  const handleRestart = () => {
    setGame(createSoloGame(playerNames, includeWhite));
    setVoteResult(null);
    setShowRole(true);
  };

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

  if (game.phase === "discussion") {
    return (
      <div className="screen solo-game">
        <div className="container">
          <div className="game-header animate-in">
            <div className="game-round badge badge-teal">Manche {game.roundNumber}</div>
            <h2 className="display game-title">DISCUSSION</h2>
            <p className="game-sub">Chacun donne un indice sur son mot, sans le révéler</p>
          </div>

          <div className="alive-players stagger">
            {alivePlayers.map((p) => (
              <div key={p.id} className="alive-player card">
                <span className="alive-avatar">{p.name[0].toUpperCase()}</span>
                <span className="alive-name">{p.name}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary animate-in"
            onClick={() => setGame({ ...game, phase: "vote" })}
          >
            Passer au vote 🗳️
          </button>
          <button className="btn btn-ghost" onClick={onBack}>Abandonner</button>
        </div>
      </div>
    );
  }

  if (game.phase === "vote") {
    return (
      <VotePanel
        players={game.players}
        onVoteComplete={handleVoteSubmit}
        isSolo={true}
      />
    );
  }

  if (game.phase === "vote-result" && voteResult) {
    return (
      <VoteResult
        result={voteResult}
        players={game.players}
        onContinue={handleAfterVoteResult}
      />
    );
  }

  if (game.phase === "game-over") {
    return (
      <GameOver
        winner={game.winner}
        players={game.players}
        onRestart={handleRestart}
        onHome={onBack}
      />
    );
  }

  return null;
}
