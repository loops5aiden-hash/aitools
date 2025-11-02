

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { startChat, generateImage, MOCK_API, generateAgentConfig, generateToolConfig, generateProjectPlanAndCode, interpretTerminalCommand, generateVideoPrompts, generateVideo, editImage } from './services/geminiService';
import type { Message, User, Agent, Tool, CreditState, UserStats, ProjectPlan, PublicUser, CommunityAgent, Project } from './types';
// FIX: Import NodeType to use it as a value.
import { Role, AIType, NodeType } from './types';
import SplashScreen from './components/SplashScreen';
import OnboardingFlow from './components/SignUpScreen';
import ProfileScreen from './components/ProfileScreen';
import HomePage from './components/HomePage';
import { AGENTS, TOOLS, MOCK_COMMUNITY_AGENTS, MOCK_PUBLIC_USERS } from './config/agentsAndTools';
import AgentSwitcher from './components/AgentSwitcher';
import MakerStudio from './components/MakerStudio';
import Layout from './components/Layout';
import ExtrasScreen from './components/ExtrasScreen';
import SettingsScreen from './components/SettingsScreen';
import MultiAgentBuilder from './components/MultiAgentBuilder';
import ConfirmationModal from './components/ConfirmationModal';
import CodeViewerModal from './components/CodeViewerModal';
import AgentHub from './components/AgentHub';
import AgentDetailView from './components/AgentDetailView';
import ConnectScreen from './components/ConnectScreen';
import PublicProfileScreen from './components/PublicProfileScreen';
import ChatScreen from './components/ChatScreen';
import ProjectsScreen from './components/ProjectsScreen';
import TerminalScreen from './components/TerminalScreen';


