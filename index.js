// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 1000;
document.body.appendChild(canvas);

// Game variables
var gameOver = false;
var monstersCaught = 0;
var maxMonsters = 15;
var scoreText = "Space Stations Destroyed: ";

// Timer variables
var timer = 30; // 30 seconds
var timerText = "Time Remaining: ";

// Load images with Promise handling
var imageLoadPromises = [];

var backgroundImage = new Image();
imageLoadPromises.push(new Promise((resolve, reject) => {
    backgroundImage.onload = resolve;
    backgroundImage.onerror = reject;
    backgroundImage.src = "images/space.png";
}));

var heroImage = new Image();
imageLoadPromises.push(new Promise((resolve, reject) => {
    heroImage.onload = resolve;
    heroImage.onerror = reject;
    heroImage.src = "images/hero.png";
}));

var bulletImage = new Image();
imageLoadPromises.push(new Promise((resolve, reject) => {
    bulletImage.onload = resolve;
    bulletImage.onerror = reject;
    bulletImage.src = "images/bullet.png";
}));

var monsterImage = new Image();
imageLoadPromises.push(new Promise((resolve, reject) => {
    monsterImage.onload = resolve;
    monsterImage.onerror = reject;
    monsterImage.src = "images/airship.png";
}));

var blockImage = new Image();
imageLoadPromises.push(new Promise((resolve, reject) => {
    blockImage.onload = resolve;
    blockImage.onerror = reject;
    blockImage.src = "images/obstacle.png";
}));

// Create audio elements
var shootSound = new Audio('sounds/gun.mp3');
var hitSound = new Audio('sounds/explosion.mp3');
var gameoverSound = new Audio('sounds/gameover.wav');



var blocks = [
	{ x: Math.random() * (canvas.width - 32), y: Math.random() * (canvas.height - 32) },
	{ x: Math.random() * (canvas.width - 32), y: Math.random() * (canvas.height - 32) },
	{ x: Math.random() * (canvas.width - 32), y: Math.random() * (canvas.height - 32) },
	{ x: Math.random() * (canvas.width - 32), y: Math.random() * (canvas.height - 32) }
];

// Game objects
var hero = {
	speed: 256, // movement in pixels per second
	x: 0,
	y: 0
};

var bullets = [];

var monster = {
	x: 0,
	y: 0
};

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
    if(e.keyCode == 82 && gameOver) { // 'R' key code is 82
        restartGame();
    }
}, false);


// Reset the game when the player catches a monster or reaches the maximum number of monsters
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	bullets = [];

	// Place the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 150));
	monster.y = 32 + (Math.random() * (canvas.height - 148));

	gameOver = false;
	timer = 30; // Reset timer

	gameoverSound.pause();
    gameoverSound.currentTime = 0;
	
};

var restartGame = function() {
    // Reset game state
    gameOver = false;
    monstersCaught = 0;
    timer = 30;
    hero.x = canvas.width / 2;
    hero.y = canvas.height / 2;
    monster.x = 32 + (Math.random() * (canvas.width - 150));
    monster.y = 32 + (Math.random() * (canvas.height - 148));
    bullets = [];
    blocks = [
        { x: Math.random() * (canvas.width - 32), y: Math.random() * (canvas.height - 32) },
        { x: Math.random() * (canvas.width - 32), y: Math.random() * (canvas.height - 32) },
        { x: Math.random() * (canvas.width - 32), y: Math.random() * (canvas.height - 32) },
        { x: Math.random() * (canvas.width - 32), y: Math.random() * (canvas.height - 32) }
    ];

}

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Update game objects
var update = function (modifier) {
	if (38 in keysDown) { // Player holding up
		hero.y -= hero.speed * modifier;
		if (hero.y < 32) {
			hero.y = 32;
		}
	}
	if (40 in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
		if (hero.y > canvas.height - 81) {
			hero.y = canvas.height - 81;
		}
	}
	if (37 in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
		if (hero.x < 21) {
			hero.x = 21;
		}
	}
	if (39 in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
		if (hero.x > canvas.width - (32 + 55)) {
			hero.x = canvas.width - (32 + 55);
		}
	}

	// Shoot bullet (space bar)
	if (32 in keysDown) {
		keysDown[32] = false; // Reset the key to prevent rapid fire

		// Create a new bullet object
		var bullet = {
			x: hero.x + 12, // Adjust the position based on the hero's size
			y: hero.y,
			speed: 512 // Bullet's movement speed
		};

		bullets.push(bullet);
        shootSound.play();
	}

	// Update bullets' positions
	for (var i = 0; i < bullets.length; i++) {
		var bullet = bullets[i];
		bullet.y -= bullet.speed * modifier;

		// Remove bullet if it goes off the screen
		if (bullet.y < 0) {
			bullets.splice(i, 1);
			i--;
		}
	}

	// Are bullets hitting the monster?
	for (var i = 0; i < bullets.length; i++) {
		var bullet = bullets[i];

		if (
			bullet.x <= monster.x + 81 &&
			monster.x <= bullet.x + 5 &&
			bullet.y <= monster.y + 83 &&
			monster.y <= bullet.y + 10
		) {
			monstersCaught++;
			hitSound.play();

			if (monstersCaught === maxMonsters) {
				gameOver = true;
				gameoverSound.play()
			}

			bullets.splice(i, 1);
			i--;

			reset();
			break;
		}
	}

	// Decrement timer
	timer -= modifier;
	if (timer <= 0) {
		gameOver = true;
		timer = 0;
	}

	// Check for collision with blocks
	for (var i = 0; i < blocks.length; i++) {
	    if (
	        hero.x <= (blocks[i].x + 32)
	        && blocks[i].x <= (hero.x + 32)
	        && hero.y <= (blocks[i].y + 32)
	        && blocks[i].y <= (hero.y + 32)
	    ) {
	        gameOver = true;
	    }
	}

	
};

// Draw everything
var render = function () {
	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw background
	ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

	// Draw hero
	ctx.drawImage(heroImage, hero.x, hero.y, 32, 32);

	// Draw bullets
	for (var i = 0; i < bullets.length; i++) {
		ctx.drawImage(bulletImage, bullets[i].x, bullets[i].y, 5, 10);
	}

	// Draw monster
	ctx.drawImage(monsterImage, monster.x, monster.y, 32, 32);

	// Draw blocks
	for (var i = 0; i < blocks.length; i++) {
		ctx.drawImage(blockImage, blocks[i].x, blocks[i].y, 32, 32);
	}

	// Draw score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(scoreText + monstersCaught, 32, 32);

	// Draw timer
	ctx.fillText(timerText + timer.toFixed(2), 32, 64); // Display the timer

	// Draw game over message
	if (gameOver) {
		ctx.fillStyle = "rgb(255, 0, 0)";
		ctx.font = "48px Helvetica";
	    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
		gameoverSound.play();
		
	}
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Keep the game running even after it ends
	requestAnimationFrame(main);
};

// Let's play this game!

// Let's play this game!
var then = Date.now();
reset();
main();