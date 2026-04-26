import { Stamp, Silhouette } from "./ui";

const ROLE_BG = {
  civil:      'var(--green-stamp)',
  undercover: 'var(--accent)',
  mrwhite:    'var(--ink)',
};
const ROLE_LABEL = { civil: 'Civil', undercover: 'Undercover', mrwhite: 'Mr. White' };

export default function GameOver({ winner, players, wordPair, onRestart, onHome }) {
  const civilWon = winner === "civil";

  const undercovers = players.filter((p) => p.role === "undercover");
  const mrWhites   = players.filter((p) => p.role === "mrwhite");
  const impostors  = [...undercovers, ...mrWhites];

  return (
    <div className="paper no-scroll fade-in" style={{ minHeight: '100dvh', overflow: 'auto', position: 'relative' }}>
      <div style={{ padding: '64px 20px 0' }}>
        <div className="mono-label" style={{ color: 'var(--accent)' }}>· FIN DE MISSION ·</div>
        <div className="mono-label" style={{ marginTop: 4, opacity: 0.5 }}>DOSSIER 0X-2026 · CLOS</div>
      </div>

      {/* Winner banner */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          background: 'var(--ink)', borderRadius: 10, padding: '24px 22px',
          color: 'var(--paper)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,0.025) 12px 13px)',
          }} />
          <div className="mono-label" style={{ color: 'rgba(241,233,214,0.5)' }}>VAINQUEURS</div>
          <div className="title-serif" style={{ fontSize: 52, lineHeight: 0.95, marginTop: 6, color: 'var(--paper)' }}>
            {civilWon ? "CIVILS" : "UNDERCOVER"}
          </div>
          <div style={{ position: 'absolute', top: 14, right: 14, transform: 'rotate(8deg)' }}>
            <Stamp color={civilWon ? 'green' : 'red'} rot={0} style={{
              fontSize: 11, padding: '3px 8px 2px',
              color: civilWon ? '#5BCB7A' : undefined,
            }}>
              {civilWon ? 'VICTOIRE' : 'DÉFAITE'}
            </Stamp>
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'rgba(241,233,214,0.7)', marginTop: 10 }}>
            {civilWon
              ? "Tous les imposteurs ont été démasqués. Mission accomplie."
              : "Les civils ont été trompés jusqu'au bout."}
          </div>
        </div>
      </div>

      {/* Word pair */}
      {wordPair && (
        <div style={{ padding: '20px 20px 0' }}>
          <div className="id-card fade-in" style={{ padding: '18px 20px' }}>
            <div className="mono-label" style={{ marginBottom: 12 }}>MOTS SECRETS RÉVÉLÉS</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className="mono-label" style={{ fontSize: 9, color: 'var(--green-stamp)', marginBottom: 4 }}>CIVILS</div>
                <div className="title-serif" style={{ fontSize: 24, color: 'var(--ink)' }}>{wordPair.civil}</div>
              </div>
              <div className="mono-num" style={{ fontSize: 16, color: 'var(--muted)' }}>VS</div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className="mono-label" style={{ fontSize: 9, color: 'var(--accent)', marginBottom: 4 }}>UNDERCOVER</div>
                <div className="title-serif" style={{ fontSize: 24, color: 'var(--accent)' }}>{wordPair.undercover}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roster */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="mono-label" style={{ marginBottom: 10 }}>RÉVÉLATION DES IDENTITÉS</div>
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {players.map((p, i) => (
            <div key={p.id ?? i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              background: 'var(--paper-2)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              opacity: p.eliminated ? 0.7 : 1,
            }}>
              <div className="mono-num" style={{ fontSize: 9, width: 18, color: 'var(--ink-soft)' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <Silhouette size={30} color={p.eliminated ? 'var(--muted)' : 'var(--ink)'} bg="transparent" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)' }}>{p.name}</div>
                <div className="mono-label" style={{ fontSize: 9, marginTop: 2, color: 'var(--ink-soft)' }}>
                  {p.eliminated ? 'ÉLIMINÉ' : 'SURVIVANT'}{p.word ? ` · MOT : ${p.word}` : ''}
                </div>
              </div>
              <div style={{
                background: ROLE_BG[p.role] || 'var(--ink)',
                color: 'var(--paper)',
                padding: '4px 8px', borderRadius: 4,
                fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}>{ROLE_LABEL[p.role] || p.role}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 20px 40px', display: 'flex', gap: 10 }}>
        <button className="btn-ghost" style={{ flex: 1, padding: '14px' }} onClick={onHome}>Accueil</button>
        {onRestart && (
          <button className="btn-accent" style={{ flex: 1.6 }} onClick={onRestart}>
            Rejouer
          </button>
        )}
      </div>
    </div>
  );
}
