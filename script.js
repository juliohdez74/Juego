// Palabras sobre TICs para el juego
const ticWords = [
    'Hardware',
    'Software',
    'Internet',
    'Servidor',
    'Navegador',
    'Base Datos',
    'Algoritmo',
    'Programación',
    'Aplicación',
    'Red',
    'Contraseña',
    'Cifrado',
    'Computadora',
    'Monitor',
    'Teclado',
    'Ratón'
];

// Variables del juego
let gameBoard = [];
let flippedCards = [];
let matchedPairs = [];
let currentTeam = 1;
let team1Score = 0;
let team2Score = 0;
let isProcessing = false;
let gameStarted = false;
let backgroundMusic = null;
let isMuted = false;

// Elementos del DOM
const gameBoardElement = document.getElementById('game-board');
const team1ScoreDisplay = document.getElementById('team1-score');
const team2ScoreDisplay = document.getElementById('team2-score');
const currentTeamDisplay = document.getElementById('current-team');
const pairsFoundDisplay = document.getElementById('pairs-found');
const messageElement = document.getElementById('message');
const resetBtn = document.getElementById('reset-btn');
const btnTeam1 = document.getElementById('btn-team1');
const btnTeam2 = document.getElementById('btn-team2');
const audioToggle = document.getElementById('audio-toggle');

// Inicializar audio
function initAudio() {
    backgroundMusic = document.getElementById('background-music');
    
    if (backgroundMusic) {
        backgroundMusic.volume = 0.3;
        
        // Evento para reproducir música cuando el usuario interactúa
        const playMusicOnInteraction = () => {
            if (gameStarted && !isMuted && backgroundMusic.paused) {
                backgroundMusic.play().catch(e => {
                    console.log('No se puede reproducir música:', e);
                });
            }
        };
        
        document.addEventListener('click', playMusicOnInteraction);
        document.addEventListener('touchstart', playMusicOnInteraction);
    }

    // Configurar botón de audio
    if (audioToggle) {
        audioToggle.addEventListener('click', toggleAudio);
    }
}

function toggleAudio() {
    if (!backgroundMusic) return;
    
    isMuted = !isMuted;

    if (isMuted) {
        backgroundMusic.pause();
        audioToggle.textContent = '🔇';
        audioToggle.classList.add('muted');
    } else {
        backgroundMusic.play().catch(e => console.log('Error reproduciendo música'));
        audioToggle.textContent = '🔊';
        audioToggle.classList.remove('muted');
    }
}

function playFlipSound() {
    // Crear sonido de flip simple usando Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 400;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Error reproduciendo sonido');
    }
}

function playMatchSound() {
    // Sonido de éxito
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // Do
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // Mi
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        console.log('Error reproduciendo sonido de match');
    }
}

