import { useState, useEffect } from "react";
import VotePanel from "../components/VotePanel";
import VoteResult from "../components/VoteResult";
import GameOver from "../components/GameOver";
import { Silhouette, Stamp } from "../components/ui";


export default function MultiGame({ socket, initialRoom, initialRole, onHome }) {
  const [room, setRoom] = useState(initialRoom);
  const [myRole, setMyRole] = useState(initialRole ?? null);
  const [voteResult, setVoteResult] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [gameOver, setGameOver] = useState(null);
  const [wordPair, setWordPair] = useState(null);
  const [wordVisible, setWordVisible] = useState(false);

  const myId = socket?.id;
  const isHost = room?.hostId === myId;
  const isEliminated = room?.eliminated?.includes(myId);
  const alivePlayers = room?.players?.filter((p) => !room.eliminated.includes(p.id)) || [];

  useEffect(() => {
    if (!socket) return;
    const onRoomUpdated = (r) => { setRoom(r); if (r.phase === "game-over") setGameOver(r); };
    const onYourRole = (data) => setMyRole(data);
    const onVoteResult = (data) => { setVoteResult(data); setMyVote(null); };
    socket.on("room-updated", onRoomUpdated);
    socket.on("your-role", onYourRole);
    socket.on("vote-result", onVoteResult);
    return () => {
      socket.off("room-updated", onRoomUpdated);
      socket.off("your-role", onYourRole);
      socket.off("vote-result", onVoteResult);
    };
  }, [socket]);

  const handleNextPhase = () => socket.emit("next-phase", { code: room.code });

  const handleVote = (targetId) => {
    setMyVote(targetId);
    socket.emit("vote", { code: room.code, targetId }, (res) => { if (!res?.success) setMyVote(null); });
  };

  const handleRestart = () => {
    socket.emit("restart-game", { code: room.code });
    setMyRole(null); setVoteResult(null); setMyVote(null); setGameOver(null); setWordVisible(false);
  };

  const handleStartGame = () => socket.emit("start-game", { code: room.code });
  const handleUpdateSettings = (settings) => socket.emit("update-settings", { code: room.code, settings });
  const handleKick = (playerId) => socket.emit("kick-player", { code: room.code, playerId });

  if (!room) return null;

  // ── LOBBY (après restart) ──
  if (room.phase === "lobby") {
    const codeLetters = room.code.split('');
    return (
      <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto' }}>
        <div style={{ padding: '64px 20px 0' }}>
          <h1 className="title-serif" style={{ fontSize: 32, lineHeight: 1, marginBottom: 0 }}>Lobby</h1>
        </div>

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
                  position: 'relative', boxShadow: 'inset 0 -3px 0 rgba(21,17,12,0.08)',
                }}>
                  {c}
                  <div className="mono-num" style={{ position: 'absolute', top: 4, left: 4, fontSize: 8, opacity: 0.4 }}>{i + 1}</div>
                </div>
              ))}
            </div>
            <div className="perforated" style={{ marginTop: 14 }} />
            <div style={{ marginTop: 10 }}>
              <div className="mono-label" style={{ fontSize: 9 }}>PARTAGER LE CODE AVEC TES AGENTS</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div className="mono-label">AGENTS PRÉSENTS · {room.players.length}/8</div>
            {room.players.length < 4 && (
              <div className="mono-label" style={{ color: 'var(--accent)', fontSize: 9 }}>{4 - room.players.length} MINIMUM</div>
            )}
          </div>
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {room.players.map((p) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 8,
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
                      padding: '4px 8px', borderRadius: 4, background: 'var(--ink)', color: 'var(--paper)',
                    }}>TOI</div>
                  )}
                  {isHost && p.id !== myId && (
                    <button onClick={() => handleKick(p.id)} style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--muted)', fontSize: 18, padding: 4,
                    }}>×</button>
                  )}
                </div>
              </div>
            ))}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              border: '1.5px dashed var(--line)', borderRadius: 8, opacity: 0.6,
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
          <div style={{ padding: '16px 20px 0' }}>
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
                onClick={() => handleUpdateSettings({ includeWhiteCard: !room.settings?.includeWhiteCard })}
              >
                <div className="toggle-thumb" />
              </button>
            </div>
          </div>
        )}


        <div style={{ padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isHost ? (
            <button className="btn-accent" disabled={room.players.length < 4} onClick={handleStartGame}>
              Lancer la mission <span style={{ fontSize: 14 }}>→</span>
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
          <button className="btn-ghost" style={{ padding: '12px' }} onClick={onHome}>Quitter</button>
        </div>
      </div>
    );
  }

  // ── GAME OVER ──
  if (room.phase === "game-over" || gameOver) {
    const allPlayers = room.players.map((p) => ({
      ...p, eliminated: room.eliminated.includes(p.id), role: p.role,
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
    const isMrWhite = myRole?.role === "mrwhite";

    return (
      <div className="paper-dark no-scroll" style={{ minHeight: '100dvh', overflow: 'auto', color: 'var(--paper)' }}>
        <div style={{ padding: '64px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="mono-num" style={{ fontSize: 10, color: 'rgba(241,233,214,0.6)' }}>ROOM {room.code}</div>
          <div className="mono-label" style={{ color: 'var(--accent-soft)' }}>· PRIVÉ ·</div>
        </div>

        <div style={{ padding: '16px 20px 0' }}>
          <div className="mono-label" style={{ color: 'rgba(241,233,214,0.5)', marginBottom: 4 }}>DOSSIER PERSONNEL</div>
          <h1 className="title-serif" style={{ fontSize: 36, lineHeight: 1, color: 'var(--paper)' }}>Ton rôle</h1>
        </div>

        {myRole ? (
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{
              background: 'var(--paper-2)', borderRadius: 12, padding: '24px 20px',
              position: 'relative', overflow: 'hidden',
            }}>
              {isMrWhite && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                    padding: '4px 8px', borderRadius: 4,
                    background: 'var(--gold)', color: 'var(--paper)',
                  }}>MR WHITE</div>
                </div>
              )}
              {isMrWhite && (
                <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                  <Silhouette size={60} color="var(--ink)" bg="var(--paper-3)" />
                  <div className="title-serif" style={{ fontSize: 40, lineHeight: 1, color: 'var(--ink)', marginTop: 10 }}>
                    MR WHITE
                  </div>
                </div>
              )}
              {!isMrWhite && (
                <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                  <Silhouette size={60} color="var(--ink)" bg="var(--paper-3)" />
                </div>
              )}
              <div style={{
                padding: '14px 16px', border: '1.5px solid var(--line)', borderRadius: 6,
                background: 'rgba(255,255,255,0.4)', textAlign: 'center',
              }}>
                <div className="mono-label" style={{ marginBottom: 8 }}>MOT DE PASSE</div>
                {myRole.word ? (
                  <div className="title-serif" style={{ fontSize: 30, color: 'var(--accent)', lineHeight: 1 }}>
                    {myRole.word.toUpperCase()}
                  </div>
                ) : (
                  <div className="title-serif" style={{ fontSize: 30, color: 'var(--muted)', lineHeight: 1 }}>???</div>
                )}
              </div>
              <div style={{ marginTop: 12, fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center' }}>
                {isMrWhite
                  ? "Tu n'as pas de mot. Écoute et improvise."
                  : "Donne des indices sur ton mot sans le révéler."}
              </div>
              {/* VALIDÉ stamp */}
              <div style={{ position: 'absolute', top: 12, right: 12, transform: 'rotate(8deg)' }}>
                <Stamp color="green" rot={0} style={{ fontSize: 9, padding: '2px 6px 1px' }}>VALIDÉ</Stamp>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{
              background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 10,
              padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div className="waiting-spinner" style={{ borderTopColor: 'var(--ink)' }} />
              <div className="mono-label" style={{ color: 'var(--ink-soft)' }}>DISTRIBUTION DES RÔLES…</div>
            </div>
          </div>
        )}

        {/* Players */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="mono-label" style={{ color: 'rgba(241,233,214,0.5)', marginBottom: 10 }}>
            AGENTS ({room.players.length})
          </div>
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {room.players.map((p) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', background: 'rgba(241,233,214,0.06)',
                border: '1px solid rgba(241,233,214,0.1)', borderRadius: 8,
              }}>
                <Silhouette size={28} color="rgba(241,233,214,0.7)" bg="transparent" />
                <div style={{ flex: 1, fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--paper)' }}>{p.name}</div>
                {p.id === myId && (
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                    padding: '3px 8px', borderRadius: 4, background: 'var(--accent)', color: 'var(--paper)',
                  }}>TOI</div>
                )}
              </div>
            ))}
          </div>
        </div>


        <div style={{ padding: '20px 20px 40px' }}>
          {isHost && myRole ? (
            <button className="btn-accent" onClick={handleNextPhase}>
              Lancer la discussion →
            </button>
          ) : (
            <div style={{
              background: 'rgba(241,233,214,0.06)', border: '1px solid rgba(241,233,214,0.1)',
              borderRadius: 10, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div className="waiting-spinner" />
              <div className="mono-label" style={{ color: 'rgba(241,233,214,0.5)', fontSize: 9 }}>
                EN ATTENTE DU HOST…
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DISCUSSION ──
  if (room.phase === "discussion") {
    return (
      <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto' }}>
        <div style={{ padding: '64px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="mono-label">TOUR {room.roundNumber} · DISCUSSION</div>
          <div className="mono-num" style={{ fontSize: 11, color: 'var(--accent)' }}>● EN DIRECT</div>
        </div>

        <div style={{ padding: '14px 20px 0' }}>
          <h1 className="title-serif" style={{ fontSize: 30, lineHeight: 1.1, margin: 0 }}>Discussion</h1>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>
            Donnez chacun un indice sur votre mot.
          </div>
        </div>

        {/* Word reminder */}
        {myRole && (
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{
              background: 'var(--ink)', color: 'var(--paper)',
              padding: '14px 16px', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div className="mono-label" style={{ color: 'rgba(241,233,214,0.5)', fontSize: 9 }}>TON MOT</div>
                <div className="title-serif" style={{ fontSize: 22, color: 'var(--paper)', marginTop: 2 }}>
                  {wordVisible ? (myRole.word || '???') : '● ● ● ●'}
                </div>
              </div>
              <button
                onClick={() => setWordVisible(v => !v)}
                style={{
                  background: 'rgba(241,233,214,0.12)', border: '1px solid rgba(241,233,214,0.2)',
                  borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700,
                  letterSpacing: '0.1em', color: 'rgba(241,233,214,0.7)', padding: '5px 10px', cursor: 'pointer',
                }}
              >
                {wordVisible ? 'CACHER' : 'RÉVÉLER'}
              </button>
            </div>
          </div>
        )}

        {/* Players alive */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="mono-label" style={{ marginBottom: 10 }}>AGENTS EN JEU · {alivePlayers.length}</div>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {alivePlayers.map((p) => (
              <div key={p.id} style={{
                background: 'var(--paper-2)', border: '1px solid var(--line)',
                borderRadius: 8, padding: '12px 8px 10px', textAlign: 'center',
              }}>
                <Silhouette size={32} color="var(--ink)" bg="transparent" />
                <div style={{ fontFamily: 'var(--serif)', fontSize: 13, marginTop: 4, color: 'var(--ink)' }}>{p.name}</div>
                {p.id === myId && (
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, marginTop: 4,
                    color: 'var(--accent)', letterSpacing: '0.1em',
                  }}>TOI</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {isEliminated && (
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{
              background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '14px 16px',
            }}>
              <div className="mono-label" style={{ color: 'var(--muted)' }}>Tu as été éliminé·e — tu peux observer.</div>
            </div>
          </div>
        )}


        <div style={{ padding: '24px 20px 40px' }}>
          {isHost ? (
            <button className="btn-accent" onClick={handleNextPhase}>
              Passer au vote →
            </button>
          ) : (
            <div style={{
              background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 10,
              padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div className="waiting-spinner" />
              <div className="mono-label" style={{ fontSize: 9 }}>LE HOST LANCERA LE VOTE…</div>
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
        <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto' }}>
          <div style={{ padding: '64px 20px 0' }}>
            <div className="mono-label" style={{ color: 'var(--accent)' }}>· VOTE EN COURS ·</div>
            <h1 className="title-serif" style={{ fontSize: 36, lineHeight: 1, margin: '6px 0 0' }}>Vote</h1>
          </div>
          <div style={{ padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '14px 16px',
            }}>
              <div className="mono-label" style={{ color: 'var(--muted)' }}>Tu as été éliminé·e — tu observes.</div>
            </div>
            <div style={{
              background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 10,
              padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div className="waiting-spinner" />
              <div className="mono-label" style={{ fontSize: 9 }}>
                {Object.keys(room.votes).length}/{alivePlayers.length} ONT VOTÉ…
              </div>
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
          <div style={{ padding: '0 20px 40px', maxWidth: 480, margin: '0 auto' }}>
            <div style={{
              background: 'rgba(241,233,214,0.06)', border: '1px solid rgba(241,233,214,0.1)',
              borderRadius: 10, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div className="waiting-spinner" />
              <div className="mono-label" style={{ color: 'rgba(241,233,214,0.5)', fontSize: 9 }}>
                EN ATTENTE DU HOST…
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── RESULT (waiting) ──
  if (room.phase === "result") {
    return (
      <div className="paper-dark no-scroll" style={{ minHeight: '100dvh', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="waiting-spinner" style={{ margin: '0 auto 12px' }} />
          <div className="mono-label" style={{ color: 'rgba(241,233,214,0.5)' }}>CALCUL DES VOTES…</div>
        </div>
      </div>
    );
  }

  return null;
}
