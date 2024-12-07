import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import firebaseConfig from "./firebaseConfig.js";

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchTeamData(sport) {
    const teamsCollection = collection(db, "teams");
    const playersCollection = collection(db, "players");

    const teamsSnapshot = await getDocs(teamsCollection);
    const teamsData = [];

    for (const teamDoc of teamsSnapshot.docs) {
        const team = { teamName: teamDoc.data().teamName, players: [] };

        // Fetch players for the team
        for (const playerId of teamDoc.data().players) {
            const playerDoc = await getDoc(doc(playersCollection, playerId));
            const playerData = playerDoc.data();
            const stats = playerData.stats[sport];

            if (stats) {
                // Calculate derived stats for specific sports
                if (sport === "softball") {
                    stats.battingAverage = (stats.hits / stats.atBats).toFixed(3);
                } else if (sport === "volleyball") {
                    stats.winPercentage = ((stats.wins / stats.gamesPlayed) * 100).toFixed(2) + '%';
                }
                team.players.push({
                    name: playerData.playerName,
                    ...stats,
                });
            }
        }
        teamsData.push(team);
    }
    return teamsData;
}

function renderTables(teamsData, sport) {
    const tablesContainer = document.getElementById("tables");
    tablesContainer.innerHTML = ""; // Clear previous tables

    const sportColumns = {
        basketball: ["Player", "Games Played", "Points", "Assists", "Rebounds"],
        softball: ["Player", "Games Played", "At Bats", "Hits", "Strike Outs", "RBIs", "Batting Average"],
        volleyball: ["Player", "Games Played", "Wins", "Losses", "Win Percentage"],
        ultimate: ["Player", "Games Played", "Points", "Assists", "Blocks"],
    };
    const columns = sportColumns[sport];

    // Add sport title at the top of the tables
    const sportTitle = document.createElement("h2");
    sportTitle.innerText = `Sport: ${sport.charAt(0).toUpperCase() + sport.slice(1)}`;
    tablesContainer.appendChild(sportTitle);

    teamsData.forEach((team) => {
        const table = document.createElement("table");
        const caption = document.createElement("caption");
        caption.innerText = team.teamName;
        table.appendChild(caption);

        const headerRow = document.createElement("tr");
        columns.forEach((col) => {
            const th = document.createElement("th");
            th.innerText = col;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        team.players.forEach((player) => {
            const row = document.createElement("tr");

            columns.forEach((col) => {
                const td = document.createElement("td");

                // Map column names to player fields
                if (col === "Player") {
                    td.innerText = player.name || "N/A"; // Display player's name
                } else if (col === "Games Played") {
                    td.innerText = player.gamesPlayed || "0"; // Display games played
                } else {
                    const field = col.toLowerCase().replace(" ", "");
                    td.innerText = player[field] || "0"; // Use '0' for missing data
                }

                row.appendChild(td);
            });
            table.appendChild(row);
        });
        tablesContainer.appendChild(table);
    });
}

function showAdminSection() {
    // Display admin section if the user is authenticated and has an "admin" role
    // You may need to fetch user data from Firestore to confirm their role
    document.getElementById("adminSection").style.display = "block";
}

// Event listener for the form submission
document.getElementById("playerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const playerName = document.getElementById("playerName").value;
    const team = document.getElementById("team").value;
    const sport = document.getElementById("sport").value;

    // Example stats data; adjust as needed for each sport
    const stats = {
        gamesPlayed: parseInt(document.getElementById("gamesPlayed").value),
        points: parseInt(document.getElementById("points").value) || 0,
        assists: parseInt(document.getElementById("assists").value) || 0,
    };

    try {
        // Add or update player data in Firestore
        const playerRef = doc(db, "players", playerName); // Use a unique ID in a real setup
        await setDoc(playerRef, {
            playerName,
            team,
            stats: { [sport]: stats }
        }, { merge: true });

        alert("Player data saved successfully!");
        document.getElementById("playerForm").reset();
    } catch (error) {
        console.error("Error saving player data:", error);
        alert("Error saving player data. Please try again.");
    }
});

// Load the admin section if the user is an admin
window.onload = () => {
    // Check if user is authenticated and authorized to see admin section
    showAdminSection();
};

// Correct the dropdown ID reference here to 'sportsDropdown'
document.getElementById("sportsDropdown").add("change", async (event) => {
    const sport = event.target.value;
    const teamsData = await fetchTeamData(sport);
    renderTables(teamsData, sport);
});

// Load default sport (e.g., Basketball) on page load
window.onload = async () => {
    const sport = document.getElementById("sportsDropdown").value;
    const teamsData = await fetchTeamData(sport);
    renderTables(teamsData, sport);
};