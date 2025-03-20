const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const loseMessages = ["Oops...", "This is bad...", "Aw... Shit!", "Dr. Jakinov has beat us!", "Well, that sucks.", "They blew us!"]

const lvl1timer = 60000;
const lvl2timer = 120000;
const lvl3timer = 180000;


let level = 0;
let bombTimer = 20000;
let inGame = false;
let exploding = false;
let canClick = false;
let cleared = false;
let timer = 30000;
let startTimer = 30000;
let timeLeft = 45;
let nextLevel = 1;
let waited = false;
let wait = 3000;
let current = 3000;
let civShot = 0;
let nutShot = 0;
let score = 0;

canvas.width = 500;
canvas.height = 700;
let lostText = loseMessages[Math.floor(Math.random() * loseMessages.length)]

const winSound = new Audio("assets/audio/win.mp3");
const loseSound = new Audio("assets/audio/lose.mp3");
const menuMusic = new Audio("assets/audio/menu.mp3");
const missionMusic1 = new Audio("assets/audio/mission1.mp3");
const missionMusic2 = new Audio("assets/audio/mission2.mp3");
const missionMusic3 = new Audio("assets/audio/mission3.mp3");
const shootSound = new Audio("assets/audio/shoot.mp3");
const hitSound = new Audio("assets/audio/ouch.mp3");
const alertSound = new Audio("assets/audio/alert.mp3");
const bombDet = new Audio("assets/audio/bombDet.mp3");
const cutsceneMusic = new Audio("assets/audio/cut.mp3");
const clearedSound = new Audio("assets/audio/cleared.mp3");
const buttonSound = new Audio("assets/audio/buttonSound.mp3");

interface Target {
    x: number;
    y: number;
    speedX: number;
    imageIndex: number;
    frames: HTMLImageElement[];
    spawnTime: number;
    enemy: boolean; // true or false
    state: string; // walk, pull, shot, stand
    shotTime: number;
    stateChangeTime: number;
    color: string;
    countDown: number;
}

interface Button {
    x: number;
    y: number;
    type: string;
    image: HTMLImageElement;
}

const titleImage = new Image();
titleImage.src = "assets/images/cutscenes/title.png";
const lvlOneImage = new Image();
lvlOneImage.src = "assets/images/maps/lvlone.jpg";
const lvlTwoImage = new Image();
lvlTwoImage.src = "assets/images/maps/lvltwo.jpg";
const lvlThreeImage = new Image();
lvlThreeImage.src = "assets/images/maps/lvlthree.jpg";
const loseImage = new Image();
loseImage.src = "assets/images/cutscenes/lose.png";
const winImage = new Image();
winImage.src = "assets/images/cutscenes/win.png";
const cS10 = new Image();
cS10.src = "assets/images/cutscenes/cs10.png";
const cS11 = new Image();
cS11.src = "assets/images/cutscenes/cs11.png";
const cS21 = new Image();
cS21.src = "assets/images/cutscenes/cs21.png";
const cS22 = new Image();
cS22.src = "assets/images/cutscenes/cs22.png";
const cS31 = new Image();
cS31.src = "assets/images/cutscenes/cs31.png";
const cS32 = new Image();
cS32.src = "assets/images/cutscenes/cs32.png";
const cS41 = new Image();
cS41.src = "assets/images/cutscenes/cs41.png";
const credits = new Image();
credits.src = "assets/images/cutscenes/credits.png";
const howTo = new Image();
howTo.src = "assets/images/cutscenes/howto.png";

const startBtn = new Image();
startBtn.src = "assets/images/ui/startBtn.jpg"
const howToBtn = new Image();
howToBtn.src = "assets/images/ui/howToBtn.jpg"
const creditsBtn = new Image();
creditsBtn.src = "assets/images/ui/creditsBtn.jpg"
const nextBtn = new Image();
nextBtn.src = "assets/images/ui/nextBtn.jpg"
const backBtn = new Image();
backBtn.src = "assets/images/ui/backBtn.jpg"

const logo1 = new Image();
logo1.src = "assets/images/cutscenes/titleText1.png"
const logo2 = new Image();
logo2.src = "assets/images/cutscenes/titleText2.png"

let backgroundImage = titleImage;

