import { useState } from "react";
import { Silhouette, Stamp } from "./ui";
import "./RoleReveal.css";

const ROLE_CONFIG = {
  mrwhite: {
    label: "MR WHITE",
    color: "var(--gold)",
    desc: "Tu n'as pas de mot. Écoute les autres et improvise.",
  },
};

export default function RoleReveal({ player, playerIndex, totalPlayers, visible, onAcknowledge }) {
  const [revealed, setRevealed] = useState(false);

  const isMrWhite = player.role === "mrwhite";

  const handleDone = () => {
    setRevealed(false);
    setTimeout(onAcknowledge, 100);
  };

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s',
      minHeight: '100dvh',
    }}>
      <div
        className="paper-dark no-scroll"
        style={{ minHeight: '100dvh', overflow: 'auto', color: 'var(--paper)', position: 'relative' }}
      >
        {/* Header */}
        <div style={{ padding: '64px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="mono-label" style={{ color: 'rgba(241,233,214,0.6)' }}>
            AGENT {playerIndex + 1}/{totalPlayers}
          </div>
          <div className="mono-label" style={{ color: 'var(--accent-soft)' }}>· PRIVÉ ·</div>
        </div>

        <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
          <div className="mono-label" style={{ color: 'rgba(241,233,214,0.5)', marginBottom: 6 }}>DOSSIER PERSONNEL</div>
          <h1 className="title-serif" style={{ fontSize: 40, lineHeight: 1, margin: 0, color: 'var(--paper)' }}>
            {player.name}
          </h1>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 11,
            color: 'rgba(241,233,214,0.5)', marginTop: 8, letterSpacing: '0.1em',
          }}>
            {revealed ? 'NE MONTRE À PERSONNE' : 'TOUCHE LA CARTE POUR RÉVÉLER'}
          </div>
        </div>

        {/* Flip card */}
        <div style={{ padding: '28px 24px', perspective: 1200 }}>
          <div
            className={`flip-card-inner ${revealed ? 'flipped' : ''}`}
            style={{ height: 360 }}
            onClick={() => !revealed && setRevealed(true)}
          >
            {/* BACK — hidden face (visible first) */}
            <div className="flip-face" style={{
              background: 'var(--accent-2)',
              backgroundImage: `
                repeating-linear-gradient(45deg, transparent 0 18px, rgba(0,0,0,0.18) 18px 19px),
                repeating-linear-gradient(-45deg, transparent 0 18px, rgba(0,0,0,0.18) 18px 19px)`,
              borderRadius: 12,
              border: '2px solid rgba(241,233,214,0.3)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                background: 'var(--paper)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                border: '3px solid var(--ink)',
              }}>
                <div className="title-serif" style={{ fontSize: 84, color: 'var(--accent-2)', fontStyle: 'italic', lineHeight: 1 }}>U</div>
              </div>
              <div style={{
                position: 'absolute', top: 14, left: 14, right: 14,
                display: 'flex', justifyContent: 'space-between',
              }}>
                <div className="mono-label" style={{ color: 'rgba(241,233,214,0.7)' }}>· UNDERCOVER ·</div>
                <div className="mono-label" style={{ color: 'rgba(241,233,214,0.7)' }}>0X-2026</div>
              </div>
              <div style={{
                position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center',
                fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                color: 'rgba(241,233,214,0.6)', letterSpacing: '0.18em',
              }}>TOUCHE POUR OUVRIR</div>
            </div>

            {/* FRONT — ID card (revealed) */}
            <div className="flip-face flip-face-front id-card" style={{
              padding: '20px 18px', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="mono-label">RÔLE ASSIGNÉ</div>
                <div className="mono-num" style={{ fontSize: 10 }}>FILE 0X · {playerIndex + 1}/{totalPlayers}</div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                <Silhouette size={60} color="var(--ink)" bg="var(--paper-3)" />

                {isMrWhite && (
                  <div style={{ textAlign: 'center' }}>
                    <div className="mono-label">STATUT</div>
                    <div className="title-serif" style={{ fontSize: 48, lineHeight: 1, color: 'var(--ink)' }}>MR WHITE</div>
                  </div>
                )}

                <div style={{
                  padding: '10px 16px', border: '1.5px solid var(--ink)', borderRadius: 6,
                  background: 'rgba(255,255,255,0.3)', textAlign: 'center', minWidth: 180,
                }}>
                  <div className="mono-label" style={{ marginBottom: 4 }}>MOT DE PASSE</div>
                  {player.word ? (
                    <div className="title-serif" style={{ fontSize: 28, color: 'var(--accent)', lineHeight: 1, letterSpacing: '0.04em' }}>
                      {player.word.toUpperCase()}
                    </div>
                  ) : (
                    <div className="title-serif" style={{ fontSize: 28, color: 'var(--muted)', lineHeight: 1 }}>???</div>
                  )}
                </div>
              </div>

              {/* VALIDÉ stamp */}
              <div style={{ position: 'absolute', top: 14, right: 14, transform: 'rotate(8deg)' }}>
                <Stamp color="green" rot={0} style={{ fontSize: 10, padding: '2px 6px 1px' }}>VALIDÉ</Stamp>
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div style={{ padding: '0 24px 40px' }}>
          {!revealed && (
            <div className="mono-label pulse" style={{
              textAlign: 'center', color: 'rgba(241,233,214,0.5)', fontSize: 10,
            }}>· EN ATTENTE ·</div>
          )}
          {revealed && (
            <button className="btn-accent" onClick={handleDone}>
              J'ai mémorisé · passer le téléphone
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
