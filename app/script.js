$(function () {
    var game;
    var canvas = $("#play-area");
    var ctx = canvas[0].getContext("2d");
    var currentPlayer = 0;
    var socket;
    var gameId;

    if ("WebSocket" in window) {
        console.log("supports web sockets");
        var protocol = "ws";
        if (location.protocol == "https:") {
            protocol = "wss";
        }

        socket = new WebSocket(protocol + "://" + location.host + "/game");

        socket.onopen = function () {
            console.log("web socket connected");
        }

        socket.onmessage = function (msg) {
            var data = msg.data;
            var ob = JSON.parse(data);
            if (ob.type == "game") {
                game = ob.game;
                update();
            } else if (ob.type == "join") {
                currentPlayer = ob.id;

                if (currentPlayer) {
                    $("#status").text("You are player " + currentPlayer);
                } else {
                    $("#status").text("There are already two players. Try again in a bit");
                }

                $("#game-id").text("The game id is: " + ob.gameId);
                gameId = ob.gameId;
            }

        }
    }

    $("#create").click(function (ev) {
        var message = {
            "type": "createGame"
        }
        socket.send(JSON.stringify(message));

    });

    $("#join").click(function (ev) {
        var gameId = $("#game-id-text").val();
        console.log(gameId);
        var message = {
            "type": "joinGame",
            "gameId": gameId
        }
        socket.send(JSON.stringify(message));
    });


    $(document).keydown(function (event) {
        if (currentPlayer) {
            paddle = (currentPlayer == 1) ? "paddle1" : "paddle2";

            var message = {
                "type": "movePaddle",
                "paddle": paddle,
                "gameId": gameId
            };
            switch (event.originalEvent.keyCode) {
                case 38: // Up
                    message.direction = -1;
                    socket.send(JSON.stringify(message));
                    break;
                case 40: // Down
                    message.direction = 1;
                    socket.send(JSON.stringify(message));
                    break;

            }
        }

    });

    $(document).keyup(function (event) {
        if (currentPlayer) {
            paddle = (currentPlayer == 1) ? "paddle1" : "paddle2";

            var message = {
                "type": "movePaddle",
                "paddle": paddle,
                "gameId": gameId
            };
            switch (event.originalEvent.keyCode) {
                case 38: // Up
                    message.direction = 0;
                    socket.send(JSON.stringify(message));
                    break;
                case 40: // Down
                    message.direction = 0;
                    socket.send(JSON.stringify(message));
                    break;
            }

        }
    });

    function update() {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, game.w, game.h);

        drawCircle(game.ball.x, game.ball.y, game.ball.r);

        drawRect(game.paddle1.x, game.paddle1.y, game.paddle1.w, game.paddle1.h);

        drawRect(game.paddle2.x, game.paddle2.y, game.paddle2.w, game.paddle2.h);
    }

    function drawRect(x, y, w, h) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x, y, w, h);
    }


    /**
     * 
     * @param {float} x the x coordinate
     * @param {float} y the y coordinate 
     * @param {float} r the radius
     */
    function drawCircle(x, y, r) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

    }
});