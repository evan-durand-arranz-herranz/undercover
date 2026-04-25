import { Silhouette } from "./ui";
import "./VoteResult.css";

const ROLE_LABEL = { civil: "CIVIL", undercover: "UNDERCOVER", mrwhite: "MR WHITE" };

const ROLE_BG = {
  civil:      'var(--green-stamp)',
  undercover: 'var(--accent)',
  mrwhite:    'var(--ink)',
};

export default function VoteResult({ result, players, onContinue }) {
  const { eliminatedId, eliminatedName, eliminatedRole, eliminatedWord, isTie, votes, counts } = result;

  const getVoterName  = (id) => players.find((p) => String(p.id) === String(id))?.name || "?";
  const getTargetName = (id) => players.find((p) => String(p.id) === String(id))?.name || "?";

  return (
    <div className="paper-dark no-scroll fade-in" style={{
      minHeight: '100dvh', overflow: 'auto', color: 'var(--paper)', position: 'relative',
    }}>
      <div style={{ padding: '64px 20px 0', textAlign: 'center' }}>
        <div className="mono-label" style={{ color: 'var(--accent-soft)' }}>· VOTE TERMINÉ ·</div>
        <div className="mono-label" style={{ color: 'rgba(241,233,214,0.5)', marginTop: 4 }}>
          DOSSIER 0X · RÉSULTATS
        </div>
      </div>

      {isTie ? (
        <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
          <h1 className="title-serif" style={{ fontSize: 40, lineHeight: 1, color: 'var(--paper)' }}>Égalité !</h1>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'rgba(241,233,214,0.7)', marginTop: 8 }}>
            Aucun agent éliminé cette manche.
          </div>
        </div>
      ) : eliminatedId !== null ? (
        <>
          <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
            <h1 className="title-serif" style={{ fontSize: 38, lineHeight: 1, margin: 0, color: 'var(--paper)' }}>
              Agent<br />éliminé
            </h1>
          </div>

          {/* Eliminated ID card */}
          <div style={{ padding: '24px 20px 0', position: 'relative' }}>
            <div className="id-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div className="id-card-corner tl" />
              <div className="id-card-corner tr" />
              <div className="id-card-corner bl" />
              <div className="id-card-corner br" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div className="mono-label">DOSSIER FERMÉ</div>
                <div className="mono-num" style={{ fontSize: 10 }}>FILE 0X-2026</div>
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <Silhouette size={72} color="var(--ink)" bg="var(--paper-3)" />
                <div style={{ flex: 1 }}>
                  <div className="mono-label">NOM DE CODE</div>
                  <div className="title-serif" style={{ fontSize: 32, lineHeight: 1, color: 'var(--ink)', marginTop: 2 }}>
                    {eliminatedName}
                  </div>
                  <div style={{
                    marginTop: 8,
                    background: ROLE_BG[eliminatedRole] || 'var(--ink)',
                    color: 'var(--paper)',
                    padding: '4px 8px', borderRadius: 4, display: 'inline-block',
                    fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                  }}>{ROLE_LABEL[eliminatedRole] || eliminatedRole?.toUpperCase()}</div>
                  {eliminatedWord && (
                    <div style={{
                      fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-soft)',
                      marginTop: 6, fontStyle: 'italic',
                    }}>
                      Mot : <span style={{ color: 'var(--accent)' }}>{eliminatedWord}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ÉLIMINÉ stamp — drops in */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                '--rot': '-14deg',
                animation: 'stampDrop 0.8s cubic-bezier(0.34, 1.4, 0.64, 1) 0.3s both',
              }}>
                <div className="stamp stamp-red" style={{
                  fontSize: 32, padding: '6px 18px 5px', borderWidth: 4,
                  transform: 'rotate(-14deg)',
                }}>ÉLIMINÉ</div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Vote breakdown (multi only — solo has no per-voter data) */}
      {votes && Object.keys(votes).length > 0 && (
        <div style={{ padding: '24px 20px 0' }}>
          <div className="mono-label" style={{ color: 'rgba(241,233,214,0.6)', marginBottom: 10 }}>
            DÉPOUILLEMENT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(votes).map(([voterId, targetId]) => (
              <div key={voterId} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px',
                background: String(targetId) === String(eliminatedId)
                  ? 'rgba(123,14,31,0.25)' : 'rgba(241,233,214,0.06)',
                borderRadius: 6,
                border: String(targetId) === String(eliminatedId)
                  ? '1px solid var(--accent-soft)' : '1px solid transparent',
              }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--paper)', flex: 1 }}>
                  {getVoterName(voterId)}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(241,233,214,0.4)' }}>→</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--paper)' }}>
                  {getTargetName(targetId)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '24px 20px 40px' }}>
        <button className="btn-accent" onClick={onContinue}>
          {isTie || eliminatedRole === 'civil' ? 'Nouvelle manche' : 'Voir la fin'}
          <span style={{ fontSize: 14 }}>→</span>
        </button>
      </div>
    </div>
  );
}
