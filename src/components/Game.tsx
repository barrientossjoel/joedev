import { useState, useEffect, useRef } from 'react';
import { Heart, Shield, Zap, Skull, Crown, Ghost, Coins, ChevronRight, ShoppingBag, Gem, Droplet } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

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
    { name: 'Slime', Icon: Droplet, color: 'text-green-500', hpMod: 1.4, atkMod: 0.6, def: 2, dodge: 0, crit: 0, vamp: 0 },
    { name: 'Bat', Icon: BatIcon, color: 'text-purple-400', hpMod: 0.5, atkMod: 0.7, def: 0, dodge: 40, crit: 0, vamp: 15 },
    { name: 'Orc', Icon: Shield, color: 'text-green-700', hpMod: 1.2, atkMod: 1.2, def: 5, dodge: 0, crit: 10, vamp: 0 },
];

const generateRooms = (floor: number): Room[] => {
    const numOptions = Math.floor(Math.random() * 3) + 2; // 2-4 options
    const options: Room[] = [];
    let hasRest = false;

    // Balance Adjustment: Reduce stats by 15% for first 15 floors
    const difficultyMod = floor <= 15 ? 0.85 : 1.0;

    for (let i = 0; i < numOptions; i++) {
        const rand = Math.random();
        let type: RoomType = 'ENEMY';
        let description = 'A dark corridor...';
        let icon = <Ghost size={16} />;
        let enemy: Enemy | undefined;
        let merchantItems: (Item | Skill)[] | undefined;

        if (rand < 0.5) {
            type = 'ENEMY';
            const template = ENEMY_TEMPLATES[Math.floor(Math.random() * ENEMY_TEMPLATES.length)];
            description = `A wild ${template.name} appears.`;
            icon = <template.Icon size={16} className={template.color.split(' ')[0]} />; // Simplified color for small icon

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
            icon = <Skull size={16} className="text-red-500" />;
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
                icon: <Skull size={64} className="text-red-500 animate-pulse" />
            };
        } else if (rand < 0.7) {
            type = 'TREASURE';
            description = 'Glimmering loot.';
            icon = <Crown size={16} className="text-yellow-500" />;
        } else if (rand < 0.8 && !hasRest) {
            type = 'REST';
            description = 'A safe spot.';
            icon = <Heart size={16} className="text-green-500" />;
            hasRest = true;
        } else if (rand < 0.9) {
            type = 'MERCHANT';
            description = 'A wandering trader.';
            icon = <ShoppingBag size={16} className="text-blue-400" />;
            // Generate shop Items
            merchantItems = [];
            for (let k = 0; k < 3; k++) {
                if (Math.random() > 0.5) {
                    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
                    merchantItems.push({ ...item, id: `${item.id}-shop-${Date.now()}-${k}` });
                } else {
                    const skill = SKILL_POOL[Math.floor(Math.random() * SKILL_POOL.length)];
                    merchantItems.push({ ...skill, id: `${skill.id}-shop-${Date.now()}-${k}` });
                }
            }
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
            enemy,
            merchantItems
        });
    }
    return options;
};

