import { useState, useEffect } from "react";
import "./MultiLobby.css";

export default function MultiLobby({ socket, onBack }) {
  const [view, setView] = useState("choice"); // choice | create | join | waiting
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [room, setRoom] = useState(null);
  const [myId, setMyId] = useState(null);
  const [includeWhite, setIncludeWhite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;
    setMyId(socket.id);

    const onRoomUpdated = (r) => setRoom(r);
    socket.on("room-updated", onRoomUpdated);

    return () => {
      socket.off("room-updated", onRoomUpdated);
    };
  }, [socket]);

  const handleCreate = () => {
    if (!name.trim()) return setError("Entre ton prénom");
    setLoading(true);
    socket.emit("create-room", { name: name.trim(), settings: { includeWhiteCard: includeWhite } }, (res) => {
      setLoading(false);
      if (res.success) {
        setRoom(res.room);
        setMyId(socket.id);
        setView("waiting");
      } else {
        setError(res.error || "Erreur");
      }
    });
  };

  const handleJoin = () => {
    if (!name.trim()) return setError("Entre ton prénom");
    if (!joinCode.trim()) return setError("Entre le code de la room");
    setLoading(true);
    socket.emit("join-room", { name: name.trim(), code: joinCode.trim().toUpperCase() }, (res) => {
      setLoading(false);
      if (res.success) {
        setRoom(res.room);
        setMyId(socket.id);
        setView("waiting");
      } else {
        setError(res.error || "Erreur");
      }
    });
  };

  const handleStartGame = () => {
    socket.emit("start-game", { code: room.code }, (res) => {
      if (!res?.success) setError(res?.error || "Impossible de lancer");
    });
  };

  const handleUpdateSettings = (newSettings) => {
    socket.emit("update-settings", { code: room.code, settings: newSettings });
  };

  const isHost = room?.hostId === myId;

  // ── Choice screen ──
  if (view === "choice") {
    return (
      <div className="screen multi-lobby">
        <div className="container">
          <div className="ml-header animate-in">
            <button className="back-btn" onClick={onBack}>← Retour</button>
            <h1 className="display ml-title">MODE MULTI</h1>
            <p className="ml-sub">Chacun joue sur son téléphone</p>
          </div>
          <div className="ml-choices stagger">
            <button className="choice-card" onClick={() => setView("create")}>
              <div>
                <div className="choice-name display">CRÉER UNE ROOM</div>
                <div className="choice-desc">Génère un code et invite tes amis</div>
              </div>
              <span className="choice-arrow">→</span>
            </button>
            <button className="choice-card choice-card--join" onClick={() => setView("join")}>
              <div>
                <div className="choice-name display">REJOINDRE</div>
                <div className="choice-desc">Entre le code d'un ami</div>
              </div>
              <span className="choice-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Create / Join form ──
  if (view === "create" || view === "join") {
    return (
      <div className="screen multi-lobby">
        <div className="container">
          <div className="ml-header animate-in">
            <button className="back-btn" onClick={() => { setView("choice"); setError(""); }}>← Retour</button>
            <h1 className="display ml-title">{view === "create" ? "CRÉER" : "REJOINDRE"}</h1>
          </div>

          <div className="ml-form stagger">
            <div>
              <label className="field-label">Ton prénom</label>
              <input
                className="input"
                placeholder="Ex: Alex"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                maxLength={20}
                autoCapitalize="words"
              />
            </div>

            {view === "join" && (
              <div>
                <label className="field-label">Code de la room</label>
                <input
                  className="input code-input"
                  placeholder="XXXX"
                  value={joinCode}
                  onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
                  maxLength={4}
                  autoCapitalize="characters"
                />
              </div>
            )}

            {view === "create" && (
              <div className="option-row card">
                <div className="option-info">
                  <span className="option-label">Carte Blanche</span>
                  <span className="option-desc">Ajouter un Mr White</span>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={includeWhite} onChange={(e) => setIncludeWhite(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            )}

            {error && <p className="error-msg">{error}</p>}

            <button
              className="btn btn-primary"
              onClick={view === "create" ? handleCreate : handleJoin}
              disabled={loading}
            >
              {loading ? "Connexion…" : view === "create" ? "Créer la room" : "Rejoindre"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Waiting lobby ──
  if (view === "waiting" && room) {
    return (
      <div className="screen multi-lobby">
        <div className="container">
          <div className="ml-header animate-in">
            <h1 className="display ml-title">LOBBY</h1>
            <div className="room-code-box">
              <span className="room-code-label">Code de la room</span>
              <span className="room-code display">{room.code}</span>
              <span className="room-code-hint">Partage ce code avec tes amis</span>
            </div>
          </div>

          <div className="players-waiting stagger">
            {room.players.map((p) => (
              <div key={p.id} className={`waiting-player card ${!p.connected ? "waiting-player--offline" : ""}`}>
                <span className="waiting-avatar">{p.name[0].toUpperCase()}</span>
                <span className="waiting-name">{p.name}</span>
                {p.id === room.hostId && <span className="badge badge-gold">Host</span>}
                {p.id === myId && <span className="badge badge-teal">Toi</span>}
                {!p.connected && <span className="badge badge-grey">Déco</span>}
              </div>
            ))}
          </div>

          <div className="waiting-count animate-in">
            {room.players.length} joueur{room.players.length > 1 ? "s" : ""} connecté{room.players.length > 1 ? "s" : ""}
            {room.players.length < 4 && ` — encore ${4 - room.players.length} minimum`}
          </div>

          {isHost && (
            <div className="host-settings card animate-in">
              <div className="option-row">
                <div className="option-info">
                  <span className="option-label">Carte Blanche</span>
                  <span className="option-desc">Ajouter un Mr White</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={room.settings?.includeWhiteCard}
                    onChange={(e) => handleUpdateSettings({ includeWhiteCard: e.target.checked })}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          )}

          {error && <p className="error-msg animate-in">{error}</p>}

          {isHost ? (
            <button
              className="btn btn-primary animate-in"
              disabled={room.players.length < 4}
              onClick={handleStartGame}
            >
              Lancer la partie
            </button>
          ) : (
            <div className="waiting-host animate-in card">
              <div className="waiting-spinner" />
              <p>En attente du host…</p>
            </div>
          )}

          <button className="btn btn-ghost" onClick={onBack}>Quitter</button>
        </div>
      </div>
    );
  }

  return null;
}
