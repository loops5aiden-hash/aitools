import React, { useState, useEffect, useRef } from 'react';
import type { ProjectPlan, BuildTask, TaskStatus, ProjectFile, Message, ProjectEditResponse } from '../types';
import { Role } from '../types';
import { BotIcon, CheckCircle2Icon, CircleDotIcon, CircleIcon, DownloadIcon, LayoutTemplateIcon, Loader2Icon, RefreshCwIcon, SparklesIcon, ZapIcon, SendIcon, CodeIcon, MaximizeIcon, MinimizeIcon } from './icons';
import { createZip } from '../utils/zipUtils';
import { editProjectCode } from '../services/geminiService';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import ScreenHeader from './ScreenHeader';

interface MultiAgentBuilderProps {
  onClose: () => void; // Becomes onBack to home
  generateProjectPlanAndCode: (prompt: string) => Promise<ProjectPlan>;
  credits: number;
  onDeductCredits: (amount: number) => boolean;
  onBuildComplete: () => void;
  onOpenCodeViewer: (project: ProjectPlan) => void;
}

type BuilderStep = 'prompt' | 'building' | 'result';
const BUILD_COST = 18; // 25% off 25
const EDIT_COST = 1; // 25% off 2

const TaskStatusIcon: React.FC<{ status: TaskStatus }> = ({ status }) => {
    switch (status) {
        case 'pending': return <CircleIcon className="w-4 h-4 text-secondary" />;
        case 'in-progress': return <CircleDotIcon className="w-4 h-4 text-accent animate-pulse" />;
        case 'completed': return <CheckCircle2Icon className="w-4 h-4 text-green-500" />;
        default: return null;
    }
};

