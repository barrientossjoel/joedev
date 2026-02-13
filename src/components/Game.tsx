import React, { useState, useEffect, useRef } from 'react';
import { Heart, Shield, Zap, Skull, Crown, Ghost, Coins, ChevronRight, ShoppingBag, Gem, Droplet } from 'lucide-react';
import { Button } from './ui/button';

// --- Types ---
type GameState = 'MENU' | 'ROOM_SELECTION' | 'COMBAT' | 'EVENT' | 'GAME_OVER' | 'VICTORY' | 'CHARACTER' | 'INVENTORY' | 'CONFIRM_EXIT' | 'MERCHANT' | 'LOOT';
type RoomType = 'ENEMY' | 'ELITE' | 'TREASURE' | 'REST' | 'EVENT' | 'MERCHANT';
type ItemType = 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'CONSUMABLE';
type SkillType = 'ATTACK' | 'DEFENSE' | 'HEAL' | 'BUFF';

interface Skill {
    id: string;
    name: string;
    type: SkillType;
    power: number; // Multiplier for DMG or Heal amount
    description: string;
    value: number;
}

interface Item {
    id: string;
    name: string;
    type: ItemType;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    stats: {
        hp?: number; // Healing for consumables
        maxHp?: number;
        attack?: number;
        defense?: number;
        critChance?: number; // %
        dodgeChance?: number; // %
        vampirism?: number; // % healing of dmg dealt
        reflect?: number; // % dmg returned
        pierce?: number; // Flat armor ignore
        speed?: number; // Turn priority
    };
    description: string;
    value: number; // Gold value
}

interface Player {
    hp: number;
    maxHp: number;
    baseMaxHp: number;
    attack: number;
    baseAttack: number;
    defense: number;
    baseDefense: number;
    // New Stats
    critChance: number;
    dodgeChance: number;
    vampirism: number;
    reflect: number;
    pierce: number;

    level: number;
    xp: number;
    xpToNext: number;
    gold: number;
    floor: number;
    inventory: Item[];
    skills: Skill[]; // Max 4
    skillInventory: Skill[]; // Spare skills
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
    defense: number;
    dodgeChance: number;
    critChance?: number;
    vampirism?: number;
    isElite: boolean;
    icon: React.ReactNode;
}

interface Room {
    id: string;
    type: RoomType;
    description: string;
    icon: React.ReactNode;
    enemy?: Enemy;
    merchantItems?: (Item | Skill)[];
}

// --- Constants ---
const STARTING_SKILLS: Skill[] = [
    { id: 'strike', name: 'Strike', type: 'ATTACK', power: 1.0, description: 'Basic attack.', value: 0 },
    { id: 'parry', name: 'Parry', type: 'DEFENSE', power: 0.5, description: 'Reduce dmg 50% & Counter.', value: 0 }
];

const BASE_PLAYER: Player = {
    hp: 100,
    maxHp: 100,
    baseMaxHp: 100,
    attack: 10,
    baseAttack: 10,
    defense: 0,
    baseDefense: 0,
    critChance: 5, // Base 5%
    dodgeChance: 5, // Base 5%
    vampirism: 0,
    reflect: 0,
    pierce: 0,
    level: 1,
    xp: 0,
    xpToNext: 100,
    gold: 0,
    floor: 1,
    inventory: [],
    skills: [...STARTING_SKILLS],
    skillInventory: [],
    equipped: {
        weapon: null,
        armor: null,
        accessory: null
    }
};

const ITEMS: Item[] = [
    // WEAPONS
    { id: 'w-1', name: 'Rusted Dagger', type: 'WEAPON', rarity: 'COMMON', stats: { attack: 2, critChance: 5 }, description: 'Fast but weak.', value: 30 },
    { id: 'w-2', name: 'Iron Sword', type: 'WEAPON', rarity: 'COMMON', stats: { attack: 5 }, description: 'Reliable blade.', value: 100 },
    { id: 'w-3', name: 'Heavy Mace', type: 'WEAPON', rarity: 'UNCOMMON', stats: { attack: 8, pierce: 2 }, description: 'Crushes armor.', value: 250 },
    { id: 'w-4', name: 'Katana', type: 'WEAPON', rarity: 'RARE', stats: { attack: 7, critChance: 15 }, description: 'Razor sharp.', value: 400 },
    { id: 'w-5', name: 'Vampire Fang', type: 'WEAPON', rarity: 'EPIC', stats: { attack: 10, vampirism: 10 }, description: 'Drips with blood.', value: 800 },
    { id: 'w-6', name: 'Soul Reaver', type: 'WEAPON', rarity: 'LEGENDARY', stats: { attack: 25, vampirism: 20, critChance: 10 }, description: 'Consumes souls.', value: 3000 },

    // ARMOR
    { id: 'a-1', name: 'Tattered Robe', type: 'ARMOR', rarity: 'COMMON', stats: { defense: 1, dodgeChance: 2 }, description: 'Better than nothing.', value: 30 },
    { id: 'a-2', name: 'Leather Armor', type: 'ARMOR', rarity: 'COMMON', stats: { defense: 3, maxHp: 10 }, description: 'Sturdy leather.', value: 100 },
    { id: 'a-3', name: 'Plate Mail', type: 'ARMOR', rarity: 'UNCOMMON', stats: { defense: 8, dodgeChance: -5 }, description: 'Heavy protection.', value: 300 },
    { id: 'a-4', name: 'Cloak of Shadows', type: 'ARMOR', rarity: 'RARE', stats: { defense: 4, dodgeChance: 15 }, description: 'Hard to hit.', value: 450 },
    { id: 'a-5', name: 'Spiked Shell', type: 'ARMOR', rarity: 'EPIC', stats: { defense: 12, reflect: 20, maxHp: 50 }, description: 'Hurts to touch.', value: 900 },
    { id: 'a-6', name: 'Dragon Scale', type: 'ARMOR', rarity: 'LEGENDARY', stats: { defense: 20, maxHp: 200, reflect: 10 }, description: 'Legendary defense.', value: 4000 },

    // ACCESSORIES
    { id: 'ac-1', name: 'Old Ring', type: 'ACCESSORY', rarity: 'COMMON', stats: { maxHp: 5 }, description: 'A simple band.', value: 20 },
    { id: 'ac-2', name: 'Charm of Health', type: 'ACCESSORY', rarity: 'UNCOMMON', stats: { maxHp: 30 }, description: 'Vitality boost.', value: 150 },
    { id: 'ac-3', name: 'Berserker Ring', type: 'ACCESSORY', rarity: 'RARE', stats: { attack: 5, defense: -2, critChance: 5 }, description: 'Reckless power.', value: 350 },
    { id: 'ac-4', name: 'Amulet of Evasion', type: 'ACCESSORY', rarity: 'RARE', stats: { dodgeChance: 10 }, description: 'Blurry movement.', value: 350 },
    { id: 'ac-5', name: 'Vampiric Amulet', type: 'ACCESSORY', rarity: 'EPIC', stats: { vampirism: 8 }, description: 'Life steal.', value: 700 },
    { id: 'ac-6', name: 'Crown of Kings', type: 'ACCESSORY', rarity: 'LEGENDARY', stats: { attack: 10, defense: 10, maxHp: 100, critChance: 5, dodgeChance: 5 }, description: 'Fit for a ruler.', value: 5000 },

    // CONSUMABLES
    { id: 'c-1', name: 'Potion', type: 'CONSUMABLE', rarity: 'COMMON', stats: { hp: 50 }, description: 'Heals 50 HP.', value: 20 },
    { id: 'c-2', name: 'Hi-Potion', type: 'CONSUMABLE', rarity: 'UNCOMMON', stats: { hp: 150 }, description: 'Heals 150 HP.', value: 60 },
    { id: 'c-3', name: 'Elixir', type: 'CONSUMABLE', rarity: 'RARE', stats: { hp: 500 }, description: 'Heals 500 HP.', value: 200 },
];

