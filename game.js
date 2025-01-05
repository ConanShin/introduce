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
    { x: 300, y: canvas.height - 320, showText: false, broken: false, breakProgress: 0 },
    { x: 800, y: canvas.height - 370, showText: false, broken: false, breakProgress: 0 },
    { x: 1500, y: canvas.height - 320, showText: false, broken: false, breakProgress: 0 },
    { x: 2200, y: canvas.height - 380, showText: false, broken: false, breakProgress: 0 },
    { x: 2900, y: canvas.height - 320, showText: false, broken: false, breakProgress: 0 },
    { x: 3600, y: canvas.height - 360, showText: false, broken: false, breakProgress: 0 }
];


// 자기소개 텍스트
const introTexts = [
    { x: 300, text: "안녕하세요! 제 이름은 신철민입니다.\n영어 이름은 코난이고, 편하게 '코난'이라고 불러주셔도 됩니다." },
    { x: 800, text: "저의 MBTI는 INFJ입니다.\n타인의 감정을 공감하고,\n조화로운 분위기를 만드는 데 노력하고 있습니다." },
    { x: 1500, text: "현재 저는 백엔드 개발을 주업으로 하고 있습니다.\nLLM, Kubernetes, CI/CD 등 다양한 분야에도\n큰 관심을 가지고 배우고 있습니다." },
    { x: 2200, text: "빨래를 개거나 하늘을 보며 공상하는 것을 좋아합니다.\n그리고 가장 좋아하는 음식은 떡볶이입니다!" },
    { x: 2900, text: "취미는 eSports 팀 T1을 응원하는 것이며,\n최근에는 와이프와 함께 뜨개질을 시작했습니다." },
    { x: 3600, text: "함께 일하게 되어 정말 기쁩니다.\n서로 배우고 성장하는 관계가 되었으면 좋겠습니다.\n앞으로 잘 부탁드립니다!" }
];

// 파티클 관련 변수
let particles = [];

// 키 입력 상태
let keys = {
    right: false,
    left: false,
};

let currentOpenScrollIndex = -1;
let scrollAnimationProgress = 0;
let isScrollClosing = false;

// 키보드 이벤트 리스너
window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowRight") keys.right = true;
    if (e.code === "ArrowLeft") keys.left = true;
    if (e.code === "Space" && !isJumping) {
        isJumping = true;
        jumpVelocity = -jumpStrength;
        closeScroll();
    }
    if (e.code === 'Escape') {
        closeScroll();
    }
});

window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowRight") keys.right = false;
    if (e.code === "ArrowLeft") keys.left = false;
});

function closeScroll() {
    if (currentOpenScrollIndex !== -1) {
        boxes[currentOpenScrollIndex].showText = false;
        currentOpenScrollIndex = -1;
        scrollAnimationProgress = 1;
    }
}

// 터치 이벤트 처리를 위한 함수
function handleTouch(e) {
    const touch = e.touches[0];
    const width = window.innerWidth;
    const x = touch.clientX;

    if (x < width / 3) {
        keys.left = true;
        keys.right = false;
    } else if (x > (2 * width) / 3) {
        keys.right = true;
        keys.left = false;
    } else if (!isJumping) {
        isJumping = true;
        jumpVelocity = -jumpStrength;
        closeScroll();
    }
}

function handleTouchEnd() {
    keys.left = false;
    keys.right = false;
}

// 터치 이벤트 리스너 추가
window.addEventListener("touchstart", handleTouch);
window.addEventListener("touchmove", handleTouch);
window.addEventListener("touchend", handleTouchEnd);

