import { useState, useEffect, useRef } from 'react';
import { Heart, Shield, Zap, Skull, Crown, Ghost, Coins, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

// --- Types ---
type GameState = 'MENU' | 'ROOM_SELECTION' | 'COMBAT' | 'EVENT' | 'GAME_OVER' | 'VICTORY' | 'CHARACTER' | 'INVENTORY' | 'CONFIRM_EXIT';
type RoomType = 'ENEMY' | 'ELITE' | 'TREASURE' | 'REST' | 'EVENT';
type ItemType = 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'CONSUMABLE';

interface Item {
    id: string;
    name: string;
    type: ItemType;
    stats: {
        hp?: number; // Healing for consumables
        maxHp?: number;
        attack?: number;
        defense?: number;
    };
    description: string;
}

interface Player {
    hp: number;
    maxHp: number;
    baseMaxHp: number;
    attack: number;
    baseAttack: number;
    defense: number;
    baseDefense: number;
    level: number;
    xp: number;
    xpToNext: number;
    gold: number;
    floor: number;
    inventory: Item[];
    equipped: {
        weapon: Item | null;
        armor: Item | null;
        accessory: Item | null;
    };
}

interface Enemy {
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    isElite: boolean;
}

interface Room {
    id: string;
    type: RoomType;
    description: string;
    icon: React.ReactNode;
    enemy?: Enemy;
}

// --- Constants ---
const BASE_PLAYER: Player = {
    hp: 100,
    maxHp: 100,
    baseMaxHp: 100,
    attack: 10,
    baseAttack: 10,
    defense: 0,
    baseDefense: 0,
    level: 1,
    xp: 0,
    xpToNext: 100,
    gold: 0,
    floor: 1,
    inventory: [],
    equipped: {
        weapon: null,
        armor: null,
        accessory: null
    }
};

const ITEMS: Item[] = [
    { id: 'sword-1', name: 'Rusted Sword', type: 'WEAPON', stats: { attack: 2 }, description: 'Better than nothing.' },
    { id: 'sword-2', name: 'Iron Sword', type: 'WEAPON', stats: { attack: 5 }, description: 'A reliable blade.' },
    { id: 'armor-1', name: 'Leather Tunic', type: 'ARMOR', stats: { defense: 1, maxHp: 10 }, description: 'Light protection.' },
    { id: 'armor-2', name: 'Chainmail', type: 'ARMOR', stats: { defense: 3, maxHp: 20 }, description: 'Sturdy rings.' },
    { id: 'ring-1', name: 'Ring of Power', type: 'ACCESSORY', stats: { attack: 1, maxHp: 5 }, description: 'Slightly magical.' },
    { id: 'potion-1', name: 'Health Potion', type: 'CONSUMABLE', stats: { hp: 50 }, description: 'Restores 50 HP.' },
];

// --- Helper Functions ---
const generateRooms = (floor: number): Room[] => {
    const numOptions = Math.floor(Math.random() * 3) + 2; // 2-4 options
    const options: Room[] = [];

    for (let i = 0; i < numOptions; i++) {
        const rand = Math.random();
        let type: RoomType = 'ENEMY';
        let description = 'A dark corridor...';
        let icon = <Ghost size={16} />;
        let enemy: Enemy | undefined;

        if (rand < 0.6) {
            type = 'ENEMY';
            description = 'Calculate risk...';
            enemy = {
                name: 'Skeleton',
                hp: 30 + floor * 5,
                maxHp: 30 + floor * 5,
                attack: 5 + floor,
                isElite: false
            };
        } else if (rand < 0.7) {
            type = 'ELITE';
            description = 'Dangerous aura!';
            icon = <Skull size={16} className="text-red-500" />;
            enemy = {
                name: 'Dark Knight',
                hp: 60 + floor * 10,
                maxHp: 60 + floor * 10,
                attack: 10 + floor * 2,
                isElite: true
            };
        } else if (rand < 0.8) {
            type = 'TREASURE';
            description = 'Something shiny?';
            icon = <Crown size={16} className="text-yellow-500" />;
        } else if (rand < 0.9) {
            type = 'REST';
            description = 'A safe spot.';
            icon = <Heart size={16} className="text-green-500" />;
        } else {
            type = 'EVENT';
            description = 'Unknown...';
            icon = <ChevronRight size={16} />;
        }

        options.push({
            id: `room-${Date.now()}-${i}`,
            type,
            description,
            icon,
            enemy
        });
    }
    return options;
};

const generateLoot = (floor: number): Item | null => {
    // Simple loot generation, better chance on deeper floors
    if (Math.random() > 0.3 - (floor * 0.01)) {
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        // Clone to allow separate instances
        return { ...item, id: `${item.id}-${Date.now()}` };
    }
    return null;
}

interface GameProps {
    onExit?: () => void;
}

export function Game({ onExit }: GameProps) {
    // --- State ---
    const [gameState, setGameState] = useState<GameState>('MENU');
    const [previousState, setPreviousState] = useState<GameState>('MENU');
    const [player, setPlayer] = useState<Player>(BASE_PLAYER);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(true);

    // Using refs for input handling focus to prevent re-renders losing focus
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-focus on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            containerRef.current?.focus();
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    // --- Helpers ---
    const addLog = (msg: string) => {
        setCombatLog(prev => [msg, ...prev].slice(0, 3));
    };

    const startGame = () => {
        setPlayer({ ...BASE_PLAYER });
        setCombatLog(['Welcome to the deep dark...']);
        setRooms(generateRooms(1));
        setGameState('ROOM_SELECTION');
        containerRef.current?.focus();
        setIsFocused(true);
    };

    const calculateStats = (p: Player) => {
        let maxHp = p.baseMaxHp;
        let attack = p.baseAttack;
        let defense = p.baseDefense;

        if (p.equipped.weapon) {
            attack += p.equipped.weapon.stats.attack || 0;
            defense += p.equipped.weapon.stats.defense || 0;
            maxHp += p.equipped.weapon.stats.maxHp || 0;
        }
        if (p.equipped.armor) {
            attack += p.equipped.armor.stats.attack || 0;
            defense += p.equipped.armor.stats.defense || 0;
            maxHp += p.equipped.armor.stats.maxHp || 0;
        }
        if (p.equipped.accessory) {
            attack += p.equipped.accessory.stats.attack || 0;
            defense += p.equipped.accessory.stats.defense || 0;
            maxHp += p.equipped.accessory.stats.maxHp || 0;
        }

        return { ...p, maxHp, attack, defense };
    };

    const equipItem = (item: Item) => {
        setPlayer(prev => {
            let newEquipped = { ...prev.equipped };
            let newInventory = prev.inventory.filter(i => i.id !== item.id); // Remove from inventory

            // Unequip current item in slot if exists
            let oldItem: Item | null = null;
            if (item.type === 'WEAPON') {
                oldItem = newEquipped.weapon;
                newEquipped.weapon = item;
            } else if (item.type === 'ARMOR') {
                oldItem = newEquipped.armor;
                newEquipped.armor = item;
            } else if (item.type === 'ACCESSORY') {
                oldItem = newEquipped.accessory;
                newEquipped.accessory = item;
            } else if (item.type === 'CONSUMABLE') {
                // Consume immediately
                const restored = item.stats.hp || 0;
                addLog(`Used ${item.name}. Healed ${restored} HP.`);
                return {
                    ...prev,
                    hp: Math.min(prev.maxHp, prev.hp + restored),
                    inventory: newInventory // Item consumed (removed)
                };
            }

            if (oldItem) {
                newInventory.push(oldItem); // Add old item back to inventory
            }

            const pWithItems = { ...prev, equipped: newEquipped, inventory: newInventory };
            const pWithStats = calculateStats(pWithItems);
            pWithStats.hp = Math.min(pWithStats.hp, pWithStats.maxHp);

            addLog(`Equipped ${item.name}.`);
            return pWithStats;
        });
    };

    const enterRoom = (room: Room) => {
        setCurrentRoom(room);
        if (room.type === 'ENEMY' || room.type === 'ELITE') {
            setGameState('COMBAT');
            addLog(`Encountered ${room.enemy?.name}!`);
        } else if (room.type === 'TREASURE') {
            setGameState('EVENT');
            const goldFound = Math.floor(Math.random() * 50) + 10;
            const item = generateLoot(player.floor);

            setPlayer(p => {
                const newInv = item ? [...p.inventory, item] : p.inventory;
                if (item) addLog(`Found ${item.name}!`);
                return { ...p, gold: p.gold + goldFound, inventory: newInv };
            });
            addLog(`Found ${goldFound} gold!`);
        } else if (room.type === 'REST') {
            setGameState('EVENT');
            const heal = Math.floor(player.maxHp * 0.3);
            setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + heal) }));
            addLog(`Rested and recovered ${heal} HP.`);
        } else {
            setGameState('EVENT');
            addLog("Nothing happened...");
        }
    };

    const handleRoomSelect = (index: number) => {
        if (index >= 0 && index < rooms.length) {
            enterRoom(rooms[index]);
        }
    };

    const combatAction = (action: 'ATTACK' | 'DEFEND' | 'ESCAPE') => {
        if (!currentRoom?.enemy) return;

        const enemy = currentRoom.enemy;
        let pDmg = player.attack;
        let eDmg = enemy.attack;
        let pDef = player.defense;

        if (action === 'ATTACK') {
            // Player hits
            const damage = Math.max(1, pDmg);
            enemy.hp -= damage;
            addLog(`You hit for ${damage}!`);
        } else if (action === 'DEFEND') {
            pDef += 5; // Temp defense boost
            addLog("You embrace for impact!");
        } else if (action === 'ESCAPE') {
            if (Math.random() > 0.5) {
                addLog("Escaped successfully!");
                finishRoom();
                return;
            } else {
                addLog("Failed to escape!");
            }
        }

        // Enemy Turn
        if (enemy.hp > 0) {
            const damage = Math.max(0, eDmg - pDef);
            setPlayer(p => {
                const newHp = p.hp - damage;
                if (newHp <= 0) {
                    setGameState('GAME_OVER');
                }
                return { ...p, hp: newHp };
            });
            addLog(`${enemy.name} hits you for ${damage}!`);
        } else {
            // Victory
            const xpGain = enemy.isElite ? 50 : 20;
            const loot = generateLoot(player.floor);

            addLog(`Victory! +${xpGain} XP`);
            if (loot) addLog(`Looted: ${loot.name}`);

            setPlayer(p => {
                let newXp = p.xp + xpGain;
                let newLevel = p.level;
                let newBaseMaxHp = p.baseMaxHp;
                let newBaseAtk = p.baseAttack;

                if (newXp >= p.xpToNext) {
                    newXp -= p.xpToNext;
                    newLevel++;
                    newBaseMaxHp += 10;
                    newBaseAtk += 2;
                    addLog("Level Up!");
                }

                let newP = {
                    ...p,
                    xp: newXp,
                    level: newLevel,
                    baseMaxHp: newBaseMaxHp,
                    baseAttack: newBaseAtk,
                    hp: Math.min(newBaseMaxHp, p.hp + 20), // Small heal on win
                    inventory: loot ? [...p.inventory, loot] : p.inventory
                };
                return calculateStats(newP);
            });
            finishRoom();
        }
    };

    const finishRoom = () => {
        if (gameState === 'GAME_OVER') return;
        setRooms(generateRooms(player.floor + 1));
        setPlayer(p => ({ ...p, floor: p.floor + 1 }));
        setGameState('ROOM_SELECTION');
        setCurrentRoom(null);
    };

    // --- Keyboard Handling ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Global Toggles
            // Capture logic
            if (!isFocused && e.target !== containerRef.current) {
                return;
            }

            e.stopPropagation();
            if (isFocused) {
                if (e.key.length === 1 || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Escape'].includes(e.key)) {
                    e.preventDefault();
                }
            }

            if (gameState === 'CONFIRM_EXIT') {
                if (e.key.toLowerCase() === 'y' || e.key === 'Enter') {
                    if (onExit) onExit();
                }
                if (e.key.toLowerCase() === 'n' || e.key === 'Escape') {
                    setGameState(previousState);
                }
                return;
            }

            // Global Q to Quit
            if (['MENU', 'ROOM_SELECTION', 'COMBAT', 'EVENT', 'CHARACTER', 'INVENTORY'].includes(gameState)) {
                if (e.key.toLowerCase() === 'q') {
                    setPreviousState(gameState);
                    setGameState('CONFIRM_EXIT');
                    return;
                }
            }

            if (gameState === 'MENU') {
                if (e.key === 'Enter') startGame();
            } else if (gameState === 'ROOM_SELECTION') {
                const num = parseInt(e.key);
                if (!isNaN(num) && num > 0 && num <= rooms.length) {
                    handleRoomSelect(num - 1);
                }
                if (e.key.toLowerCase() === 'c') {
                    setPreviousState('ROOM_SELECTION');
                    setGameState('CHARACTER');
                }
                if (e.key.toLowerCase() === 'i') {
                    setPreviousState('ROOM_SELECTION');
                    setGameState('INVENTORY');
                }
                if (e.key === 'Escape') {
                    setIsFocused(false);
                    containerRef.current?.blur();
                }
            } else if (gameState === 'COMBAT') {
                if (e.key === '1') combatAction('ATTACK');
                if (e.key === '2') combatAction('DEFEND');
                if (e.key === '3') combatAction('ESCAPE');
            } else if (gameState === 'EVENT') {
                if (e.key === 'Enter' || e.key === ' ') finishRoom();
            } else if (gameState === 'GAME_OVER') {
                if (e.key === 'Enter') setGameState('MENU');
            } else if (gameState === 'CHARACTER' || gameState === 'INVENTORY') {
                if (e.key === 'Escape' || e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'i') {
                    setGameState(previousState);
                }
                if (gameState === 'INVENTORY') {
                    const num = parseInt(e.key);
                    if (!isNaN(num) && num > 0 && num <= player.inventory.length) {
                        equipItem(player.inventory[num - 1]);
                    }
                }
            }
        };

        const handleFocus = () => setIsFocused(true);
        const handleBlur = () => setIsFocused(false);

        const container = containerRef.current;
        if (container) {
            container.addEventListener('keydown', handleKeyDown);
            container.addEventListener('focus', handleFocus);
            container.addEventListener('blur', handleBlur);
        }

        return () => {
            if (container) {
                container.removeEventListener('keydown', handleKeyDown);
                container.removeEventListener('focus', handleFocus);
                container.removeEventListener('blur', handleBlur);
            }
        };
    }, [gameState, rooms, currentRoom, player, isFocused, previousState, onExit]);

    // Handle global Escape to exit when not focused
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isFocused && onExit) {
                onExit();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isFocused, onExit]);

    // --- Render ---
    if (gameState === 'CONFIRM_EXIT') {
        return (
            <div
                className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-in fade-in outline-none relative"
                ref={containerRef}
                tabIndex={0}
                onClick={() => containerRef.current?.focus()}
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40"></div>
                <div className="relative z-50 p-6 border border-red-500/50 rounded bg-black w-3/4 max-w-sm">
                    <h1 className="text-xl font-bold text-red-500 mb-2">QUIT GAME?</h1>
                    <p className="text-[10px] text-primary/60 mb-6">Unsaved progress will be lost.</p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" size="sm" className="h-8 border-red-500/50 text-red-400 hover:bg-red-950 hover:text-red-200" onClick={onExit}>[Y] Yes</Button>
                        <Button variant="outline" size="sm" className="h-8 border-primary/50 text-primary hover:bg-primary/10" onClick={() => setGameState(previousState)}>[N] No</Button>
                    </div>
                </div>
            </div>
        )
    }

    if (gameState === 'MENU') {
        return (
            <div
                className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-in fade-in outline-none"
                ref={containerRef}
                tabIndex={0}
                onClick={() => containerRef.current?.focus()}
            >
                <h1 className="text-2xl font-bold text-primary tracking-widest">TERMINAL CRAWLER</h1>
                <p className="text-xs text-primary/60">Delve deep. Die often.</p>
                <div className="mt-8 animate-pulse text-xs opacity-70 flex flex-col gap-2">
                    <span>[ Press ENTER to Start ]</span>
                    <span>[ Press Q to Quit ]</span>
                </div>
            </div>
        );
    }

    if (gameState === 'GAME_OVER') {
        return (
            <div
                className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-in fade-in outline-none"
                ref={containerRef}
                tabIndex={0}
                onClick={() => containerRef.current?.focus()}
            >
                <Skull size={48} className="text-red-600 mb-4" />
                <h1 className="text-2xl font-bold text-red-500">YOU DIED</h1>
                <p className="text-xs text-primary/60">Floor Reached: {player.floor}</p>
                <div className="mt-8 animate-pulse text-xs opacity-70">[ Press ENTER to Menu ]</div>
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col h-full max-h-[22rem] overflow-hidden font-mono text-xs select-none relative p-1 outline-none transition-colors ${isFocused ? 'bg-black/90' : 'opacity-70 grayscale'}`}
            ref={containerRef}
            tabIndex={0}
            onClick={() => containerRef.current?.focus()}
        >
            {!isFocused && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                    <div className="text-white bg-black/80 px-3 py-1 rounded border border-white/20 animate-pulse cursor-pointer">
                        [ Click to Focus ]
                    </div>
                </div>
            )}

            {/* Header / Stats */}
            <div className="flex justify-between items-end border-b border-primary/20 pb-2 mb-2 px-1">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1 text-primary">
                        <Heart size={10} /> <span>{Math.ceil(player.hp)}/{player.maxHp}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary/80">
                        <Shield size={10} /> <span>{player.defense}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Coins size={10} /> <span>{player.gold}G</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                        <Zap size={10} /> <span>Lvl {player.level}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-primary/30">FL {player.floor}</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center min-h-0">
                {gameState === 'ROOM_SELECTION' && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-primary/50 text-[10px] mb-2 px-2">
                            <span>[C] Character</span>
                            <span>- Choose your path -</span>
                            <span>[I] Inventory</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {rooms.map((room, i) => (
                                <div key={room.id} className="group flex flex-col items-center justify-center gap-1 p-2 border border-primary/20 hover:bg-white/5 cursor-pointer rounded transition-all aspect-square sm:aspect-auto sm:h-24" onClick={() => handleRoomSelect(i)}>
                                    <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform mb-1">
                                        {room.icon}
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-primary group-hover:text-white transition-colors text-xs">
                                            <span className="opacity-50 mr-1">[{i + 1}]</span>
                                            {room.type === 'ENEMY' ? room.enemy?.name : room.type}
                                        </div>
                                        <div className="text-primary/50 text-[9px] leading-tight mt-1 line-clamp-2">{room.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'CHARACTER' && (
                    <div className="space-y-4 px-4 animate-in fade-in">
                        <div className="text-center font-bold text-lg text-primary border-b border-primary/20 pb-1">CHARACTER SHEET</div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="text-primary/50 uppercase tracking-widest text-[10px]">Stats</div>
                                <div className="flex justify-between"><span>Attack:</span> <span className="text-red-400">{player.attack}</span></div>
                                <div className="flex justify-between"><span>Defense:</span> <span className="text-blue-400">{player.defense}</span></div>
                                <div className="flex justify-between"><span>Max HP:</span> <span className="text-green-400">{player.maxHp}</span></div>
                                <div className="flex justify-between"><span>XP:</span> <span className="text-yellow-400">{player.xp}/{player.xpToNext}</span></div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-primary/50 uppercase tracking-widest text-[10px]">Equipped</div>
                                <div className="flex flex-col text-[10px]">
                                    <span className="opacity-50">Weapon:</span>
                                    <span className="truncate text-primary">{player.equipped.weapon?.name || 'None'}</span>
                                </div>
                                <div className="flex flex-col text-[10px]">
                                    <span className="opacity-50">Armor:</span>
                                    <span className="truncate text-primary">{player.equipped.armor?.name || 'None'}</span>
                                </div>
                                <div className="flex flex-col text-[10px]">
                                    <span className="opacity-50">Accessory:</span>
                                    <span className="truncate text-primary">{player.equipped.accessory?.name || 'None'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center text-[10px] opacity-50 mt-4">[ ESC to Back ]</div>
                    </div>
                )}

                {gameState === 'INVENTORY' && (
                    <div className="space-y-2 px-2 animate-in fade-in h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
                        <div className="text-center font-bold text-lg text-primary border-b border-primary/20 pb-1 mb-2">INVENTORY</div>
                        {player.inventory.length === 0 ? (
                            <div className="text-center opacity-50 py-8">Empty Backpack...</div>
                        ) : (
                            player.inventory.map((item, i) => (
                                <div key={item.id} className="flex items-center justify-between p-1 border-b border-primary/10 hover:bg-white/5 cursor-pointer" onClick={() => equipItem(item)}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="font-bold opacity-50 w-4">{i + 1}.</span>
                                        <div className="truncate">
                                            <div className="text-primary">{item.name}</div>
                                            <div className="text-[9px] opacity-50">{item.description}</div>
                                        </div>
                                    </div>
                                    <div className="text-[9px] opacity-70 whitespace-nowrap">
                                        {item.type === 'CONSUMABLE' ? 'Use' : 'Equip'}
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="text-center text-[10px] opacity-50 mt-4 sticky bottom-0 bg-black py-1">[ Press 1-{player.inventory.length} ] [ ESC ]</div>
                    </div>
                )}

                {gameState === 'COMBAT' && currentRoom?.enemy && (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                        {/* Enemy Visual */}
                        <div className="mb-4 relative">
                            <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full"></div>
                            {currentRoom.enemy.isElite ? (
                                <Skull size={64} className="text-red-500 relative z-10 animate-pulse" />
                            ) : (
                                <Ghost size={48} className="text-primary relative z-10 opacity-80" />
                            )}
                        </div>

                        <div className="text-lg font-bold text-red-400 mb-1">{currentRoom.enemy.name}</div>
                        <Progress value={(currentRoom.enemy.hp / currentRoom.enemy.maxHp) * 100} className="h-2 w-32 bg-red-950 [&>div]:bg-red-500 mb-4" />

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-2 w-full max-w-xs mt-2">
                            <Button size="sm" variant="outline" className="text-[10px] h-8 border-primary/30 hover:bg-red-900/20 hover:text-red-400" onClick={() => combatAction('ATTACK')}>
                                [1] Attack
                            </Button>
                            <Button size="sm" variant="outline" className="text-[10px] h-8 border-primary/30 hover:bg-blue-900/20 hover:text-blue-400" onClick={() => combatAction('DEFEND')}>
                                [2] Defend
                            </Button>
                            <Button size="sm" variant="outline" className="text-[10px] h-8 border-primary/30 hover:bg-yellow-900/20 hover:text-yellow-400" onClick={() => combatAction('ESCAPE')}>
                                [3] Flee
                            </Button>
                        </div>
                    </div>
                )}

                {gameState === 'EVENT' && (
                    <div className="text-center space-y-4 animate-in fade-in">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg inline-block">
                            {currentRoom?.icon}
                        </div>
                        <p className="text-sm text-primary/80">{
                            currentRoom?.type === 'TREASURE' ? "You found some loot!" :
                                currentRoom?.type === 'REST' ? "You feel refreshed." : "You move on..."
                        }</p>
                        <div className="text-xs animate-pulse opacity-50 mt-4">[ Press Space/Enter ]</div>
                    </div>
                )}
            </div>

            {/* Log / Footer */}
            <div className="mt-auto pt-2 border-t border-primary/20 h-16 text-[10px] text-primary/60 font-mono flex flex-col justify-end">
                {combatLog.map((log, i) => (
                    <div key={i} className="truncate select-text">&gt; {log}</div>
                ))}
            </div>
        </div>
    );
}
