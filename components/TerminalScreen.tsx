
import React, { useState, useEffect, useRef } from 'react';
import { TerminalIcon, ZapIcon } from './icons';
import ScreenHeader from './ScreenHeader';
import type { AIType } from '../types';

interface TerminalScreenProps {
    onBack: () => void;
    interpretCommand: (input: string) => Promise<any>;
    generateImage: (prompt: string) => Promise<string>;
    generateVideoPrompts: (prompt: string, model: AIType, count: number, ar: string) => Promise<{ promptText: string }[]>;
    generateVideo: (prompt: string, image: any, onProgress: (msg: string) => void) => Promise<string>;
}

interface TerminalLine {
    id: number;
    type: 'input' | 'output' | 'system' | 'image';
    content: string;
}

const TerminalScreen: React.FC<TerminalScreenProps> = ({ onBack, interpretCommand, generateImage, generateVideoPrompts, generateVideo }) => {
    const [lines, setLines] = useState<TerminalLine[]>([
        { id: 0, type: 'system', content: 'Gemini AI Terminal [Version 1.0.0]\nType "help" for a list of commands.' }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const endOfTerminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    const addLine = (type: TerminalLine['type'], content: string) => {
        setLines(prev => [...prev, { id: prev.length, type, content }]);
    };

    const handleCommand = async (commandInput: string) => {
        setIsProcessing(true);
        try {
            const parsed = await interpretCommand(commandInput);
            const { command, args } = parsed;

            switch (command) {
                case 'generate_image':
                    addLine('system', `Generating image for prompt: "${args.prompt}"...`);
                    const imageUrl = await generateImage(args.prompt);
                    addLine('image', imageUrl);
                    break;
                case 'generate_video_prompts':
                    addLine('system', `Generating ${args.count || 3} prompts for ${args.model || 'sora'}...`);
                    const prompts = await generateVideoPrompts(args.prompt, args.model || 'sora', args.count || 3, args.aspectRatio || '16:9');
                    const promptText = prompts.map((p, i) => `${i + 1}. ${p.promptText}`).join('\n');
                    addLine('output', promptText);
                    break;
                case 'generate_video':
                     const progressCallback = (msg: string) => addLine('system', msg);
                     await generateVideo(args.prompt, null, progressCallback);
                    // Video URL would be handled here in a real app
                    addLine('output', 'Video generation complete. URL: [mock_url]');
                    break;
                case 'help':
                    addLine('output', 'You can use natural language or commands.\n\nExamples:\n- "create an image of a robot cat"\n- "prompts about ancient rome count:5"\n- "video of a futuristic city"\n\nCommands:\n- image <prompt>\n- prompts <topic>\n- video <prompt>\n- clear, help');
                    break;
                case 'clear':
                    setLines([]);
                    break;
                default:
                    addLine('output', `My expertise is in creating images and video ideas. For example, you could say 'create a picture of a cat in space' or ask for 'video ideas about ancient Egypt'.\n\nWhat would you like to create?`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            addLine('output', `Error: ${message}`);
        }
        setIsProcessing(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;
        addLine('input', input);
        handleCommand(input);
        setInput('');
    };

    return (
        <div className="h-full flex flex-col p-6 font-mono">
            <ScreenHeader title="Terminal" icon={TerminalIcon} onBack={onBack} />
            <div className="flex-1 bg-black/80 border border-surface rounded-lg p-4 overflow-y-auto scrollbar-thin">
                {lines.map(line => (
                    <div key={line.id} className="mb-2">
                        {line.type === 'input' && <span className="text-accent mr-2">&gt;</span>}
                        {line.type === 'image' ? (
                            <img src={`data:image/jpeg;base64,${line.content}`} alt="Generated" className="max-w-xs rounded-md mt-2" />
                        ) : (
                            <p className={`whitespace-pre-wrap ${line.type === 'system' ? 'text-yellow-400' : 'text-primary'}`}>{line.content}</p>
                        )}
                    </div>
                ))}
                 {isProcessing && (
                    <div className="flex items-center gap-2 text-secondary">
                        <ZapIcon className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                    </div>
                 )}
                <div ref={endOfTerminalRef}></div>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
                 <span className="text-accent text-lg">&gt;</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isProcessing}
                    className="flex-1 bg-surface border border-white/10 rounded-md px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter command..."
                    autoFocus
                />
            </form>
        </div>
    );
};

export default TerminalScreen;
