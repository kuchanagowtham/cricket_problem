const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const teamPlayers = `
    SELECT 
    * 
    FROM
    cricket_team
    ORDER BY 
    player_id;
    `;
  const team = await db.all(teamPlayers);
  response.send(team);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const addPlayer = `
    INSERT INTO 
    cricket_team(player_id,player_name,jersey_number,role)
    VALUES 
   ( ${player_id},
    ${player_name},
    ${jersey_number},
    ${role});
    `;
  const dbResponse = await db.run(addPlayer);
  const playerId = dbResponse.lastID;
  response.send({"Player Added to Team" });
});

app.get("/players/:playerId/", async (request, response) => {
  const { player_id } = request.params;
  const playerdetails = `
    SELECT 
    *
     FROM
     cricket_team
     WHERE 
     player_id = {player_id}
    `;
  const player = await db.get(playerdetails);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const updateplayer = `
  UPDATE 
  cricket_team
  SET
  player_id = ${playerId}
  player_name = ${player_name}
  jersey_number = ${jersey_number}
  role = ${role}
  WHERE 
  player_id = ${playerId}
  `;
  await db.run(updateplayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM
    cricket_team
    WHERE 
    player_id = {playerId}
    `;
  await db.run(deletePlayer);
  response.send("Player Removed");
});
module.exports = app;
