
function Game() {
    // Hardcoded for now
    this.w = 700;
    this.h = 500;

    this.ballSpeed = 10;
    this.ballStartingSpeed = 10;
    this.ballRadius = 10;

    this.paddleSpeed = 5;
    this.paddleHeight = 200;
    this.paddleWidth = 10;

    this.ball;
    this.newBall();

    this.paddle1 = {
        x: 0,
        y: (this.h / 2) - (this.paddleHeight / 2),
        w: this.paddleWidth,
        h: this.paddleHeight,
        vy: 0
    }

    this.paddle2 = {
        x: this.w - this.paddleWidth,
        y: (this.h / 2) - (this.paddleHeight / 2),
        w: this.paddleWidth,
        h: this.paddleHeight,
        vy: 0
    }

};

Game.prototype.newBall = function () {
    var randVx = Math.random() * 2 - 1;

    var vyPower = 1 - Math.abs(randVx);

    var yDir = 1;
    if (Math.round(Math.random()) == 0) {
        yDir = -1;
    }

    var randVy = yDir * vyPower;
    this.ball = {
        x: this.w / 2,
        y: this.h / 2,
        r: 10,
        vx: randVx,
        vy: randVy
    }

    this.ballSpeed = this.ballStartingSpeed;
}

Game.prototype.updateGame = function () {
    this.updateBall(this.ball);
    this.updatePaddle(this.paddle1);
    this.updatePaddle(this.paddle2);
}

Game.prototype.updatePaddle = function (paddle) {
    if (paddle.y < 0) {
        paddle.vy = 0;
        paddle.y = 0;
    } else if (paddle.y + paddle.h > this.h) {
        paddle.vy = 0;
        paddle.y = this.h - paddle.h;
    }
    paddle.y = paddle.y + (paddle.vy * this.paddleSpeed);
}

Game.prototype.updateBall = function (ball) {
    ball.x = ball.x + (ball.vx * this.ballSpeed);
    ball.y = ball.y + (ball.vy * this.ballSpeed);

    this.hitPaddle(ball);

    if (ball.x - ball.r < 0 || ball.x + ball.r > this.w) {
        this.newBall();
    }

    if (ball.y - ball.r < 0 || ball.y + ball.r > this.h) {
        ball.vy = -ball.vy;
    }

    this.ballSpeed += 0.001;
}

Game.prototype.hitPaddle = function(ball) {
    this.paddleBallCollision(this.paddle1, this.ball);
    this.paddleBallCollision(this.paddle2, this.ball);
}

Game.prototype.paddleBallCollision = function(paddle, ball) {
    var vertical = (ball.y >= paddle.y && ball.y <= paddle.y + paddle.h);
    var left = (ball.x - ball.r <= paddle.x + paddle.w && ball.vx < 0 && ball.x + ball.r >= paddle.x + paddle.w);
    var right = (ball.x + ball.r >= paddle.x && ball.vx >= 0 && ball.x - ball.r <= paddle.x);

    if (vertical && (left || right)) {
        let heightRatio = (ball.y - paddle.y) / paddle.h;
        let ratioFormatted = (heightRatio * 2) - 1;

        ball.vy = ratioFormatted;

        let newVx = 1 - Math.abs(ratioFormatted);
        if (Math.sign(ball.vx) == Math.sign(newVx)) {
            newVx = -newVx;
        }
        ball.vx = newVx;
    };
}

Game.prototype.movePaddle = function(paddle, direction) {
    this[paddle].vy = direction;
}

Game.prototype.getGame = function () {
    var game = {}
    game.ball = this.ball;
    game.paddle1 = this.paddle1;
    game.paddle2 = this.paddle2;
    game.w = this.w;
    game.h = this.h;
    return game;
}


module.exports = Game;