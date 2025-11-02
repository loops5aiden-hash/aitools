
import React, { useState } from 'react';
import type { Project, NodeData, PromptNodeData, ImageNodeData } from '../types';
import { AIType, NodeType } from '../types';
import { 
    PencilSquareIcon, SquareOnSquareIcon, MinusIcon, PlusIcon, XIcon,
    UndoIcon, RedoIcon, FileJsonIcon, SoraIcon, VeoIcon, TerminalIcon, GrokIcon,
    WandIcon, ImageIcon, VideoIcon, SparklesIcon, Loader2Icon
} from './icons';

interface ProjectDetailViewProps {
    project: Project;
    onBack: () => void;
    onSaveProject: (project: Project) => void;
    generateVideoPrompts: (seedPrompt: string, aiType: any, numPrompts: number, aspectRatio: string) => Promise<{ promptText: string }[]>;
    generateVideo: (prompt: string, image: { data: string, mimeType: string } | null, onProgress: (message: string) => void) => Promise<string>;
    generateImage: (prompt: string) => Promise<string>;
    editImage: (base64ImageData: string, mimeType: string, prompt: string) => Promise<string>;
}

const AITypeIcon: React.FC<{ type: AIType }> = ({ type }) => {
    switch(type) {
        case AIType.Sora: return <SoraIcon className="w-5 h-5" />;
        case AIType.Veo: return <VeoIcon className="w-5 h-5" />;
        case AIType.Terminal: return <TerminalIcon className="w-5 h-5" />;
        case AIType.Grok: return <GrokIcon className="w-5 h-5" />;
        default: return null;
    }
};

const Node: React.FC<{ 
    node: NodeData; 
    onUpdate: (updatedNode: NodeData) => void; 
    onDelete: (id: string) => void;
    onGenerate: (node: NodeData) => void;
}> = ({ node, onUpdate, onDelete, onGenerate }) => {
    
    const renderNodeContent = () => {
        switch(node.type) {
            case NodeType.Text:
                return (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                           <AITypeIcon type={node.aiType} />
                           <span className="text-sm font-semibold">{node.aiType} Prompt</span>
                        </div>
                        <textarea
                            value={node.content}
                            onChange={(e) => onUpdate({ ...node, content: e.target.value })}
                            className="w-full h-24 bg-background/50 border border-surface rounded-md p-2 text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                    </div>
                );
            case NodeType.Image:
                 return (
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-primary">
                           <ImageIcon className="w-5 h-5" />
                           <span className="text-sm font-semibold">Image Generation</span>
                        </div>
                        {node.isLoading ? (
                            <div className="w-full aspect-square bg-black/30 rounded-md flex flex-col items-center justify-center">
                               <Loader2Icon className="w-8 h-8 text-accent animate-spin" />
                               <p className="text-sm text-secondary mt-2">Generating...</p>
                            </div>
                        ) : node.base64Image ? (
                            <img src={`data:image/jpeg;base64,${node.base64Image}`} alt="Generated" className="w-full rounded-md" />
                        ) : (
                             <div className="w-full aspect-square bg-black/30 rounded-md flex items-center justify-center">
                                <p className="text-secondary text-sm">No Image</p>
                             </div>
                        )}
                    </div>
                );
             case NodeType.Video:
                return (
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-primary">
                           <VideoIcon className="w-5 h-5" />
                           <span className="text-sm font-semibold">Video Generation</span>
                        </div>
                        {node.isLoading ? (
                            <div className="w-full aspect-video bg-black/30 rounded-md flex flex-col items-center justify-center">
                                <Loader2Icon className="w-8 h-8 text-accent animate-spin" />
                                <p className="text-sm text-secondary mt-2">{node.statusMessage || 'Generating...'}</p>
                            </div>
                        ) : node.videoUrl ? (
                           <video src={node.videoUrl} controls className="w-full rounded-md" />
                        ) : (
                             <div className="w-full aspect-video bg-black/30 rounded-md flex items-center justify-center">
                                <p className="text-secondary text-sm">No Video</p>
                             </div>
                        )}
                    </div>
                );
        }
    };
    
    return (
        <div className="bg-surface border border-white/10 rounded-lg p-4">
            <div className="flex justify-end items-center gap-2 mb-2">
                <button onClick={() => onGenerate(node)} className="p-1.5 text-secondary hover:text-accent"><SparklesIcon className="w-4 h-4" /></button>
                <button onClick={() => onUpdate({...node, isCollapsed: !node.isCollapsed})} className="p-1.5 text-secondary hover:text-primary">{node.isCollapsed ? <PlusIcon className="w-4 h-4"/> : <MinusIcon className="w-4 h-4"/>}</button>
                <button onClick={() => onDelete(node.id)} className="p-1.5 text-secondary hover:text-red-500"><XIcon className="w-4 h-4"/></button>
            </div>
            {!node.isCollapsed && renderNodeContent()}
        </div>
    );
};


