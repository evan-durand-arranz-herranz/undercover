import { useState } from "react";
import "./VotePanel.css";

export default function VotePanel({ players, onVoteComplete, isSolo = false, myId = null, onVote = null, votes = {}, allVoted = false }) {
  const [selectedTarget, setSelectedTarget] = useState(null);

  const alivePlayers = players.filter((p) => !p.eliminated);

  // SOLO MODE — vote général à l'oral, on confirme la décision collective
  if (isSolo) {
    return (
      <div className="screen vote-panel">
        <div className="container">
          <div className="vote-header animate-in">
            <div className="badge badge-red">Vote</div>
            <h2 className="display vote-title">QUI ÉLIMINER ?</h2>
            <p className="vote-voter">Votez à l'oral, puis confirmez la décision du groupe</p>
          </div>

          <div className="vote-targets stagger">
            {alivePlayers.map((target) => (
              <button
                key={target.id}
                className={`vote-target ${selectedTarget === target.id ? "vote-target--selected" : ""}`}
                onClick={() => setSelectedTarget(target.id)}
              >
                <span className="target-avatar">{target.name[0].toUpperCase()}</span>
                <span className="target-name">{target.name}</span>
                {selectedTarget === target.id && <span className="target-check">✓</span>}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary animate-in"
            disabled={selectedTarget === null}
            onClick={() => onVoteComplete(selectedTarget)}
          >
            Confirmer l'élimination
          </button>
        </div>
      </div>
    );
  }

  // MULTI MODE — player votes for themselves
  const aliveTargets = alivePlayers.filter((p) => p.id !== myId);
  const myVote = votes[myId];
  const iHaveVoted = !!myVote;
  const totalVoted = Object.keys(votes).length;

  const handleMultiVote = () => {
    if (selectedTarget === null) return;
    onVote(selectedTarget);
  };

  return (
    <div className="screen vote-panel">
      <div className="container">
        <div className="vote-header animate-in">
          <div className="badge badge-red">Vote</div>
          <h2 className="display vote-title">QUI ÉLIMINER ?</h2>
          {!iHaveVoted ? (
            <p className="vote-sub">Choisissez qui vous semble suspect</p>
          ) : (
            <p className="vote-sub">Vote enregistré — {totalVoted}/{alivePlayers.length} ont voté</p>
          )}
        </div>

        {!iHaveVoted ? (
          <>
            <div className="vote-targets stagger">
              {aliveTargets.map((target) => (
                <button
                  key={target.id}
                  className={`vote-target ${selectedTarget === target.id ? "vote-target--selected" : ""}`}
                  onClick={() => setSelectedTarget(target.id)}
                >
                  <span className="target-avatar">{target.name[0].toUpperCase()}</span>
                  <span className="target-name">{target.name}</span>
                  {selectedTarget === target.id && <span className="target-check">✓</span>}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" disabled={selectedTarget === null} onClick={handleMultiVote}>
              Confirmer mon vote
            </button>
          </>
        ) : (
          <div className="waiting-votes card animate-in">
            <div className="waiting-spinner" />
            <p>En attente des autres joueurs…</p>
            <div className="vote-progress">
              {alivePlayers.map((p) => (
                <div key={p.id} className={`vote-dot ${votes[p.id] ? "vote-dot--done" : ""}`} title={p.name} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
