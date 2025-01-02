// 캔버스 설정
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 게임 변수
let characterX = 50;
let characterY = canvas.height - 150;
const characterWidth = 50;
const characterHeight = 50;
let speed = 5;

let scrollOffset = 0;

// 점프 관련 변수
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.6;
const jumpStrength = 15;
const groundY = canvas.height - 150; // 캐릭터의 기본 Y 위치

// 물음표 박스 관련 변수
const boxes = [
    { x: 300, y: canvas.height - 250, showText: false, broken: false, breakProgress: 0 },
    { x: 800, y: canvas.height - 250, showText: false, broken: false, breakProgress: 0 },
    { x: 1500, y: canvas.height - 250, showText: false, broken: false, breakProgress: 0 },
    { x: 2200, y: canvas.height - 250, showText: false, broken: false, breakProgress: 0 }
];


// 자기소개 텍스트
const introTexts = [
    { x: 300, text: "안녕하세요! 저는 홍길동입니다." },
    { x: 800, text: "저는 프로그래밍을 좋아해요!" },
    { x: 1500, text: "취미는 독서와 게임입니다." },
    { x: 2200, text: "만나서 반가워요!" },
];

// 파티클 관련 변수
let particles = [];

// 키 입력 상태
let keys = {
    right: false,
    left: false,
};

// 키보드 이벤트 리스너
window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowRight") keys.right = true;
    if (e.code === "ArrowLeft") keys.left = true;
    if (e.code === "Space" && !isJumping) {
        isJumping = true;
        jumpVelocity = -jumpStrength;
    }
});

window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowRight") keys.right = false;
    if (e.code === "ArrowLeft") keys.left = false;
});

// 캐릭터 그리기 함수
function drawCharacter() {
    // 몸통
    ctx.fillStyle = "#FF6347"; // 빨간색 몸통
    ctx.fillRect(characterX, characterY, characterWidth, characterHeight);

    // 머리
    ctx.fillStyle = "#FFA07A"; // 살구색 머리
    ctx.beginPath();
    ctx.arc(characterX + characterWidth / 2, characterY - 15, 20, 0, Math.PI * 2);
    ctx.fill();

    // 눈
    ctx.fillStyle = "#000000"; // 검은색 눈
    ctx.beginPath();
    ctx.arc(characterX + characterWidth / 2 - 7, characterY - 20, 4, 0, Math.PI * 2);
    ctx.arc(characterX + characterWidth / 2 + 7, characterY - 20, 4, 0, Math.PI * 2);
    ctx.fill();

    // 입
    ctx.beginPath();
    ctx.arc(characterX + characterWidth / 2, characterY - 5, 8, 0, Math.PI);
    ctx.stroke();

    // 팔
    ctx.fillStyle = "#FF6347"; // 빨간색 팔
    ctx.fillRect(characterX - 10, characterY + 10, 10, 30); // 왼팔
    ctx.fillRect(characterX + characterWidth, characterY + 10, 10, 30); // 오른팔

    // 다리
    if (isJumping) {
        ctx.fillRect(characterX + 10, characterY + characterHeight, 10, 10); // 왼다리
        ctx.fillRect(characterX + characterWidth - 20, characterY + characterHeight, 10, 10); // 오른다리
    } else {
        ctx.fillRect(characterX + 10, characterY + characterHeight, 10, 20); // 왼다리
        ctx.fillRect(characterX + characterWidth - 20, characterY + characterHeight, 10, 20); // 오른다리
    }
}

// 배경 그리기 함수
function drawBackground() {
    // 벽
    ctx.fillStyle = "#F0F0F0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 바닥
    ctx.fillStyle = "#D2B48C";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // scrollOffset을 이용하여 요소들의 위치 조정
    const offset = -scrollOffset;

    // 창문 그리기
    drawWindows(offset);

    // 반복되는 요소들 그리기
    drawRepeatingElements(offset);
}

