import { useState } from "react";
import { Silhouette, DossierHeader } from "../components/ui";
import "./SoloSetup.css";

export default function SoloSetup({ onStart, onBack }) {
  const [players, setPlayers] = useState(["", ""]);
  const [includeWhite, setIncludeWhite] = useState(false);
  const [error, setError] = useState("");

  const addPlayer = () => {
    if (players.length < 12) setPlayers([...players, ""]);
  };

  const removePlayer = (i) => {
    if (players.length > 2) setPlayers(players.filter((_, idx) => idx !== i));
  };

  const updatePlayer = (i, val) => {
    const next = [...players];
    next[i] = val;
    setPlayers(next);
  };

  const handleStart = () => {
    const trimmed = players.map((p) => p.trim()).filter(Boolean);
    if (trimmed.length < 4) { setError("Il faut au moins 4 agents !"); return; }
    const unique = new Set(trimmed.map((n) => n.toLowerCase()));
    if (unique.size !== trimmed.length) { setError("Deux agents ont le même prénom."); return; }
    setError("");
    onStart(trimmed, includeWhite);
  };

  return (
    <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto' }}>
      {/* Top bar */}
      <div style={{ padding: '64px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="back-btn" onClick={onBack}>
          <span style={{ fontSize: 16 }}>‹</span> Retour
        </button>
        <div className="mono-label" style={{ color: 'var(--accent)' }}>· EN COURS ·</div>
      </div>

      <DossierHeader num="07-UNDR / SETUP" />

      <div style={{ padding: '20px 20px 0' }}>
        <div className="mono-label">PHASE 01</div>
        <h1 className="title-serif fade-in" style={{ fontSize: 38, lineHeight: 1, margin: '4px 0 0' }}>
          Brief des<br />agents
        </h1>
        <div style={{ marginTop: 8, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
          Saisis les prénoms des joueurs. Minimum 4 agents.
        </div>
      </div>

      {/* Player list */}
      <div style={{ padding: '20px 20px 0' }} className="stagger">
        {players.map((name, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--paper-2)', borderRadius: 8,
            padding: '10px 12px', marginBottom: 8,
            border: '1px solid var(--line)',
            boxShadow: '0 1px 2px rgba(21,17,12,0.04)',
          }}>
            <div className="mono-num" style={{ fontSize: 10, color: 'var(--ink-soft)', width: 22, textAlign: 'center' }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <Silhouette size={28} color="var(--ink)" bg="var(--paper-3)" />
            <input
              className="player-input"
              placeholder={`Agent ${i + 1}`}
              value={name}
              onChange={(e) => updatePlayer(i, e.target.value)}
              maxLength={20}
              autoCapitalize="words"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)', padding: '4px 0',
              }}
            />
            {players.length > 2 && (
              <button onClick={() => removePlayer(i)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: 18, padding: 4,
              }}>×</button>
            )}
          </div>
        ))}

        {players.length < 12 && (
          <button onClick={addPlayer} style={{
            width: '100%', padding: '12px',
            background: 'transparent', border: '1.5px dashed var(--line)',
            borderRadius: 8, cursor: 'pointer',
            fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.14em', color: 'var(--ink-soft)', textTransform: 'uppercase',
          }}>+ Ajouter un agent</button>
        )}
      </div>

      {/* Settings */}
      <div style={{ padding: '24px 20px 0' }}>
        <div className="mono-label" style={{ marginBottom: 10 }}>PARAMÈTRES DE MISSION</div>

        {/* Mr White toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--paper-2)', borderRadius: 8,
          padding: '12px 14px', border: '1px solid var(--line)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)' }}>Mr. White</div>
            <div className="mono-label" style={{ fontSize: 9, marginTop: 2 }}>AUCUN MOT REÇU</div>
          </div>
          <button
            className={`toggle-track ${includeWhite ? 'on' : ''}`}
            onClick={() => setIncludeWhite(!includeWhite)}
          >
            <div className="toggle-thumb" />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>{error}</div>
        </div>
      )}

      <div style={{ padding: '24px 20px 40px' }}>
        <button className="btn-accent" onClick={handleStart}>
          Distribuer les rôles
          <span style={{ fontSize: 14 }}>→</span>
        </button>
      </div>
    </div>
  );
}
