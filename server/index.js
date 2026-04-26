const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const WORD_PAIRS = require("./words");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Stockage des rooms en mémoire
const rooms = {};

// Génère un code de room à 4 lettres
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  do {
    code = Array.from({ length: 4 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  } while (rooms[code]);
  return code;
}

// Sélectionne une paire et assigne aléatoirement quel mot est civil / undercover
function getRandomWordPair() {
  const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
  return Math.random() < 0.5
    ? { civil: pair[0], undercover: pair[1] }
    : { civil: pair[1], undercover: pair[0] };
}

// Mélange un tableau
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Distribue les rôles selon le nombre de joueurs
function assignRoles(players, includeWhiteCard) {
  const n = players.length;
  let undercoverCount = n <= 5 ? 1 : n <= 8 ? 2 : 3;
  let mrWhiteCount = includeWhiteCard ? 1 : 0;

  // S'assure qu'il y a toujours plus de civils

  const wordPair = getRandomWordPair();
  const roles = [];

  const civilCount = n - undercoverCount - mrWhiteCount;
  for (let i = 0; i < civilCount; i++) roles.push({ role: "civil", word: wordPair.civil });
  for (let i = 0; i < undercoverCount; i++) roles.push({ role: "undercover", word: wordPair.undercover });
  for (let i = 0; i < mrWhiteCount; i++) roles.push({ role: "mrwhite", word: "" });

  const shuffled = shuffle(roles);
  return players.map((p, i) => ({ ...p, ...shuffled[i] }));
}

// Vérifie la condition de victoire
function checkWin(players, eliminated) {
  const alive = players.filter((p) => !eliminated.includes(p.id));
  const aliveUndercovers = alive.filter((p) => p.role === "undercover");
  const aliveCivilsAndWhite = alive.filter((p) => p.role !== "undercover");
  if (aliveUndercovers.length === 0) return "civil";
  if (aliveUndercovers.length >= aliveCivilsAndWhite.length) return "undercover";
  return null;
}

// État d'une room
function createRoom(hostId, hostName, settings) {
  return {
    code: null,
    hostId,
    players: [{ id: hostId, name: hostName, connected: true }],
    settings: {
      includeWhiteCard: settings?.includeWhiteCard ?? false,
    },
    phase: "lobby", // lobby | role-reveal | discussion | vote | result | game-over
    roundNumber: 0,
    eliminated: [],
    votes: {},
    wordPair: null,
  };
}

// Construit le state public d'une room (sans les mots)
function publicRoomState(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      connected: p.connected,
      eliminated: room.eliminated.includes(p.id),
      role: room.phase === "game-over" ? p.role : undefined,
    })),
    settings: room.settings,
    phase: room.phase,
    roundNumber: room.roundNumber,
    eliminated: room.eliminated,
    votes: room.phase === "vote" || room.phase === "result" ? room.votes : {},
    mrwhiteVotes: room.phase === "vote-mrwhite" ? room.mrwhiteVotes || {} : {},
    mrwhiteResult: room.phase === "vote-mrwhite-result" ? room.mrwhiteResult || null : null,
  };
}