// 캐릭터 그리기 함수
function drawCharacter() {
    const centerX = characterX + characterWidth / 2;
    const headRadius = characterWidth / 2;

    // 그림자
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(centerX, characterY + characterHeight, characterWidth / 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 다리
    ctx.fillStyle = "#0000FF";
    if (isJumping) {
        ctx.fillRect(characterX + 5, characterY + characterHeight - 30, characterWidth / 2 - 10, 20);
        ctx.fillRect(characterX + characterWidth / 2 + 5, characterY + characterHeight - 30, characterWidth / 2 - 10, 20);
    } else {
        ctx.fillRect(characterX + 5, characterY + characterHeight - 40, characterWidth / 2 - 10, 30);
        ctx.fillRect(characterX + characterWidth / 2 + 5, characterY + characterHeight - 40, characterWidth / 2 - 10, 30);
    }

    // 신발
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(characterX + 5, characterY + characterHeight - 15, characterWidth / 2 - 10, 15);
    ctx.fillRect(characterX + characterWidth / 2 + 5, characterY + characterHeight - 15, characterWidth / 2 - 10, 15);

    // 멜빵 바지
    ctx.fillStyle = "#0000FF";
    ctx.fillRect(characterX, characterY + characterHeight / 2 - 10, characterWidth, characterHeight / 2 - 20);

    // 상의
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(characterX, characterY, characterWidth, characterHeight / 2);

    // 팔
    ctx.fillStyle = "#FAD6A5";
    ctx.fillRect(characterX - 10, characterY + 10, 10, characterHeight / 2);
    ctx.fillRect(characterX + characterWidth, characterY + 10, 10, characterHeight / 2);

    // 장갑
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(characterX - 5, characterY + characterHeight / 2 + 10, 7, 0, Math.PI * 2);
    ctx.arc(characterX + characterWidth + 5, characterY + characterHeight / 2 + 10, 7, 0, Math.PI * 2);
    ctx.fill();

    // 얼굴
    ctx.fillStyle = "#FAD6A5";
    ctx.beginPath();
    ctx.arc(centerX, characterY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // 모자
    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.arc(centerX, characterY - 5, headRadius + 5, Math.PI, 0);
    ctx.fill();

    // 눈
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(centerX - headRadius / 3, characterY - 5, 3, 0, Math.PI * 2);
    ctx.arc(centerX + headRadius / 3, characterY - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // 콧수염
    ctx.beginPath();
    ctx.arc(centerX, characterY + 5, headRadius / 2, 0, Math.PI);
    ctx.stroke();

    // 멜빵 단추
    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    ctx.arc(characterX + characterWidth / 4, characterY + characterHeight / 2, 5, 0, Math.PI * 2);
    ctx.arc(characterX + 3 * characterWidth / 4, characterY + characterHeight / 2, 5, 0, Math.PI * 2);
    ctx.fill();
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
    for (let i = 0; i < 500; i++) {
        clouds.push({
            x: Math.random() * canvas.width * 3,
            y: Math.random() * (canvas.height / 2 - 70),
            width: Math.random() * 400 + 200,
            height: Math.random() * 100 + 50,
            speed: Math.random() * 0.2 + 0.1 // 속도를 더 느리게 조정
        });
    }
}

function drawWindows(offset) {
    const windowWidth = 300;
    const windowHeight = canvas.height / 4; // 창문 높이를 줄임
    const windowSpacing = 20;
    const verticalSpacing = 20; // 상하 창문 사이의 간격
    const totalWidth = windowWidth + windowSpacing;

    const repetitions = Math.ceil(canvas.width / totalWidth) + 1;

    for (let row = 0; row < 2; row++) { // 2줄의 창문을 그리기 위한 루프
        for (let i = 0; i < repetitions; i++) {
            const x = i * totalWidth + offset % totalWidth;
            const y = 50 + row * (windowHeight + verticalSpacing); // 각 줄의 y 위치 계산

            // 창문 프레임
            ctx.fillStyle = "#4A4A4A";
            ctx.fillRect(x, y, windowWidth, windowHeight);

            // 창문 안 하늘 그리기
            ctx.save();
            ctx.beginPath();
            ctx.rect(x + 5, y + 5, windowWidth - 10, windowHeight - 10);
            ctx.clip();
            drawSky(x + 5, y + 5, windowWidth - 10, windowHeight - 10, offset);
            drawClouds(offset, y + 5, windowHeight - 10); // y 위치와 높이 정보 전달
            ctx.restore();

            // 창문 테두리
            ctx.strokeStyle = "#6A6A6A";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 5, y + 5, windowWidth - 10, windowHeight - 10);
        }
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
        let cloudX = (cloud.x - offset * 0.3) % (canvas.width * 3);
        if (cloudX < 0) cloudX += canvas.width * 3;
        drawCloud(cloudX, cloud.y, cloud.width, cloud.height);
    });
}

function drawCloud(x, y, width, height) {
    const baseRadius = Math.min(width, height) / 3;

    // 그라데이션 효과 생성
    const gradient = ctx.createRadialGradient(
        x + width / 2, y + height / 2, 0,
        x + width / 2, y + height / 2, width / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
    ctx.fillStyle = gradient;

    // 중앙에 큰 원 그리기
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, baseRadius, 0, Math.PI * 2);
    ctx.fill();
}



function drawRepeatingElements(offset) {
    const repetitions = boxes.length * 800 / 500;
    for (let i = 0; i < repetitions; i++) {
        const repOffset = offset + i * 500;
        
        // 책상
        drawDesk(100 + repOffset, canvas.height - 150);
    }
}


function drawDesk(x, y) {
    // 책상 그리기
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x, y, 250, 10);
    ctx.fillRect(x, y + 10, 10, 70);
    ctx.fillRect(x + 240, y + 10, 10, 70);

    // 책상 서랍 그리기
    ctx.fillStyle = "#A0522D";
    ctx.fillRect(x + 50, y + 20, 60, 50);
    ctx.fillStyle = "#D2691E";
    ctx.fillRect(x + 55, y + 35, 50, 5);

    // 컴퓨터 모니터 그리기
    ctx.fillStyle = "#2F4F4F";
    ctx.fillRect(x + 100, y - 80, 100, 70);
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 105, y - 75, 90, 60);

    // 모니터
    ctx.fillRect(x + 110, y - 70, 80, 50);

    // 모니터 받침대
    ctx.fillStyle = "#2F4F4F";
    ctx.fillRect(x + 140, y - 10, 20, 10);
    ctx.fillRect(x + 130, y, 40, 5);
}