const ProjectDetailView: React.FC<ProjectDetailViewProps> = (props) => {
    const { project: initialProject, onBack, onSaveProject } = props;
    const [project, setProject] = useState(initialProject);
    const [projectName, setProjectName] = useState(project.name);

    const handleNodeUpdate = (updatedNode: NodeData) => {
        const newNodes = project.nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
        setProject({ ...project, nodes: newNodes });
        onSaveProject({ ...project, nodes: newNodes });
    };

    const handleNodeDelete = (id: string) => {
        const newNodes = project.nodes.filter(n => n.id !== id);
        setProject({ ...project, nodes: newNodes });
        onSaveProject({ ...project, nodes: newNodes });
    };

    const handleAddNode = (type: NodeType) => {
        const baseNode = { id: `node_${Date.now()}`, isCollapsed: false };
        let newNode: NodeData;

        const lastTextNode = [...project.nodes].reverse().find(n => n.type === NodeType.Text);
        const lastImageNode = [...project.nodes].reverse().find(n => n.type === NodeType.Image);

        switch(type) {
            case NodeType.Text: {
                newNode = { ...baseNode, type, content: '', aiType: AIType.Sora };
                break;
            }
            case NodeType.Image: {
                let prompt = '';
                if (lastTextNode && lastTextNode.type === NodeType.Text) {
                    prompt = lastTextNode.content;
                }
                newNode = { ...baseNode, type, prompt, base64Image: '', isLoading: false };
                break;
            }
            case NodeType.Video: {
                let prompt = '';
                if (lastTextNode && lastTextNode.type === NodeType.Text) {
                    prompt = lastTextNode.content;
                }
                let base64SeedImage: string | undefined;
                if (lastImageNode && lastImageNode.type === NodeType.Image) {
                    base64SeedImage = lastImageNode.base64Image;
                }
                newNode = { ...baseNode, type, prompt, base64SeedImage, videoUrl: '', isLoading: false, statusMessage: '' };
                break;
            }
            default:
                console.error("Unsupported node type:", type);
                return;
        }
        const newNodes = [...project.nodes, newNode];
        setProject({ ...project, nodes: newNodes });
        onSaveProject({ ...project, nodes: newNodes });
    };
    
    const handleGenerate = async (node: NodeData) => {
        if (node.type === NodeType.Text) { // Generate sub-prompts
            const prompts = await props.generateVideoPrompts(node.content, node.aiType, 3, '16:9');
            const newNodes = prompts.map(p => ({
                id: `node_${Date.now()}_${Math.random()}`,
                type: NodeType.Text,
                content: p.promptText,
                aiType: node.aiType,
                isCollapsed: false,
            } as NodeData));
             const insertIndex = project.nodes.findIndex(n => n.id === node.id) + 1;
             const allNodes = [...project.nodes];
             allNodes.splice(insertIndex, 0, ...newNodes);
             setProject({...project, nodes: allNodes});
        }
        if (node.type === NodeType.Image) {
            handleNodeUpdate({...node, isLoading: true});
            const base64Image = await props.generateImage(node.prompt);
            handleNodeUpdate({...node, base64Image, isLoading: false});
        }
        if (node.type === NodeType.Video) {
            const onProgress = (message: string) => handleNodeUpdate({...node, isLoading: true, statusMessage: message});
            handleNodeUpdate({...node, isLoading: true, statusMessage: 'Initializing...'});
            const imagePayload = node.base64SeedImage ? { data: node.base64SeedImage, mimeType: 'image/jpeg' } : null;
            const videoUrl = await props.generateVideo(node.prompt, imagePayload, onProgress);
            handleNodeUpdate({...node, videoUrl, isLoading: false, statusMessage: 'Completed'});
        }
    };

    const handleExportForAI = () => {
        const exportData = {
            manifestVersion: "1.0.0",
            projectName: projectName,
            instructionsForAI: "You are an AI project builder. This file contains a structured 'AI Projects' workflow. Your task is to replicate this project. The 'nodes' array represents a sequence of creative steps. Each node has a 'type' ('text', 'image', 'video'). Follow the sequence to understand the creative flow. For example, a 'video' node might use the 'prompt' from a preceding 'text' node and the 'base64SeedImage' from a preceding 'image' node. Reconstruct this project structure and content in your environment.",
            nodes: project.nodes.map(node => {
                const { isLoading, statusMessage, videoUrl, ...stableNode } = node as any;
                const exportNode: any = { ...stableNode };
                if (exportNode.type === 'video') {
                    delete exportNode.videoUrl;
                }
                return exportNode;
            })
        };
    
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s+/g, '_')}.aiproj.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-surface flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-2 text-secondary hover:text-primary rounded-full bg-surface/50 hover:bg-surface transition-colors">
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <input 
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        onBlur={() => onSaveProject({...project, name: projectName})}
                        className="bg-transparent text-lg font-bold text-primary focus:outline-none focus:ring-1 focus:ring-accent rounded px-2"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-secondary hover:text-primary rounded-full"><UndoIcon className="w-5 h-5"/></button>
                    <button className="p-2 text-secondary hover:text-primary rounded-full"><RedoIcon className="w-5 h-5"/></button>
                    <button onClick={handleExportForAI} title="Export for AI" className="p-2 text-secondary hover:text-primary rounded-full"><FileJsonIcon className="w-5 h-5"/></button>
                </div>
            </header>

            {/* Workspace */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {project.nodes.map(node => (
                    <Node key={node.id} node={node} onUpdate={handleNodeUpdate} onDelete={handleNodeDelete} onGenerate={handleGenerate} />
                ))}
            </div>

            {/* Toolbar */}
            <footer className="p-3 border-t border-surface flex items-center justify-center gap-2">
                <button onClick={() => handleAddNode(NodeType.Text)} className="flex items-center gap-2 px-3 py-2 text-sm bg-surface text-primary rounded-md font-semibold hover:bg-white/20">
                    <WandIcon className="w-4 h-4"/> Prompt
                </button>
                <button onClick={() => handleAddNode(NodeType.Image)} className="flex items-center gap-2 px-3 py-2 text-sm bg-surface text-primary rounded-md font-semibold hover:bg-white/20">
                    <ImageIcon className="w-4 h-4"/> Image
                </button>
                <button onClick={() => handleAddNode(NodeType.Video)} className="flex items-center gap-2 px-3 py-2 text-sm bg-surface text-primary rounded-md font-semibold hover:bg-white/20">
                    <VideoIcon className="w-4 h-4"/> Video
                </button>
            </footer>
        </div>
    );
};

export default ProjectDetailView;
