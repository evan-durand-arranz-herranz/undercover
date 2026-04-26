import { useState, useEffect } from "react";
import { Silhouette } from "../components/ui";
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
    const onKicked = () => { setRoom(null); setView("choice"); setError("Tu as été exclu de la room."); };
    socket.on("room-updated", onRoomUpdated);
    socket.on("kicked", onKicked);
    return () => { socket.off("room-updated", onRoomUpdated); socket.off("kicked", onKicked); };
  }, [socket]);

  const handleCreate = () => {
    if (!name.trim()) return setError("Entre ton prénom");
    setLoading(true);
    socket.emit("create-room", { name: name.trim(), settings: { includeWhiteCard: includeWhite } }, (res) => {
      setLoading(false);
      if (res.success) { setRoom(res.room); setMyId(socket.id); setView("waiting"); }
      else setError(res.error || "Erreur");
    });
  };

  const handleJoin = () => {
    if (!name.trim()) return setError("Entre ton prénom");
    if (!joinCode.trim()) return setError("Entre le code de la room");
    setLoading(true);
    socket.emit("join-room", { name: name.trim(), code: joinCode.trim().toUpperCase() }, (res) => {
      setLoading(false);
      if (res.success) { setRoom(res.room); setMyId(socket.id); setView("waiting"); }
      else setError(res.error || "Erreur");
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

  // ── Choix ──
  if (view === "choice") {
    return (
      <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto' }}>
        <div style={{ padding: '64px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="back-btn" onClick={onBack}><span style={{ fontSize: 16 }}>‹</span> Retour</button>
          <div className="mono-label" style={{ color: 'var(--accent)' }}>· MULTI ·</div>
        </div>

        <div style={{ padding: '14px 20px 0' }}>
          <div className="mono-label">CHAMBRE D'OPÉRATION</div>
          <h1 className="title-serif" style={{ fontSize: 36, lineHeight: 1, margin: '4px 0 0' }}>
            Quartier<br />Général
          </h1>
        </div>

        <div className="stagger" style={{ padding: '32px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn-primary" onClick={() => setView("create")}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" /></svg>
            Créer une room
          </button>
          <button className="btn-ghost" onClick={() => setView("join")}>
            Rejoindre une room
          </button>
        </div>
      </div>
    );
  }

  // ── Create / Join form ──
  if (view === "create" || view === "join") {
    return (
      <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto' }}>
        <div style={{ padding: '64px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="back-btn" onClick={() => { setView("choice"); setError(""); }}>
            <span style={{ fontSize: 16 }}>‹</span> Retour
          </button>
          <div className="mono-label" style={{ color: 'var(--accent)' }}>
            {view === "create" ? '· CRÉER ·' : '· REJOINDRE ·'}
          </div>
        </div>

        <div style={{ padding: '14px 20px 0' }}>
          <h1 className="title-serif" style={{ fontSize: 36, lineHeight: 1, margin: 0 }}>
            {view === "create" ? "Nouvelle\nroom" : "Rejoindre\nune room"}
          </h1>
        </div>

        <div style={{ padding: '28px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="mono-label" style={{ marginBottom: 8 }}>TON PRÉNOM</div>
            <input
              style={{
                width: '100%', background: 'var(--paper-2)', border: '1px solid var(--line)',
                borderRadius: 8, padding: '14px 16px', outline: 'none',
                fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)',
              }}
              placeholder="Agent X"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              maxLength={20}
              autoCapitalize="words"
            />
          </div>

          {view === "join" && (
            <div>
              <div className="mono-label" style={{ marginBottom: 8 }}>CODE D'ACCÈS</div>
              <input
                style={{
                  width: '100%', background: 'var(--paper-2)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '14px 16px', outline: 'none',
                  fontFamily: 'var(--mono)', fontSize: 28, color: 'var(--ink)',
                  letterSpacing: '0.3em', textTransform: 'uppercase', textAlign: 'center',
                }}
                placeholder="XXXX"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
                maxLength={4}
                autoCapitalize="characters"
              />
            </div>
          )}

          {view === "create" && (
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
          )}

          {error && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {error}
            </div>
          )}

          <button
            className="btn-accent"
            onClick={view === "create" ? handleCreate : handleJoin}
            disabled={loading}
          >
            {loading ? "Connexion…" : view === "create" ? "Créer la room →" : "Rejoindre →"}
          </button>
        </div>
      </div>
    );
  }

  // ── Waiting lobby ──
  if (view === "waiting" && room) {
    const codeLetters = room.code.split('');
    return (
      <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto' }}>
        <div style={{ padding: '64px 20px 0' }}>
          <h1 className="title-serif" style={{ fontSize: 32, lineHeight: 1, marginBottom: 0 }}>Lobby</h1>
        </div>

        {/* Code card */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            background: 'var(--paper-2)', border: '1.5px dashed var(--ink)',
            borderRadius: 10, padding: '20px 18px', position: 'relative',
          }}>
            <div className="mono-label" style={{ marginBottom: 10 }}>CODE D'ACCÈS</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {codeLetters.map((c, i) => (
                <div key={i} style={{
                  width: 56, height: 68, background: 'var(--paper)',
                  border: '2px solid var(--ink)', borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontSize: 40, color: 'var(--ink)',
                  position: 'relative',
                  boxShadow: 'inset 0 -3px 0 rgba(21,17,12,0.08)',
                }}>
                  {c}
                  <div className="mono-num" style={{ position: 'absolute', top: 4, left: 4, fontSize: 8, opacity: 0.4 }}>
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="perforated" style={{ marginTop: 14 }} />
            <div style={{ marginTop: 10 }}>
              <div className="mono-label" style={{ fontSize: 9 }}>PARTAGER LE CODE AVEC TES AGENTS</div>
            </div>
          </div>
        </div>

        {/* Players */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div className="mono-label">AGENTS PRÉSENTS · {room.players.length}/8</div>
            {room.players.length < 4 && (
              <div className="mono-label" style={{ color: 'var(--accent)', fontSize: 9 }}>
                {4 - room.players.length} MINIMUM
              </div>
            )}
          </div>

          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {room.players.map((p) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 8,
                opacity: p.connected === false ? 0.5 : 1,
              }}>
                <Silhouette size={30} color="var(--ink)" bg="transparent" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>{p.name}</div>
                  <div className="mono-label" style={{ fontSize: 9, marginTop: 1 }}>
                    {p.id === room.hostId ? 'HÔTE · OPÉRATEUR' : 'AGENT'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {p.id === myId && (
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                      padding: '4px 8px', borderRadius: 4,
                      background: 'var(--ink)', color: 'var(--paper)',
                    }}>TOI</div>
                  )}
                  {p.connected === false && (
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                      padding: '4px 8px', borderRadius: 4,
                      background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)',
                    }}>DÉCO</div>
                  )}
                  {isHost && p.id !== myId && (
                    <button
                      onClick={() => socket.emit("kick-player", { code: room.code, playerId: p.id })}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--muted)', fontSize: 18, padding: 4,
                      }}
                    >×</button>
                  )}
                </div>
              </div>
            ))}

            {/* Empty slot pulse */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', border: '1.5px dashed var(--line)', borderRadius: 8, opacity: 0.6,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', border: '1.5px dashed var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 16,
              }}>+</div>
              <div className="mono-label" style={{ flex: 1, fontSize: 9 }}>EN ATTENTE D'UN AGENT…</div>
              <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            </div>
          </div>
        </div>

        {isHost && (
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{
              background: 'var(--paper-2)', border: '1px solid var(--line)',
              borderRadius: 8, padding: '12px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)' }}>Mr. White</div>
                <div className="mono-label" style={{ fontSize: 9, marginTop: 2 }}>AUCUN MOT REÇU</div>
              </div>
              <button
                className={`toggle-track ${room.settings?.includeWhiteCard ? 'on' : ''}`}
                onClick={(e) => handleUpdateSettings({ includeWhiteCard: !room.settings?.includeWhiteCard })}
              >
                <div className="toggle-thumb" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 20px 0' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {error}
            </div>
          </div>
        )}

        {isHost && (
          <div style={{ padding: '0 20px', marginBottom: 4 }}>
            <button
              onClick={() => socket.emit("add-fake-players", { code: room.code, count: 3 })}
              style={{
                width: '100%', padding: '10px', borderRadius: 6, cursor: 'pointer',
                background: 'transparent', border: '1.5px dashed #b8860b',
                fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', color: '#b8860b',
              }}
            >
              [DEV] + 3 BOTS
            </button>
          </div>
        )}

        <div style={{ padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isHost ? (
            <button
              className="btn-accent"
              disabled={room.players.length < 4}
              onClick={handleStartGame}
            >
              Lancer la mission
              <span style={{ fontSize: 14 }}>→</span>
            </button>
          ) : (
            <div style={{
              background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 10,
              padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div className="waiting-spinner" />
              <div className="mono-label" style={{ fontSize: 10 }}>EN ATTENTE DU HOST…</div>
            </div>
          )}
          <button className="btn-ghost" style={{ padding: '12px' }} onClick={onBack}>Quitter</button>
        </div>
      </div>
    );
  }

  return null;
}
