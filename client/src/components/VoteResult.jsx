import "./VoteResult.css";

const ROLE_LABEL = {
  civil: "Civil",
  undercover: "Undercover !",
  mrwhite: "Mr White !",
};

export default function VoteResult({ result, players, onContinue }) {
  const { eliminatedId, eliminatedName, eliminatedRole, isTie, votes, counts } = result;

  const getVoterName = (id) => {
    const p = players.find((p) => String(p.id) === String(id));
    return p?.name || "?";
  };

  const getTargetName = (id) => {
    const p = players.find((p) => String(p.id) === String(id));
    return p?.name || "?";
  };

  return (
    <div className="screen vote-result">
      <div className="container">
        {isTie ? (
          <div className="vr-header animate-in">
            <h2 className="display vr-title">ÉGALITÉ !</h2>
            <p className="vr-sub">Aucun joueur n'est éliminé cette manche.</p>
          </div>
        ) : eliminatedId !== null ? (
          <div className="vr-header animate-in">
            <h2 className="display vr-title">{eliminatedName}</h2>
            <p className="vr-sub">a été éliminé·e</p>
            <div className={`vr-role-reveal ${eliminatedRole === "civil" ? "vr-role--civil" : eliminatedRole === "undercover" ? "vr-role--uc" : "vr-role--white"}`}>
              <span className="vr-role-label">C'était un·e</span>
              <span className="vr-role-value display">{ROLE_LABEL[eliminatedRole]}</span>
            </div>
          </div>
        ) : null}

        {votes && Object.keys(votes).length > 0 && (
          <div className="vr-votes card animate-in">
            <h3 className="vr-votes-title">Résultats du vote</h3>
            <div className="vr-vote-list stagger">
              {Object.entries(votes).map(([voterId, targetId]) => (
                <div key={voterId} className="vr-vote-row">
                  <span className="vr-voter">{getVoterName(voterId)}</span>
                  <span className="vr-arrow">→</span>
                  <span className={`vr-target ${String(targetId) === String(eliminatedId) ? "vr-target--eliminated" : ""}`}>
                    {getTargetName(targetId)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-primary animate-in" onClick={onContinue}>
          {isTie ? "Nouvelle manche →" : eliminatedRole === "undercover" || eliminatedRole === "mrwhite" ? "Voir la fin →" : "Nouvelle manche →"}
        </button>
      </div>
    </div>
  );
}
