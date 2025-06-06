# CLAUDE.md
必ず日本語で回答してください

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tetris game built with Next.js 14, TypeScript, and Tailwind CSS. The project uses the new App Router structure.

## Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint the code
npm run lint

# Install dependencies
npm install
```

## Architecture

### File Structure
- `app/` - Next.js App Router pages and layouts
- `lib/` - Game logic and utility functions
- `types/` - TypeScript type definitions
- `tailwind.config.js` - Tailwind CSS configuration

### Key Components
- `app/page.tsx` - Main game component with React hooks for game state
- `lib/tetris.ts` - Core game logic (movement, rotation, line clearing)
- `types/tetris.ts` - Type definitions and game constants

### Game Features
- 完全なテトリスゲーム機能
- キーボード操作（矢印キー、スペース、P）
- スコア・レベル・ライン数の表示
- ゲームオーバー・一時停止機能
- 次のピース表示

## Development Notes

- ゲーム状態は React の useState で管理
- useEffect でゲームループとキーボードイベントを制御
- Tailwind CSS でレスポンシブデザイン