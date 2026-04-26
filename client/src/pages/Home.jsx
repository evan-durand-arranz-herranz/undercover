import { Stamp, Silhouette } from "../components/ui";

export default function Home({ onSelectMode }) {
  return (
    <div className="paper no-scroll" style={{ minHeight: '100dvh', overflow: 'auto', position: 'relative' }}>
      {/* Top labels */}
      <div style={{ padding: '72px 24px 0' }}>
        <div className="mono-label" style={{ marginBottom: 4 }}>· CONFIDENTIEL ·</div>
        <div className="mono-label" style={{ color: 'var(--accent)', fontSize: 9 }}>NIVEAU D'ACCRÉDITATION : MAX</div>
      </div>

      {/* Hero ID card */}
      <div style={{ padding: '28px 24px 0', position: 'relative' }}>
        <div className="id-card fade-in" style={{ padding: '24px 22px 22px', position: 'relative' }}>
          <div className="id-card-corner tl" />
          <div className="id-card-corner tr" />
          <div className="id-card-corner bl" />
          <div className="id-card-corner br" />

          <div className="tape" style={{ top: -10, left: 24, transform: 'rotate(-4deg)' }} />
          <div className="tape" style={{ top: -10, right: 24, transform: 'rotate(5deg)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div className="mono-label">AGENCE · UNDR</div>
              <div className="mono-num" style={{ marginTop: 2, fontSize: 10 }}>FILE N° 0X-2026</div>
            </div>
            <div style={{
              border: '1px solid var(--ink)', padding: '2px 6px', borderRadius: 2,
              fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
            }}>TOP SECRET</div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flexShrink: 0, position: 'relative' }}>
              <Silhouette size={84} color="var(--accent)" bg="var(--paper-3)" />
              <div style={{
                position: 'absolute', bottom: -6, right: -6,
                background: 'var(--paper)', padding: '2px 5px',
                fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700,
                letterSpacing: '0.1em', border: '1px solid var(--ink)',
              }}>ID</div>
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div className="mono-label">NOM DE CODE</div>
              <div className="title-serif" style={{ fontSize: 36, lineHeight: 1, marginTop: 4 }}>
                UNDER<br />COVER
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <span className="redacted" style={{ fontSize: 11, height: 12 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span className="redacted" style={{ fontSize: 11, height: 12 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
            </div>
          </div>

          {/* CLASSIFIÉ stamp */}
          <div style={{ position: 'absolute', bottom: 12, right: 16 }}>
            <Stamp color="red" rot={-9} style={{ fontSize: 11, padding: '3px 8px 2px' }}>CLASSIFIÉ</Stamp>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="stagger" style={{ padding: '28px 24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn-primary" onClick={() => onSelectMode('solo')}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" />
          </svg>
          Nouvelle mission · solo
        </button>
        <button className="btn-accent" onClick={() => onSelectMode('multi')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="4.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M1 13c0-2 2-3 3.5-3s3.5 1 3.5 3M6 13c0-2 2-3 3.5-3s3.5 1 3.5 3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Mission collective · multi
        </button>
      </div>

      {/* How to play */}
      <div style={{ padding: '24px 24px 0' }}>
        <div className="id-card fade-in" style={{ padding: '18px 20px' }}>
          <div className="mono-label" style={{ marginBottom: 12 }}>BRIEFING · COMMENT JOUER</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['01', 'Les civils reçoivent le même mot secret'],
              ['02', "L'undercover reçoit un mot légèrement différent"],
              ['03', 'Chacun donne un indice sans révéler son mot'],
              ['04', "On vote pour éliminer l'imposteur"],
            ].map(([num, text]) => (
              <div key={num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div className="mono-num" style={{ fontSize: 9, color: 'var(--accent)', flexShrink: 0, paddingTop: 2 }}>{num}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 24px 40px', textAlign: 'center' }}>
        <div className="mono-label" style={{ fontSize: 9, opacity: 0.4 }}>· FIN DE TRANSMISSION ·</div>
      </div>
    </div>
  );
}