const generateLoot = (floor: number): Item | null => {
    if (Math.random() > 0.3 - (floor * 0.01)) {
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
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
            addLog(`Auto-equipped ${item.name}.`);
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
                addLog(`Used ${item.name}. +${restored} HP.`);
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
                addLog(`Learned ${skill.name}!`);
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
            addLog(`Encountered ${room.enemy?.name}!`);
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
                addLog(`You found ${item.name}!`);
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
            addLog(`Rested. +${heal} HP.`);
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
                addLog(`Used ${skill.name}! ${isCrit ? 'CRITICAL! ' : ''}Hit for ${dmg}.`);

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
            addLog(`${skill.name}! You brace yourself.`);

            // Counter logic
            const counterDmg = Math.floor(pDmg * 0.5);
            enemy.hp -= counterDmg;
            addLog(`Counter-attack for ${counterDmg}!`);
        } else if (skill.type === 'HEAL') {
            let heal = skill.power;
            // Crit Heal? Why not.
            if (Math.random() * 100 < player.critChance) {
                heal *= 1.5;
                addLog(`Critical Heal!`);
            }
            setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + heal) }));
            addLog(`Used ${skill.name}. +${Math.floor(heal)} HP.`);
        } else if (skill.type === 'BUFF') {
            addLog(`${skill.name}! (Buff not impl yet)`);
        }

        // Enemy Turn
        if (enemy.hp > 0) {
            // Dodge Check
            if (Math.random() * 100 < player.dodgeChance) {
                addLog(`Dodged ${enemy.name}'s attack!`);
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

        addLog(`Victory! +${xpGain} XP`);

        setPlayer(p => {
            let newXp = p.xp + xpGain;
            let newLevel = p.level;
            let newBaseRef = p;

            if (newXp >= p.xpToNext) {
                newXp -= p.xpToNext;
                newLevel++;
                addLog("Level Up!");
                // Stat growth baked into calculateStats base?
                // Simple growth:
                newBaseRef = {
                    ...p,
                    baseMaxHp: p.baseMaxHp + 10,
                    baseAttack: p.baseAttack + 2
                };
            }
            const healedP = { ...newBaseRef, xp: newXp, level: newLevel, hp: Math.min(newBaseRef.baseMaxHp, p.hp + 20) };
            return calculateStats(healedP);
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
                if (e.key.toLowerCase() === 'y' || e.key === 'Enter') resolveLoot('SWAP');
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
                <div className="relative z-50 p-6 border border-red-500/50 rounded bg-black w-3/4 max-w-sm">
                    <h1 className="text-xl font-bold text-red-500 mb-2">QUIT GAME?</h1>
                    <p className="text-[10px] text-primary/60 mb-6">Progress will be lost.</p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" size="sm" className="h-8 border-red-500/50 text-red-400 hover:bg-red-950 hover:text-red-200" onClick={onExit}>[Y] Yes</Button>
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
            <Skull size={48} className="text-red-600 mb-4" />
            <h1 className="text-2xl font-bold text-red-500">YOU DIED</h1>
            <p className="text-xs text-primary/60">Floor Reached: {player.floor}</p>
            <div className="mt-8 animate-pulse text-xs opacity-70">[ Press ENTER to Menu ]</div>
        </div>
    );

    return (
        <div className={`flex flex-col h-full max-h-[22rem] overflow-hidden font-mono text-xs select-none relative p-1 outline-none transition-colors ${isFocused ? 'bg-background' : 'opacity-70 grayscale'}`} ref={containerRef} tabIndex={0} onClick={() => containerRef.current?.focus()}>
            {!isFocused && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px]"><div className="text-white bg-black/80 px-3 py-1 rounded border border-white/20 animate-pulse cursor-pointer">[ Click to Focus ]</div></div>}

            {/* Header */}
            <div className="flex justify-between items-end border-b border-primary/20 pb-2 mb-2 px-1">
                <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1 text-primary"><Heart size={10} /> <span>{Math.ceil(player.hp)}/{player.maxHp}</span></div>
                    <div className="flex items-center gap-1 text-primary/80"><Shield size={10} /> <span>{player.defense}</span></div>
                    <div className="flex items-center gap-1 text-blue-400"><Zap size={10} /> <span>Lvl {player.level}</span></div>
                    <div className="flex items-center gap-1 text-yellow-500"><Coins size={10} /> <span>{player.gold}G</span></div>
                    <div className="flex items-center gap-1 text-cyan-400"><Gem size={10} /> <span>{diamonds}</span></div>
                </div>
                <div className="text-right text-xl font-bold text-primary/30">FL {player.floor}</div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center min-h-0">
                {gameState === 'ROOM_SELECTION' && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-primary/50 text-[10px] mb-2 px-2"><span>[C] Character</span><span>- Choose your path -</span><span>[I] Inventory</span></div>
                        <div className="grid grid-cols-2 gap-2">
                            {rooms.map((room, i) => (
                                <div key={room.id} className="group flex flex-col items-center justify-center gap-1 p-2 border border-primary/20 hover:bg-white/5 cursor-pointer rounded transition-all aspect-square sm:aspect-auto sm:h-24" onClick={() => enterRoom(room)}>
                                    <div className="text-primary group-hover:scale-110 transition-transform mb-1">{room.icon}</div>
                                    <div className="text-center">
                                        <div className="font-bold text-primary group-hover:text-white transition-colors text-xs"><span className="opacity-50 mr-1">[{i + 1}]</span>{room.type === 'ENEMY' ? room.enemy?.name : room.type}</div>
                                        <div className="text-primary/50 text-[9px] leading-tight mt-1 line-clamp-2">{room.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'COMBAT' && currentRoom?.enemy && (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                        <div className="mb-4 relative">
                            <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full"></div>
                            <div className="relative z-10 drop-shadow-lg">{currentRoom.enemy.icon}</div>
                        </div>
                        <div className="text-lg font-bold text-red-400 mb-1">{currentRoom.enemy.name}</div>
                        <Progress value={(currentRoom.enemy.hp / currentRoom.enemy.maxHp) * 100} className="h-2 w-32 bg-red-950 [&>div]:bg-red-500 mb-4" />

                        <div className="grid grid-cols-2 gap-2 w-full max-w-sm mt-2">
                            {player.skills.map((skill, i) => (
                                <Button key={i} size="sm" variant="outline" className="text-[10px] h-10 border-primary/30 hover:bg-white/10 flex flex-col items-start px-2 py-1" onClick={() => useSkill(i)}>
                                    <span className="font-bold text-primary">[{i + 1}] {skill.name}</span>
                                    <span className="text-[8px] opacity-50">{skill.type}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'MERCHANT' && (
                    <div className="space-y-4 animate-in fade-in px-4">
                        <div className="text-center border-b border-primary/20 pb-2 font-bold text-blue-400">MERCHANT</div>
                        <div className="grid grid-cols-1 gap-2">
                            {currentRoom?.merchantItems?.map((item, i) => (
                                <div key={i} className={`flex justify-between items-center p-2 border border-primary/10 rounded hover:bg-white/5 cursor-pointer ${player.gold >= item.value ? 'text-yellow-400' : 'text-red-500'}`} onClick={() => buyItem(item)}>
                                    <div className="flex gap-2">
                                        <span className="opacity-50 font-bold">[{i + 1}]</span>
                                        <div>
                                            <div className="font-bold">{item.name}</div>
                                            <div className="text-[9px] opacity-70">{item.description}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold">{item.value}G</div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center text-[10px] opacity-50 mt-4">[ Enter ] Leave</div>
                    </div>
                )}

                {gameState === 'LOOT' && pendingLoot && (
                    <div className="text-center space-y-4 animate-in fade-in px-4">
                        <div className="text-lg font-bold text-yellow-500">BETTER GEAR?</div>
                        <div className="grid grid-cols-2 gap-4 text-left">
                            {(() => {
                                const slot = pendingLoot.type === 'WEAPON' ? 'weapon' : pendingLoot.type === 'ARMOR' ? 'armor' : 'accessory';
                                const equippedItem = player.equipped[slot];

                                const renderStatRow = (label: string, val: number | undefined, compareVal: number | undefined, isComparing: boolean) => {
                                    if (!val && !compareVal) return null;
                                    const v = val || 0;
                                    const c = compareVal || 0;
                                    const diff = v - c;

                                    return (
                                        <div className="flex justify-between items-center">
                                            <span className="opacity-70">{label}</span>
                                            <span>
                                                {v}
                                                {isComparing && diff !== 0 && (
                                                    <span className={`ml-1 text-[9px] ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {diff > 0 ? `(+${diff})` : `(${diff})`}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    );
                                };

                                return (
                                    <>
                                        <div className="p-2 border border-primary/20 bg-black/50 flex flex-col">
                                            <div className="text-[10px] opacity-50 uppercase mb-1">Equipped</div>
                                            <div className="text-primary font-bold truncate mb-2">
                                                {equippedItem?.name || 'Empty'}
                                            </div>
                                            {equippedItem && (
                                                <div className="text-[10px] space-y-1">
                                                    {renderStatRow("ATK", equippedItem.stats.attack, 0, false)}
                                                    {renderStatRow("DEF", equippedItem.stats.defense, 0, false)}
                                                    {renderStatRow("HP", equippedItem.stats.maxHp, 0, false)}
                                                    {renderStatRow("CRI", equippedItem.stats.critChance, 0, false)}
                                                    {renderStatRow("DGE", equippedItem.stats.dodgeChance, 0, false)}
                                                    {renderStatRow("VMP", equippedItem.stats.vampirism, 0, false)}
                                                    {renderStatRow("RFL", equippedItem.stats.reflect, 0, false)}
                                                    {renderStatRow("PRC", equippedItem.stats.pierce, 0, false)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 border border-yellow-500/50 bg-yellow-900/10 flex flex-col">
                                            <div className="text-[10px] opacity-50 uppercase mb-1">Found</div>
                                            <div className="text-yellow-400 font-bold truncate mb-2">{pendingLoot.name}</div>
                                            <div className="text-[10px] space-y-1">
                                                {renderStatRow("ATK", pendingLoot.stats.attack, equippedItem?.stats.attack, true)}
                                                {renderStatRow("DEF", pendingLoot.stats.defense, equippedItem?.stats.defense, true)}
                                                {renderStatRow("HP", pendingLoot.stats.maxHp, equippedItem?.stats.maxHp, true)}
                                                {renderStatRow("CRI", pendingLoot.stats.critChance, equippedItem?.stats.critChance, true)}
                                                {renderStatRow("DGE", pendingLoot.stats.dodgeChance, equippedItem?.stats.dodgeChance, true)}
                                                {renderStatRow("VMP", pendingLoot.stats.vampirism, equippedItem?.stats.vampirism, true)}
                                                {renderStatRow("RFL", pendingLoot.stats.reflect, equippedItem?.stats.reflect, true)}
                                                {renderStatRow("PRC", pendingLoot.stats.pierce, equippedItem?.stats.pierce, true)}
                                            </div>
                                            <div className="text-[10px] opacity-70 mt-auto pt-2 border-t border-yellow-500/20">{pendingLoot.description}</div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <Button size="sm" variant="outline" className="text-yellow-400 border-yellow-500/50" onClick={() => resolveLoot('SWAP')}>[Y/Enter] Swap</Button>
                            <Button size="sm" variant="outline" className="text-primary border-primary/50" onClick={() => resolveLoot('DISCARD')}>[N] Discard</Button>
                            <Button size="sm" variant="outline" className="text-blue-400 border-blue-500/50" onClick={() => resolveLoot('TAKE')}>[T] Take</Button>
                        </div>
                    </div>
                )}

                {gameState === 'EVENT' && (
                    <div className="text-center space-y-4 animate-in fade-in">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg inline-block">{currentRoom?.icon}</div>
                        <p className="text-sm text-primary/80">{currentRoom?.type === 'TREASURE' ? "Looted." : currentRoom?.type === 'REST' ? "Refreshed." : "Nothing remains."}</p>
                        <div className="text-xs animate-pulse opacity-50 mt-4">[ Press Space/Enter ]</div>
                    </div>
                )}

                {gameState === 'CHARACTER' && (
                    <div className="space-y-4 px-4 animate-in fade-in">
                        <div className="text-center font-bold text-primary border-b border-primary/20 pb-1">HERO STATUS</div>
                        <div className="grid grid-cols-2 gap-4 text-[10px]">
                            <div className="space-y-1">
                                <div className="text-primary/50 uppercase">Stats</div>
                                <div className="flex justify-between"><span>ATK</span> <span className="text-red-400">{player.attack}</span></div>
                                <div className="flex justify-between"><span>DEF</span> <span className="text-blue-400">{player.defense}</span></div>
                                <div className="flex justify-between"><span>HP</span> <span className="text-green-400">{Math.ceil(player.hp)}/{player.maxHp}</span></div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-2 pt-2 border-t border-primary/10">
                                    <div className="flex justify-between"><span>CRI</span> <span className="text-yellow-400">{player.critChance}%</span></div>
                                    <div className="flex justify-between"><span>DGE</span> <span className="text-cyan-400">{player.dodgeChance}%</span></div>
                                    <div className="flex justify-between"><span>VMP</span> <span className="text-red-600">{player.vampirism}%</span></div>
                                    <div className="flex justify-between"><span>RFL</span> <span className="text-purple-400">{player.reflect}%</span></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-primary/50 uppercase">Gear</div>
                                <div className="truncate text-primary">{player.equipped.weapon?.name || '-'}</div>
                                <div className="truncate text-primary">{player.equipped.armor?.name || '-'}</div>
                                <div className="truncate text-primary">{player.equipped.accessory?.name || '-'}</div>
                            </div>
                        </div>
                        <div className="space-y-1 mt-2">
                            <div className="text-primary/50 uppercase text-[10px]">Skills</div>
                            <div className="grid grid-cols-2 gap-1">
                                {player.skills.map(s => <div key={s.id} className="border border-primary/20 p-1 text-[9px] text-center rounded">{s.name}</div>)}
                            </div>
                        </div>
                        <div className="text-center text-[10px] opacity-50 mt-2">[ ESC Back ]</div>
                    </div>
                )}

                {gameState === 'INVENTORY' && (
                    <div className="space-y-2 px-2 animate-in fade-in h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
                        <div className="text-center font-bold text-primary border-b border-primary/20 pb-1 mb-2">BACKPACK</div>
                        {player.inventory.map((item, i) => (
                            <div key={item.id} className="flex justify-between p-1 border-b border-primary/10 hover:bg-white/5 cursor-pointer" onClick={() => equipItem(item)}>
                                <span className="text-primary text-[10px]">{i + 1}. {item.name}</span>
                                <span className="text-[9px] opacity-50">{item.type}</span>
                            </div>
                        ))}
                        {player.inventory.length === 0 && <div className="text-center opacity-50 py-4">Empty</div>}
                    </div>
                )}
            </div>

            {/* Log */}
            <div className="mt-auto pt-2 border-t border-primary/20 h-16 text-[10px] text-primary/60 font-mono flex flex-col justify-end">
                {combatLog.map((log, i) => <div key={i} className="truncate select-text">&gt; {log}</div>)}
            </div>
        </div>
    );
}
