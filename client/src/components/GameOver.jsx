import "./GameOver.css";

export default function GameOver({ winner, players, wordPair, onRestart, onHome }) {
  const civilWon = winner === "civil";
  const undercovers = players.filter((p) => p.role === "undercover");
  const mrWhites = players.filter((p) => p.role === "mrwhite");

  return (
    <div className="screen game-over">
      <div className="go-bg">
        <div className={`go-orb ${civilWon ? "go-orb--teal" : "go-orb--red"}`} />
      </div>
      <div className="container">
        <div className="go-header animate-in">
          <div className="go-icon">{civilWon ? "🏆" : "🕵️"}</div>
          <h2 className="display go-title">
            {civilWon ? "CIVILS\nVICTORIEUX" : "UNDERCOVER\nGAGNE"}
          </h2>
          <p className="go-sub">
            {civilWon
              ? "L'imposteur a été démasqué !"
              : "Les civils ont été trompés jusqu'au bout."}
          </p>
        </div>

        {wordPair && (
          <div className="go-words card animate-in">
            <div className="go-word-row">
              <div className="go-word-item">
                <span className="go-word-label">Mot des civils</span>
                <span className="go-word display">{wordPair.civil}</span>
              </div>
              <div className="go-word-divider">VS</div>
              <div className="go-word-item">
                <span className="go-word-label">Mot undercover</span>
                <span className="go-word display go-word--uc">{wordPair.undercover}</span>
              </div>
            </div>
          </div>
        )}

        <div className="go-players card animate-in">
          <h3 className="go-players-title">Les imposteurs étaient…</h3>
          <div className="go-impostor-list stagger">
            {undercovers.map((p) => (
              <div key={p.id} className="go-impostor-row">
                <span className="go-impostor-avatar">{p.name[0].toUpperCase()}</span>
                <span className="go-impostor-name">{p.name}</span>
                <span className="badge badge-red">Undercover</span>
              </div>
            ))}
            {mrWhites.map((p) => (
              <div key={p.id} className="go-impostor-row">
                <span className="go-impostor-avatar">{p.name[0].toUpperCase()}</span>
                <span className="go-impostor-name">{p.name}</span>
                <span className="badge badge-gold">Mr White</span>
              </div>
            ))}
          </div>

          <div className="go-divider" />

          <h3 className="go-players-title">Les civils</h3>
          <div className="go-civil-list stagger">
            {players
              .filter((p) => p.role === "civil")
              .map((p) => (
                <div key={p.id} className="go-civil-row">
                  <span className="go-civil-avatar">{p.name[0].toUpperCase()}</span>
                  <span className="go-civil-name">{p.name}</span>
                  {p.eliminated && <span className="badge badge-grey">Éliminé</span>}
                </div>
              ))}
          </div>
        </div>

        <div className="go-actions stagger">
          <button className="btn btn-primary" onClick={onRestart}>
            Rejouer 🔄
          </button>
          <button className="btn btn-ghost" onClick={onHome}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
