/**
 * Unit Tests for Game.js
 * Tests core game logic, state management, and game flow
 */

// Mock dependencies
jest.mock('../../src/core/QuestionManager.js');
jest.mock('../../src/services/GameDataService.js');
jest.mock('../../src/components/UI.js', () => ({}));
jest.mock('../../src/components/UIEffects.js', () => ({}));
jest.mock('../../src/utils/Utils.js', () => ({
    showNotification: jest.fn()
}));

describe('Game Core', () => {
    let game;
    let QuestionManager;
    let GameDataService;
    let showNotification;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = `
            <div id="welcome-screen" class="game-screen"></div>
            <div id="question-screen" class="game-screen"></div>
            <div id="categories-screen" class="game-screen">
                <div class="categories-content"></div>
            </div>
            <div id="victory-screen" class="game-screen"></div>
            <div id="gameover-screen" class="game-screen"></div>
            <div class="question-text"></div>
            <div id="answers-container"></div>
            <div id="timer-phase"></div>
            <div id="timer-question"></div>
            <div id="timer-number"></div>
            <div id="timer-circle"></div>
            <div id="bible-reference"></div>
            <div class="gameover-subtitle"></div>
        `;

        // Reset modules
        jest.resetModules();

        // Setup mocks
        QuestionManager = require('../../src/core/QuestionManager.js').default;
        QuestionManager.init = jest.fn().mockResolvedValue(true);
        QuestionManager.getRandomQuestionsByCategory = jest.fn();
        QuestionManager.getFallbackQuestions = jest.fn();
        QuestionManager.categories = [
            { id: 'antiguo-testamento', name: 'Antiguo Testamento', icon: 'fa-book', color: '#3498db' },
            { id: 'nuevo-testamento', name: 'Nuevo Testamento', icon: 'fa-cross', color: '#e74c3c' },
            { id: 'personajes-biblicos', name: 'Personajes Bíblicos', icon: 'fa-users', color: '#2ecc71' }
        ];

        GameDataService = require('../../src/services/GameDataService.js').default;
        GameDataService.addCoins = jest.fn();
        GameDataService.spendCoins = jest.fn();
        GameDataService.getCoins = jest.fn().mockReturnValue(100);

        showNotification = require('../../src/utils/Utils.js').showNotification;

        // Get singleton instance
        game = require('../../src/core/Game.js').default;

        // Reset game state manually
        game.isGameActive = false;
        game.timer = null;
        game.timeLeft = 0;
        game.state = {
            phase: 'welcome',
            currentQuestionIndex: 0,
            initialCorrectAnswers: 0,
            completedCategories: [],
            currentCategory: null,
            categoryQuestions: [],
            categoryQuestionIndex: 0,
            categoryCorrectAnswers: 0,
            categoryIncorrectAnswers: 0,
            score: 0,
            perfectGame: true,
            powerupsUsed: { eliminate: 0, timeExtender: 0, secondChance: 0 },
            hasSecondChance: false
        };

        jest.clearAllMocks();
    });

    afterEach(() => {
        if (game.timer) {
            clearInterval(game.timer);
            game.timer = null;
        }
        jest.clearAllTimers();
    });

    describe('Initialization', () => {
        test('should have default configuration', () => {
            expect(game.config.questionsPerCategory).toBe(3);
            expect(game.config.minCorrectToWin).toBe(3);
            expect(game.config.correctForRepechage).toBe(2);
        });

        test('should have reward structure', () => {
            expect(game.rewards.categoryCorrect).toBeDefined();
            expect(game.rewards.gameComplete).toBeDefined();
            expect(game.rewards.perfectGame).toBeDefined();
        });
    });

    describe('Game Start', () => {
        test('should reset state when starting new game', () => {
            game.state.score = 100;
            game.state.completedCategories = ['test'];

            const mockQuestion = { id: 1, text: 'Test', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };
            QuestionManager.getRandomQuestionsByCategory.mockReturnValue([mockQuestion]);

            game.startGame();

            expect(game.state.phase).toBe('initial');
            expect(game.state.score).toBe(0);
            expect(game.state.completedCategories).toEqual([]);
            expect(game.isGameActive).toBe(true);
        });

        test('should load initial questions from different categories', () => {
            const mockQuestion = { id: 1, text: 'Test', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };
            QuestionManager.getRandomQuestionsByCategory.mockReturnValue([mockQuestion]);

            game.startGame();

            expect(QuestionManager.getRandomQuestionsByCategory).toHaveBeenCalledWith('antiguo-testamento', 1);
            expect(QuestionManager.getRandomQuestionsByCategory).toHaveBeenCalledWith('nuevo-testamento', 1);
            expect(QuestionManager.getRandomQuestionsByCategory).toHaveBeenCalledWith('personajes-biblicos', 1);
        });

        test('should use fallback questions if not enough available', () => {
            QuestionManager.getRandomQuestionsByCategory.mockReturnValue([]);
            const fallbackQuestions = [
                { id: 1, text: 'Q1', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
                { id: 2, text: 'Q2', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
                { id: 3, text: 'Q3', options: ['A', 'B', 'C', 'D'], correctIndex: 2 }
            ];
            QuestionManager.getFallbackQuestions.mockReturnValue(fallbackQuestions);

            game.startGame();

            expect(QuestionManager.getFallbackQuestions).toHaveBeenCalled();
        });
    });

    describe('Phase Transitions', () => {
        test('should show category selection after 3 correct initial answers', () => {
            game.state.initialCorrectAnswers = 3;
            game.showCategorySelection = jest.fn();

            game.evaluateInitialPhase();

            expect(game.showCategorySelection).toHaveBeenCalled();
        });

        test('should assign random category after 2 correct initial answers', () => {
            game.state.initialCorrectAnswers = 2;
            game.assignRandomCategory = jest.fn();

            game.evaluateInitialPhase();

            expect(game.assignRandomCategory).toHaveBeenCalled();
        });

        test('should trigger game over with less than 2 correct initial answers', () => {
            game.state.initialCorrectAnswers = 1;
            game.gameOver = jest.fn();

            game.evaluateInitialPhase();

            expect(game.gameOver).toHaveBeenCalledWith('No superaste la fase inicial.');
        });
    });

    describe('Power-ups', () => {
        beforeEach(() => {
            game.currentQuestion = {
                id: 1,
                text: 'Test',
                options: ['A', 'B', 'C', 'D'],
                correctIndex: 2
            };
            game.isGameActive = true;
            game.state.phase = 'category';
            GameDataService.getCoins.mockReturnValue(100);
            GameDataService.spendCoins.mockReturnValue(true);
        });

        test('should eliminate 2 incorrect answers with eliminate powerup', () => {
            document.getElementById('answers-container').innerHTML = `
                <button class="answer-btn">A</button>
                <button class="answer-btn">B</button>
                <button class="answer-btn">C</button>
                <button class="answer-btn">D</button>
            `;

            game.usePowerup('eliminate');

            const buttons = document.querySelectorAll('.answer-btn');
            let hiddenCount = 0;
            buttons.forEach(btn => {
                if (btn.style.visibility === 'hidden') hiddenCount++;
            });

            expect(hiddenCount).toBe(2);
            expect(GameDataService.spendCoins).toHaveBeenCalled();
        });

        test('should add 15 seconds with time extender powerup', () => {
            game.timeLeft = 10;
            game.updateTimerDisplay = jest.fn();

            game.usePowerup('timeExtender');

            expect(game.timeLeft).toBe(25);
            expect(GameDataService.spendCoins).toHaveBeenCalled();
        });

        test('should activate second chance powerup', () => {
            game.usePowerup('secondChance');

            expect(game.state.hasSecondChance).toBe(true);
            expect(GameDataService.spendCoins).toHaveBeenCalled();
            expect(showNotification).toHaveBeenCalledWith('Segunda oportunidad activada', 'success');
        });

        test('should not use powerup if insufficient coins', () => {
            GameDataService.getCoins.mockReturnValue(30);

            game.usePowerup('eliminate');

            expect(showNotification).toHaveBeenCalledWith('No tienes suficientes monedas', 'warning');
        });
    });

    describe('Timer', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should start timer with specified seconds', () => {
            game.startTimer(20);

            expect(game.timeLeft).toBe(20);
        });

        test('should decrement time every second', () => {
            game.updateTimerDisplay = jest.fn();
            game.startTimer(20);

            jest.advanceTimersByTime(5000);

            expect(game.timeLeft).toBe(15);
        });

        test('should stop timer when stopTimer is called', () => {
            game.updateTimerDisplay = jest.fn();
            game.startTimer(20);
            const initialTime = game.timeLeft;

            game.stopTimer();
            jest.advanceTimersByTime(5000);

            expect(game.timeLeft).toBe(initialTime);
        });
    });

    describe('Victory and Game Over', () => {
        test('should award coins on victory', () => {
            game.state.perfectGame = false;
            game.showScreen = jest.fn();

            game.victory();

            expect(GameDataService.addCoins).toHaveBeenCalledWith(game.rewards.gameComplete, 'game_victory');
        });

        test('should award bonus coins for perfect game', () => {
            game.state.perfectGame = true;
            game.showScreen = jest.fn();

            game.victory();

            expect(GameDataService.addCoins).toHaveBeenCalledWith(game.rewards.perfectGame, 'perfect_game');
        });

        test('should show game over screen with reason', () => {
            const reason = 'Test reason';

            game.gameOver(reason);

            const msg = document.querySelector('.gameover-subtitle');
            expect(msg.textContent).toBe(reason);
        });
    });

    describe('Screen Management', () => {
        test('should show correct screen and hide others', () => {
            game.showScreen('question-screen');

            const questionScreen = document.getElementById('question-screen');
            const welcomeScreen = document.getElementById('welcome-screen');

            expect(questionScreen.classList.contains('active')).toBe(true);
            expect(welcomeScreen.classList.contains('active')).toBe(false);
        });
    });
});