const SKILL_POOL: Skill[] = [
    { id: 'bash', name: 'Bash', type: 'ATTACK', power: 1.3, description: 'Heavy hit.', value: 100 },
    { id: 'heal', name: 'Heal', type: 'HEAL', power: 30, description: 'Restores Health.', value: 150 },
    { id: 'fire', name: 'Fireball', type: 'ATTACK', power: 1.8, description: 'Massive damage.', value: 300 },
    { id: 'focus', name: 'Focus', type: 'BUFF', power: 2.0, description: 'Next hit x2 Dmg.', value: 120 },
];

// --- Helper Functions ---
const BatIcon = (props: React.ComponentProps<'svg'>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M22 6c-2.7 1.3-5.2 0-7-2-1.7 1-4.3 0-6 0-1.7 1-4 2-7 2 0 4.6 2 7 5 7 1.8 0 3-1 4-2.5C12 11.5 14 13 17 13c2.7 0 5-2.2 5-7z" />
        <path d="M9 13l3 3" />
        <path d="M15 13l-3 3" />
    </svg>
);

const ENEMY_TEMPLATES = [
    { name: 'Skeleton', Icon: Skull, color: 'text-primary', hpMod: 1.0, atkMod: 1.0, def: 0, dodge: 5, crit: 5, vamp: 0 },
    { name: 'Ghost', Icon: Ghost, color: 'text-primary opacity-80', hpMod: 0.6, atkMod: 0.8, def: 0, dodge: 30, crit: 0, vamp: 0 },
    { name: 'Slime', Icon: Droplet, color: 'text-game-success', hpMod: 1.4, atkMod: 0.6, def: 2, dodge: 0, crit: 0, vamp: 0 },
    { name: 'Bat', Icon: BatIcon, color: 'text-game-info', hpMod: 0.5, atkMod: 0.7, def: 0, dodge: 40, crit: 0, vamp: 15 },
    { name: 'Orc', Icon: Shield, color: 'text-game-success', hpMod: 1.2, atkMod: 1.2, def: 5, dodge: 0, crit: 10, vamp: 0 },
];

const generateRooms = (floor: number): Room[] => {
    const numOptions = Math.floor(Math.random() * 2) + 2; // Reduced to 2-3 options for better UI balance
    const options: Room[] = [];
    let hasRest = false;

    // Balance Adjustment: Reduce stats by 15% for first 15 floors
    const difficultyMod = floor <= 15 ? 0.85 : 1.0;

    for (let i = 0; i < numOptions; i++) {
        const rand = Math.random();
        let type: RoomType = 'ENEMY';
        let description = 'A dark corridor...';
        let icon = <Ghost size={28} strokeWidth={1.5} />;
        let enemy: Enemy | undefined;
        let merchantItems: (Item | Skill)[] | undefined;

        if (rand < 0.5) {
            type = 'ENEMY';
            const template = ENEMY_TEMPLATES[Math.floor(Math.random() * ENEMY_TEMPLATES.length)];
            description = `A wild ${template.name} appears.`;
            icon = <template.Icon size={28} strokeWidth={1.5} className={template.color.split(' ')[0]} />;

            const baseHp = 30 + (floor * 5);
            const baseAtk = 5 + floor;

            enemy = {
                name: template.name,
                hp: Math.floor(baseHp * template.hpMod * difficultyMod),
                maxHp: Math.floor(baseHp * template.hpMod * difficultyMod),
                attack: Math.floor(baseAtk * template.atkMod * difficultyMod),
                defense: template.def + Math.floor(floor * 0.2),
                dodgeChance: template.dodge,
                critChance: template.crit,
                vampirism: template.vamp,
                isElite: false,
                icon: <template.Icon size={64} className={template.color} />
            };
        } else if (rand < 0.6) {
            type = 'ELITE';
            description = 'Dangerous aura!';
            icon = <Skull size={28} strokeWidth={1.5} className="text-game-danger" />;
            enemy = {
                name: 'Dark Knight',
                hp: Math.floor((60 + floor * 10) * difficultyMod),
                maxHp: Math.floor((60 + floor * 10) * difficultyMod),
                attack: Math.floor((10 + floor * 2) * difficultyMod),
                defense: 10 + Math.floor(floor * 0.5),
                dodgeChance: 10,
                critChance: 15,
                vampirism: 10,
                isElite: true,
                icon: <Skull size={64} className="text-game-danger animate-pulse" />
            };
        } else if (rand < 0.7) {
            type = 'TREASURE';
            description = 'Glimmering loot.';
            icon = <Crown size={28} strokeWidth={1.5} className="text-game-warning" />; // Updated size and strokeWidth
        } else if (rand < 0.8 && !hasRest) {
            type = 'REST';
            description = 'A safe spot.';
            icon = <Heart size={28} strokeWidth={1.5} className="text-game-success" />; // Updated size and strokeWidth
            hasRest = true;
        } else if (rand < 0.9) {
            type = 'MERCHANT';
            description = 'A wandering trader.';
            icon = <ShoppingBag size={28} strokeWidth={1.5} className="text-game-info" />; // Updated size and strokeWidth
            // Generate shop Items
            merchantItems = [];
            for (let k = 0; k < 3; k++) {
                if (Math.random() > 0.5) {
                    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
                    merchantItems.push({ ...item, value: Math.floor(item.value * 0.8), id: `${item.id}-shop-${Date.now()}-${k}` });
                } else {
                    const skill = SKILL_POOL[Math.floor(Math.random() * SKILL_POOL.length)];
                    merchantItems.push({ ...skill, value: Math.floor(skill.value * 0.8), id: `${skill.id}-shop-${Date.now()}-${k}` });
                }
            }
        } else {
            type = 'EVENT';
            description = 'Unknown...';
            icon = <ChevronRight size={16} />;
        }

        options.push({
            id: `room - ${Date.now()} -${i} `,
            type,
            description,
            icon,
            enemy,
            merchantItems
        });
    }
    return options;
};

