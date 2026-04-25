import { useState } from "react";
import "./RoleReveal.css";

const ROLE_CONFIG = {
  civil: {
    label: "CIVIL",
    color: "teal",
    desc: "Vous connaissez le mot. Donnez des indices sans trahir votre identité.",
  },
  undercover: {
    label: "UNDERCOVER",
    color: "red",
    desc: "Votre mot est légèrement différent. Bluffez sans vous faire démasquer !",
  },
  mrwhite: {
    label: "MR WHITE",
    color: "gold",
    desc: "Vous n'avez aucun mot. Improvisez et essayez de deviner discrètement.",
  },
};

export default function RoleReveal({ player, playerIndex, totalPlayers, visible, onAcknowledge }) {
  const [revealed, setRevealed] = useState(false);
  const config = ROLE_CONFIG[player.role] || ROLE_CONFIG.civil;

  const handleReveal = () => setRevealed(true);
  const handleDone = () => {
    setRevealed(false);
    setTimeout(onAcknowledge, 100);
  };

  return (
    <div className={`role-reveal-screen screen ${visible ? "rv-visible" : "rv-hidden"}`}>
      {/* Waiting screen (before reveal) */}
      {!revealed && (
        <div className="rv-waiting container animate-in">
          <div className="rv-pass-indicator">
            <span className="rv-pass-num">{playerIndex + 1}/{totalPlayers}</span>
          </div>
          <h2 className="display rv-pass-title">
            À toi,<br />{player.name} !
          </h2>
          <p className="rv-pass-sub">
            Les autres joueurs ne doivent pas regarder. Appuie quand tu es prêt·e.
          </p>
          <button className="btn btn-primary rv-reveal-btn" onClick={handleReveal}>
            Voir mon rôle
          </button>
        </div>
      )}

      {/* Role card */}
      {revealed && (
        <div className="rv-card-wrapper container animate-in">
          <div className={`rv-card rv-card--${config.color}`}>
            <div className={`rv-role-badge badge badge-${config.color}`}>{config.label}</div>
            {player.word ? (
              <div className="rv-word-area">
                <span className="rv-word-label">Ton mot secret</span>
                <div className="rv-word display">{player.word}</div>
              </div>
            ) : (
              <div className="rv-word-area">
                <span className="rv-word-label">Tu n'as pas de mot</span>
                <div className="rv-word display rv-no-word">???</div>
              </div>
            )}
            <p className="rv-role-desc">{config.desc}</p>
          </div>

          <button className="btn btn-primary" onClick={handleDone}>
            J'ai mémorisé, cacher
          </button>
          <p className="rv-warning">Ne montre pas ton écran aux autres !</p>
        </div>
      )}
    </div>
  );
}
