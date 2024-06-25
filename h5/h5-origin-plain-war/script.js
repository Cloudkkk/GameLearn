// script.js

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const gameTitle = document.getElementById('gameTitle');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
    bullets: [],
    hp: 3,
    maxHp: 3,
    score: 0
};

const enemies = [];
let boss = null;

const keys = {
    right: false,
    left: false,
    up: false,
    down: false,
    space: false
};

function drawPlayer() {
    context.fillStyle = 'white';
    context.fillRect(player.x, player.y, player.width, player.height);

    // Draw player health bar
    context.fillStyle = 'green';
    context.fillRect(player.x, player.y - 10, (player.hp / player.maxHp) * player.width, 5);
}

function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos() {
    player.x += player.dx;
    player.y += player.dy;

    // Detect walls
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    if (player.y < 0) {
        player.y = 0;
    }

    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

function moveRight() {
    player.dx = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function moveUp() {
    player.dy = -player.speed;
}

function moveDown() {
    player.dy = player.speed;
}

function shoot() {
    player.bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        speed: 7
    });
}

function drawBullets() {
    player.bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        context.fillStyle = 'white';
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Remove bullet if it goes off-screen
        if (bullet.y < 0) {
            player.bullets.splice(index, 1);
        }
    });
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        context.fillStyle = enemy.color;
        context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Draw enemy health bar
        context.fillStyle = 'red';
        context.fillRect(enemy.x, enemy.y - 10, (enemy.hp / enemy.maxHp) * enemy.width, 5);

        // Remove enemy if it goes off-screen
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
}

function spawnEnemy() {
    const x = Math.random() * (canvas.width - 50);
    const strength = Math.floor(Math.random() * 3);
    let enemy;

    if (strength === 0) {
        enemy = {
            x: x,
            y: 0,
            width: 30,
            height: 30,
            speed: 2,
            color: 'green',
            hp: 1,
            maxHp: 1
        };
    } else if (strength === 1) {
        enemy = {
            x: x,
            y: 0,
            width: 40,
            height: 40,
            speed: 1.5,
            color: 'yellow',
            hp: 2,
            maxHp: 2
        };
    } else {
        enemy = {
            x: x,
            y: 0,
            width: 50,
            height: 50,
            speed: 1,
            color: 'red',
            hp: 3,
            maxHp: 3
        };
    }

    enemies.push(enemy);
}

function spawnBoss() {
    const x = canvas.width / 2 - 100;
    boss = {
        x: x,
        y: 0,
        width: 200,
        height: 200,
        speed: 1,
        color: 'purple',
        hp: 50,
        maxHp: 50,
        bullets: []
    };
}

function drawBoss() {
    if (boss) {
        boss.y += boss.speed;
        context.fillStyle = boss.color;
        context.fillRect(boss.x, boss.y, boss.width, boss.height);

        // Draw boss health bar
        context.fillStyle = 'red';
        context.fillRect(50, canvas.height - 30, (boss.hp / boss.maxHp) * (canvas.width - 100), 20);

        // Remove boss if it goes off-screen
        if (boss.y > canvas.height) {
            boss = null;
        }
    }
}

function bossShoot() {
    if (boss) {
        boss.bullets.push({
            x: boss.x + boss.width / 2 - 5,
            y: boss.y + boss.height,
            width: 10,
            height: 20,
            speed: 5
        });
    }
}

function drawBossBullets() {
    if (boss) {
        boss.bullets.forEach((bullet, index) => {
            bullet.y += bullet.speed;
            context.fillStyle = 'yellow';
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            // Remove bullet if it goes off-screen
            if (bullet.y > canvas.height) {
                boss.bullets.splice(index, 1);
            }
        });
    }
}

function checkCollision() {
    player.bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // Collision detected
                enemy.hp -= 1;
                player.bullets.splice(bIndex, 1);

                if (enemy.hp <= 0) {
                    player.score += enemy.maxHp * 10; // Increase score based on enemy strength
                    enemies.splice(eIndex, 1);
                }
            }
        });

        if (boss) {
            if (
                bullet.x < boss.x + boss.width &&
                bullet.x + bullet.width > boss.x &&
                bullet.y < boss.y + boss.height &&
                bullet.y + bullet.height > boss.y
            ) {
                // Collision detected
                boss.hp -= 1;
                player.bullets.splice(bIndex, 1);

                if (boss.hp <= 0) {
                    player.score += boss.maxHp * 10; // Increase score based on boss strength
                    boss = null;
                }
            }
        }
    });

    enemies.forEach((enemy, eIndex) => {
        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y
        ) {
            // Enemy hits player
            player.hp -= 1;
            enemies.splice(eIndex, 1);

            if (player.hp <= 0) {
                alert('Game Over! Your score: ' + player.score);
                document.location.reload();
            }
        }
    });

    if (boss) {
        boss.bullets.forEach((bullet, index) => {
            if (
                bullet.x < player.x + player.width &&
                bullet.x + bullet.width > player.x &&
                bullet.y < player.y + player.height &&
                bullet.y + bullet.height > player.y
            ) {
                // Boss bullet hits player
                player.hp -= 1;
                boss.bullets.splice(index, 1);

                if (player.hp <= 0) {
                    alert('Game Over! Your score: ' + player.score);
                    document.location.reload();
                }
            }
        });

        if (
            boss.x < player.x + player.width &&
            boss.x + boss.width > player.x &&
            boss.y < player.y + player.height &&
            boss.y + boss.height > player.y
        ) {
            // Boss hits player
            player.hp -= 1;
            boss = null;

            if (player.hp <= 0) {
                alert('Game Over! Your score: ' + player.score);
                document.location.reload();
            }
        }
    }
}

function drawScore() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText('Score: ' + player.score, 10, 30);
}

function update() {
    clear();

    drawPlayer();
    drawBullets();
    drawEnemies();
    drawBoss();
    drawBossBullets();
    checkCollision();
    drawScore();

    newPos();
    requestAnimationFrame(update);
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        moveLeft();
    } else if (e.key === 'ArrowUp' || e.key === 'Up') {
        moveUp();
    } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        moveDown();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        shoot();
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left' ||
        e.key === 'ArrowUp' ||
        e.key === 'Up' ||
        e.key === 'ArrowDown' ||
        e.key === 'Down'
    ) {
        player.dx = 0;
        player.dy = 0;
    }
}
function startGame() {
    startButton.style.display = 'none';
    gameTitle.style.display = 'none';
    canvas.style.display = 'block';

    // Set interval to spawn regular enemies
    setInterval(spawnEnemy, 1200);

    // Set interval to spawn Boss enemies
    setInterval(spawnBoss, 8000); // 每30秒生成一个Boss

    // Set interval for the boss to shoot
    setInterval(bossShoot, 2000); // Boss每2秒射击一次

    // Start the game loop
    update();
}

startButton.addEventListener('click', startGame);
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
