
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { PetType, useGame } from '../contexts/GameContext';
import { toast } from 'sonner';

// Add Framer Motion
<lov-add-dependency>framer-motion@^11.0.5</lov-add-dependency>

const IntroSequence: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [petName, setPetName] = useState<string>('');
  const [selectedType, setSelectedType] = useState<PetType | null>(null);
  const { setPetName: setGamePetName, setPetType, completeIntro } = useGame();
  
  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete the intro
      if (petName && selectedType) {
        setGamePetName(petName);
        setPetType(selectedType);
        completeIntro();
        toast(`Welcome to your new adventure with ${petName}!`);
      } else {
        toast.error('Please give your pet a name and choose a type!');
      }
    }
  };
  
  return (
    <motion.div 
      className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="max-w-md w-full bg-card/90 backdrop-blur border border-primary/30 p-6">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {step === 0 && (
            <>
              <h2 className="text-2xl font-bold text-center text-primary">Welcome to AetherPet Genesis!</h2>
              <p className="text-center">
                In a world where magical creatures are born from ancient elemental crystals, 
                you've stumbled upon a hidden shrine...
              </p>
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 aether-shrine flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/40 pulse-glow"></div>
                </div>
              </div>
            </>
          )}
          
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-center text-primary">The Ancient Crystal</h2>
              <p className="text-center">
                As you approach the shrine, you notice a glowing crystal. 
                It seems to be reacting to your presence...
              </p>
              <div className="flex justify-center">
                <div className="w-32 h-32 relative aether-shrine flex items-center justify-center">
                  <div className="absolute w-16 h-16 bg-gradient-to-br from-primary/80 to-secondary/80 rounded-md rotate-45 float-animation"></div>
                </div>
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-center text-primary">Choose Your Element</h2>
              <p className="text-center">
                The crystal begins to transform. Which elemental affinity speaks to you?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={selectedType === 'fire' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('fire')}
                  className={`h-24 ${selectedType === 'fire' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">🔥</span>
                    <span>Fire</span>
                  </div>
                </Button>
                <Button 
                  variant={selectedType === 'water' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('water')}
                  className={`h-24 ${selectedType === 'water' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">💧</span>
                    <span>Water</span>
                  </div>
                </Button>
                <Button 
                  variant={selectedType === 'forest' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('forest')}
                  className={`h-24 ${selectedType === 'forest' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">🌿</span>
                    <span>Forest</span>
                  </div>
                </Button>
                <Button 
                  variant={selectedType === 'electric' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('electric')}
                  className={`h-24 ${selectedType === 'electric' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">⚡</span>
                    <span>Electric</span>
                  </div>
                </Button>
              </div>
            </>
          )}
          
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-center text-primary">Name Your AetherPet</h2>
              <p className="text-center">
                The crystal shatters, revealing a small creature looking at you with curious eyes.
                What will you name your new companion?
              </p>
              <div className="space-y-4">
                <Input 
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Enter a name..."
                  className="w-full"
                />
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 aether-shrine flex items-center justify-center">
                    {selectedType === 'fire' && <span className="text-4xl">🔥</span>}
                    {selectedType === 'water' && <span className="text-4xl">💧</span>}
                    {selectedType === 'forest' && <span className="text-4xl">🌿</span>}
                    {selectedType === 'electric' && <span className="text-4xl">⚡</span>}
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleNextStep}
              className="w-full"
              disabled={step === 3 && (!petName || !selectedType)}
            >
              {step < 3 ? "Continue" : "Start Your Adventure"}
            </Button>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default IntroSequence;