// 물음표 박스 그리기 함수
function drawBoxes() {
    const currentTime = Date.now();
    const rotationAngle = ((currentTime % 2000) / 2000) * Math.PI * 2; // 2초마다 한 바퀴 회전

    boxes.forEach((box) => {
        ctx.save(); // 캔버스 상태 저장

        // 상자 중심 좌표
        const centerX = box.x - scrollOffset + 35;
        const centerY = box.y + 35;

        if (!box.broken) {
            // 회전 변환 적용 (Y축 기준)
            const cosAngle = Math.cos(rotationAngle);
            const sinAngle = Math.sin(rotationAngle);

            // 상자의 3D 정점 정의 (앞면과 뒷면)
            const vertices = [
                { x: -35, y: -35, z: -35 }, // 뒷면 좌상단
                { x: 35, y: -35, z: -35 },  // 뒷면 우상단
                { x: 35, y: 35, z: -35 },   // 뒷면 우하단
                { x: -35, y: 35, z: -35 },  // 뒷면 좌하단
                { x: -35, y: -35, z: 35 },  // 앞면 좌상단
                { x: 35, y: -35, z: 35 },   // 앞면 우상단
                { x: 35, y: 35, z: 35 },    // 앞면 우하단
                { x: -35, y: 35, z: 35 }    // 앞면 좌하단
            ];

            // 회전 및 투영 변환 적용 (3D -> 2D)
            const projectedVertices = vertices.map((v) => {
                const rotatedX = v.x * cosAngle - v.z * sinAngle;
                const rotatedZ = v.x * sinAngle + v.z * cosAngle;
                return {
                    x: centerX + rotatedX,
                    y: centerY + v.y,
                    z: rotatedZ
                };
            });

            // 상자의 면 정의 (6개의 면)
            const faces = [
                [0, 1, 2, 3], // 뒷면
                [4, 5, 6, 7], // 앞면
                [0, 4, 7, 3], // 왼쪽 면
                [1, 5, 6, 2], // 오른쪽 면
                [0, 1, 5, 4], // 윗면
                [3, 2, 6, 7]  // 아랫면
            ];

            // 면 그리기 (Z값에 따라 순서 조정)
            faces.sort((a, b) => {
                const avgZ1 = a.reduce((sum, i) => sum + projectedVertices[i].z, 0) / a.length;
                const avgZ2 = b.reduce((sum, i) => sum + projectedVertices[i].z, 0) / b.length;
                return avgZ2 - avgZ1; // Z값이 큰 면부터 그리기 (뒤에서 앞으로)
            });

            faces.forEach((face, index) => {
                ctx.beginPath();
                ctx.moveTo(projectedVertices[face[0]].x, projectedVertices[face[0]].y);
                for (let i = 1; i < face.length; i++) {
                    ctx.lineTo(projectedVertices[face[i]].x, projectedVertices[face[i]].y);
                }
                ctx.closePath();

                // 색상 지정 (앞/뒤/옆면 구분)
                if (face === faces[1]) ctx.fillStyle = "#FFD700"; // 앞면 (밝은 노란색)
                else if (face === faces[0]) ctx.fillStyle = "#DAA520"; // 뒷면 (어두운 노란색)
                else ctx.fillStyle = "#E5C100"; // 옆면

                ctx.fill();
                ctx.strokeStyle = "#000";
                ctx.stroke();

                // 모든 면에 물음표 추가
                const faceCenterX = face.reduce((sum, i) => sum + projectedVertices[i].x, 0) / face.length;
                const faceCenterY = face.reduce((sum, i) => sum + projectedVertices[i].y, 0) / face.length;
                const faceNormalZ = (projectedVertices[face[0]].z + projectedVertices[face[2]].z) / 2;

                ctx.fillStyle = "#000";
                ctx.font = "bold 30px Arial";
                ctx.save();
                ctx.translate(faceCenterX, faceCenterY);

                // 면의 방향에 따라 크기 조정
                const scale = Math.abs(faceNormalZ) / 35;
                ctx.scale(scale, scale);

                // 회전 각도 계산 및 적용
                let rotationAngle = 0;
                if (face === faces[2] || face === faces[3]) { // 왼쪽 또는 오른쪽 면
                    rotationAngle = Math.PI / 2;
                } else if (face === faces[4] || face === faces[5]) { // 윗면 또는 아랫면
                    rotationAngle = Math.atan2(projectedVertices[face[1]].y - projectedVertices[face[0]].y,
                        projectedVertices[face[1]].x - projectedVertices[face[0]].x);
                }
                ctx.rotate(rotationAngle);

                ctx.fillText("?", -10, 10);
                ctx.restore();
            });

        } else if (box.breakProgress < 1) {
            // 깨지는 애니메이션 (기존 코드 유지)
            ctx.globalAlpha = 1 - box.breakProgress;

            for (let i = 0; i < 4; i++) {
                let pieceX = box.x - scrollOffset + (i % 2) * 35;
                let pieceY = box.y + Math.floor(i / 2) * 35;
                ctx.fillStyle = "#FFD700";
                ctx.fillRect(pieceX, pieceY, 35, 35);
                ctx.strokeStyle = "#DAA520";
                ctx.strokeRect(pieceX, pieceY, 35, 35);
            }

            ctx.globalAlpha = 1;
        }

        ctx.restore(); // 캔버스 상태 복원
    });
}




