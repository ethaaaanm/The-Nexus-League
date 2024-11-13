import { collection, getDocs, addDoc } from "firebase/firestore";
import { db, colRef } from './firebaseConfig';

document.getElementById('loadTeams').addEventListener('click', async function() {
    const teamsCol = collection(db, "teams");
    const teamsSnapshot = await getDocs(teamsCol);
    let teamsList = "";
    teamsSnapshot.forEach((doc) => {
        const teamData = doc.data();
        teamsList += `<p>Team: ${teamData.name}, Players: ${teamData.players.join(', ')}</p>`;
    });
    document.getElementById('teams').innerHTML = teamsList;
});

// Example: Add a new team to the Firestore database
addDoc(collection(db, "teams"), {
    name: "Team Alpha",
    players: ["Player 1", "Player 2", "Player 3"]
})
.then((docRef) => {
    console.log("Team added with ID: ", docRef.id);
})
.catch((error) => {
    console.error("Error adding team: ", error);
});


const addTeamForm = document.querySelector('.add')
addTeamForm.addEventListener('submit', (e) => {
    e.preventDefault()

    addDoc(colRef, {
        title: addTeamForm.title.value ,
    })
    .then(() => { 
        addTeamForm.reset()
    })
})

const deleteTeamForm = document.querySelector('.delete')
deleteTeamForm.addEventListener('submit', (e) => {
    e.preventDefault()
})