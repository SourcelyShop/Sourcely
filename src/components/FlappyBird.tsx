'use client';

import React, { useEffect, useRef, useState } from 'react';
import { updateFlappyScore } from '@/app/(main)/easter-egg/actions';

interface FlappyBirdProps {
    initialHighScore: number;
}

export function FlappyBird({ initialHighScore }: FlappyBirdProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(initialHighScore);
    const [gameOver, setGameOver] = useState(false);

    // Refs for mutable game state
    const gameState = useRef({
        birdY: 250,
        velocity: 0,
        pipes: [] as { x: number; y: number; width: number; height: number; passed: boolean }[],
        frames: 0,
        score: 0
    });

    // Ref for high score to access in loop without dependency
    const highScoreRef = useRef(initialHighScore);
    useEffect(() => {
        highScoreRef.current = highScore;
    }, [highScore]);

    const requestRef = useRef<number>(0);

    // Game constants
    const GRAVITY = 0.6;
    const JUMP = -10;
    const PIPE_SPEED = 3;
    const PIPE_SPAWN_RATE = 100;
    const PIPE_GAP = 200;

    const resetGame = () => {
        gameState.current = {
            birdY: 250,
            velocity: 0,
            pipes: [],
            frames: 0,
            score: 0
        };
        setScore(0);
        setGameOver(false);
    };

    useEffect(() => {
        if (!isPlaying) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const loop = () => {
            const state = gameState.current;
            state.frames++;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background
            ctx.fillStyle = '#70c5ce';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Bird Physics
            state.velocity += GRAVITY;
            state.birdY += state.velocity;

            // Draw Bird
            ctx.fillStyle = '#f4d03f';
            ctx.beginPath();
            ctx.arc(50, state.birdY, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Eye
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(58, state.birdY - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(60, state.birdY - 5, 2, 0, Math.PI * 2);
            ctx.fill();

            // Pipe Logic
            if (state.frames % PIPE_SPAWN_RATE === 0) {
                const minHeight = 50;
                const maxHeight = canvas.height - PIPE_GAP - minHeight;
                const height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

                state.pipes.push({
                    x: canvas.width,
                    y: 0,
                    width: 50,
                    height: height,
                    passed: false
                });
            }

            // Draw and Move Pipes
            for (let i = 0; i < state.pipes.length; i++) {
                const p = state.pipes[i];
                p.x -= PIPE_SPEED;

                // Top Pipe
                ctx.fillStyle = '#73bf2e';
                ctx.fillRect(p.x, p.y, p.width, p.height);
                ctx.strokeRect(p.x, p.y, p.width, p.height);

                // Bottom Pipe
                const bottomPipeY = p.height + PIPE_GAP;
                const bottomPipeHeight = canvas.height - bottomPipeY;
                ctx.fillRect(p.x, bottomPipeY, p.width, bottomPipeHeight);
                ctx.strokeRect(p.x, bottomPipeY, p.width, bottomPipeHeight);

                // Collision Detection
                const birdLeft = 35;
                const birdRight = 65;
                const birdTop = state.birdY - 15;
                const birdBottom = state.birdY + 15;

                if (
                    birdRight > p.x &&
                    birdLeft < p.x + p.width &&
                    (birdTop < p.height || birdBottom > bottomPipeY)
                ) {
                    endGame();
                    return;
                }

                // Score Update
                if (p.x + p.width < birdLeft && !p.passed) {
                    state.score += 1;
                    setScore(state.score);
                    p.passed = true;
                }

                // Remove off-screen pipes
                if (p.x + p.width < 0) {
                    state.pipes.shift();
                    i--;
                }
            }

            // Ground Collision
            if (state.birdY + 15 > canvas.height || state.birdY - 15 < 0) {
                endGame();
                return;
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        const endGame = () => {
            setIsPlaying(false);
            setGameOver(true);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);

            if (gameState.current.score > highScoreRef.current) {
                setHighScore(gameState.current.score);
                updateFlappyScore(gameState.current.score).catch(console.error);
            }
        };

        requestRef.current = requestAnimationFrame(loop);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying]);

    // Input Handler
    const handleJump = () => {
        if (isPlaying) {
            gameState.current.velocity = JUMP;
        } else if (!isPlaying && !gameOver) {
            setIsPlaying(true);
            resetGame();
        } else if (gameOver) {
            resetGame();
            setIsPlaying(true);
        }
    };

    // Initial Draw & Static Screen
    useEffect(() => {
        if (!isPlaying) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Draw initial state
            ctx.fillStyle = '#70c5ce';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Bird
            ctx.fillStyle = '#f4d03f';
            ctx.beginPath();
            ctx.arc(50, 250, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw Text
            ctx.fillStyle = '#fff';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            if (gameOver) {
                ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = '20px Arial';
                ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
                ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 50);
            } else {
                ctx.fillText('Click or Space to Fly', canvas.width / 2, canvas.height / 2 + 50);
            }
        }
    }, [isPlaying, gameOver, score]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleJump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, gameOver]);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex justify-between w-full max-w-[400px] mb-4 text-white">
                <span className="font-bold text-xl">Jumping bird</span>
                <div className="flex gap-4">
                    <span>Score: {score}</span>
                    <span className="text-yellow-400">High Score: {highScore}</span>
                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={400}
                height={500}
                className="border-4 border-neutral-800 rounded-lg cursor-pointer shadow-2xl"
            />
            <p className="mt-4 text-neutral-500 text-sm">Click or Press Space to Jump</p>
        </div>
    );
}