type AppFlowState = 'splash' | 'onboarding' | 'main';
export type CurrentScreen = 'home' | 'chat' | 'projects' | 'terminal' | 'builder' | 'makerStudio' | 'agentHub' | 'connect' | 'extras';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appFlowState, setAppFlowState] = useState<AppFlowState>('splash');
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('home');
  const [user, setUser] = useState<User | null>(null);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAgentSwitcherOpen, setIsAgentSwitcherOpen] = useState(false);
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);
  
  const [publicProfileToView, setPublicProfileToView] = useState<PublicUser | null>(null);
  const [communityAgentToView, setCommunityAgentToView] = useState<CommunityAgent | null>(null);
  
  const [projectToView, setProjectToView] = useState<ProjectPlan | null>(null);
  
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENTS[0]);
  const [customAgents, setCustomAgents] = useState<Agent[]>([]);
  const [customTools, setCustomTools] = useState<Tool[]>([]);

  const [theme, setTheme] = useState<Theme>('dark');
  const [creditState, setCreditState] = useState<CreditState>({ daily: 100, monthly: 600, nextReset: Date.now() + 24 * 60 * 60 * 1000 });
  const [userStats, setUserStats] = useState<UserStats>({ messagesSent: 0, imagesGenerated: 0, creations: 0, buildsCompleted: 0 });
  const [confirmationModal, setConfirmationModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // State for Projects Screen
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const chatRef = useRef<Chat | null>(null);

  const initializeChat = useCallback((agent: Agent, userName: string, currentCustomTools: Tool[]) => {
    try {
      chatRef.current = startChat(agent, [...TOOLS, ...currentCustomTools]);
      setMessages([
        { id: 'initial-message', role: Role.MODEL, type: 'text', content: agent.welcomeMessage.replace('{user}', userName) },
      ]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Initialization error.");
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedUser = localStorage.getItem('gemini-agent-user');
        const storedTheme = localStorage.getItem('gemini-theme') as Theme | null;
        if (storedTheme) setTheme(storedTheme);
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) setTheme('light');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          const storedAgentId = localStorage.getItem('gemini-active-agent-id');
          const storedCustomAgents = localStorage.getItem('gemini-custom-agents');
          const storedCustomTools = localStorage.getItem('gemini-custom-tools');
          const storedCredits = localStorage.getItem('gemini-credits');
          const storedStats = localStorage.getItem('gemini-stats');

          const loadedCustomAgents = storedCustomAgents ? JSON.parse(storedCustomAgents) : [];
          const loadedCustomTools = storedCustomTools ? JSON.parse(storedCustomTools) : [];
          setCustomAgents(loadedCustomAgents);
          setCustomTools(loadedCustomTools);

          if (storedCredits) setCreditState(JSON.parse(storedCredits));
          if (storedStats) setUserStats(JSON.parse(storedStats));
          
          let initialAgent = AGENTS[0];
          if (storedAgentId) {
            const allAgents = [...AGENTS, ...loadedCustomAgents];
            const savedAgent = allAgents.find(a => a.id === storedAgentId);
            if (savedAgent) initialAgent = savedAgent;
          }
          setActiveAgent(initialAgent);
          initializeChat(initialAgent, parsedUser.name, loadedCustomTools); 
          setAppFlowState('main');
        } else {
          setAppFlowState('onboarding');
        }
      } catch (e) {
        console.error("Failed to parse data from localStorage", e);
        handleFullReset(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []); 

   useEffect(() => {
    if (user) {
      initializeChat(activeAgent, user.name, customTools);
    }
  }, [activeAgent, customTools, user, initializeChat]);


  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('gemini-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    const checkCredits = () => {
      setCreditState(prev => {
        if (Date.now() > prev.nextReset) {
          return { ...prev, daily: 100, nextReset: Date.now() + 24 * 60 * 60 * 1000 };
        }
        return prev;
      });
    };
    checkCredits();
    const interval = setInterval(checkCredits, 60000);
    localStorage.setItem('gemini-credits', JSON.stringify(creditState));
    return () => clearInterval(interval);
  }, [creditState]);

  useEffect(() => {
    localStorage.setItem('gemini-stats', JSON.stringify(userStats));
  }, [userStats]);


  const deductCredits = useCallback((amount: number): boolean => {
    if (amount === 0) return true;
    if (creditState.daily < amount || creditState.monthly < amount) {
      setError("Insufficient credits for this action.");
      return false;
    }
    setCreditState(prev => ({
      ...prev,
      daily: prev.daily - amount,
      monthly: prev.monthly - amount,
    }));
    return true;
  }, [creditState]);

  const handleOnboardingComplete = (userData: User) => {
    localStorage.setItem('gemini-agent-user', JSON.stringify(userData));
    setUser(userData);
    setAppFlowState('main');
    setCurrentScreen('home');
  };
  
  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('gemini-agent-user', JSON.stringify(updatedUser));
    setIsProfileOpen(false);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (isLoading || !text.trim() || !user) return;

    const trimmedText = text.trim();
    const commandMatch = trimmedText.match(/^\/(\w+)/);
    const allTools = [...TOOLS, ...customTools];
    const tool = commandMatch ? allTools.find(t => t.command.startsWith(`/${commandMatch[1]}`)) : undefined;
    
    const cost = tool ? (tool.cost || 0) : 0;
    
    if (!deductCredits(cost)) return;

    setIsLoading(true);
    setError(null);
    
    const userMessage: Message = { id: Date.now().toString(), role: Role.USER, type: 'text', content: text };
    setMessages(prev => [...prev, userMessage]);
    setUserStats(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));

    try {
      if (tool && tool.id === 'nano_banana_image') {
        if (!deductCredits(3)) { setIsLoading(false); return; }
        const prompt = trimmedText.replace(tool.command.split(' ')[0], '').trim();
        if (!prompt) throw new Error("Please provide a prompt for the image.");
        const imageUrl = await generateImage(prompt);
        const imageMessage: Message = { id: (Date.now() + 1).toString(), role: Role.MODEL, type: 'image', imageUrl };
        setMessages(prev => [...prev, imageMessage]);
        setUserStats(prev => ({...prev, imagesGenerated: prev.imagesGenerated + 1}));
      } else {
        if (!chatRef.current) throw new Error("Chat session not initialized.");
        
        let stream = await chatRef.current.sendMessageStream({ message: text });
        
        let aggregatedResponse = { text: '', functionCalls: [] as any[] };
        let modelMessageId = (Date.now() + 1).toString();
        let firstChunk = true;
        let isToolCall = false;

        for await (const chunk of stream) {
            if (chunk.text) aggregatedResponse.text += chunk.text;
            if (chunk.functionCalls) {
                isToolCall = true;
                aggregatedResponse.functionCalls.push(...chunk.functionCalls);
            }
            
            if (!isToolCall && firstChunk && aggregatedResponse.text) {
                 setMessages(prev => [...prev, { id: modelMessageId, role: Role.MODEL, type: 'text', content: aggregatedResponse.text }]);
                 firstChunk = false;
            } else if (!isToolCall) {
                 setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, content: aggregatedResponse.text } : msg));
            }
        }

        if (isToolCall) {
            const call = aggregatedResponse.functionCalls[0];
            const toolMessage: Message = { id: modelMessageId, role: Role.MODEL, type: 'tool-call', content: `Using tool: ${call.name}...` };
            setMessages(prev => [...prev, toolMessage]);
            
            const currentTool = allTools.find(t => t.id === call.name);
            const apiFunction = MOCK_API[call.name as keyof typeof MOCK_API] || (() => ({ status: `Custom tool '${currentTool?.name || call.name}' executed successfully.`}));
            const apiResult = apiFunction(call.args);
            
            // FIX: The tool response part was malformed. It should be a single object
            // with a `functionResponse` key, not `functionResponses` (plural), and the value
            // should be an object, not an array. This aligns with the `FunctionResponsePart` type.
            const toolResponse = { functionResponse: { name: call.name, response: apiResult } };
            
            const toolResponseStream = await chatRef.current.sendMessageStream({ message: [toolResponse] });

            let modelResponseText = '';
            const finalModelMessageId = (Date.now() + 2).toString();
            firstChunk = true;

            for await (const chunk of toolResponseStream) {
                if(chunk.text) modelResponseText += chunk.text;
                if (firstChunk && chunk.text) {
                    setMessages(prev => [...prev, { id: finalModelMessageId, role: Role.MODEL, type: 'text', content: modelResponseText }]);
                    firstChunk = false;
                } else {
                    setMessages(prev => prev.map(msg => msg.id === finalModelMessageId ? { ...msg, content: modelResponseText } : msg));
                }
            }
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      console.error(e);
      setError(`Error: ${errorMessage}.`);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.MODEL, type: 'text', content: "Sorry, I encountered an error. Please try again."}]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, user, customTools, creditState, deductCredits]);
  
  const handleNewChat = useCallback(() => {
    if (!user) return;
    setIsLoading(false); 
    setMessages([]);
    setError(null);
    initializeChat(activeAgent, user.name, customTools);
  }, [user, activeAgent, customTools, initializeChat]);
    
  const handleSelectAgent = (agent: Agent) => {
    setActiveAgent(agent);
    localStorage.setItem('gemini-active-agent-id', agent.id);
    setIsAgentSwitcherOpen(false);
    setCurrentScreen('chat');
  };

  const handleSaveCreation = (item: Agent | Tool, type: 'agent' | 'tool') => {
    const cost = 7;
    if (!deductCredits(cost)) return;

    if (type === 'agent') {
        setCustomAgents(prev => {
            const newAgents = [...prev, item as Agent];
            localStorage.setItem('gemini-custom-agents', JSON.stringify(newAgents));
            return newAgents;
        });
    } else {
        const newTool = { ...(item as Tool), cost: 2 };
        setCustomTools(prev => {
            const newTools = [...prev, newTool];
            localStorage.setItem('gemini-custom-tools', JSON.stringify(newTools));
            return newTools;
        });
    }
    setUserStats(prev => ({...prev, creations: prev.creations + 1}));
  };

  const handleDeleteCustomItem = (id: string, type: 'agent' | 'tool') => {
      if (type === 'agent') {
        setCustomAgents(prev => {
            const newAgents = prev.filter(a => a.id !== id);
            localStorage.setItem('gemini-custom-agents', JSON.stringify(newAgents));
            if (activeAgent.id === id) {
              const newActiveAgent = AGENTS[0];
              setActiveAgent(newActiveAgent);
              localStorage.setItem('gemini-active-agent-id', newActiveAgent.id);
            }
            return newAgents;
        });
      } else {
        setCustomTools(prev => {
            const newTools = prev.filter(t => t.id !== id);
            localStorage.setItem('gemini-custom-tools', JSON.stringify(newTools));
            return newTools;
        });
      }
  };

  const handleClearCustomData = () => {
    setConfirmationModal({
        isOpen: true,
        title: "Clear Custom Data",
        message: "Are you sure you want to delete all your custom agents and tools? This action cannot be undone.",
        onConfirm: () => {
            setCustomAgents([]);
            setCustomTools([]);
            localStorage.removeItem('gemini-custom-agents');
            localStorage.removeItem('gemini-custom-tools');
            if (activeAgent.isCustom) {
                const newActiveAgent = AGENTS[0];
                setActiveAgent(newActiveAgent);
                localStorage.setItem('gemini-active-agent-id', newActiveAgent.id);
            }
            setConfirmationModal({isOpen: false, title: '', message: '', onConfirm: () => {}});
        }
    });
  };

  const handleFullReset = (isError = false) => {
    const performReset = () => {
        localStorage.clear();
        setUser(null);
        setCustomAgents([]);
        setCustomTools([]);
        setActiveAgent(AGENTS[0]);
        setMessages([]);
        setCreditState({ daily: 100, monthly: 600, nextReset: Date.now() + 24 * 60 * 60 * 1000 });
        setUserStats({ messagesSent: 0, imagesGenerated: 0, creations: 0, buildsCompleted: 0 });
        setAppFlowState('onboarding');
        setCurrentScreen('home');
        setConfirmationModal({isOpen: false, title: '', message: '', onConfirm: () => {}});
    };

    if (isError) {
        performReset();
        return;
    }

    setConfirmationModal({
        isOpen: true,
        title: "Full App Reset",
        message: "Are you sure you want to reset the entire application? This will clear all your data, including your profile, and you will be logged out.",
        onConfirm: performReset
    });
  };
  
  const handleBuildComplete = () => {
    setUserStats(prev => ({ ...prev, buildsCompleted: prev.buildsCompleted + 1 }));
  };
  
  const handleOpenCodeViewer = (project: ProjectPlan) => {
    setProjectToView(project);
    setIsCodeViewerOpen(true);
  };
  
  const handleInstallAgent = (agent: CommunityAgent) => {
    const newAgent: Agent = {
        ...agent,
        id: `custom_${agent.id}_${Date.now()}`,
        isCustom: true,
    };
    setCustomAgents(prev => {
        const existing = prev.find(a => a.id.includes(agent.id));
        if (existing) return prev;
        const newAgents = [...prev, newAgent];
        localStorage.setItem('gemini-custom-agents', JSON.stringify(newAgents));
        return newAgents;
    });
  };

  // Handlers for Projects Screen
  const handleSaveProject = (updatedProject: Project) => {
      const newProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
      setProjects(newProjects);
  };
  const handleCreateProject = () => {
      const newProject: Project = {
          id: `proj_${Date.now()}`,
          name: 'New Project',
          promptCount: 0,
          lastEdited: new Date().toLocaleDateString(),
          nodes: [{
              id: `node_${Date.now()}`,
              // FIX: Use NodeType enum instead of string literal to satisfy TypeScript type checking.
              type: NodeType.Text,
              content: 'Your first prompt...',
              aiType: AIType.Sora,
              isCollapsed: false,
          }]
      };
      setProjects(prev => [...prev, newProject]);
      setActiveProject(newProject);
  };
  const handleSelectProject = (project: Project) => setActiveProject(project);

  const renderScreen = () => {
    if (!user) return null;

    switch (currentScreen) {
      case 'home':
        return <HomePage user={user} onNavigate={setCurrentScreen} />;
      case 'chat':
        return <ChatScreen
            messages={messages}
            isLoading={isLoading}
            user={user}
            error={error}
            handleSendMessage={handleSendMessage}
            handleNewChat={handleNewChat}
            activeAgent={activeAgent}
            onOpenAgentSwitcher={() => setIsAgentSwitcherOpen(true)}
            theme={theme}
            customTools={customTools}
            creditState={creditState}
            setError={setError}
        />;
      case 'projects':
        return <ProjectsScreen 
            projects={projects}
            activeProject={activeProject}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onSaveProject={handleSaveProject}
            onBack={() => setActiveProject(null)}
            onBackToHome={() => setCurrentScreen('home')}
            // Pass AI service functions
            generateVideoPrompts={generateVideoPrompts}
            generateVideo={generateVideo}
            generateImage={generateImage}
            editImage={editImage}
        />;
      case 'terminal':
        return <TerminalScreen 
            onBack={() => setCurrentScreen('home')}
            interpretCommand={interpretTerminalCommand}
            generateImage={generateImage}
            generateVideoPrompts={generateVideoPrompts}
            generateVideo={generateVideo}
        />;
      case 'builder':
        return <MultiAgentBuilder
          onClose={() => setCurrentScreen('home')}
          generateProjectPlanAndCode={generateProjectPlanAndCode}
          credits={creditState.daily}
          onDeductCredits={deductCredits}
          onBuildComplete={handleBuildComplete}
          onOpenCodeViewer={handleOpenCodeViewer}
        />;
      case 'makerStudio':
         return <MakerStudio 
            onNavigate={setCurrentScreen}
            onSave={handleSaveCreation}
            generateAgentConfig={generateAgentConfig}
            generateToolConfig={generateToolConfig}
            credits={creditState.daily}
          />;
      case 'agentHub':
        return <AgentHub
            agents={MOCK_COMMUNITY_AGENTS}
            onBack={() => setCurrentScreen('home')}
            onViewAgent={setCommunityAgentToView}
        />;
      case 'connect':
        return <ConnectScreen users={MOCK_PUBLIC_USERS} onViewProfile={setPublicProfileToView} />;
      case 'extras':
        return <ExtrasScreen onOpenProfile={() => setIsProfileOpen(true)} onOpenSettings={() => setIsSettingsOpen(true)} />;
    }
  };

  if (appFlowState === 'splash') return <SplashScreen />;
  if (appFlowState === 'onboarding') return <OnboardingFlow onComplete={handleOnboardingComplete} />;

  return (
    <>
      <Layout
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        credits={creditState.daily}
        user={user}
      >
        {renderScreen()}
      </Layout>
      
      {isProfileOpen && user && (
        <ProfileScreen 
          user={user} 
          onSave={handleProfileUpdate} 
          onClose={() => setIsProfileOpen(false)} 
          customAgents={customAgents}
          customTools={customTools}
          onDelete={handleDeleteCustomItem}
          creditState={creditState}
          userStats={userStats}
        />
      )}
      {isSettingsOpen && (
        <SettingsScreen 
            onClose={() => setIsSettingsOpen(false)}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            onClearCustomData={handleClearCustomData}
            onFullReset={() => handleFullReset(false)}
        />
      )}
      {isAgentSwitcherOpen && (
          <AgentSwitcher 
            agents={[...AGENTS, ...customAgents]} 
            activeAgentId={activeAgent.id} 
            onSelectAgent={handleSelectAgent} 
            onClose={() => setIsAgentSwitcherOpen(false)} 
          />
      )}
      {isCodeViewerOpen && projectToView && (
        <CodeViewerModal
            project={projectToView}
            onClose={() => setIsCodeViewerOpen(false)}
        />
      )}
      {communityAgentToView && (
          <AgentDetailView
            agent={communityAgentToView}
            onClose={() => setCommunityAgentToView(null)}
            onInstall={handleInstallAgent}
            isInstalled={customAgents.some(a => a.id.includes(communityAgentToView.id))}
          />
      )}
      {publicProfileToView && (
        <PublicProfileScreen
            user={publicProfileToView}
            onClose={() => setPublicProfileToView(null)}
        />
      )}
      {confirmationModal.isOpen && (
        <ConfirmationModal
            title={confirmationModal.title}
            message={confirmationModal.message}
            onConfirm={confirmationModal.onConfirm}
            onCancel={() => setConfirmationModal({isOpen: false, title: '', message: '', onConfirm: () => {}})}
        />
      )}
    </>
  );
};

export default App;