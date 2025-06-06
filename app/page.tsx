'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  TETROMINO_COLORS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '@/types/tetris';
import {
  initializeGame,
  moveTetromino,
  rotatePiece,
  dropTetromino,
  gameStep,
  getDropSpeed,
  getTetrominoBlocks,
} from '@/lib/tetris';

export default function TetrisGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isClient, setIsClient] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
    setGameState(initializeGame());
  }, []);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!gameState || gameState.gameOver || gameState.isPaused) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          setGameState((prev) => moveTetromino(prev, 'left'));
          break;
        case 'ArrowRight':
          event.preventDefault();
          setGameState((prev) => moveTetromino(prev, 'right'));
          break;
        case 'ArrowDown':
          event.preventDefault();
          setGameState((prev) => moveTetromino(prev, 'down'));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setGameState((prev) => rotatePiece(prev));
          break;
        case ' ':
          event.preventDefault();
          setGameState((prev) => dropTetromino(prev));
          break;
        case 'p':
        case 'P':
          event.preventDefault();
          setGameState((prev) => ({
            ...prev,
            isPaused: !prev.isPaused,
          }));
          break;
      }
    },
    [gameState?.gameOver, gameState?.isPaused]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!gameState || gameState.gameOver || gameState.isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const interval = getDropSpeed(gameState.level);
    gameLoopRef.current = setInterval(() => {
      setGameState((prev) => prev ? gameStep(prev) : null);
    }, interval);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState?.level, gameState?.gameOver, gameState?.isPaused]);

  const restartGame = () => {
    setGameState(initializeGame());
  };

  const renderBoard = () => {
    if (!gameState) return null;
    
    const board = gameState.board.map((row) => [...row]);

    if (gameState.currentPiece) {
      const blocks = getTetrominoBlocks(gameState.currentPiece);
      blocks.forEach((block) => {
        if (block.y >= 0 && block.y < BOARD_HEIGHT && block.x >= 0 && block.x < BOARD_WIDTH) {
          board[block.y][block.x] = gameState.currentPiece!.type;
        }
      });
    }

    return board.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className={`w-6 h-6 border-2 ${
              cell ? TETROMINO_COLORS[cell] : 'bg-gray-800 border-gray-600'
            }`}
          />
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    if (!gameState || !gameState.nextPiece) return null;

    const shape = gameState.nextPiece.shape;
    return (
      <div className="grid gap-0">
        {shape.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={x}
                className={`w-4 h-4 border-2 ${
                  cell ? TETROMINO_COLORS[gameState.nextPiece!.type] : 'bg-gray-800 border-gray-600'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (!isClient || !gameState) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-4">テトリス</h1>
          <div className="border-2 border-white p-2 bg-gray-900">
            {renderBoard()}
          </div>
          {gameState.gameOver && (
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-red-500 mb-2">ゲームオーバー</div>
              <button
                onClick={restartGame}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                もう一度プレイ
              </button>
            </div>
          )}
          {gameState.isPaused && !gameState.gameOver && (
            <div className="mt-4 text-2xl font-bold text-yellow-500">一時停止中</div>
          )}
        </div>

        <div className="flex flex-col gap-4 min-w-[200px]">
          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">スコア</h2>
            <div className="text-2xl">{gameState.score.toLocaleString()}</div>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">レベル</h2>
            <div className="text-2xl">{gameState.level}</div>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">ライン</h2>
            <div className="text-2xl">{gameState.lines}</div>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">次のピース</h2>
            <div className="flex justify-center">
              {renderNextPiece()}
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">操作方法</h2>
            <div className="text-sm space-y-1">
              <div>← → 移動</div>
              <div>↓ 高速落下</div>
              <div>↑ 回転</div>
              <div>スペース ハードドロップ</div>
              <div>P 一時停止</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}