// Shared design-system components — dossier aesthetic

export const Silhouette = ({ size = 64, color = 'var(--ink)', bg = 'var(--paper-3)' }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} style={{ background: bg, borderRadius: 4, flexShrink: 0 }}>
    <circle cx="32" cy="24" r="11" fill={color} />
    <path d="M 8 64 C 8 46, 20 38, 32 38 C 44 38, 56 46, 56 64 Z" fill={color} />
  </svg>
);

export const Stamp = ({ children, color = 'red', rot = -8, style = {} }) => {
  const cls = color === 'red' ? 'stamp-red' : color === 'green' ? 'stamp-green' : 'stamp-black';
  return (
    <div
      className={`stamp ${cls}`}
      style={{ transform: `rotate(${rot}deg)`, fontSize: 13, fontWeight: 400, ...style }}
    >
      {children}
    </div>
  );
};

export const DossierHeader = ({ num = '07-UNDR', section }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px 10px',
    borderBottom: '1px solid var(--line-soft)',
  }}>
    <div className="mono-num" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
        background: 'var(--accent)',
      }} />
      DOSSIER · {num}
    </div>
    {section && <div className="mono-label" style={{ fontSize: 9 }}>{section}</div>}
  </div>
);

export const IDCard = ({ children, style = {} }) => (
  <div className="id-card" style={{ padding: '22px', position: 'relative', ...style }}>
    <div className="id-card-corner tl" />
    <div className="id-card-corner tr" />
    <div className="id-card-corner bl" />
    <div className="id-card-corner br" />
    {children}
  </div>
);
