import { useState } from "react";
import { Silhouette } from "./ui";

export default function VotePanel({
  players, onVoteComplete,
  isSolo = false, myId = null, onVote = null, votes = {}, allVoted = false,
}) {
  const [selectedTarget, setSelectedTarget] = useState(null);

  const alivePlayers = players.filter((p) => !p.eliminated);

  // ── SOLO — vote général à l'oral ──
  if (isSolo) {
    return (
      <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto' }}>
        <div style={{ padding: '64px 20px 0' }}>
          <div className="mono-label" style={{ color: 'var(--accent)' }}>· VOTE EN COURS ·</div>
          <div className="mono-label" style={{ marginTop: 4 }}>PHASE 03 · ÉLIMINATION</div>
          <h1 className="title-serif" style={{ fontSize: 36, lineHeight: 1, margin: '6px 0 0' }}>
            Désigne<br />l'imposteur
          </h1>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            Votez à l'oral, puis confirmez la décision du groupe.
          </div>
        </div>

        <div className="stagger" style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alivePlayers.map((p) => {
            const isSel = selectedTarget === p.id;
            return (
              <button key={p.id} onClick={() => setSelectedTarget(p.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px',
                background: isSel ? 'var(--ink)' : 'var(--paper-2)',
                color: isSel ? 'var(--paper)' : 'var(--ink)',
                border: isSel ? '2px solid var(--accent)' : '1px solid var(--line)',
                borderRadius: 10, cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSel ? '0 6px 16px rgba(123,14,31,0.3)' : '0 1px 2px rgba(21,17,12,0.04)',
                textAlign: 'left',
              }}>
                <Silhouette size={36} color={isSel ? 'var(--paper)' : 'var(--ink)'} bg="transparent" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{p.name}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: `2px solid ${isSel ? 'var(--accent)' : 'var(--line)'}`,
                  background: isSel ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isSel && <span style={{ color: 'var(--paper)', fontSize: 13, fontWeight: 700 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '20px 20px 40px' }}>
          <button
            className="btn-accent"
            disabled={selectedTarget === null}
            onClick={() => onVoteComplete(selectedTarget)}
          >
            Confirmer l'élimination
            <span style={{ fontSize: 14 }}>→</span>
          </button>
        </div>
      </div>
    );
  }

  // ── MULTI — each player votes individually ──
  const aliveTargets = alivePlayers.filter((p) => p.id !== myId);
  const myVote = votes[myId];
  const iHaveVoted = !!myVote;
  const totalVoted = Object.keys(votes).length;

  const handleMultiVote = () => {
    if (selectedTarget === null) return;
    onVote(selectedTarget);
  };

  return (
    <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto' }}>
      <div style={{ padding: '64px 20px 0' }}>
        <div className="mono-label" style={{ color: 'var(--accent)' }}>· VOTE EN COURS ·</div>
        <div className="mono-label" style={{ marginTop: 4 }}>PHASE 03 · ÉLIMINATION</div>
        <h1 className="title-serif" style={{ fontSize: 36, lineHeight: 1, margin: '6px 0 0' }}>
          Désigne<br />l'imposteur
        </h1>
        {!iHaveVoted ? (
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            Choisis l'agent le plus suspect.
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green-stamp)', marginTop: 8, letterSpacing: '0.1em' }}>
            VOTE ENREGISTRÉ — {totalVoted}/{alivePlayers.length}
          </div>
        )}
      </div>

      {!iHaveVoted ? (
        <>
          <div className="stagger" style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {aliveTargets.map((p) => {
              const isSel = selectedTarget === p.id;
              return (
                <button key={p.id} onClick={() => setSelectedTarget(p.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px',
                  background: isSel ? 'var(--ink)' : 'var(--paper-2)',
                  color: isSel ? 'var(--paper)' : 'var(--ink)',
                  border: isSel ? '2px solid var(--accent)' : '1px solid var(--line)',
                  borderRadius: 10, cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSel ? '0 6px 16px rgba(123,14,31,0.3)' : '0 1px 2px rgba(21,17,12,0.04)',
                  textAlign: 'left',
                }}>
                  <Silhouette size={36} color={isSel ? 'var(--paper)' : 'var(--ink)'} bg="transparent" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{p.name}</div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `2px solid ${isSel ? 'var(--accent)' : 'var(--line)'}`,
                    background: isSel ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isSel && <span style={{ color: 'var(--paper)', fontSize: 13, fontWeight: 700 }}>✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ padding: '20px 20px 40px' }}>
            <button className="btn-accent" disabled={selectedTarget === null} onClick={handleMultiVote}>
              Confirmer mon vote
              <span style={{ fontSize: 14 }}>→</span>
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: '24px 20px 40px' }}>
          <div style={{
            background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 10,
            padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            <div className="waiting-spinner" />
            <div className="mono-label">EN ATTENTE DES AUTRES AGENTS</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {alivePlayers.map((p) => (
                <div key={p.id} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: votes[p.id] ? 'var(--green-stamp)' : 'var(--paper-3)',
                  border: '1px solid var(--line)',
                  transition: 'background 0.3s',
                }} title={p.name} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