// 전역 변수로 구름 배열 추가
const clouds = [];

// 초기화 함수에서 구름 생성
function initClouds() {
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width * 3,
            y: Math.random() * (canvas.height / 2 - 100),
            width: Math.random() * 400 + 200,
            height: Math.random() * 100 + 50,
            speed: Math.random() * 0.2 + 0.05 // 속도를 더 느리게 조정
        });
    }
}

function drawWindows(offset) {
    const windowWidth = 300;
    const windowHeight = canvas.height / 2;
    const windowSpacing = 20;
    const totalWidth = windowWidth + windowSpacing;

    const repetitions = Math.ceil(canvas.width / totalWidth) + 1;

    for (let i = 0; i < repetitions; i++) {
        const x = i * totalWidth + offset % totalWidth;

        // 창문 프레임
        ctx.fillStyle = "#4A4A4A";
        ctx.fillRect(x, 50, windowWidth, windowHeight);

        // 창문 안 하늘 그리기
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 5, 55, windowWidth - 10, windowHeight - 10);
        ctx.clip();
        drawSky(x + 5, 55, windowWidth - 10, windowHeight - 10, offset);
        drawClouds(offset);
        ctx.restore();

        // 창문 테두리
        ctx.strokeStyle = "#6A6A6A";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 5, 55, windowWidth - 10, windowHeight - 10);
    }
}

function drawSky(x, y, width, height) {
    // 그라데이션으로 하늘 표현
    const skyGradient = ctx.createLinearGradient(x, y, x, y + height);
    skyGradient.addColorStop(0, "#87CEEB"); // 하늘색
    skyGradient.addColorStop(1, "#E0F6FF"); // 연한 하늘색
    ctx.fillStyle = skyGradient;
    ctx.fillRect(x, y, width, height);
}

function drawClouds(offset) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    clouds.forEach(cloud => {
        // 구름의 위치를 scrollOffset과 연동하여 움직임
        const cloudX = (cloud.x - offset * 0.3) % (canvas.width * 3);
        drawCloud(cloudX, cloud.y, cloud.width, cloud.height);
    });
}

function drawCloud(x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, y + height / 2);
    
    // 구름의 윤곽을 더 부드럽게 그리기
    for (let i = 0; i <= width; i += width / 20) {
        const yOffset = Math.sin(i / 50) * height / 6 + Math.random() * height / 10;
        ctx.lineTo(x + i, y + height / 2 + yOffset);
    }
    
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
}


function drawRepeatingElements(offset) {
    const repetitions = Math.ceil(canvas.width / 800) + 1;
    for (let i = 0; i < repetitions; i++) {
        const repOffset = offset + i * 800;
        
        // 책상
        drawDesk(100 + repOffset, canvas.height - 150);
        
        // 컴퓨터
        drawComputer(150 + repOffset, canvas.height - 200);
    }
}


function drawDesk(x, y) {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x, y, 250, 10);
    ctx.fillRect(x, y + 10, 10, 40);
    ctx.fillRect(x + 240, y + 10, 10, 40);
}

function drawComputer(x, y) {
    // 모니터
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, 100, 60);
    ctx.fillStyle = "#4169E1";
    ctx.fillRect(x + 5, y + 5, 90, 50);
    
    // 키보드
    ctx.fillStyle = "#A9A9A9";
    ctx.fillRect(x + 20, y + 70, 60, 20);
}

function drawPartition(x, y) {
    ctx.fillStyle = "#A9A9A9";
    ctx.fillRect(x, y, 5, 150);
    ctx.fillRect(x, y, 100, 5);
    ctx.fillStyle = "#D3D3D3";
    ctx.fillRect(x + 5, y + 5, 95, 145);
}





