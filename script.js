const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let level = 1;
canvas.width = 500;
canvas.height = 700;
const titleImage = new Image();
titleImage.src = "assets/images/titleImage.png";
const lvlOneImage = new Image();
lvlOneImage.src = "assets/images/lvloneimage.png";
const lvlTwoImage = new Image();
lvlTwoImage.src = "assets/images/titleImage.png";
const lvlThreeImage = new Image();
lvlThreeImage.src = "assets/images/titleImage.png";
const loseImage = new Image();
loseImage.src = "assets/images/titleImage.png";
const winImage = new Image();
winImage.src = "assets/images/titleImage.png";
let backgroundImage = titleImage;
titleImage.onload = () => {
    drawBackground();
};
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}
function getFramesForState(enemy, color, state) {
    const frameCounts = {
        walk: 2,
        pull: 8,
        stand: 2,
        shot: 9,
        // Add more states if needed
    };
    const frameCount = frameCounts[state] || 1; // Default to 1 frame if state is unknown
    return Array.from({ length: frameCount }, (_, i) => {
        const img = new Image();
        img.src = `assets/images/civs/${enemy}${color}${state}${i + 1}.png`;
        return img;
    });
}
const targets = [];
let score = 0;
function spawnTarget() {
    const x = Math.random() * (canvas.width - 50);
    const y = Math.random() * (canvas.height - 50);
    const speedX = Math.random() > 0.5 ? 1 : -1;
    const enemy = Math.random() > 0.5;
    const state = "walk"; // Default state (change this based on game logic)
    const stateChangeTime = performance.now() + 2000;
    const colors = ["green"];
    const color = colors[Math.floor(Math.random() * colors.length)]; // Pick a random color
    const frames = getFramesForState(enemy, color, state);
    const newTarget = {
        x,
        y,
        speedX,
        imageIndex: 0,
        frames, // Assign frames for this state
        spawnTime: performance.now(),
        shotTime: 0,
        enemy,
        state,
        stateChangeTime,
        color,
    };
    targets.push(newTarget);
}
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        if (mouseX >= target.x && mouseX <= target.x + 50 &&
            mouseY >= target.y && mouseY <= target.y + 50 &&
            target.state !== "shot" && target.enemy) {
            target.shotTime = performance.now();
            target.state = "shot";
            target.frames = getFramesForState(target.enemy, target.color, "shot"); // Update frames to shot animation
            target.imageIndex = 0; // Reset frame index for animation
            score += 100;
            console.log("Score:", score);
            break;
        }
        if (mouseX >= target.x && mouseX <= target.x + 50 &&
            mouseY >= target.y && mouseY <= target.y + 50 &&
            target.state !== "shot" && !target.enemy) {
            target.shotTime = performance.now();
            target.state = "shot";
            target.frames = getFramesForState(target.enemy, target.color, "shot"); // Update frames to shot animation
            target.imageIndex = 0; // Reset frame index for animation
            score -= 100;
            console.log("Score:", score);
            break;
        }
    }
});
function update() {
    const currentTime = performance.now();
    targets.forEach((target, index) => {
        target.x += target.speedX;
        // Check if the target should change its state
        if (currentTime >= target.stateChangeTime) {
            // Switch state: walking -> standing or vice versa
            if (target.state === "walk") {
                target.state = "stand"; // Change to standing state
                target.speedX = 0;
                target.frames = getFramesForState(target.enemy, target.color, "stand"); // Update frames for standing
                target.stateChangeTime = currentTime + 2000; // Set next state change time (2 seconds later)
            }
            else if (target.state === "stand" || target.state === "pull") {
                target.state = Math.random() > 0.7 ? "walk" : "pull";
                if (target.state === "walk") {
                    target.speedX = Math.random() > 0.5 ? 1 : -1;
                    target.frames = getFramesForState(target.enemy, target.color, "walk"); // Update frames for walking
                    target.stateChangeTime = currentTime + 2000; // Set next state change time (2 seconds later)
                }
                else if (target.state === "pull") {
                    target.frames = getFramesForState(target.enemy, target.color, "pull"); // Update frames for walking
                    target.stateChangeTime = currentTime + 2000; // Set next state change time (2 seconds later)
                }
            }
        }
        // if they are not an enemy they we dissappear after 20 seconds
        if (!target.enemy) {
            if (performance.now() - target.spawnTime > 20000) {
                targets.splice(index, 1);
            }
        }
        if (target.state === "shot") {
            // Cycle through shot animation frames
            target.speedX = 0;
            const frameDuration = 100; // 100ms per frame
            const frameIndex = Math.floor((currentTime - target.shotTime) / frameDuration);
            if (frameIndex < target.frames.length) {
                target.imageIndex = frameIndex;
            }
            else {
                // Remove target after animation completes
                targets.splice(index, 1);
            }
        }
        if (target.state === "pull") {
            target.speedX = 0;
            const frameDuration = 200;
            target.imageIndex = Math.floor((currentTime / frameDuration) % target.frames.length);
        }
        if (target.state === "stand") {
            target.speedX = 0;
            const frameDuration = 300;
            target.imageIndex = Math.floor((currentTime / frameDuration) % target.frames.length);
        }
        if (target.state === "walk") {
            // Cycle through walk animation frames
            const frameDuration = 100; // 200ms per frame
            target.imageIndex = Math.floor((currentTime / frameDuration) % target.frames.length);
        }
        if (target.x > canvas.width - 30) {
            target.speedX = -1;
        }
        else if (target.x < 30) {
            target.speedX = 1;
        }
    });
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    targets.forEach((target) => {
        ctx.drawImage(target.frames[target.imageIndex], target.x, target.y, 50, 50);
    });
    ctx.fillStyle = "white";
    ctx.font = "30px impact";
    ctx.fillText(`Score: ${score}`, 10, 30);
}
function drawBG() {
    // title screen
    if (level === 0) {
        backgroundImage = titleImage;
    }
    // level 1
    if (level === 1) {
        backgroundImage = lvlOneImage;
        // Spawn new targets every second
        if (Math.random() < 0.02) {
            if (targets.length < 10) {
                spawnTarget();
            }
        }
    }
    // level 2
    if (level === 2) {
        backgroundImage = lvlTwoImage;
    }
    // level 3
    if (level === 3) {
        backgroundImage = lvlThreeImage;
    }
    // Lose screen
    if (level === 4) {
        backgroundImage = loseImage;
    }
    // Win Screen
    if (level === 5) {
        backgroundImage = winImage;
    }
}
function gameLoop() {
    update();
    drawBG();
    draw();
    requestAnimationFrame(gameLoop);
}
// Start game loop
gameLoop();
