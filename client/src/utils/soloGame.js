// Paires de mots pour le mode solo (identique au serveur)
const WORD_PAIRS = [
  { civil: "Coca-Cola", undercover: "Pepsi" },
  { civil: "Pizza", undercover: "Tarte flambée" },
  { civil: "Chien", undercover: "Loup" },
  { civil: "Chat", undercover: "Tigre" },
  { civil: "Soleil", undercover: "Lune" },
  { civil: "Plage", undercover: "Piscine" },
  { civil: "Voiture", undercover: "Moto" },
  { civil: "Bière", undercover: "Cidre" },
  { civil: "Chocolat noir", undercover: "Chocolat au lait" },
  { civil: "Facebook", undercover: "Instagram" },
  { civil: "iPhone", undercover: "Android" },
  { civil: "Netflix", undercover: "Disney+" },
  { civil: "Paris", undercover: "Lyon" },
  { civil: "Foot", undercover: "Rugby" },
  { civil: "Tennis", undercover: "Badminton" },
  { civil: "Guitare", undercover: "Basse" },
  { civil: "Café", undercover: "Thé" },
  { civil: "Pain", undercover: "Baguette" },
  { civil: "Fromage", undercover: "Beurre" },
  { civil: "Vin rouge", undercover: "Vin rosé" },
  { civil: "Cinéma", undercover: "Théâtre" },
  { civil: "Avion", undercover: "Hélicoptère" },
  { civil: "Mer", undercover: "Lac" },
  { civil: "Montagne", undercover: "Colline" },
  { civil: "Hiver", undercover: "Automne" },
  { civil: "Noel", undercover: "Halloween" },
  { civil: "Médecin", undercover: "Infirmier" },
  { civil: "Pompier", undercover: "Policier" },
  { civil: "Professeur", undercover: "Directeur" },
  { civil: "Boulanger", undercover: "Pâtissier" },
  { civil: "Requin", undercover: "Dauphin" },
  { civil: "Lion", undercover: "Panthère" },
  { civil: "Éléphant", undercover: "Rhinocéros" },
  { civil: "Aigle", undercover: "Vautour" },
  { civil: "Fraise", undercover: "Framboise" },
  { civil: "Pomme", undercover: "Poire" },
  { civil: "Orange", undercover: "Mandarine" },
  { civil: "Banane", undercover: "Plantain" },
  { civil: "Sushi", undercover: "Maki" },
  { civil: "Burger", undercover: "Sandwich" },
  { civil: "Hôtel", undercover: "Auberge" },
  { civil: "Vélo", undercover: "Trottinette" },
  { civil: "Train", undercover: "Métro" },
  { civil: "Natation", undercover: "Plongée" },
  { civil: "Yoga", undercover: "Pilates" },
  { civil: "Boxe", undercover: "Karaté" },
  { civil: "Mariage", undercover: "Fiançailles" },
  { civil: "Bibliothèque", undercover: "Librairie" },
  { civil: "Musée", undercover: "Galerie" },
  { civil: "Whisky", undercover: "Rhum" },
  { civil: "Champagne", undercover: "Prosecco" },
  { civil: "Harry Potter", undercover: "Seigneur des Anneaux" },
  { civil: "Star Wars", undercover: "Star Trek" },
  { civil: "Marvel", undercover: "DC Comics" },
  { civil: "Fantôme", undercover: "Zombie" },
  { civil: "Vampire", undercover: "Loup-garou" },
  { civil: "Dragon", undercover: "Dinosaure" },
  { civil: "Pirate", undercover: "Corsaire" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createSoloGame(playerNames, includeWhiteCard) {
  const n = playerNames.length;
  let undercoverCount = n <= 5 ? 1 : n <= 8 ? 2 : 3;
  let mrWhiteCount = includeWhiteCard ? 1 : 0;


  const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
  const roles = [];
  const civil = n - undercoverCount - mrWhiteCount;

  for (let i = 0; i < civil; i++) roles.push({ role: "civil", word: pair.civil });
  for (let i = 0; i < undercoverCount; i++) roles.push({ role: "undercover", word: pair.undercover });
  for (let i = 0; i < mrWhiteCount; i++) roles.push({ role: "mrwhite", word: "" });

  const shuffledRoles = shuffle(roles);
  const players = playerNames.map((name, i) => ({
    id: i,
    name,
    ...shuffledRoles[i],
    eliminated: false,
  }));

  return {
    players,
    phase: "role-reveal",
    currentRevealIndex: 0,
    roundNumber: 1,
    votes: {},
    wordPair: pair,
  };
}

export function checkWinCondition(players) {
  const alive = players.filter((p) => !p.eliminated);
  const aliveUndercovers = alive.filter((p) => p.role === "undercover");
  const aliveCivilsAndWhite = alive.filter((p) => p.role !== "undercover");

  if (aliveUndercovers.length === 0) return { over: true, winner: "civil" };
  if (aliveUndercovers.length >= aliveCivilsAndWhite.length) return { over: true, winner: "undercover" };
  return { over: false };
}