const generateLoot = (floor: number): Item | null => {
    if (Math.random() > 0.3 - (floor * 0.01)) {
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        return { ...item, id: `${item.id} -${Date.now()} ` };
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
    const [pendingLoot, setPendingLoot] = useState<Item | null>(null);
    const [diamonds, setDiamonds] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement>(null);

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('joe_rpg_diamonds');
        if (saved) setDiamonds(parseInt(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('joe_rpg_diamonds', diamonds.toString());
    }, [diamonds]);

    // Auto-focus logic
    useEffect(() => {
        const timer = setTimeout(() => containerRef.current?.focus(), 10);
        return () => clearTimeout(timer);
    }, []);

    // --- Helpers ---
    const addLog = (msg: string) => setCombatLog(prev => [msg, ...prev].slice(0, 3));

    const startGame = () => {
        setPlayer({ ...BASE_PLAYER, skills: [...STARTING_SKILLS] });
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
        let critChance = 5;
        let dodgeChance = 5;
        let vampirism = 0;
        let reflect = 0;
        let pierce = 0;

        const addStats = (item: Item | null) => {
            if (!item) return;
            maxHp += item.stats.maxHp || 0;
            attack += item.stats.attack || 0;
            defense += item.stats.defense || 0;
            critChance += item.stats.critChance || 0;
            dodgeChance += item.stats.dodgeChance || 0;
            vampirism += item.stats.vampirism || 0;
            reflect += item.stats.reflect || 0;
            pierce += item.stats.pierce || 0;
        };

        addStats(p.equipped.weapon);
        addStats(p.equipped.armor);
        addStats(p.equipped.accessory);

        return { ...p, maxHp, attack, defense, critChance, dodgeChance, vampirism, reflect, pierce };
    };

    // Smart Loot Logic
    const handleLootAcquisition = (item: Item) => {
        // Check if consumable
        if (item.type === 'CONSUMABLE') {
            setPlayer(p => ({ ...p, inventory: [...p.inventory, item] }));
            addLog(`Picked up ${item.name}.`);
            finishRoom();
            return;
        }

        // Check if slot empty
        const slot = item.type === 'WEAPON' ? 'weapon' : item.type === 'ARMOR' ? 'armor' : 'accessory';

        // Need to access player state directly, but can't inside checker easily without context
        // We act on current `player` state
        if (!player.equipped[slot]) {
            // Auto Equip
            setPlayer(prev => {
                const newEquipped = { ...prev.equipped, [slot]: item };
                const pWithStats = calculateStats({ ...prev, equipped: newEquipped });
                pWithStats.hp = Math.min(pWithStats.hp, pWithStats.maxHp); // Clamp HP? Or keep it?
                return pWithStats;
            });
            addLog(`Auto - equipped ${item.name}.`);
            finishRoom();
        } else {
            // Manual Decision Needed
            setPendingLoot(item);
            setGameState('LOOT');
        }
    };

    const resolveLoot = (action: 'SWAP' | 'TAKE' | 'DISCARD') => {
        if (!pendingLoot) return;

        if (action === 'DISCARD') {
            addLog(`Discarded ${pendingLoot.name}.`);
            finishRoom();
            return;
        }

        setPlayer(prev => {
            const slot = pendingLoot.type === 'WEAPON' ? 'weapon' : pendingLoot.type === 'ARMOR' ? 'armor' : 'accessory';

            if (action === 'SWAP') {
                // Replace equipped
                const oldItem = prev.equipped[slot];
                const newEquipped = { ...prev.equipped, [slot]: pendingLoot };
                const newInv = oldItem ? [...prev.inventory, oldItem] : prev.inventory;

                const p = calculateStats({ ...prev, equipped: newEquipped, inventory: newInv });
                addLog(`Equipped ${pendingLoot.name}.`);
                return p;
            } else {
                // TAKE (Add to inventory)
                return { ...prev, inventory: [...prev.inventory, pendingLoot] };
            }
        });
        finishRoom();
    };

    const equipItem = (item: Item) => {
        setPlayer(prev => {
            let newEquipped = { ...prev.equipped };
            let newInventory = prev.inventory.filter(i => i.id !== item.id);
            let oldItem: Item | null = null;

            if (item.type === 'WEAPON') { oldItem = newEquipped.weapon; newEquipped.weapon = item; }
            else if (item.type === 'ARMOR') { oldItem = newEquipped.armor; newEquipped.armor = item; }
            else if (item.type === 'ACCESSORY') { oldItem = newEquipped.accessory; newEquipped.accessory = item; }
            else if (item.type === 'CONSUMABLE') {
                const restored = item.stats.hp || 0;
                addLog(`Used ${item.name}.+${restored} HP.`);
                return { ...prev, hp: Math.min(prev.maxHp, prev.hp + restored), inventory: newInventory };
            }

            if (oldItem) newInventory.push(oldItem);
            const p = calculateStats({ ...prev, equipped: newEquipped, inventory: newInventory });
            p.hp = Math.min(p.hp, p.maxHp);
            addLog(`Equipped ${item.name}.`);
            return p;
        });
    };

    const buyItem = (item: Item | Skill) => {
        if (player.gold < item.value) {
            addLog("Not enough Gold!");
            return;
        }

        setPlayer(prev => ({ ...prev, gold: prev.gold - item.value }));

        // Remove from shop (visual only, strictness not needed as shop regenerates)
        if (currentRoom?.merchantItems) {
            const idx = currentRoom.merchantItems.findIndex(i => i.id === item.id);
            if (idx > -1) currentRoom.merchantItems.splice(idx, 1);
        }

        if ('power' in item) {
            // It's a skill
            learnSkill(item as Skill);
        } else {
            // It's an item
            handleLootAcquisition(item as Item);
        }
    };

    const learnSkill = (skill: Skill) => {
        setPlayer(prev => {
            if (prev.skills.length < 4) {
                addLog(`Learned ${skill.name} !`);
                return { ...prev, skills: [...prev.skills, skill] };
            } else {
                // For now, auto-add to "spare" inventory or just replace last?
                // Request said "swappable option".
                addLog(`Learned ${skill.name} (Stored).`);
                return { ...prev, skillInventory: [...prev.skillInventory, skill] };
            }
        });
    };

    const enterRoom = (room: Room) => {
        setCurrentRoom(room);
        if (room.type === 'ENEMY' || room.type === 'ELITE') {
            setGameState('COMBAT');
            addLog(`Encountered ${room.enemy?.name} !`);
        } else if (room.type === 'TREASURE') {
            // Chance for Diamond
            if (Math.random() < 0.03) { // 3% for Diamond
                setDiamonds(d => d + 1);
                addLog("Found a Rare Diamond!");
            }
            const goldFound = Math.floor(Math.random() * 50) + 10;
            const item = generateLoot(player.floor);

            setPlayer(p => ({ ...p, gold: p.gold + goldFound }));
            addLog(`Found ${goldFound} gold!`);

            if (item) {
                addLog(`You found ${item.name} !`);
                handleLootAcquisition(item);
            } else {
                setGameState('EVENT'); // Done
            }
        } else if (room.type === 'MERCHANT') {
            setGameState('MERCHANT');
            addLog("Welcome, traveler!");
        } else if (room.type === 'REST') {
            setGameState('EVENT');
            const heal = Math.floor(player.maxHp * 0.3);
            setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + heal) }));
            addLog(`Rested. + ${heal} HP.`);
        } else {
            setGameState('EVENT');
            addLog("Nothing happened...");
        }
    };

    const useSkill = (skillIndex: number) => {
        if (!currentRoom?.enemy || !player.skills[skillIndex]) return;

        const skill = player.skills[skillIndex];
        const enemy = currentRoom.enemy;

        // Player Turn
        let pDmg = player.attack;
        let eDmg = enemy.attack;
        let pDef = player.defense;
        let skillBonusDefense = 0;

        // Skill Effects
        if (skill.type === 'ATTACK') {
            // Check Enemy Dodge
            if (Math.random() * 100 < (enemy.dodgeChance || 0)) {
                addLog(`${enemy.name} dodged your attack!`);
            } else {
                let dmg = Math.floor(Math.max(1, pDmg * skill.power));

                // Critical Hit
                let isCrit = false;
                if (Math.random() * 100 < player.critChance) {
                    dmg = Math.floor(dmg * 2);
                    isCrit = true;
                }

                // Apply Enemy Defense & Pierce
                const effectiveDef = Math.max(0, (enemy.defense || 0) - player.pierce);
                dmg = Math.max(1, dmg - effectiveDef);

                enemy.hp -= dmg;
                addLog(`Used ${skill.name} !${isCrit ? 'CRITICAL! ' : ''}Hit for ${dmg}.`);

                // Vampirism
                if (player.vampirism > 0) {
                    const heal = Math.ceil(dmg * (player.vampirism / 100));
                    if (heal > 0) {
                        setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + heal) }));
                        addLog(`Drained ${heal} HP.`);
                    }
                }
            }

        } else if (skill.type === 'DEFENSE') {
            // Power acts as DMG reduction multiplier (0.5 = 50% taken)
            skillBonusDefense = eDmg * (1 - skill.power);
            addLog(`${skill.name} !You brace yourself.`);

            // Counter logic
            const counterDmg = Math.floor(pDmg * 0.5);
            enemy.hp -= counterDmg;
            addLog(`Counter - attack for ${counterDmg}!`);
        } else if (skill.type === 'HEAL') {
            let heal = skill.power;
            // Crit Heal? Why not.
            if (Math.random() * 100 < player.critChance) {
                heal *= 1.5;
                addLog(`Critical Heal!`);
            }
            setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + heal) }));
            addLog(`Used ${skill.name}.+${Math.floor(heal)} HP.`);
        } else if (skill.type === 'BUFF') {
            addLog(`${skill.name} !(Buff not impl yet)`);
        }

        // Enemy Turn
        if (enemy.hp > 0) {
            // Dodge Check
            if (Math.random() * 100 < player.dodgeChance) {
                addLog(`Dodged ${enemy.name} 's attack!`);
            } else {
                const damage = Math.max(0, Math.floor(eDmg - pDef - skillBonusDefense));

                // Enemy Crit
                let finalDmg = damage;
                let isEnemyCrit = false;
                if (Math.random() * 100 < (enemy.critChance || 0)) {
                    finalDmg = Math.floor(damage * 1.5);
                    isEnemyCrit = true;
                }

                setPlayer(p => {
                    const newHp = p.hp - finalDmg;
                    if (newHp <= 0) setGameState('GAME_OVER');
                    return { ...p, hp: newHp };
                });
                addLog(`${enemy.name} ${isEnemyCrit ? 'CRITICALLY ' : ''}hits for ${finalDmg}!`);

                // Enemy Vampirism
                if ((enemy.vampirism || 0) > 0 && finalDmg > 0) {
                    const heal = Math.ceil(finalDmg * ((enemy.vampirism || 0) / 100));
                    enemy.hp += heal; // No max HP cap for enemies for simplicity, or add one if needed? Let's keep it simple.
                    addLog(`${enemy.name} drains ${heal} HP!`);
                }

                // Reflect
                if (player.reflect > 0 && finalDmg > 0) {
                    const reflected = Math.ceil(finalDmg * (player.reflect / 100));
                    enemy.hp -= reflected;
                    addLog(`Reflected ${reflected} damage!`);
                }
            }
        } else {
            handleVictory(enemy);
        }
    };

    const handleVictory = (enemy: Enemy) => {
        const xpGain = enemy.isElite ? 50 : 20;
        // Chance for loot
        const loot = generateLoot(player.floor);
        // Chance for Diamond (Elite only?)
        if (enemy.isElite && Math.random() < 0.08) {
            setDiamonds(d => d + 1);
            addLog("Enemy dropped a Diamond!");
        }
        setPlayer(p => {
            let newXp = p.xp + xpGain;
            let newLevel = p.level;
            let newBaseRef = p;

            if (newXp >= p.xpToNext) {
                newXp -= p.xpToNext;
                newLevel++;
                addLog("Level Up!");
                newBaseRef = {
                    ...p,
                    baseMaxHp: p.baseMaxHp + 10,
                    baseAttack: p.baseAttack + 2
                };
            }

            const goldGain = Math.floor(15 + (newLevel * 8) + Math.random() * 20);
            addLog(`Victory! +${xpGain} XP, +${goldGain} Gold`);

            const healedP = { ...newBaseRef, xp: newXp, level: newLevel, hp: p.hp + 5, gold: p.gold + goldGain };
            const stats = calculateStats(healedP);
            return { ...stats, hp: Math.min(stats.maxHp, stats.hp) };
        });

        if (loot) {
            addLog(`Looted: ${loot.name}`);
            handleLootAcquisition(loot);
        } else {
            finishRoom();
        }
    };

    const finishRoom = () => {
        if (gameState === 'GAME_OVER') return;
        setRooms(generateRooms(player.floor + 1));
        setPlayer(p => ({ ...p, floor: p.floor + 1 }));
        setGameState('ROOM_SELECTION');
        setCurrentRoom(null);
        setPendingLoot(null);
    };

    // --- Keyboard Handling ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isFocused && e.target !== containerRef.current) return;
            e.stopPropagation();
            if (isFocused && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Escape', ' '].includes(e.key)) e.preventDefault();

            // Navigation
            if (gameState === 'CONFIRM_EXIT') {
                if (e.key === 'y' || e.key === 'Enter') onExit && onExit();
                if (e.key === 'n' || e.key === 'Escape') setGameState(previousState);
                return;
            }

            if (['MENU', 'ROOM_SELECTION', 'COMBAT', 'EVENT', 'CHARACTER', 'INVENTORY', 'MERCHANT'].includes(gameState)) {
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
                if (!isNaN(num) && num > 0 && num <= rooms.length) enterRoom(rooms[num - 1]);
                if (e.key.toLowerCase() === 'c') { setPreviousState('ROOM_SELECTION'); setGameState('CHARACTER'); }
                if (e.key.toLowerCase() === 'i') { setPreviousState('ROOM_SELECTION'); setGameState('INVENTORY'); }
                if (e.key === 'Escape') { setIsFocused(false); containerRef.current?.blur(); }
            } else if (gameState === 'COMBAT') {
                const num = parseInt(e.key);
                if (!isNaN(num) && num > 0 && num <= player.skills.length) useSkill(num - 1);
            } else if (gameState === 'MERCHANT') {
                const num = parseInt(e.key);
                // 1-3 to buy items, Enter/Space to leave
                if (!isNaN(num) && num > 0 && num <= (currentRoom?.merchantItems?.length || 0)) {
                    buyItem(currentRoom!.merchantItems![num - 1]);
                }
                if (e.key === 'Enter' || e.key === ' ') finishRoom();
            } else if (gameState === 'LOOT') {
                // Compare logic keys? 
                if (e.key.toLowerCase() === 'y' || e.key === ' ') resolveLoot('SWAP');
                if (e.key.toLowerCase() === 'n') resolveLoot('DISCARD');
                if (e.key.toLowerCase() === 't') resolveLoot('TAKE'); // If we have inventory space
            } else if (gameState === 'EVENT') {
                if (e.key === 'Enter' || e.key === ' ') finishRoom();
            } else if (gameState === 'GAME_OVER') {
                if (e.key === 'Enter') setGameState('MENU');
            } else if (gameState === 'CHARACTER' || gameState === 'INVENTORY') {
                if (e.key === 'Escape') setGameState(previousState);
            }
        };

        const container = containerRef.current;
        container?.addEventListener('keydown', handleKeyDown);
        return () => container?.removeEventListener('keydown', handleKeyDown);
    }, [gameState, rooms, currentRoom, player, isFocused, pendingLoot]);

    // --- Render ---
    if (gameState === 'CONFIRM_EXIT') {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-in fade-in outline-none relative" ref={containerRef} tabIndex={0} onClick={() => containerRef.current?.focus()}>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40"></div>
                <div className="relative z-50 p-6 border border-game-danger/50 rounded bg-black w-3/4 max-w-sm">
                    <h1 className="text-xl font-bold text-game-danger mb-2">QUIT GAME?</h1>
                    <p className="text-[10px] text-primary/60 mb-6">Progress will be lost.</p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" size="sm" className="h-8 border-game-danger/50 text-game-danger hover:bg-game-danger/20 hover:text-game-danger" onClick={onExit}>[Y] Yes</Button>
                        <Button variant="outline" size="sm" className="h-8 border-primary/50 text-primary hover:bg-primary/10" onClick={() => setGameState(previousState)}>[N] No</Button>
                    </div>
                </div>
            </div>
        )
    }

    if (gameState === 'MENU') return (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-in fade-in outline-none" ref={containerRef} tabIndex={0} onClick={() => containerRef.current?.focus()}>
            <h1 className="text-2xl font-bold text-primary tracking-widest">TERMINAL CRAWLER</h1>
            <p className="text-xs text-primary/60">Delve deep. Die often.</p>
            <div className="mt-8 animate-pulse text-xs opacity-70 flex flex-col gap-2"><span>[ Press ENTER to Start ]</span><span>[ Press Q to Quit ]</span></div>
        </div>
    );

    if (gameState === 'GAME_OVER') return (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-in fade-in outline-none" ref={containerRef} tabIndex={0} onClick={() => containerRef.current?.focus()}>
            <Skull size={48} className="text-game-danger mb-4" />
            <h1 className="text-2xl font-bold text-game-danger">YOU DIED</h1>
            <p className="text-xs text-primary/60">Floor Reached: {player.floor}</p>
            <div className="mt-8 animate-pulse text-xs opacity-70">[ Press ENTER to Menu ]</div>
        </div>
    );

    return (
        <div className={`flex flex-col h-full max-h-[22rem] overflow-hidden font-mono text-xs select-none relative p-1 outline-none transition-colors ${isFocused ? 'bg-background' : 'opacity-70 grayscale'}`} ref={containerRef} tabIndex={0} onClick={() => containerRef.current?.focus()}>
            {!isFocused && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px]"><div className="text-white bg-black/80 px-3 py-1 rounded border border-white/20 animate-pulse cursor-pointer">[ Click to Focus ]</div></div>}

            {/* Compact Header to prevent overlap */}
            <div className="flex justify-between items-center border-b border-primary/20 pb-1.5 mb-2 px-2 bg-primary/5">
                <div className="flex flex-wrap gap-x-4 gap-y-1 max-w-[70%]">
                    <div className="flex items-center gap-1.5 text-primary"><Heart size={12} strokeWidth={2.5} /> <span className="text-xs font-bold leading-none">{Math.ceil(player.hp)}/{player.maxHp}</span></div>
                    <div className="flex items-center gap-1.5 text-primary/80"><Shield size={12} strokeWidth={2.5} /> <span className="text-xs font-bold leading-none">{player.defense}</span></div>
                    <div className="flex items-center gap-1.5 text-game-info"><Zap size={12} strokeWidth={2.5} /> <span className="text-xs font-bold leading-none">L{player.level}</span></div>
                    <div className="flex items-center gap-1.5 text-game-warning"><Coins size={12} strokeWidth={2.5} /> <span className="text-xs font-bold leading-none">{player.gold}</span></div>
                    <div className="flex items-center gap-1.5 text-game-info"><Gem size={12} strokeWidth={2.5} /> <span className="text-xs font-bold leading-none">{diamonds}</span></div>
                </div>
                <div className="text-right text-xl font-black text-primary/40 tracking-tighter shrink-0">FL {player.floor}</div>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-center min-h-0">
                {gameState === 'ROOM_SELECTION' && (
                    <div className="flex flex-col h-full animate-in fade-in py-1">
                        {/* maximized Top Nav */}
                        <div className="flex justify-between items-center text-xs uppercase tracking-[0.2em] font-black mb-2 px-3">
                            <div className="flex items-center gap-2 text-primary/80">
                                <span className="bg-primary/20 px-2 py-0.5 rounded border border-primary/40 text-[9px] font-mono shadow-sm">C</span>
                                <span className="text-[10px]">STATUS</span>
                            </div>
                            <div className="text-primary font-black italic border-x-2 border-primary/20 px-4 py-0.5 bg-primary/5 text-[11px]">PROJECT PATH</div>
                            <div className="flex items-center gap-2 text-primary/80">
                                <span className="bg-primary/20 px-2 py-0.5 rounded border border-primary/40 text-[9px] font-mono shadow-sm">I</span>
                                <span className="text-[10px]">ITEMS</span>
                            </div>
                        </div>

                        {/* Adaptive Room Cards */}
                        <div className={`grid ${rooms.length === 4 ? 'grid-cols-2' : rooms.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2 px-1 flex-1 min-h-0`}>
                            {rooms.map((room, i) => (
                                <div
                                    key={room.id}
                                    className={`group flex flex-col items-center justify-between p-2 border border-primary/20 hover:bg-primary/5 hover:border-primary/60 cursor-pointer rounded transition-all relative overflow-hidden ${rooms.length === 4 ? 'h-28' : 'h-40'} shadow-inner`}
                                    onClick={() => enterRoom(room)}
                                >
                                    {/* Number Badge */}
                                    <div className="absolute top-1 left-1 text-[9px] font-mono opacity-40 font-black">0{i + 1}</div>

                                    {/* Icon Container */}
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-primary group-hover:scale-125 transition-transform duration-300 drop-shadow-[0_0_8px_var(--primary)] p-2">
                                            {room.icon}
                                        </div>
                                    </div>

                                    {/* Info Panel */}
                                    <div className="w-full text-center border-t border-primary/20 pt-1.5 bg-black/20">
                                        <div className="text-[11px] font-black text-primary uppercase tracking-wider mb-0.5 group-hover:text-white transition-colors truncate px-1 drop-shadow-sm">
                                            {room.type === 'ENEMY' ? room.enemy?.name : room.type}
                                        </div>
                                        <div className="text-[9px] text-primary/80 leading-tight line-clamp-1 italic px-1 font-medium">
                                            {room.description}
                                        </div>
                                    </div>

                                    {/* Scanning line for rooms */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-2 w-full -translate-y-full group-hover:animate-[scan-v_3s_linear_infinite] pointer-events-none"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'COMBAT' && currentRoom?.enemy && (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-200 py-1">
                        <div className="mb-1.5 relative">
                            {/* Enemy Icon with theme-aware glow */}
                            <div className="flex flex-col items-center justify-center p-1 relative min-h-[5rem]">
                                <div className="text-base font-bold text-game-danger mb-1 tracking-widest uppercase drop-shadow-[0_0_5px_var(--game-danger)]">{currentRoom.enemy.name}</div>
                                <div
                                    className="scale-100 origin-center transition-transform duration-500"
                                    style={{ filter: 'drop-shadow(0 0 10px var(--game-danger))' }}
                                >
                                    {currentRoom.enemy.icon}
                                </div>
                            </div>
                        </div>

                        {/* Standard Segmented Health Bar */}
                        <div className="flex flex-col gap-1 w-48 mb-2">
                            <div className="flex justify-between text-[9px] uppercase tracking-tighter opacity-50 font-bold">
                                <span className="text-primary">Target Status</span>
                                <span className="text-game-danger">{Math.ceil((currentRoom.enemy.hp / currentRoom.enemy.maxHp) * 100)}%</span>
                            </div>
                            <div className="h-3 w-full bg-black/40 border border-game-danger/30 p-[1px] relative overflow-hidden">
                                <div
                                    className="h-full bg-game-danger transition-all duration-500 relative"
                                    style={{
                                        width: `${(currentRoom.enemy.hp / currentRoom.enemy.maxHp) * 100}%`,
                                        backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)',
                                        backgroundSize: '12.5% 100%',
                                        boxShadow: '0 0 15px var(--game-danger)'
                                    }}
                                />
                                {/* Scanning line effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full -translate-x-full animate-[scan_2s_linear_infinite]"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                            {player.skills.map((skill, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    className="h-11 border-primary/20 hover:bg-primary/5 hover:border-primary/40 flex flex-col items-center justify-center px-4 gap-0.5 transition-all active:scale-95 group relative overflow-hidden"
                                    onClick={() => useSkill(i)}
                                >
                                    <span className="font-bold text-primary text-[11px] truncate w-full text-center">[{i + 1}] {skill.name}</span>
                                    <span className="text-[9px] opacity-40 uppercase tracking-[0.2em] font-medium leading-tight">{skill.type}</span>

                                    {/* Subtle corner detail for "Retro-Tech" look */}
                                    <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'MERCHANT' && currentRoom?.merchantItems && (
                    <div className="flex flex-col h-full animate-in fade-in py-1">
                        <div className="text-sm font-black text-game-info mb-3 uppercase tracking-[0.2em] text-center">Black Market</div>
                        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto px-1 pr-2 scrollbar-none">
                            {currentRoom.merchantItems.map((item, i) => {
                                const isSkill = 'power' in item;
                                const itemStats = !isSkill ? (item as Item).stats : null;
                                const slot = !isSkill ? ((item as Item).type === 'WEAPON' ? 'weapon' : (item as Item).type === 'ARMOR' ? 'armor' : (item as Item).type === 'ACCESSORY' ? 'accessory' : null) : null;
                                const equipped = slot ? player.equipped[slot] : null;

                                return (
                                    <div
                                        key={item.id}
                                        className={`flex justify-between items-center p-2.5 border border-primary/10 rounded hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all ${player.gold >= item.value ? 'text-game-warning' : 'text-game-danger'}`}
                                        onClick={() => buyItem(item)}
                                    >
                                        <div className="flex gap-3 text-xs flex-1">
                                            <span className="opacity-40 font-mono text-[10px] self-start mt-0.5">[{i + 1}]</span>
                                            <div className="flex flex-col">
                                                <div className="font-bold leading-tight group-hover:translate-x-1 transition-transform">{item.name}</div>
                                                <div className="text-[10px] opacity-50 leading-tight mt-1 line-clamp-1">{item.description}</div>
                                            </div>
                                        </div>

                                        {/* Stat Diff Panel */}
                                        {equipped && itemStats && (
                                            <div className="hidden sm:flex gap-2 mx-2 text-[9px] font-bold">
                                                {[
                                                    { key: 'attack', label: 'ATK' },
                                                    { key: 'defense', label: 'DEF' },
                                                    { key: 'maxHp', label: 'HP' }
                                                ].map(s => {
                                                    const val = (itemStats as any)[s.key] || 0;
                                                    const eqVal = (equipped.stats as any)[s.key] || 0;
                                                    const diff = val - eqVal;
                                                    if (diff === 0) return null;
                                                    return (
                                                        <span key={s.key} className={diff > 0 ? 'text-game-success' : 'text-game-danger'}>
                                                            {s.label}{diff > 0 ? '+' : ''}{diff}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div className="text-base font-bold ml-2 shrink-0 border-l border-primary/10 pl-3">{item.value}G</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="text-center text-[10px] opacity-40 mt-auto py-2 uppercase tracking-widest">[ Enter ] Leave Shop</div>
                    </div>
                )}

                {gameState === 'LOOT' && pendingLoot && (
                    <div className="flex flex-col h-full animate-in fade-in py-1">
                        <div className="text-sm font-black text-game-warning mb-1 uppercase tracking-tighter text-center italic">Better Gear?</div>
                        <div className="flex-1 flex flex-col justify-center min-h-0">
                            <div className="flex justify-center gap-2 items-stretch px-2 mb-1.5">
                                {(() => {
                                    const slot = pendingLoot.type === 'WEAPON' ? 'weapon' : pendingLoot.type === 'ARMOR' ? 'armor' : 'accessory';
                                    const equippedItem = player.equipped[slot];

                                    const renderStats = (item: Item | null, isComparing: boolean) => {
                                        const stats: { label: string; key: keyof Item['stats'] }[] = [
                                            { label: 'ATK', key: 'attack' },
                                            { label: 'DEF', key: 'defense' },
                                            { label: 'HP', key: 'maxHp' },
                                        ];

                                        return (
                                            <div className="space-y-1 flex flex-col justify-center h-full">
                                                {stats.map(({ label, key }) => {
                                                    const v = item?.stats[key] || 0;
                                                    const equippedV = equippedItem?.stats[key] || 0;
                                                    const diff = v - equippedV;

                                                    return (
                                                        <div key={label} className="flex justify-between items-center border-b border-primary/5 pb-0.5 last:border-0 h-7">
                                                            <span className="opacity-40 uppercase tracking-[0.15em] text-[11px] font-black">{label}</span>
                                                            <div className="flex items-center gap-2 font-black">
                                                                <span className="text-primary text-sm">{v}</span>
                                                                {isComparing && diff !== 0 && (
                                                                    <span className={`text-[11px] px-1.5 py-0.5 rounded-sm font-mono ${diff > 0 ? 'bg-game-success/20 text-game-success' : 'bg-game-danger/10 text-game-danger'}`}>
                                                                        {diff > 0 ? `+${diff}` : diff}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    };
                                    return (
                                        <div className="flex gap-2 h-40">
                                            <div className="flex-1 border border-primary/10 p-2 rounded bg-black/20 flex flex-col shadow-inner">
                                                <div className="text-[10px] opacity-30 uppercase tracking-[0.2em] mb-1 border-b border-primary/5 pb-0.5 font-bold text-center">EQUIPPED</div>
                                                <div className="text-primary font-black truncate text-xs mb-1.5 border-b border-primary/10 pb-0.5 uppercase tracking-tight text-center">
                                                    {equippedItem?.name || 'EMPTY'}
                                                </div>
                                                <div className="flex-1 overflow-hidden">{renderStats(equippedItem, false)}</div>
                                            </div>
                                            <div className="flex-1 border border-game-warning/30 p-2 rounded bg-game-warning/5 flex flex-col shadow-[0_0_20px_rgba(var(--game-warning),0.05)]">
                                                <div className="text-[10px] opacity-60 uppercase tracking-[0.2em] text-game-warning mb-1 border-b border-game-warning/10 pb-0.5 font-black text-center">FOUND</div>
                                                <div className="text-game-warning font-black truncate text-xs mb-1.5 uppercase tracking-tight text-center">{pendingLoot.name}</div>
                                                <div className="flex-1 overflow-hidden">{renderStats(pendingLoot, true)}</div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="flex justify-center gap-2 pb-1">
                            <Button size="sm" variant="outline" className="text-xs h-7 px-3 border-game-warning/40 text-game-warning font-bold" onClick={() => resolveLoot('SWAP')}>[Space] Swap</Button>
                            <Button size="sm" variant="outline" className="text-xs h-7 px-3 border-primary/20 opacity-60" onClick={() => resolveLoot('DISCARD')}>[N] Pass</Button>
                            <Button size="sm" variant="outline" className="text-xs h-7 px-3 border-game-info/40 text-game-info font-bold" onClick={() => resolveLoot('TAKE')}>[T] Take</Button>
                        </div>
                    </div>
                )}

                {gameState === 'EVENT' && (
                    <div className="text-center space-y-2 animate-in fade-in py-4 flex flex-col items-center justify-center h-full">
                        <div className="p-4 bg-primary/10 border border-primary/30 rounded inline-block scale-110 mb-4 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                            {React.isValidElement(currentRoom?.icon)
                                ? React.cloneElement(currentRoom.icon as any, { size: 48, strokeWidth: 1.5 })
                                : currentRoom?.icon}
                        </div>
                        <p className="text-base font-bold text-primary italic uppercase tracking-wider">{currentRoom?.type === 'TREASURE' ? "Room looted." : currentRoom?.type === 'REST' ? "Vitality restored." : "Path remains clear."}</p>
                        <div className="text-xs animate-pulse opacity-40 mt-8 tracking-[0.3em] font-black">[ Space / Enter ]</div>
                    </div>
                )}

                {gameState === 'CHARACTER' && (
                    <div className="flex flex-col h-full px-4 animate-in fade-in py-1">
                        <div className="text-sm font-black text-primary mb-3 uppercase tracking-[0.2em] text-center italic">Hero Status</div>

                        <div className="grid grid-cols-2 gap-3 items-stretch h-36">
                            <div className="flex-1 border border-primary/10 p-2.5 rounded bg-black/20 flex flex-col shadow-inner">
                                <div className="text-[9px] opacity-30 uppercase tracking-[0.2em] mb-1.5 border-b border-primary/5 pb-0.5 font-bold text-center">CORE STATS</div>
                                <div className="flex-1 flex flex-col justify-center space-y-1">
                                    <div className="flex justify-between items-center border-b border-primary/5 pb-1 h-7">
                                        <span className="opacity-40 text-[10px] uppercase font-black">ATK</span>
                                        <span className="text-game-danger font-black text-sm">{player.attack}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-primary/5 pb-1 h-7">
                                        <span className="opacity-40 text-[10px] uppercase font-black">DEF</span>
                                        <span className="text-game-info font-black text-sm">{player.defense}</span>
                                    </div>
                                    <div className="flex justify-between items-center h-7">
                                        <span className="opacity-40 text-[10px] uppercase font-black">HP</span>
                                        <span className="text-game-success font-black text-sm">{Math.ceil(player.hp)}/{player.maxHp}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 border border-primary/10 p-2.5 rounded bg-black/20 flex flex-col shadow-inner">
                                <div className="text-[9px] opacity-30 uppercase tracking-[0.2em] mb-1.5 border-b border-primary/5 pb-0.5 font-bold text-center">EQUIPPED GEAR</div>
                                <div className="flex-1 flex flex-col justify-center space-y-1">
                                    <div className="flex justify-between gap-2 border-b border-primary/5 pb-1 h-7 items-center">
                                        <span className="opacity-40 text-[9px] uppercase font-black">Wpn</span>
                                        <span className="text-primary font-bold truncate max-w-[75px] text-[11px]">{player.equipped.weapon?.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between gap-2 border-b border-primary/5 pb-1 h-7 items-center">
                                        <span className="opacity-40 text-[9px] uppercase font-black">Arm</span>
                                        <span className="text-primary font-bold truncate max-w-[75px] text-[11px]">{player.equipped.armor?.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between gap-2 h-7 items-center">
                                        <span className="opacity-40 text-[9px] uppercase font-black">Acc</span>
                                        <span className="text-primary font-bold truncate max-w-[75px] text-[11px]">{player.equipped.accessory?.name || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="opacity-30 uppercase text-[9px]">Skills</span>
                                <div className="h-px flex-1 bg-primary/10"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                                {player.skills.map(s => <div key={s.id} className="border border-primary/10 p-1 text-center rounded bg-primary/5 truncate font-bold">{s.name}</div>)}
                            </div>
                        </div>
                        <div className="text-center text-[10px] opacity-30 mt-auto py-2 uppercase tracking-widest">[ ESC ] Close Status</div>
                    </div>
                )}

                {gameState === 'INVENTORY' && (
                    <div className="flex flex-col h-full px-2 animate-in fade-in py-1">
                        <div className="text-sm font-black text-primary mb-3 uppercase tracking-[0.2em] text-center italic">Backpack</div>
                        {player.inventory.map((item, i) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center p-3 border-b border-primary/5 hover:bg-primary/5 cursor-pointer rounded transition-all group"
                                onClick={() => equipItem(item)}
                            >
                                <div className="flex flex-col">
                                    <span className="text-primary text-xs font-semibold group-hover:translate-x-1 transition-transform">{i + 1}. {item.name}</span>
                                    <span className="text-[9px] opacity-30 italic leading-none mt-1">Click to equip</span>
                                </div>
                                <span className="text-[9px] opacity-40 uppercase tracking-[0.15em] border border-primary/20 px-1.5 py-0.5 rounded-sm bg-primary/5 font-medium">{item.type}</span>
                            </div>
                        ))}
                        {player.inventory.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-32 opacity-20 italic">
                                <ShoppingBag className="mb-2" size={24} />
                                <div className="text-xs">No items found.</div>
                            </div>
                        )}
                        <div className="text-center text-[10px] opacity-30 mt-auto py-2 uppercase tracking-widest leading-none">[ ESC ] Close Backpack</div>
                    </div>
                )}
            </div>

            {/* Log */}
            <div className="mt-auto pt-2 border-t border-primary/20 h-16 text-[11px] text-primary/60 font-mono flex flex-col justify-end overflow-hidden">
                <div className="opacity-20 text-[8px] uppercase tracking-widest mb-1 border-b border-primary/5 w-fit">Event Log</div>
                {combatLog.slice(-3).map((log, i) => (
                    <div key={i} className="truncate select-text animate-in slide-in-from-left-1 duration-300">
                        <span className="opacity-40 mr-2">&gt;</span>{log}
                    </div>
                ))}
            </div>
        </div>
    );
}