// Inicializar el juego
function initGame() {
    gameBoard = [];
    flippedCards = [];
    matchedPairs = [];
    currentTeam = 1;
    team1Score = 0;
    team2Score = 0;
    isProcessing = false;
    gameStarted = true;

    // Reproducir música de fondo si no está silenciada
    if (backgroundMusic && !isMuted) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(e => {
            console.log('No se puede reproducir música:', e);
        });
    }

    // Seleccionar 8 palabras aleatorias y duplicarlas
    const shuffled = ticWords.sort(() => 0.5 - Math.random()).slice(0, 8);
    const pairs = [...shuffled, ...shuffled];
    gameBoard = pairs.sort(() => 0.5 - Math.random());

    // Limpiar el tablero
    gameBoardElement.innerHTML = '';

    // Crear las tarjetas
    gameBoard.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.word = word;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${word}</div>
            </div>
        `;

        card.addEventListener('click', flipCard);
        gameBoardElement.appendChild(card);
    });

    updateScoreboard();
    showMessage('¡Juego iniciado! ¡A jugar!', 'success');
}

// Voltear tarjeta
function flipCard(event) {
    if (!gameStarted || isProcessing) return;

    const card = event.currentTarget;
    const index = card.dataset.index;

    // No permitir hacer clic en la misma carta dos veces
    if (flippedCards.some(c => c.dataset.index === index) || card.classList.contains('matched')) {
        return;
    }

    card.classList.add('flipped');
    flippedCards.push(card);
    playFlipSound();

    if (flippedCards.length === 2) {
        isProcessing = true;
        checkMatch();
    }
}

// Verificar si las dos cartas coinciden
function checkMatch() {
    const [card1, card2] = flippedCards;
    const match = card1.dataset.word === card2.dataset.word;

    if (match) {
        // Marcar como encontradas
        card1.classList.add('matched');
        card2.classList.add('matched');
        playMatchSound();

        // Aumentar puntuación del equipo actual
        if (currentTeam === 1) {
            team1Score++;
            team1ScoreDisplay.textContent = team1Score;
        } else {
            team2Score++;
            team2ScoreDisplay.textContent = team2Score;
        }

        matchedPairs.push([card1, card2]);
        pairsFoundDisplay.textContent = matchedPairs.length;

        showMessage(`¡Felicidades Equipo ${currentTeam}! 🎉 ¡Ganaste un punto!`, 'team-win');

        // Verificar si el juego terminó
        if (matchedPairs.length === gameBoard.length / 2) {
            endGame();
        }

        flippedCards = [];
        isProcessing = false;
    } else {
        // No coinciden, voltear de vuelta después de un tiempo
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isProcessing = false;
            
            // Cambiar al siguiente equipo
            changeTeam();
        }, 1000);
    }
}

// Cambiar equipo
function changeTeam() {
    currentTeam = currentTeam === 1 ? 2 : 1;
    currentTeamDisplay.textContent = `Equipo ${currentTeam}`;

    // Actualizar botones de equipo
    if (currentTeam === 1) {
        btnTeam1.classList.add('active');
        btnTeam2.classList.remove('active');
    } else {
        btnTeam1.classList.remove('active');
        btnTeam2.classList.add('active');
    }

    updateScoreboard();
}

// Actualizar tablero de puntuación
function updateScoreboard() {
    team1ScoreDisplay.textContent = team1Score;
    team2ScoreDisplay.textContent = team2Score;
}

// Finalizar juego
function endGame() {
    gameStarted = false;
    
    // Detener música de fondo cuando termina el juego
    if (backgroundMusic && !isMuted) {
        backgroundMusic.pause();
    }
    
    let winner = '';

    if (team1Score > team2Score) {
        winner = `¡EQUIPO 1 GANA! 🏆 Puntuación: ${team1Score} - ${team2Score}`;
    } else if (team2Score > team1Score) {
        winner = `¡EQUIPO 2 GANA! 🏆 Puntuación: ${team1Score} - ${team2Score}`;
    } else {
        winner = `¡EMPATE! 🤝 Ambos equipos con ${team1Score} puntos`;
    }

    showMessage(winner, 'team-win');
}

// Mostrar mensajes
function showMessage(text, type = '') {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;

    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'message';
    }, 3000);
}

// Event Listeners
resetBtn.addEventListener('click', initGame);

btnTeam1.addEventListener('click', () => {
    if (!gameStarted && team1Score === 0 && team2Score === 0) {
        currentTeam = 1;
        currentTeamDisplay.textContent = `Equipo ${currentTeam}`;
        btnTeam1.classList.add('active');
        btnTeam2.classList.remove('active');
    }
});

btnTeam2.addEventListener('click', () => {
    if (!gameStarted && team1Score === 0 && team2Score === 0) {
        currentTeam = 2;
        currentTeamDisplay.textContent = `Equipo ${currentTeam}`;
        btnTeam1.classList.remove('active');
        btnTeam2.classList.add('active');
    }
});

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initAudio();
    initGame();
});
