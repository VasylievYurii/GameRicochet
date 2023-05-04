const game = {
  width: 900,
  height: 400,
  ctx: undefined,
  platform: undefined,
  ball: undefined,
  rows: 4,
  cols: 10,
  blocks: [],
  running: true,
  score: 0,
  sprites: {
    background: undefined,
    platform: undefined,
    ball: undefined,
    block: undefined,
  },

  init() {
    const canvas = document.getElementById("mycanvas");
    this.ctx = canvas.getContext("2d");
    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        game.platform.dx = -game.platform.velocity;
      } else if (e.key === "ArrowRight") {
        game.platform.dx = game.platform.velocity;
      } else if (e.code === "Space") {
        game.platform.releaseBall();
      }
    });
    window.addEventListener("keyup", function () {
      game.platform.stop();
    });
  },

  load() {
    for (const image in this.sprites) {
      this.sprites[image] = new Image();
      this.sprites[image].src = "/images/" + image + ".png";
    }
  },

  create() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
          x: 200 * 0.3 * col + 150,
          y: 100 * 0.3 * row + 35,
          width: 177 * 0.3,
          height: 78 * 0.3,
          isAlive: true,
        });
      }
    }
  },

  start() {
    this.init();
    this.load();
    this.create();
    this.run();
  },

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(
      this.sprites.platform,
      this.platform.x,
      this.platform.y,
      this.platform.width,
      this.platform.height
    );
    this.ctx.drawImage(
      this.sprites.ball,
      this.ball.width * this.ball.frame,
      0,
      this.ball.width,
      this.ball.height,
      this.ball.x,
      this.ball.y,
      // як намалювати
      this.ball.width,
      this.ball.height
    );
    this.blocks.forEach((e) => {
      if (e.isAlive) {
        this.ctx.drawImage(this.sprites.block, e.x, e.y, e.width, e.height);
      }
    }, this);
  },

  update() {
    //тут шукай
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
    }
    if (this.platform.dx) {
      this.platform.move();
    }
    if (this.ball.dx || this.ball.dy) {
      this.ball.move();
    }
    this.blocks.forEach((el) => {
      if (el.isAlive) {
        if (this.ball.collide(el)) {
          this.ball.bumpBlock(el);
        }
      }
    }, this);

    this.ball.checkBounds();
  },

  run() {
    this.update();
    this.render();

    if (this.running) {
      window.requestAnimationFrame(() => {
        game.run();
      });
    }
  },

  over(message) {
    alert(message);
    this.running = false;
    window.location.reload();
  },
};

game.ball = {
  frame: 0,
//   width: 28,
  x: 430,
  y: 281,
  width: 28,
  height: 28,
  dx: 0,
  dy: 0,
  velocity: 3,
  jump() {
    this.dx = -this.velocity;
    this.dy = -this.velocity;
    this.animation();
  },
  animation() {
    setInterval(function(){
        ++game.ball.frame;
        if (game.ball.frame > 3 ){
            game.ball.frame = 0;
    }}, 100);
  },

  move() {
    this.x += this.dx;
    this.y += this.dy;
  },
  collide(el) {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    if (
      x + this.width > el.x &&
      x < el.x + el.width &&
      y + this.height > el.y &&
      y < el.y + el.height
    ) {
      return true;
    }
    return false;
  },
  bumpBlock(block) {
    this.dy *= -1;
    block.isAlive = false;
    ++game.score;
    if (game.score >= game.blocks.length) {
      game.over("You win!");
    }
  },
  onTheLeftSide(platform) {
    return this.x + this.width / 2 < platform.x + platform.width / 2;
  },
  bumpPlatform(platform) {
    this.dy = -this.velocity;
    this.dx = this.onTheLeftSide(platform) ? -this.velocity : this.velocity;
  },
  checkBounds() {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    if (x < 0) {
      this.x = 0;
      this.dx = this.velocity;
    } else if (x + this.width > game.width) {
      this.x = game.width - this.width;
      this.dx = -this.velocity;
    } else if (y < 0) {
      this.y = 0;
      this.dy = this.velocity;
    } else if (y + this.height > game.height) {
      game.over("Game over");
    }
  },
};

game.platform = {
  x: 393,
  y: 309,
  width: 108,
  height: 23,
  velocity: 6,
  dx: 0,
  ball: game.ball,

  move() {
    this.x += this.dx;
    if (this.ball) {
      this.ball.x += this.dx;
    }
  },
  stop() {
    this.dx = 0;
    if (this.ball) {
      this.ball.dx = 0;
    }
  },
  releaseBall() {
    if (this.ball) {
      this.ball.jump();
      this.ball = false;
    }
  },
};

window.addEventListener("load", game.start.bind(game));
