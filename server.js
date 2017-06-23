const express = require("express");
const app = express();
const enableWs = require("express-ws");
const path = require("path");
const guid = require("guid");

const Game = require("./game");
const runningGames = [];

const wsExpress = enableWs(app);

let idCounter = 0;



function update() {
    runningGames.forEach(function (gameState) {
        let gameJson = gameState.game.getGame();
        message = {
            "type": "game",
            "game": gameJson
        }

        try {
            if (gameState.player1) {
                gameState.player1.send(JSON.stringify(message));
            }

            if (gameState.player2) {
                gameState.player2.send(JSON.stringify(message));
            }

        } catch (e) {
            console.log(e);
        }

        gameState.game.updateGame();
    });
}

app.set('port', (process.env.PORT || 8080));

app.use(express.static(path.join(__dirname + '/app')));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + '/app/index.html'));
});

app.ws('/game', (ws, req) => {
    ws.clientId = idCounter += 1;

    ws.on('message', msg => {
        let ob = JSON.parse(msg);
        if (ob.type == "movePaddle") {
            runningGames.forEach(function (gameState) {
                if (gameState.id == ob.gameId) {
                    gameState.game.movePaddle(ob.paddle, ob.direction);
                }
            })
        } else if (ob.type == "resetGame") {
            // currGame = new Game();
        } else if (ob.type == "joinGame") {
            runningGames.forEach(function (gameState) {
                console.log(gameState.id, ob.gameId);
                if (ob.gameId == gameState.id) {
                    console.log("found game");
                    message = {
                        "type": "join",
                        "gameId": ob.gameId
                    }
                    if (!gameState.player1) {
                        gameState.player1 = ws;
                        message.id = 1;
                    } else if (!gameState.player2) {
                        gameState.player2 = ws;
                        message.id = 2;
                    } else {
                        message.id = 0;
                    }
                    ws.send(JSON.stringify(message));
                }
            });
        } else if (ob.type == "createGame") {
            let gameState = {
                "game": new Game(),
                "id": guid.raw(),
                "player1": ws,
                "player2": null
            }

            runningGames.push(gameState);
            message = {
                "type": "join",
                "id": 1,
                "gameId": gameState.id
            }
            ws.send(JSON.stringify(message));
        }
    })

    ws.on('close', () => {
        for (var i = runningGames.length - 1; i >= 0; i--) {
            var gameState = runningGames[i];

            if (gameState.player1 && gameState.player1.clientId == ws.clientId) {
                gameState.player1 = null;
            }

            if (gameState.player2 && gameState.player2.clientId == ws.clientId) {
                gameState.player2 = null;
            }

            if (!gameState.player1 && !gameState.player2) {
                runningGames.splice(i, 1);
                console.log("removing game", runningGames.length);
            }
        }
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

setInterval(update, 10);