// 물음표 박스 그리기 함수
function drawBoxes() {
    boxes.forEach((box) => {
        if (!box.broken) {
            ctx.fillStyle = "#FFD700";
            ctx.fillRect(box.x - scrollOffset, box.y, 50, 50);
            ctx.fillStyle = "#000";
            ctx.font = "30px Arial";
            ctx.fillText("?", box.x - scrollOffset + 15, box.y + 35);
        } else if (box.breakProgress < 1) {
            // 깨지는 애니메이션
            ctx.globalAlpha = 1 - box.breakProgress;
            ctx.fillStyle = "#FFD700";
            ctx.fillRect(box.x - scrollOffset, box.y, 50, 50);
            ctx.globalAlpha = 1;
        }
    });
}

// 텍스트 그리기 함수
function drawIntroText() {
    boxes.forEach((box, index) => {
        if (box.showText) {
            const boxWidth = 220;
            const boxHeight = 40;
            const boxX = box.x - scrollOffset; // 물음표 박스의 x 위치
            const boxY = box.y; // 물음표 박스의 y 위치

            // 페이드 인 효과를 위한 알파값 계산
            const alpha = Math.min(1, box.breakProgress * 2);

            // 텍스트 그리기
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.font = "16px 'Comic Sans MS', cursive";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // 텍스트를 물음표 박스 위치에 그리기
            ctx.fillText(introTexts[index].text, 
                         boxX + 25, // 박스의 중앙 x 좌표 (박스 너비의 절반)
                         boxY + 25); // 박스의 중앙 y 좌표 (박스 높이의 절반)

            // 텍스트 스타일 초기화
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
        }
    });
}




// 파티클 생성 함수
function createParticles(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            size: Math.random() * 5 + 2,
            color: "#FFD700",
            life: Math.random() * 30 + 30
        });
    }
}

// 파티클 업데이트 및 그리기 함수
function updateParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life--;
        if (particle.life <= 0) {
            particles.splice(index, 1); // 수명이 다한 파티클 제거
        }
    });

    particles.forEach((particle) => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x - scrollOffset, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 충돌 감지 함수
function checkCollision() {
    boxes.forEach((box) => {
        if (!box.broken &&
            characterX < box.x - scrollOffset + 50 &&
            characterX + characterWidth > box.x - scrollOffset &&
            characterY < box.y + 50 &&
            characterY + characterHeight > box.y) {
            box.broken = true;
            box.showText = true;
            createParticles(box.x + 25, box.y + 25);
        }
    });
}

// 게임 루프 함수
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 지우기

    drawBackground(); // 배경 그리기
    drawBoxes(); // 물음표 박스 그리기
    drawCharacter(); // 캐릭터 그리기
    drawIntroText(); // 텍스트 그리기
    updateParticles(); // 파티클 업데이트 및 그리기

    // 점프 로직
    if (isJumping) {
        characterY += jumpVelocity;
        jumpVelocity += gravity;

        if (characterY >= groundY) {
            characterY = groundY;
            isJumping = false;
            jumpVelocity = 0;
        }

        checkCollision(); // 충돌 감지
    } else {
        characterY = groundY;
    }

    // 캐릭터 이동 및 화면 스크롤 처리
    if (keys.right) {
        characterX += speed;
        scrollOffset += speed;

        if (characterX > canvas.width / 2) {
            characterX = canvas.width / 2; // 캐릭터가 화면 중앙에 고정되도록 설정
        }
    }

    if (keys.left) {
        if (scrollOffset > 0) {
            scrollOffset -= speed;
            if (characterX > canvas.width / 2) {
                characterX -= speed;
            }
        } else {
            characterX = Math.max(0, characterX - speed);
        }
    }

    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width + cloud.width;
        }
    });

    // 박스 깨짐 진행 업데이트
    boxes.forEach(box => {
        if (box.broken && box.breakProgress < 1) {
            box.breakProgress += 0.05;
        }
    });

    requestAnimationFrame(gameLoop); // 다음 프레임 호출
}


// 게임 시작
initClouds();
gameLoop();