titleImage.onload = () => {
    drawBackground();
};

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function getFramesForState(enemy: boolean, color: string, state: string): HTMLImageElement[] {
    const frameCounts: { [key: string]: number } = {
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

const targets: Target[] = [];
const buttons: Button[] = [];

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
    const countDown = performance.now() + 6000; // 20 seconds from spawn time
    const newTarget: Target = {
        x,
        y,
        speedX,
        imageIndex: 0,
        frames,  // Assign frames for this state
        spawnTime: performance.now(),
        shotTime: 0,
        enemy,
        state,
        stateChangeTime,
        color,
        countDown,
    };

    targets.push(newTarget);
}

const logo = {
    x: 30,
    y: -150, // Start above canvas
    targetY: 150, // Stop position
    imageIndex: 0,
    speedY: 3, // Speed of downward movement
    frames: [logo1, logo2], // Array to store images
    currentFrame: logo1,
};

// Switch logo every 500ms
setInterval(() => {
    logo.imageIndex = (logo.imageIndex + 1) % 2;
    logo.currentFrame = logo.frames[logo.imageIndex];
  }, 200);
  
  function updateLogoPosition() {
    // Move the logo down until it reaches targetY
    if (logo.y < logo.targetY) {
      logo.y += logo.speedY;
      if (logo.y > logo.targetY) {
        logo.y = logo.targetY;
      }
    }
  }
  
  function drawLogo() {
    ctx.drawImage(logo.currentFrame, logo.x, logo.y);
  }


const playButton: Button = {x:canvas.width/2 -50, y:600, type:"play", image: startBtn}
const howToButton: Button = {x:canvas.width/2 -200, y:600, type:"howto", image: howToBtn}
const creditsButton: Button = {x:canvas.width/2 + 100, y:600, type:"credits", image: creditsBtn}
const nextButton: Button = {x:canvas.width-105, y:645, type:"next", image:nextBtn}
const backButton: Button = {x:canvas.width-105, y:645, type:"back", image:backBtn}

function handleClickOrTouch(event) {
    event.preventDefault(); // Prevents unwanted scrolling on mobile

    const rect = canvas.getBoundingClientRect();
    let mouseX, mouseY;

    if (event.type === "touchstart") {
        mouseX = (event.touches[0].clientX - rect.left) * (canvas.width / rect.width);
        mouseY = (event.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    } else {
        mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
        mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
    }

    switch (level) {
        case 0: // title
        if (mouseX >= playButton.x && mouseX <= playButton.x + 100 &&
            mouseY >= playButton.y && mouseY <= playButton.y + 50) {
                buttonSound.play();
                menuMusic.pause();
                backgroundImage = cS10;
                level = 10;
                cutsceneMusic.play();
                addNextButton();
        }

        if (mouseX >= howToButton.x && mouseX <= howToButton.x + 100 &&
            mouseY >= howToButton.y && mouseY <= howToButton.y + 50) {
                buttonSound.play();
                backgroundImage = howTo;
                level = 14;
                addbackButton();
        }

        if (mouseX >= creditsButton.x && mouseX <= creditsButton.x + 100 &&
            mouseY >= creditsButton.y && mouseY <= creditsButton.y + 50) {
                buttonSound.play();
                backgroundImage = credits;
                level = 15;
                addbackButton();
        }
        break;
        

        case 10: // 1st cs
        if (mouseX >= nextButton.x && mouseX <= nextButton.x + 100 &&
            mouseY >= nextButton.y && mouseY <= nextButton.y + 50) {
                buttonSound.play();
                menuMusic.pause();
                backgroundImage = cS11;
                level = 11;
                cutsceneMusic.play();
            }
            break;

        case 11: // 
        if (mouseX >= nextButton.x && mouseX <= nextButton.x + 100 &&
            mouseY >= nextButton.y && mouseY <= nextButton.y + 50) {
                buttonSound.play();
                timer = lvl1timer;
                startTimer = performance.now();
                cutsceneMusic.pause();
                cleared = false;
                level = 1;
                buttons.length = 0;
            }
            break;

        case 1: // lvl 1
            if (waited) {
                missionMusic1.pause();
                addNextButton();
            }

            if (mouseX >= nextButton.x && mouseX <= nextButton.x + 100 &&
                mouseY >= nextButton.y && mouseY <= nextButton.y + 50 &&
                buttons.length > 0) {
                    buttonSound.play();
                    cutsceneMusic.play();
                    backgroundImage = cS21;
                    level = 20;
                    targets.length = 0;
                    inGame = false;
                    waited = false;
                    addNextButton();
                }
            break;


        case 20: // 2nd cs
        if (mouseX >= nextButton.x && mouseX <= nextButton.x + 100 &&
            mouseY >= nextButton.y && mouseY <= nextButton.y + 50) {
                buttonSound.play();
                cleared = false;
                level = 21;
                startTimer = performance.now();
                backgroundImage = cS22;
                addNextButton();
        }
            break;

        case 21: // 2nd cs
        if (mouseX >= nextButton.x && mouseX <= nextButton.x + 100 &&
            mouseY >= nextButton.y && mouseY <= nextButton.y + 50) {
                buttonSound.play();
                cutsceneMusic.pause();
                level = 2;
                timer = lvl2timer;
                startTimer = performance.now();
                backgroundImage = lvlTwoImage;
                buttons.length = 0;
        }
            break;


        case 2: // lvl 2
        if (waited) {
            missionMusic2.pause();
            addNextButton();
        }

        if (mouseX >= nextButton.x && mouseX <= nextButton.x + 100 &&
            mouseY >= nextButton.y && mouseY <= nextButton.y + 50 &&
            buttons.length > 0) {
                buttonSound.play();
                cutsceneMusic.play();
                backgroundImage = cS31;
                level = 31;
                targets.length = 0;
                inGame = false;
                waited = false;
                cleared = false;
                addNextButton();
        }
            break;


        case 31: // 3rd cs
        if (mouseX >= nextButton.x && mouseX <= nextButton.x + 100 &&
            mouseY >= nextButton.y && mouseY <= nextButton.y + 50) {
                buttonSound.play();
                backgroundImage = cS32;
                level = 32;
                startTimer = performance.now();
                addNextButton();
            }

            break;

        case 32: // 3rd cs
        if (mouseX >= nextButton.x && mouseX <= nextButton.x + 100 &&
            mouseY >= nextButton.y && mouseY <= nextButton.y + 50) {
                buttonSound.play();
                cutsceneMusic.pause();
                backgroundImage = lvlThreeImage;
                level = 3;
                timer = lvl3timer;
                cleared = false;
                startTimer = performance.now();
                buttons.length = 0;
        }
            break;


        case 3: // lvl 3
        if (waited) {
            missionMusic3.pause();
            addNextButton();
        }

        if (mouseX >= nextButton.x && mouseX <= nextButton.x + 100 &&
            mouseY >= nextButton.y && mouseY <= nextButton.y + 50 &&
            buttons.length > 0) {
                buttonSound.play();
                cutsceneMusic.play();
                backgroundImage = cS41;
                level = 41;
                targets.length = 0;
                inGame = false;
                waited = false;
                addNextButton();
        }
        
            break;

        case 41: // 4th cs
        if (mouseX >= nextButton.x && mouseX <= nextButton.x + 100 &&
            mouseY >= nextButton.y && mouseY <= nextButton.y + 50) {
                buttonSound.play();
                cutsceneMusic.pause();
                winSound.play();
                backgroundImage = winImage;
                level = 5;
                targets.length = 0;
                addbackButton();
            }
            break;

        case 4: // lose

        if (mouseX >= backButton.x && mouseX <= backButton.x + 100 &&
            mouseY >= backButton.y && mouseY <= backButton.y + 50) {
                buttonSound.play();
                addtitleButtons();
                gameReset();
            }
            break;

        case 5: // win

        if (mouseX >= backButton.x && mouseX <= backButton.x + 100 &&
            mouseY >= backButton.y && mouseY <= backButton.y + 50) {
                buttonSound.play();
                addtitleButtons();
                winSound.pause();
                gameReset();
        }
            break;

        case 14: //howTo
        if (mouseX >= backButton.x && mouseX <= backButton.x + 100 &&
            mouseY >= backButton.y && mouseY <= backButton.y + 50) {
                buttonSound.play();
                addtitleButtons();
                level = 0;
        }
            break;


        case 15: //credits
        if (mouseX >= backButton.x && mouseX <= backButton.x + 100 &&
            mouseY >= backButton.y && mouseY <= backButton.y + 50) {
                buttonSound.play();
                addtitleButtons();
                level = 0;
        }
            break;
    }


    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        if (mouseX >= target.x && mouseX <= target.x + 50 &&
            mouseY >= target.y && mouseY <= target.y + 50 &&
            target.state !== "shot" && target.enemy) {
                target.shotTime = performance.now();
                target.enemy = false;
                target.state = "shot";
                target.frames = getFramesForState(target.enemy, target.color, "shot"); // Update frames to shot animation
                target.imageIndex = 0; // Reset frame index for animation
                score += 100;
                shootSound.play();
                console.log("Score:", score);
                nutShot++;
                break;
        }
        if (mouseX >= target.x && mouseX <= target.x + 50 &&
            mouseY >= target.y && mouseY <= target.y + 50 &&
            target.state !== "shot" && !target.enemy && !cleared) {
                target.shotTime = performance.now();
                target.state = "shot";
                target.frames = getFramesForState(target.enemy, target.color, "shot"); // Update frames to shot animation
                target.imageIndex = 0; // Reset frame index for animation
                score -= 100;
                shootSound.play();
                console.log("Score:", score);
                civShot++;
                break;
        }
    }
};

canvas.addEventListener("click", handleClickOrTouch);
canvas.addEventListener("touchstart", handleClickOrTouch);

function addNextButton() {
    buttons.length = 0;
    buttons.push(nextButton);
}

function addtitleButtons() {
    buttons.length = 0;
    buttons.push(playButton);
    buttons.push(creditsButton);
    buttons.push(howToButton);
}

function addbackButton() {
    buttons.length = 0;
    buttons.push(backButton);
}


function gameReset() {
    level = 0;
    score = 0;
    civShot = 0;
    nutShot = 0;
    lostText = loseMessages[Math.floor(Math.random() * loseMessages.length)]
    loseSound.pause();
    bombDet.pause();
}

function detonation() {
    exploding = true;
    targets.length = 0;

    bombDet.play();

    let fadeTime = 2000;
    let explosionTime = performance.now();


    function fadeToWhite() {
        let elapsedTime = performance.now() - explosionTime;
        let alpha = Math.min(elapsedTime / fadeTime, 1); // Gradually increase alpha from 0 to 1

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(0,0,canvas.width, canvas.height);

        if (alpha < 1 && exploding) {
            missionMusic1.pause();
            missionMusic2.pause();
            missionMusic3.pause();
            requestAnimationFrame(fadeToWhite);
        }
        else {
            backgroundImage = loseImage;
            exploding = false;
            addbackButton();
            level = 4;
        }
    }
    fadeToWhite();
}

function clearStage() {
    clearedSound.play()
    cleared = true;
    waited = false;
    wait = 2000;
    current = performance.now();

}


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
            } else if (target.state === "stand" || target.state === "pull") {
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

        if (cleared) {
            target.enemy = false;
        }

        if (target.enemy) {
            // the imminemt alert will go off 5 secs before the bombtimer reaches zero
            if (performance.now() - target.spawnTime > (bombTimer - 5000)) {
                ctx.font = "40px Impact";
                
                // Alternate between red and white every 500ms
                if (Math.floor(performance.now() / 500) % 2 === 0) {
                    ctx.fillStyle = "red";
                } else {
                    ctx.fillStyle = "white";
                }
                alertSound.play();
                ctx.fillText("Detonation Imminent!", 50, canvas.height / 2);
            }
            if (performance.now() - target.spawnTime > bombTimer){
                detonation();
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
            } else {
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

function drawTimer() {
    timeLeft =  Math.floor((startTimer - performance.now() + timer) / 1000);
    ctx.fillStyle = "white";
    ctx.font = "30px impact";
    ctx.fillText(`Defuse: ${timeLeft}`, canvas.width / 2 - 50, 30);
}

function drawButtons() {
    buttons.forEach((button) => {
        ctx.drawImage(button.image, button.x, button.y)
    });
}


function draw() {
    targets.forEach((target) => {
        ctx.drawImage(target.frames[target.imageIndex], target.x, target.y, 50, 50);
    });
    ctx.fillStyle = "white";
    ctx.font = "30px impact";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawText() {

    if (waited) {
        ctx.fillStyle = "white";
        ctx.font = "60px impact";
        buttons.push(nextButton);
    }

    if (cleared && inGame) {

        ctx.fillStyle = "white";
        ctx.font = "60px impact";
        ctx.fillText("Stage Cleared!", 50, canvas.height / 2 - 100);
    }
    if (level === 4) {
        ctx.fillStyle = "white";
        ctx.font = "32px impact";
        ctx.fillText(`${lostText}`, canvas.width / 3, canvas.height / 2);
        ctx.fillText(`Your score: ${score}`, canvas.width / 3, canvas.height / 2 + 100);
    }
    if (level === 5) {
        let wonText1 = "";
        let wonText2 = "";
        let wonText3 = "";
        let rank = "";
        if (score < 99) {
            rank = "PIECE OF SHIT";
            wonText1 = `You shot a lotta innocents,`;
            wonText2 = `but dammit, you got the job done!`;
        }

        if (score > 99 && score < 4999) {
            rank = "PRIVATE NUTBUSTER";
            wonText1 = `Nice work Major!`;
            wonText2 = `You can bust a`;
            wonText3 = `nut for me anyday!`
        }
        if (score > 5000 && score < 9999) {
            rank = "MASTER NUTBUSTER";
            wonText1 = `Dr. Jakinov will think twice`;
            wonText2 = `before he tries to blow us again!`;
            wonText3 = `Good job busting those nuts!`;
        }
        if (score > 10000) {
            rank = "5-BROWNSTAR NUTBUSTER";
            wonText1 = `You saved freedom!`;
            wonText2 = `I promote you to`;
            wonText3 = `Major Fattygay!`
        }
        
        ctx.fillStyle = "white";
        ctx.font = "28px impact";
        ctx.fillText(`CONGRATULATION!!!`, 50, 100);
        ctx.fillText(`${wonText1}`, 50, 150);
        ctx.fillText(`${wonText2}`, 50, 200);
        ctx.fillText(`${wonText3}`, 50, 250);
        ctx.fillText(`STATS`, 50, canvas.height / 2 - 50);
        ctx.fillText(`Nuts Busted: ${nutShot}`, 50, canvas.height / 2);
        ctx.fillText(`Civs Busted: ${civShot}`, 50, canvas.height / 2 + 50);
        ctx.fillText(`Total Score: ${score}`, 50, canvas.height / 2 + 100);
        ctx.fillText(`Rank: ${rank}`, 50, canvas.height / 2 + 150);
    }
}

function checkCleared() {
    if (performance.now() > current + wait && cleared) {
        waited = true;
    }
}

function updateLevel() {
    // menu screen
    if (level === 0) {
        buttons.push(creditsButton);
        buttons.push(howToButton);
        buttons.push(playButton);
        inGame = false;
        backgroundImage = titleImage;
        menuMusic.play();
    }

    // level 1
    if (level === 1) {
        inGame = true;
        backgroundImage = lvlOneImage;
        missionMusic1.play();
        bombTimer = 20000;

        if (timeLeft === 0) {
            missionMusic1.pause();

            clearStage();
        }

        // Spawn new targets every second
        if (Math.random() < 0.02 && !exploding) {
            if (targets.length < 10) {
                spawnTarget();
            }
        }

    }

    // level 2
    if (level === 2) {
        inGame = true;
        backgroundImage = lvlTwoImage;
        missionMusic2.play();
        bombTimer = 20000;

        if (timeLeft === 0) {
            missionMusic2.pause();
            clearStage();
        }

        // Spawn new targets every second
        if (Math.random() < 0.02 && !exploding) {
            if (targets.length < 15) {
                spawnTarget();
            }
        }
    }


    // level 3
    if (level === 3) {
        inGame = true;
        backgroundImage = lvlThreeImage;
        missionMusic3.play();
        bombTimer = 20000;

        if (timeLeft === 0) {
            missionMusic3.pause();
            clearStage();
        }

        // Spawn new targets every second
        if (Math.random() < 0.02 && !exploding) {
            if (targets.length < 20) {
                spawnTarget();
            }
        }
    }

    // Lose screen
    if (level === 4) {
        inGame = false;
        backgroundImage = loseImage;
        missionMusic1.pause();
        missionMusic2.pause();
        missionMusic3.pause();
        loseSound.play();
    }

    // Win Screen
    if (level === 5) {
        inGame = false;
        backgroundImage = winImage;
        missionMusic3.pause();
        winSound.play();
    }
}

function gameLoop() {
    updateLevel();
    if (!exploding){
        drawBackground();
    }
    if (inGame) {
        checkCleared();
        draw();
        drawTimer();
    }
    drawText();
    drawButtons();
    if (level === 0) {
        updateLogoPosition();
        drawLogo();
    }
    update();

    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
