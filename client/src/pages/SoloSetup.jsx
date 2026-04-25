import { useState } from "react";
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
    if (trimmed.length < 4) {
      setError("Il faut au moins 4 joueurs !");
      return;
    }
    const unique = new Set(trimmed.map((n) => n.toLowerCase()));
    if (unique.size !== trimmed.length) {
      setError("Deux joueurs ont le même prénom.");
      return;
    }
    setError("");
    onStart(trimmed, includeWhite);
  };

  return (
    <div className="screen solo-setup">
      <div className="container">
        <div className="setup-header animate-in">
          <button className="back-btn" onClick={onBack}>← Retour</button>
          <h1 className="display setup-title">MODE SOLO</h1>
          <p className="setup-sub">Entrez les prénoms des joueurs</p>
        </div>

        <div className="players-list stagger">
          {players.map((name, i) => (
            <div key={i} className="player-row">
              <span className="player-num">{i + 1}</span>
              <input
                className="input player-input"
                placeholder={`Joueur ${i + 1}`}
                value={name}
                onChange={(e) => updatePlayer(i, e.target.value)}
                maxLength={20}
                autoCapitalize="words"
              />
              {players.length > 2 && (
                <button className="remove-btn" onClick={() => removePlayer(i)}>×</button>
              )}
            </div>
          ))}
        </div>

        {players.length < 12 && (
          <button className="btn btn-secondary add-btn animate-in" onClick={addPlayer}>
            + Ajouter un joueur
          </button>
        )}

        <div className="option-row card animate-in">
          <div className="option-info">
            <span className="option-label">🃏 Carte Blanche (Mr White)</span>
            <span className="option-desc">Un joueur ne reçoit aucun mot — s'il est éliminé, il peut tenter de deviner le mot des civils</span>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={includeWhite} onChange={(e) => setIncludeWhite(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>

        {error && <p className="error-msg animate-in">{error}</p>}

        <button className="btn btn-primary animate-in" onClick={handleStart}>
          Distribuer les rôles 🎭
        </button>
      </div>
    </div>
  );
}
