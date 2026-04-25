import { useState } from "react";
import "./Home.css";

export default function Home({ onSelectMode }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="home-screen screen">
      <div className="home-bg">
        <div className="home-orb home-orb-1" />
        <div className="home-orb home-orb-2" />
      </div>

      <div className="home-content container">
        <div className="home-header animate-in">
          <div className="home-eye">👁️</div>
          <h1 className="display home-title">UNDER<br />COVER</h1>
          <p className="home-subtitle">Qui est l'imposteur parmi vous ?</p>
        </div>

        <div className="home-modes stagger">
          <button
            className={`mode-card ${hovered === "solo" ? "mode-card--hovered" : ""}`}
            onClick={() => onSelectMode("solo")}
            onMouseEnter={() => setHovered("solo")}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="mode-icon">📱</div>
            <div className="mode-info">
              <h2 className="mode-name display">MODE SOLO</h2>
              <p className="mode-desc">Un seul téléphone, on se le passe à chaque tour</p>
            </div>
            <div className="mode-arrow">→</div>
          </button>

          <button
            className={`mode-card mode-card--multi ${hovered === "multi" ? "mode-card--hovered" : ""}`}
            onClick={() => onSelectMode("multi")}
            onMouseEnter={() => setHovered("multi")}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="mode-icon">🌐</div>
            <div className="mode-info">
              <h2 className="mode-name display">MODE MULTI</h2>
              <p className="mode-desc">Chacun joue sur son propre téléphone</p>
            </div>
            <div className="mode-arrow">→</div>
          </button>
        </div>

        <div className="home-rules card animate-in">
          <h3 className="rules-title">Comment jouer ?</h3>
          <ul className="rules-list">
            <li>🔴 Les <strong>civils</strong> reçoivent le même mot secret</li>
            <li>🕵️ L'<strong>undercover</strong> reçoit un mot similaire</li>
            <li>💬 Chacun donne un indice sans révéler son mot</li>
            <li>🗳️ On vote pour éliminer l'imposteur</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