// 텍스트 그리기 함수
function drawIntroText() {
    boxes.forEach((box, index) => {
        if (box.showText || (isScrollClosing && index === currentOpenScrollIndex)) {
            // 두루마리가 새로 열릴 때 애니메이션 초기화
            if (box.showText && currentOpenScrollIndex !== index) {
                scrollAnimationProgress = 0;
                isScrollClosing = false;
            }

            currentOpenScrollIndex = index;

            if (!isScrollClosing && scrollAnimationProgress < 1) {
                scrollAnimationProgress += 0.03;
            } else if (isScrollClosing) {
                scrollAnimationProgress -= 0.03;
            }

            scrollAnimationProgress = Math.max(0, Math.min(1, scrollAnimationProgress));

            if (scrollAnimationProgress <= 0 && isScrollClosing) {
                box.showText = false;
                isScrollClosing = false;
                currentOpenScrollIndex = -1;
                return;
            }

            currentOpenScrollIndex = index;

            const scrollWidth = Math.min(canvas.width * 0.8, 500);
            const scrollHeight = Math.min(canvas.height * 0.6, 300);
            const scrollX = (canvas.width - scrollWidth) / 2;
            const scrollY = (canvas.height - scrollHeight) / 2;

            // 두루마리 배경 그리기
            ctx.fillStyle = '#F4E5C3';
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;

            // 왼쪽 부분
            ctx.beginPath();
            ctx.moveTo(scrollX + scrollWidth / 2, scrollY);
            ctx.lineTo(scrollX + scrollWidth / 2 - scrollWidth / 2 * scrollAnimationProgress, scrollY);
            ctx.quadraticCurveTo(
                scrollX + scrollWidth / 2 - scrollWidth / 2 * scrollAnimationProgress - 20,
                scrollY + scrollHeight / 2,
                scrollX + scrollWidth / 2 - scrollWidth / 2 * scrollAnimationProgress,
                scrollY + scrollHeight
            );
            ctx.lineTo(scrollX + scrollWidth / 2, scrollY + scrollHeight);
            ctx.fill();
            ctx.stroke();

            // 오른쪽 부분
            ctx.beginPath();
            ctx.moveTo(scrollX + scrollWidth / 2, scrollY);
            ctx.lineTo(scrollX + scrollWidth / 2 + scrollWidth / 2 * scrollAnimationProgress, scrollY);
            ctx.quadraticCurveTo(
                scrollX + scrollWidth / 2 + scrollWidth / 2 * scrollAnimationProgress + 20,
                scrollY + scrollHeight / 2,
                scrollX + scrollWidth / 2 + scrollWidth / 2 * scrollAnimationProgress,
                scrollY + scrollHeight
            );
            ctx.lineTo(scrollX + scrollWidth / 2, scrollY + scrollHeight);
            ctx.fill();
            ctx.stroke();

            // 텍스트 그리기
            ctx.fillStyle = `rgba(0, 0, 0, ${scrollAnimationProgress})`;
            ctx.font = "20px 'Comic Sans MS', cursive";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const text = introTexts[index].text;
            const lines = text.split('\n');

            // 전체 텍스트 높이 계산
            let totalHeight = 0;
            const lineHeight = 35;
            lines.forEach(line => {
                const words = line.split(' ');
                let currentLine = '';
                for (let n = 0; n < words.length; n++) {
                    const testLine = currentLine + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > scrollWidth - 60 && n > 0) {
                        totalHeight += lineHeight;
                        currentLine = words[n] + ' ';
                    } else {
                        currentLine = testLine;
                    }
                }
                totalHeight += lineHeight;
            });

            // 시작 y 위치 계산 (세로 중앙)
            let y = scrollY + (scrollHeight - totalHeight) / 2;

            lines.forEach(line => {
                const words = line.split(' ');
                let currentLine = '';

                for (let n = 0; n < words.length; n++) {
                    const testLine = currentLine + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;

                    if (testWidth > scrollWidth - 60 && n > 0) {
                        ctx.fillText(currentLine, scrollX + scrollWidth / 2, y);
                        currentLine = words[n] + ' ';
                        y += lineHeight;
                    } else {
                        currentLine = testLine;
                    }
                }
                ctx.fillText(currentLine, scrollX + scrollWidth / 2, y);
                y += lineHeight;
            });

            // 닫기 안내 텍스트
            ctx.font = "16px Arial";
            ctx.fillText("닫으려면 'ESC' 혹은 'Jump'를 누르세요", scrollX + scrollWidth / 2, scrollY + scrollHeight - 20);

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
            characterX < box.x - scrollOffset + 70 &&
            characterX + characterWidth > box.x - scrollOffset &&
            characterY < box.y + 70 &&
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
