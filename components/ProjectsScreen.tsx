import React from 'react';
import type { Project } from '../types';
import { FolderIcon, PlusIcon } from './icons';
import ScreenHeader from './ScreenHeader';
import ProjectDetailView from './ProjectDetailView'; // Assuming this component exists or will be created

interface ProjectsScreenProps {
    projects: Project[];
    activeProject: Project | null;
    onSelectProject: (project: Project) => void;
    onCreateProject: () => void;
    onSaveProject: (project: Project) => void;
    onBack: () => void;
    onBackToHome: () => void;
    // Pass AI functions
    generateVideoPrompts: (seedPrompt: string, aiType: any, numPrompts: number, aspectRatio: string) => Promise<{ promptText: string }[]>;
    generateVideo: (prompt: string, image: { data: string, mimeType: string } | null, onProgress: (message: string) => void) => Promise<string>;
    generateImage: (prompt: string) => Promise<string>;
    editImage: (base64ImageData: string, mimeType: string, prompt: string) => Promise<string>;
}

const ProjectsScreen: React.FC<ProjectsScreenProps> = (props) => {
    const { projects, activeProject, onSelectProject, onCreateProject, onBack, onBackToHome } = props;

    if (activeProject) {
        return <ProjectDetailView project={activeProject} onBack={onBack} {...props} />;
    }

    return (
        <div className="h-full flex flex-col p-6">
            <ScreenHeader
                title="Projects"
                icon={FolderIcon}
                onBack={onBackToHome}
            />
            <div className="flex justify-end mb-4">
                 <button 
                    onClick={onCreateProject}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                    <PlusIcon className="w-5 h-5"/>
                    New Project
                </button>
            </div>
            
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(project => (
                        <button key={project.id} onClick={() => onSelectProject(project)} className="bg-surface border border-white/10 rounded-lg p-4 text-left hover:border-accent transition-colors">
                            <h3 className="font-semibold text-primary">{project.name}</h3>
                            <p className="text-sm text-secondary">Prompts: {project.promptCount}</p>
                            <p className="text-xs text-secondary mt-2">Last Edited: {project.lastEdited}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <FolderIcon className="w-16 h-16 text-secondary mb-4" />
                    <h2 className="text-xl font-bold text-primary">No Projects Yet</h2>
                    <p className="text-secondary">Click "New Project" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectsScreen;
