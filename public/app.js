import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import firebaseConfig from "./firebaseConfig.js";

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function displayPlayers() {
  const selectedSport = document.getElementById("sport-select").value;
  const teams = { "team-A": [], "team-B": [] };

  // Get player data from Firestore
  const playersRef = collection(db, "players");
  const playerSnapshot = await getDocs(playersRef);

  playerSnapshot.forEach(playerDoc => {
    const playerData = playerDoc.data();
    const team = playerData.team === "Team A" ? "team-A" : "team-B";

    // Only include players who play the selected sport
    if (playerData.stats[selectedSport]) {
      teams[team].push({
        playerName: playerData.playerName,
        stats: playerData.stats[selectedSport]
      });
    }
  });

  // Generate tables
  ["team-A", "team-B"].forEach(teamId => {
    const teamContainer = document.getElementById(teamId);
    teamContainer.innerHTML = teams[teamId].length > 0
      ? createTableHtml(teamId.replace("team-", "Team "), selectedSport, teams[teamId])
      : `<p>No data available for ${teamId.replace("team-", "Team ")} in ${selectedSport}.</p>`;
  });
}

function createTableHtml(teamName, sport, players) {
  const sportHeaders = getSportHeaders(sport);
  const headerHtml = sportHeaders.map(header => `<th>${header}</th>`).join('');
  const rowsHtml = players.map(player => `
    <tr>
      <td>${player.playerName}</td>
      ${sportHeaders.slice(1).map(header => `<td>${player.stats[header.toLowerCase()] || ''}</td>`).join('')}
    </tr>
  `).join('');

  return `
    <table>
      <thead>
        <tr><th colspan="${sportHeaders.length}">${teamName} - ${sport.charAt(0).toUpperCase() + sport.slice(1)}</th></tr>
        <tr>${headerHtml}</tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

function getSportHeaders(sport) {
  switch (sport) {
    case "basketball":
      return ["Player", "Games Played", "Points", "Assists", "Rebounds"];
    case "softball":
      return ["Player", "Games Played", "At Bats", "Hits", "Strike Outs", "RBIs", "Batting Average"];
    case "volleyball":
      return ["Player", "Games Played", "Wins", "Losses", "Win Percentage"];
    case "ultimate-frisbee":
      return ["Player", "Games Played", "Points", "Assists", "Blocks"];
    default:
      return ["Player"];
  }
}

// Initial load
displayPlayers();