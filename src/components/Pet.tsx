import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Moon, Dog, Cat } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

type Mood = 'happy' | 'hungry' | 'sleepy' | 'bored';

export function Pet() {
    const [mood, setMood] = useState<Mood>('happy');
    const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
    const [hunger, setHunger] = useState(100);
    const [energy, setEnergy] = useState(100);
    const [happiness, setHappiness] = useState(100);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Randomly assign pet type on mount
        setPetType(Math.random() > 0.5 ? 'dog' : 'cat');

        const interval = setInterval(() => {
            setHunger((prev) => Math.max(0, prev - 1));
            setEnergy((prev) => Math.max(0, prev - 0.5));
            setHappiness((prev) => Math.max(0, prev - 0.5));
        }, 2000); // Slower tick for text based

        return () => clearInterval(interval);
    }, []);

    // Mood logic
    useEffect(() => {
        if (hunger < 30) setMood('hungry');
        else if (energy < 30) setMood('sleepy');
        else if (happiness < 30) setMood('bored');
        else setMood('happy');
    }, [hunger, energy, happiness]);

    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const feed = () => {
        if (hunger >= 100) {
            showMessage("I'm full!");
            return;
        }
        setHunger(Math.min(100, hunger + 20));
        setHappiness(Math.min(100, happiness + 5));
        showMessage('Yum! 🍔');
    };

    const sleep = () => {
        if (energy >= 100) {
            showMessage("I'm not tired!");
            return;
        }
        setEnergy(Math.min(100, energy + 40));
        showMessage('Zzz... 😴');
    };

    const play = () => {
        if (energy < 20) {
            showMessage("Too tired to play...");
            return;
        }
        setHappiness(Math.min(100, happiness + 20));
        setEnergy(Math.max(0, energy - 10));
        setHunger(Math.max(0, hunger - 5));
        showMessage('Wheee! 🎾');
    };

    const getIcon = () => {
        const Icon = petType === 'dog' ? Dog : Cat;

        // Simple animation/style changes based on mood since we don't have separate emotion icons for dog/cat
        // We could also mix in the face icons if we wanted, but user asked for Dog or Cat icon.
        // Let's use the Dog/Cat icon as the base and animate it.

        switch (mood) {
            case 'happy': return <Icon size={48} className="animate-bounce" />;
            case 'hungry': return <Icon size={48} className="animate-pulse opacity-80" />;
            case 'sleepy': return <Icon size={48} className="animate-pulse opacity-50" />;
            case 'bored': return <Icon size={48} className="" />;
            default: return <Icon size={48} />;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono p-2 max-w-sm my-2"
            >
                <div className="flex items-center gap-6">
                    <div className="text-primary p-4 border border-primary/50 rounded bg-primary/5">
                        {getIcon()}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-primary/80 uppercase tracking-wider">
                                <span>Hunger</span>
                                <span>{Math.round(hunger)}%</span>
                            </div>
                            <Progress value={hunger} className="h-2 bg-primary/20 [&>div]:bg-primary" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-primary/80 uppercase tracking-wider">
                                <span>Energy</span>
                                <span>{Math.round(energy)}%</span>
                            </div>
                            <Progress value={energy} className="h-2 bg-primary/20 [&>div]:bg-primary" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-primary/80 uppercase tracking-wider">
                                <span>Happy</span>
                                <span>{Math.round(happiness)}%</span>
                            </div>
                            <Progress value={happiness} className="h-2 bg-primary/20 [&>div]:bg-primary" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-between gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={feed}
                        className="flex-1 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-widest text-xs"
                    >
                        <Zap size={14} className="mr-2" /> Feed
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={play}
                        className="flex-1 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-widest text-xs"
                    >
                        <Heart size={14} className="mr-2" /> Play
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={sleep}
                        className="flex-1 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-widest text-xs"
                    >
                        <Moon size={14} className="mr-2" /> Sleep
                    </Button>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-center text-xs text-primary font-bold border-t border-primary/20 pt-2"
                    >
                        &gt; {message}
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
