import {
  TetrominoType,
  Tetromino,
  Board,
  GameState,
  Position,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINO_SHAPES,
} from '@/types/tetris';

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

export function getRandomTetrominoType(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

export function createTetromino(type: TetrominoType): Tetromino {
  return {
    type,
    shape: TETROMINO_SHAPES[type][0],
    position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    rotation: 0,
  };
}

export function rotateTetromino(tetromino: Tetromino): Tetromino {
  const shapes = TETROMINO_SHAPES[tetromino.type];
  const nextRotation = (tetromino.rotation + 1) % shapes.length;
  return {
    ...tetromino,
    shape: shapes[nextRotation],
    rotation: nextRotation,
  };
}

export function getTetrominoBlocks(tetromino: Tetromino): Position[] {
  const blocks: Position[] = [];
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        blocks.push({
          x: tetromino.position.x + x,
          y: tetromino.position.y + y,
        });
      }
    }
  }
  return blocks;
}

export function isValidPosition(board: Board, tetromino: Tetromino, offset: Position = { x: 0, y: 0 }): boolean {
  const testTetromino = {
    ...tetromino,
    position: {
      x: tetromino.position.x + offset.x,
      y: tetromino.position.y + offset.y,
    },
  };

  const blocks = getTetrominoBlocks(testTetromino);

  for (const block of blocks) {
    if (
      block.x < 0 ||
      block.x >= BOARD_WIDTH ||
      block.y >= BOARD_HEIGHT ||
      (block.y >= 0 && board[block.y][block.x] !== null)
    ) {
      return false;
    }
  }

  return true;
}

export function placeTetromino(board: Board, tetromino: Tetromino): Board {
  const newBoard = board.map(row => [...row]);
  const blocks = getTetrominoBlocks(tetromino);

  for (const block of blocks) {
    if (block.y >= 0) {
      newBoard[block.y][block.x] = tetromino.type;
    }
  }

  return newBoard;
}

export function clearLines(board: Board): { newBoard: Board; linesCleared: number } {
  const newBoard: Board = [];
  let linesCleared = 0;

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (board[y].every(cell => cell !== null)) {
      linesCleared++;
    } else {
      newBoard.push([...board[y]]);
    }
  }

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => null));
  }

  return { newBoard, linesCleared };
}

export function calculateScore(linesCleared: number, level: number): number {
  const baseScore = [0, 40, 100, 300, 1200];
  return baseScore[linesCleared] * (level + 1);
}

export function calculateLevel(totalLines: number): number {
  return Math.floor(totalLines / 10);
}

export function getDropSpeed(level: number): number {
  return Math.max(50, 500 - level * 50);
}

export function initializeGame(): GameState {
  return {
    board: createEmptyBoard(),
    currentPiece: createTetromino(getRandomTetrominoType()),
    nextPiece: createTetromino(getRandomTetrominoType()),
    score: 0,
    level: 0,
    lines: 0,
    gameOver: false,
    isPaused: false,
  };
}

export function moveTetromino(gameState: GameState, direction: 'left' | 'right' | 'down'): GameState {
  if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
    return gameState;
  }

  const offset = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 },
  }[direction];

  if (isValidPosition(gameState.board, gameState.currentPiece, offset)) {
    return {
      ...gameState,
      currentPiece: {
        ...gameState.currentPiece,
        position: {
          x: gameState.currentPiece.position.x + offset.x,
          y: gameState.currentPiece.position.y + offset.y,
        },
      },
    };
  }

  return gameState;
}

export function dropTetromino(gameState: GameState): GameState {
  if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
    return gameState;
  }

  let newGameState = { ...gameState };
  while (isValidPosition(newGameState.board, newGameState.currentPiece!, { x: 0, y: 1 })) {
    newGameState = moveTetromino(newGameState, 'down');
  }

  return newGameState;
}

export function rotatePiece(gameState: GameState): GameState {
  if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
    return gameState;
  }

  const rotatedPiece = rotateTetromino(gameState.currentPiece);

  if (isValidPosition(gameState.board, rotatedPiece)) {
    return {
      ...gameState,
      currentPiece: rotatedPiece,
    };
  }

  return gameState;
}

export function gameStep(gameState: GameState): GameState {
  if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
    return gameState;
  }

  if (isValidPosition(gameState.board, gameState.currentPiece, { x: 0, y: 1 })) {
    return moveTetromino(gameState, 'down');
  }

  const newBoard = placeTetromino(gameState.board, gameState.currentPiece);
  const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
  
  const newLines = gameState.lines + linesCleared;
  const newLevel = calculateLevel(newLines);
  const newScore = gameState.score + calculateScore(linesCleared, gameState.level);

  const nextPiece = createTetromino(getRandomTetrominoType());
  const gameOver = !isValidPosition(clearedBoard, gameState.nextPiece!);

  return {
    board: clearedBoard,
    currentPiece: gameOver ? null : gameState.nextPiece,
    nextPiece,
    score: newScore,
    level: newLevel,
    lines: newLines,
    gameOver,
    isPaused: false,
  };
}