io.on("connection", (socket) => {
  console.log(`[connect] ${socket.id}`);

  // --- CRÉER UNE ROOM ---
  socket.on("create-room", ({ name, settings }, cb) => {
    const code = generateRoomCode();
    const room = createRoom(socket.id, name, settings);
    room.code = code;
    rooms[code] = room;
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerName = name;
    console.log(`[create-room] ${code} by ${name}`);
    cb({ success: true, code, room: publicRoomState(room) });
  });

  // --- REJOINDRE UNE ROOM ---
  socket.on("join-room", ({ code, name }, cb) => {
    const room = rooms[code?.toUpperCase()];
    if (!room) return cb({ success: false, error: "Room introuvable" });
    if (room.phase !== "lobby") return cb({ success: false, error: "Partie déjà en cours" });
    if (room.players.length >= 12) return cb({ success: false, error: "Room pleine (12 max)" });
    if (room.players.find((p) => p.name.toLowerCase() === name.toLowerCase()))
      return cb({ success: false, error: "Ce pseudo est déjà pris" });

    room.players.push({ id: socket.id, name, connected: true });
    socket.join(code.toUpperCase());
    socket.data.roomCode = code.toUpperCase();
    socket.data.playerName = name;

    io.to(code.toUpperCase()).emit("room-updated", publicRoomState(room));
    cb({ success: true, code: code.toUpperCase(), room: publicRoomState(room) });
  });

  // --- LANCER LA PARTIE ---
  socket.on("start-game", ({ code }, cb) => {
    const room = rooms[code];
    if (!room) return cb?.({ success: false, error: "Room introuvable" });
    if (room.hostId !== socket.id) return cb?.({ success: false, error: "Seul le host peut lancer" });
    if (room.players.length < 4) return cb?.({ success: false, error: "Minimum 4 joueurs" });

    room.players = assignRoles(room.players, room.settings.includeWhiteCard);
    room.phase = "role-reveal";
    room.roundNumber = 1;
    room.eliminated = [];
    room.votes = {};

    // Envoie à chaque joueur son propre rôle/mot
    room.players.forEach((p) => {
      io.to(p.id).emit("your-role", { role: p.role, word: p.word });
    });

    io.to(code).emit("room-updated", publicRoomState(room));
    cb?.({ success: true });
  });

  // --- PHASE SUIVANTE ---
  socket.on("next-phase", ({ code }, cb) => {
    const room = rooms[code];
    if (!room) return cb?.({ success: false });
    if (room.hostId !== socket.id) return cb?.({ success: false });

    if (room.phase === "role-reveal") {
      room.phase = "discussion";
    } else if (room.phase === "discussion") {
      const hasMrWhite = room.players.some(
        (p) => !room.eliminated.includes(p.id) && p.role === "mrwhite"
      );
      if (hasMrWhite) {
        room.phase = "vote-mrwhite";
        room.mrwhiteVotes = {};
      } else {
        room.phase = "vote";
        room.votes = {};
      }
    } else if (room.phase === "vote-mrwhite-result") {
      room.phase = "vote";
      room.votes = {};
      room.mrwhiteVotes = {};
      room.mrwhiteResult = null;
    } else if (room.phase === "result") {
      const winner = checkWin(room.players, room.eliminated);
      if (winner) {
        room.phase = "game-over";
        room.winner = winner;
      } else {
        room.phase = "discussion";
        room.roundNumber++;
        room.votes = {};
      }
    }

    io.to(code).emit("room-updated", publicRoomState(room));
    cb?.({ success: true });
  });

  // --- VOTER ---
  socket.on("vote", ({ code, targetId }, cb) => {
    const room = rooms[code];
    if (!room || room.phase !== "vote") return cb?.({ success: false });
    if (room.eliminated.includes(socket.id)) return cb?.({ success: false });

    room.votes[socket.id] = targetId;

    // Vérifie si tout le monde a voté
    const alivePlayers = room.players.filter((p) => !room.eliminated.includes(p.id));
    const allVoted = alivePlayers.every((p) => room.votes[p.id]);

    io.to(code).emit("room-updated", publicRoomState(room));

    if (allVoted) {
      // Comptage des votes
      const voteCounts = {};
      Object.values(room.votes).forEach((id) => {
        voteCounts[id] = (voteCounts[id] || 0) + 1;
      });

      const maxVotes = Math.max(...Object.values(voteCounts));
      const eliminated = Object.entries(voteCounts)
        .filter(([, count]) => count === maxVotes)
        .map(([id]) => id);

      // En cas d'égalité, personne n'est éliminé
      let eliminatedId = null;
      if (eliminated.length === 1) {
        eliminatedId = eliminated[0];
        room.eliminated.push(eliminatedId);
      }

      room.phase = "result";
      const eliminatedPlayer = eliminatedId
        ? room.players.find((p) => p.id === eliminatedId)
        : null;

      io.to(code).emit("vote-result", {
        eliminatedId,
        eliminatedName: eliminatedPlayer?.name,
        eliminatedRole: eliminatedPlayer?.role,
        isTie: eliminated.length > 1,
        votes: room.votes,
        voteCounts,
      });
      io.to(code).emit("room-updated", publicRoomState(room));
    }

    cb?.({ success: true, allVoted });
  });

  // --- VOTER POUR MR. WHITE ---
  socket.on("vote-mrwhite", ({ code, targetId }, cb) => {
    const room = rooms[code];
    if (!room || room.phase !== "vote-mrwhite") return cb?.({ success: false });
    if (room.eliminated.includes(socket.id)) return cb?.({ success: false });

    if (!room.mrwhiteVotes) room.mrwhiteVotes = {};
    room.mrwhiteVotes[socket.id] = targetId;

    const alivePlayers = room.players.filter((p) => !room.eliminated.includes(p.id));
    const allVoted = alivePlayers.every((p) => room.mrwhiteVotes[p.id]);

    io.to(code).emit("room-updated", publicRoomState(room));

    if (allVoted) {
      const voteCounts = {};
      Object.values(room.mrwhiteVotes).forEach((id) => {
        voteCounts[id] = (voteCounts[id] || 0) + 1;
      });
      const maxVotes = Math.max(...Object.values(voteCounts));
      const topVoted = Object.entries(voteCounts)
        .filter(([, c]) => c === maxVotes)
        .map(([id]) => id);

      const isTie = topVoted.length > 1;
      const pickedId = isTie ? null : topVoted[0];
      const pickedPlayer = pickedId ? room.players.find((p) => p.id === pickedId) : null;
      const wasMrWhite = pickedPlayer?.role === "mrwhite";

      if (wasMrWhite && pickedId) {
        room.eliminated.push(pickedId);
      }

      const winner = checkWin(room.players, room.eliminated);
      if (winner) {
        room.phase = "game-over";
        room.winner = winner;
      } else {
        room.phase = "vote-mrwhite-result";
        room.mrwhiteResult = {
          pickedId,
          pickedName: pickedPlayer?.name,
          wasMrWhite,
          isTie,
          votes: { ...room.mrwhiteVotes },
          voteCounts,
        };
        io.to(code).emit("mrwhite-result", room.mrwhiteResult);
      }

      io.to(code).emit("room-updated", publicRoomState(room));
    }

    cb?.({ success: true, allVoted });
  });

  // --- EXCLURE UN JOUEUR ---
  socket.on("kick-player", ({ code, playerId }, cb) => {
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return cb?.({ success: false });
    if (room.phase !== "lobby") return cb?.({ success: false });
    if (playerId === socket.id) return cb?.({ success: false });
    room.players = room.players.filter((p) => p.id !== playerId);
    io.to(playerId).emit("kicked");
    io.to(code).emit("room-updated", publicRoomState(room));
    cb?.({ success: true });
  });

  // --- REJOUER ---
  socket.on("restart-game", ({ code }, cb) => {
    const room = rooms[code];
    if (!room) return cb?.({ success: false });
    if (room.hostId !== socket.id) return cb?.({ success: false });

    room.phase = "lobby";
    room.roundNumber = 0;
    room.eliminated = [];
    room.votes = {};
    room.mrwhiteVotes = {};
    room.mrwhiteResult = null;
    room.players = room.players.map((p) => ({ id: p.id, name: p.name, connected: p.connected }));

    io.to(code).emit("room-updated", publicRoomState(room));
    cb?.({ success: true });
  });

  // --- MISE À JOUR SETTINGS ---
  socket.on("update-settings", ({ code, settings }, cb) => {
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return cb?.({ success: false });
    room.settings = { ...room.settings, ...settings };
    io.to(code).emit("room-updated", publicRoomState(room));
    cb?.({ success: true });
  });

  // --- DÉCONNEXION ---
  socket.on("disconnect", () => {
    const code = socket.data.roomCode;
    if (!code || !rooms[code]) return;
    const room = rooms[code];
    const player = room.players.find((p) => p.id === socket.id);
    if (player) player.connected = false;

    // Si host déconnecté, transférer le host
    if (room.hostId === socket.id) {
      const next = room.players.find((p) => p.id !== socket.id && p.connected);
      if (next) room.hostId = next.id;
    }

    // Nettoyer la room si vide
    const anyConnected = room.players.some((p) => p.connected);
    if (!anyConnected) {
      setTimeout(() => {
        if (!rooms[code]) return;
        const stillConnected = rooms[code].players.some((p) => p.connected);
        if (!stillConnected) {
          delete rooms[code];
          console.log(`[cleanup] Room ${code} supprimée`);
        }
      }, 30000);
    }

    io.to(code).emit("room-updated", publicRoomState(room));
    console.log(`[disconnect] ${socket.id} from room ${code}`);
  });
});

// Health check
app.get("/health", (req, res) => res.json({ ok: true, rooms: Object.keys(rooms).length }));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🎭 Undercover server running on port ${PORT}`));
