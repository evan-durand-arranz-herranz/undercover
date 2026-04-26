const WORD_PAIRS = [
  ["Coca-Cola", "Pepsi"],
  ["Pizza", "Tarte flambée"],
  ["Chien", "Loup"],
  ["Chat", "Tigre"],
  ["Soleil", "Lune"],
  ["Plage", "Piscine"],
  ["Voiture", "Moto"],
  ["Bière", "Cidre"],
  ["Chocolat noir", "Chocolat au lait"],
  ["Facebook", "Instagram"],
  ["iPhone", "Android"],
  ["Netflix", "Disney+"],
  ["Paris", "Lyon"],
  ["Foot", "Rugby"],
  ["Tennis", "Badminton"],
  ["Guitare", "Basse"],
  ["Café", "Thé"],
  ["Pain", "Baguette"],
  ["Fromage", "Beurre"],
  ["Vin rouge", "Vin rosé"],
  ["Cinéma", "Théâtre"],
  ["Avion", "Hélicoptère"],
  ["Mer", "Lac"],
  ["Montagne", "Colline"],
  ["Hiver", "Automne"],
  ["Noel", "Halloween"],
  ["Médecin", "Infirmier"],
  ["Pompier", "Policier"],
  ["Professeur", "Directeur"],
  ["Boulanger", "Pâtissier"],
  ["Requin", "Dauphin"],
  ["Lion", "Panthère"],
  ["Éléphant", "Rhinocéros"],
  ["Aigle", "Vautour"],
  ["Fraise", "Framboise"],
  ["Pomme", "Poire"],
  ["Orange", "Mandarine"],
  ["Banane", "Plantain"],
  ["Sushi", "Maki"],
  ["Burger", "Sandwich"],
  ["Piscine", "Jacuzzi"],
  ["Hôtel", "Auberge"],
  ["Camping", "Glamping"],
  ["Vélo", "Trottinette"],
  ["Train", "Métro"],
  ["Bateau", "Pédalo"],
  ["Natation", "Plongée"],
  ["Yoga", "Pilates"],
  ["Boxe", "Karaté"],
  ["Escalade", "Spéléologie"],
  ["Mariage", "Fiançailles"],
  ["Anniversaire", "Fête"],
  ["Diplôme", "Concours"],
  ["Vacances", "Week-end"],
  ["Bibliothèque", "Librairie"],
  ["Musée", "Galerie"],
  ["Parc", "Jardin"],
  ["Supermarché", "Épicerie"],
  ["Pharmacie", "Clinique"],
  ["Banque", "Distributeur"],
  ["Whisky", "Rhum"],
  ["Champagne", "Prosecco"],
  ["Vodka", "Gin"],
  ["Jeans", "Pantalon"],
  ["T-shirt", "Polo"],
  ["Baskets", "Running"],
  ["Casquette", "Bonnet"],
  ["Manteau", "Imperméable"],
  ["Robe", "Jupe"],
  ["Sac à dos", "Sac de sport"],
  ["Montre", "Bracelet connecté"],
  ["Ordinateur", "Tablette"],
  ["Télévision", "Projecteur"],
  ["Imprimante", "Scanner"],
  ["Clavier", "Souris"],
  ["Micro-ondes", "Four"],
  ["Frigo", "Congélateur"],
  ["Lave-vaisselle", "Lave-linge"],
  ["Canapé", "Fauteuil"],
  ["Lit", "Matelas"],
  ["Lampe", "Bougie"],
  ["Tableau", "Affiche"],
  ["Tapis", "Parquet"],
  ["Rideau", "Store"],
  ["Roses", "Tulipes"],
  ["Marguerites", "Tournesols"],
  ["Cactus", "Bambou"],
  ["Chêne", "Hêtre"],
  ["Sapin", "Pin"],
  ["Harry Potter", "Seigneur des Anneaux"],
  ["Star Wars", "Star Trek"],
  ["Marvel", "DC Comics"],
  ["James Bond", "Jason Bourne"],
  ["Titanic", "Naufrage"],
  ["Fantôme", "Zombie"],
  ["Vampire", "Loup-garou"],
  ["Dragon", "Dinosaure"],
  ["Licorne", "Pégase"],
  ["Pirate", "Corsaire"],
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


  const rawPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
  const [civilWord, undercoverWord] = Math.random() < 0.5 ? rawPair : [rawPair[1], rawPair[0]];
  const roles = [];
  const civil = n - undercoverCount - mrWhiteCount;

  for (let i = 0; i < civil; i++) roles.push({ role: "civil", word: civilWord });
  for (let i = 0; i < undercoverCount; i++) roles.push({ role: "undercover", word: undercoverWord });
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
    wordPair: { civil: civilWord, undercover: undercoverWord },
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
