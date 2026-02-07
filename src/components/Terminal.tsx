import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Minus, Square, Terminal as TerminalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Pet } from './Pet';
import { Game } from './Game';

interface Command {
    command: string;
    output: React.ReactNode;
}

export function Terminal() {
    useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<Command[]>([
        { command: 'help', output: 'Type "help" to see available commands.' }
    ]);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Check if the last command is interactive (e.g. game)
    const [isInteractive, setIsInteractive] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isOpen, isMinimized, isInteractive]);

    useEffect(() => {
        if (isOpen && !isMinimized && !isInteractive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isMinimized, isInteractive]);

    const handleCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim().toLowerCase();
        let output: React.ReactNode = '';

        switch (trimmedCmd) {
            case 'help':
                output = (
                    <div className="space-y-1">
                        <p>Available commands:</p>
                        <ul className="list-disc list-inside pl-2">
                            <li><span className="text-primary font-bold">about</span> - Short bio</li>
                            <li><span className="text-primary font-bold">skills</span> - Technical skills</li>
                            <li><span className="text-primary font-bold">contact</span> - Contact info</li>
                            <li><span className="text-primary font-bold">pet</span> - Summon your pet</li>
                            <li><span className="text-primary font-bold">game</span> - Play a dungeon crawler</li>
                            <li><span className="text-primary font-bold">clear</span> - Clear history</li>
                            <li><span className="text-primary font-bold">exit</span> - Close terminal</li>
                        </ul>
                    </div>
                );
                break;
            case 'about':
                output = "I'm a full-stack developer passionate about building beautiful and functional web applications.";
                break;
            case 'skills':
                output = "React, TypeScript, Node.js, Tailwind CSS, SQL, Python, AI/ML basics.";
                break;
            case 'contact':
                output = (
                    <div>
                        <p>Email: contact@joedev.com</p>
                        <p>GitHub: github.com/joedev</p>
                    </div>
                )
                break;
            case 'pet':
                output = <Pet />;
                break;
            case 'game':
                output = <Game onExit={() => setIsInteractive(false)} />;
                setIsInteractive(true);
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'exit':
                setIsOpen(false);
                return;
            case '':
                output = '';
                break;
            default:
                output = `Command not found: ${trimmedCmd}. Type "help" for valid commands.`;
        }

        setHistory(prev => [...prev, { command: cmd, output }]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCommand(input);
            setInput('');
        }
    };

    if (!isOpen) {
        return (
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 h-10 w-10 flex items-center justify-center bg-card border border-border rounded-md shadow-lg hover:shadow-primary/20 transition-all text-primary"
                aria-label="Open Terminal"
            >
                <TerminalIcon size={24} />
            </motion.button>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.9 }}
                className={cn(
                    "fixed bottom-4 right-4 z-50 bg-neutral-950 border border-border rounded-lg shadow-2xl overflow-hidden font-mono text-sm w-full max-w-lg transition-all duration-300",
                    isMinimized ? "h-12" : "h-96"
                )}
            >
                {/* Title Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-border text-neutral-400 select-none">
                    <div className="flex items-center gap-2">
                        <TerminalIcon size={14} />
                        <span className="text-xs font-semibold">joe@dev:~</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-white transition-colors">
                            {isMinimized ? <Square size={12} /> : <Minus size={12} />}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="hover:text-red-500 transition-colors">
                            <X size={12} />
                        </button>
                    </div>
                </div>

                {/* Terminal Content */}
                {!isMinimized && (
                    <div
                        ref={scrollRef}
                        className="p-4 h-[calc(100%-3rem)] overflow-y-auto text-primary space-y-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
                        onClick={() => !isInteractive && inputRef.current?.focus()}
                    >
                        <div className="opacity-50 mb-4 text-xs">
                            Welcome to JoeDev Terminal v1.0.0
                            <br />
                            Type "help" to get started so you can see what I can do.
                        </div>

                        {history.map((item, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex gap-2">
                                    <span className="text-neutral-500">joe@dev:~$</span>
                                    <span>{item.command}</span>
                                </div>
                                {item.output && (
                                    <div className="pl-4 text-neutral-300 whitespace-pre-wrap">{item.output}</div>
                                )}
                            </div>
                        ))}

                        {!isInteractive && (
                            <div className="flex gap-2 items-center">
                                <span className="text-neutral-500">joe@dev:~$</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 bg-transparent border-none outline-none text-primary placeholder-neutral-700"
                                    autoFocus
                                    spellCheck={false}
                                    autoComplete="off"
                                />
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
