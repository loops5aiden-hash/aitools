import React, { useState } from 'react';
import type { Agent, Tool } from '../types';
import type { CurrentScreen } from '../App';
import { ICON_MAP, SparklesIcon, ZapIcon, CheckCircle2Icon, Share2Icon, LightbulbIcon } from './icons';
import ScreenHeader from './ScreenHeader';

interface MakerStudioProps {
  onNavigate: (screen: CurrentScreen) => void;
  onSave: (item: Agent | Tool, type: 'agent' | 'tool') => void;
  generateAgentConfig: (prompt: string) => Promise<any>;
  generateToolConfig: (prompt: string) => Promise<any>;
  credits: number;
}

type MakerStep = 'select' | 'prompt' | 'loading' | 'preview' | 'published';
type CreationType = 'agent' | 'tool';
const CREATION_COST = 7; // 25% off 10

const MakerStudio: React.FC<MakerStudioProps> = ({ onNavigate, onSave, generateAgentConfig, generateToolConfig, credits }) => {
  const [step, setStep] = useState<MakerStep>('select');
  const [type, setType] = useState<CreationType>('agent');
  const [prompt, setPrompt] = useState('');
  const [generatedConfig, setGeneratedConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const hasEnoughCredits = credits >= CREATION_COST;

  const handleSelectType = (selectedType: CreationType) => {
    setType(selectedType);
    setStep('prompt');
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !hasEnoughCredits) return;
    setStep('loading');
    setError(null);
    try {
      const config = type === 'agent' 
        ? await generateAgentConfig(prompt) 
        : await generateToolConfig(prompt);

      if (!config.name || !config.description || !config.icon || !ICON_MAP[config.icon]) {
          throw new Error("The AI failed to generate a valid configuration. Please try a more specific prompt.");
      }
      setGeneratedConfig(config);
      setStep('preview');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during generation.";
      setError(`Error: ${errorMessage}`);
      setStep('prompt');
    }
  };

  const handleSave = () => {
    if (!generatedConfig) return;
    const newItem = {
      ...generatedConfig,
      id: `${type}_${generatedConfig.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      isCustom: true,
    };
    onSave(newItem, type);
    setStep('published');
  };
  
  const handlePublish = () => {
    alert("This would publish your creation to the community Agent Hub!");
    onNavigate('home');
  }

  const renderContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="text-center">
            <h2 className="text-xl font-bold text-primary mb-2">What would you like to create?</h2>
            <p className="text-secondary mb-6">Choose a creation type to get started.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => handleSelectType('agent')} className="p-6 bg-surface rounded-lg border border-white/10 hover:border-accent hover:bg-accent/10 transition-colors">
                <h3 className="font-semibold text-primary">New Agent</h3>
                <p className="text-sm text-secondary">Create a custom AI persona.</p>
              </button>
              <button onClick={() => handleSelectType('tool')} className="p-6 bg-surface rounded-lg border border-white/10 hover:border-accent hover:bg-accent/10 transition-colors">
                <h3 className="font-semibold text-primary">New Tool</h3>
                <p className="text-sm text-secondary">Create a new AI-powered tool.</p>
              </button>
            </div>
          </div>
        );
      case 'prompt':
        return (
          <div>
            <h2 className="text-xl font-bold text-primary mb-2">Describe Your {type === 'agent' ? 'Agent' : 'Tool'}</h2>
            <p className="text-secondary mb-6">Be as descriptive as possible. The AI will use this to generate its configuration.</p>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            {!hasEnoughCredits && <p className="text-yellow-500 text-sm text-center mb-4">You need at least {CREATION_COST} credits to generate a new {type}.</p>}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={type === 'agent' ? "e.g., A witty and cynical movie critic who specializes in sci-fi films from the 1980s." : "e.g., A tool that can find the current price of any cryptocurrency. The command should be /crypto <ticker>"}
              className="w-full h-32 bg-background/50 border border-surface rounded-lg p-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/70 resize-none"
            />
            <button onClick={handleGenerate} disabled={!prompt.trim() || !hasEnoughCredits} className="w-full mt-4 py-3 bg-accent text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:bg-surface disabled:text-secondary disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <span>Generate</span>
              <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-black/20">
                <ZapIcon className="w-3 h-3" />
                <span>{CREATION_COST}</span>
              </div>
            </button>
          </div>
        );
      case 'loading':
        return (
          <div className="text-center py-10">
            <SparklesIcon className="w-10 h-10 text-accent mx-auto animate-spin" />
            <p className="text-secondary mt-4">Generating your {type}... please wait.</p>
          </div>
        );
      case 'preview':
        const Icon = generatedConfig?.icon ? ICON_MAP[generatedConfig.icon] : SparklesIcon;
        return (
            <div>
                <h2 className="text-xl font-bold text-primary mb-2">Generation Complete!</h2>
                <p className="text-secondary mb-6">Review the generated configuration below.</p>
                <div className="bg-black/20 p-4 rounded-lg space-y-3 border border-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-surface rounded-md">
                            <Icon className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary">{generatedConfig.name}</h3>
                            <p className="text-sm text-secondary">{generatedConfig.description}</p>
                        </div>
                    </div>
                    {generatedConfig.command && <p className="font-mono bg-black/30 p-2 rounded text-sm text-accent">{generatedConfig.command}</p>}
                    {generatedConfig.systemInstruction && <p className="text-xs text-secondary italic border-l-2 border-accent/30 pl-3">{generatedConfig.systemInstruction}</p>}
                </div>
                 <div className="flex gap-4 w-full mt-6">
                    <button onClick={handleGenerate} className="w-full py-3 bg-white/10 text-primary rounded-lg font-semibold hover:bg-white/20 transition-colors">
                        Regenerate
                    </button>
                    <button onClick={handleSave} className="w-full py-3 bg-accent text-background rounded-lg font-semibold hover:opacity-90 transition-opacity">
                        Save {type === 'agent' ? 'Agent' : 'Tool'}
                    </button>
                </div>
            </div>
        );
       case 'published':
        return (
            <div className="text-center">
                <CheckCircle2Icon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-primary mb-2">Creation Saved!</h2>
                <p className="text-secondary mb-6">Your new {type} is now available in your personal list.</p>
                <div className="space-y-3">
                    <button onClick={handlePublish} className="w-full py-3 bg-accent/20 text-accent rounded-lg font-semibold hover:bg-accent/30 transition-colors flex items-center justify-center gap-2">
                        <Share2Icon className="w-5 h-5"/>
                        Publish to Hub
                    </button>
                    <button onClick={() => onNavigate('home')} className="w-full py-3 bg-white/10 text-primary rounded-lg font-semibold hover:bg-white/20 transition-colors">
                        Done
                    </button>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
        <ScreenHeader 
            title="Maker Studio"
            icon={LightbulbIcon}
            onBack={() => step === 'select' ? onNavigate('home') : setStep('select')}
        />
        <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-lg">
                {renderContent()}
            </div>
        </div>
    </div>
  );
};

export default MakerStudio;