const MultiAgentBuilder: React.FC<MultiAgentBuilderProps> = ({ onClose, generateProjectPlanAndCode, credits, onDeductCredits, onBuildComplete, onOpenCodeViewer }) => {
  const [step, setStep] = useState<BuilderStep>('prompt');
  const [prompt, setPrompt] = useState('');
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [currentTasks, setCurrentTasks] = useState<BuildTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editInputValue, setEditInputValue] = useState('');
  
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projectPlan?.editMessages, isEditing]);

  const hasEnoughCredits = credits >= BUILD_COST;

  useEffect(() => {
    if (step === 'building' && projectPlan) {
      setCurrentTasks(projectPlan.tasks.map(t => ({ ...t, status: 'pending' })));
      
      let taskIndex = 0;
      const interval = setInterval(() => {
        setCurrentTasks(prevTasks => {
          const newTasks = [...prevTasks];
          if (taskIndex > 0) newTasks[taskIndex-1].status = 'completed';
          if (taskIndex < newTasks.length) {
            newTasks[taskIndex].status = 'in-progress';
            taskIndex++;
            return newTasks;
          } else {
            clearInterval(interval);
            setTimeout(() => {
                setStep('result');
                onBuildComplete();
            }, 800);
            return prevTasks.map(t => ({...t, status: 'completed'}));
          }
        });
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [step, projectPlan, onBuildComplete]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !hasEnoughCredits || !onDeductCredits(BUILD_COST)) {
        if (!hasEnoughCredits) setError("Insufficient credits to start a new build.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateProjectPlanAndCode(prompt);
      if (!plan || !plan.tasks || !plan.files || plan.files.length === 0) {
        throw new Error("The AI failed to generate a valid project. Please try a more specific prompt.");
      }
      setProjectPlan(plan);
      setStep('building');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendEdit = async () => {
    if (!editInputValue.trim() || !projectPlan || isEditing || !onDeductCredits(EDIT_COST)) {
      return;
    }
    
    setIsEditing(true);
    setError(null);
    const userMessage: Message = { id: Date.now().toString(), role: Role.USER, type: 'text', content: editInputValue };
    
    setProjectPlan(prev => prev ? { ...prev, editMessages: [...(prev.editMessages || []), userMessage] } : null);
    setEditInputValue('');

    try {
        const result: ProjectEditResponse = await editProjectCode(userMessage.content!, projectPlan.files);
        const modelMessage: Message = { id: (Date.now() + 1).toString(), role: Role.MODEL, type: 'text', content: result.summary };
        setProjectPlan(prev => prev ? { ...prev, files: result.files, editMessages: [...(prev.editMessages || []), modelMessage] } : null);
    } catch (e) {
         const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during edit.";
         setError(errorMessage);
         const modelMessage: Message = { id: (Date.now() + 1).toString(), role: Role.MODEL, type: 'text', content: `Sorry, I encountered an error: ${errorMessage}` };
         setProjectPlan(prev => prev ? { ...prev, editMessages: [...(prev.editMessages || []), modelMessage] } : null);
    } finally {
        setIsEditing(false);
    }
  };

  const handleStartOver = () => {
    setStep('prompt');
    setPrompt('');
    setProjectPlan(null);
    setCurrentTasks([]);
    setError(null);
  };
  
  const handleDownloadZip = () => {
    if (projectPlan) createZip(projectPlan.files);
  };

  const getPreviewContent = () => {
    if (!projectPlan) return '<p>Loading preview...</p>';
    const htmlFile = projectPlan.files.find(f => f.name === 'index.html');
    const cssFile = projectPlan.files.find(f => f.name === 'style.css');
    const jsFile = projectPlan.files.find(f => f.name === 'script.js');

    if (!htmlFile) return '<p>No HTML file found for preview.</p>';

    let content = htmlFile.content;
    if (cssFile) {
        content = content.replace('</head>', `<style>${cssFile.content}</style></head>`);
    }
    if (jsFile) {
        content = content.replace('</body>', `<script>${jsFile.content}</script></body>`);
    }
    return content;
  };


  const renderContent = () => {
    switch (step) {
      case 'prompt':
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-full max-w-2xl mx-auto">
              <LayoutTemplateIcon className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary mb-2">Multi-Agent Builder</h2>
              <p className="text-secondary mb-8">Describe the component or website you want to build.</p>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              {!hasEnoughCredits && <p className="text-yellow-500 text-sm text-center mb-4">You need at least {BUILD_COST} credits to start a build.</p>}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A modern, interactive calculator with a dark theme."
                className="w-full h-32 bg-surface/75 backdrop-blur-xl border border-white/10 rounded-lg p-4 text-primary focus:outline-none focus:ring-2 focus:ring-accent/70 resize-none mb-4"
              />
              <button 
                  onClick={handleGenerate} 
                  disabled={isLoading || !prompt.trim() || !hasEnoughCredits}
                  className="w-full py-3 bg-accent text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:bg-surface disabled:text-secondary disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                  {isLoading ? <Loader2Icon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5" />}
                  {isLoading ? 'Generating Plan...' : 'Start Building'}
                  <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-black/20">
                      <ZapIcon className="w-3 h-3" />
                      <span>{BUILD_COST}</span>
                  </div>
              </button>
            </div>
          </div>
        );
        
      case 'building':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-xl mx-auto">
              <BotIcon className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-primary mb-2 text-center">Building Your Project...</h2>
              <p className="text-secondary mb-8 text-center">The AI agents are working on your request. Here's the plan:</p>
              <div className="bg-surface/75 backdrop-blur-xl border border-white/10 rounded-lg p-6 space-y-4">
                  {currentTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 animate-fade-in">
                          <TaskStatusIcon status={task.status} />
                          <span className={`transition-colors ${task.status === 'completed' ? 'text-secondary line-through' : 'text-primary'}`}>
                              {task.description}
                          </span>
                      </div>
                  ))}
              </div>
            </div>
          </div>
        );
        
      case 'result':
        if (!projectPlan) return null;
        const hasEdits = projectPlan.editMessages && projectPlan.editMessages.length > 0;
        const hasEnoughEditCredits = credits >= EDIT_COST;

        return (
            <div className="flex flex-col h-full w-full animate-fade-in p-6">
                <header className="flex items-center justify-between pb-4 border-b border-surface flex-shrink-0">
                    <h2 className="text-xl font-bold text-primary">Build Complete</h2>
                    <div className="flex items-center gap-2">
                         <button onClick={() => onOpenCodeViewer(projectPlan)} className="flex items-center gap-2 px-3 py-2 text-sm bg-white/10 text-primary rounded-lg font-semibold hover:bg-white/20 transition-colors">
                            <CodeIcon className="w-4 h-4" />
                            View Code
                        </button>
                         <button onClick={handleDownloadZip} className="flex items-center gap-2 px-3 py-2 text-sm bg-white/10 text-primary rounded-lg font-semibold hover:bg-white/20 transition-colors">
                            <DownloadIcon className="w-4 h-4" />
                            Download ZIP
                        </button>
                        <button onClick={handleStartOver} className="flex items-center gap-2 px-3 py-2 text-sm bg-accent text-background rounded-lg font-semibold hover:opacity-90 transition-opacity">
                            <RefreshCwIcon className="w-4 h-4" />
                            Start Over
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto scrollbar-thin pt-4 space-y-6">
                    <div className="border border-surface rounded-lg overflow-hidden bg-white aspect-video relative">
                        <iframe
                            srcDoc={getPreviewContent()}
                            title="Live Preview"
                            className="w-full h-full"
                            sandbox="allow-scripts"
                        />
                    </div>
                    
                    <div className="bg-surface/50 border border-surface rounded-lg">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-primary">Refine with AI</h3>
                        </div>
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin p-4 border-t border-surface">
                           {!hasEdits && (
                                <div className="text-center text-secondary text-sm py-4">
                                    <p>Your project is built! You can now ask for changes.</p>
                                    <p className="font-semibold">e.g., "Change the button color to blue."</p>
                                </div>
                           )}
                           {(projectPlan.editMessages || []).map(msg => (
                               <MessageBubble key={msg.id} message={msg} user={{name: "You", color: "gold"}}/>
                           ))}
                           {isEditing && <LoadingIndicator />}
                           <div ref={endOfMessagesRef} />
                        </div>
                         <div className="p-4 border-t border-surface">
                            <div className="flex items-center gap-2">
                                <input 
                                    value={editInputValue}
                                    onChange={e => setEditInputValue(e.target.value)}
                                    onKeyDown={e => {if (e.key === 'Enter') handleSendEdit()}}
                                    placeholder="Ask for an edit..."
                                    className="flex-1 bg-background/50 border border-white/10 rounded-lg px-4 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent/70"
                                />
                                <button
                                    onClick={handleSendEdit}
                                    disabled={isEditing || !editInputValue.trim() || !hasEnoughEditCredits}
                                    className="p-3 bg-accent rounded-full text-background disabled:bg-surface disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200"
                                    aria-label="Send edit request"
                                >
                                    <SendIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-center text-xs text-secondary mt-2">Cost: {EDIT_COST} credit per edit.</div>
                         </div>
                    </div>

                    <div className="bg-surface/50 border border-surface rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 text-primary">Initial Build Plan</h3>
                        <div className="space-y-3">
                            {currentTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-3">
                                    <TaskStatusIcon status={task.status} />
                                    <span className="text-secondary line-through">{task.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
        <ScreenHeader title="Multi-Agent Builder" icon={LayoutTemplateIcon} onBack={onClose} />
        {renderContent()}
    </div>
  );
};

export default MultiAgentBuilder;