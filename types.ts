import React from 'react';

export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export type MessageType = 'text' | 'image' | 'tool-call';

export interface Message {
  id: string;
  role: Role;
  type: MessageType;
  content?: string;
  imageUrl?: string;
}

export interface User {
  name: string;
  color: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  welcomeMessage: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  isCustom?: boolean;
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    command: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    cost?: number;
    isCustom?: boolean;
}

// --- New Types ---

export interface CreditState {
    daily: number;
    monthly: number;
    nextReset: number;
}

export interface UserStats {
    messagesSent: number;
    imagesGenerated: number;
    creations: number;
    buildsCompleted: number;
}


// --- Multi-Agent Builder Types ---

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface BuildTask {
    id: string;
    description: string;
    status: TaskStatus;
}

export interface ProjectFile {
    name: string;
    content: string;
}

export interface ProjectPlan {
    tasks: BuildTask[];
    files: ProjectFile[];
    editMessages?: Message[];
}

export interface ProjectEditResponse {
    files: ProjectFile[];
    summary: string;
}

// --- Social & Hub Types ---
export interface CommunityAgent {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    author: string;
    version: string;
    category: 'Productivity' | 'Creative' | 'Developer' | 'Fun';
    tags: string[];
    systemInstruction: string;
    welcomeMessage: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    installs: number;
}

export interface PublicUser {
    id: string;
    name: string;
    color: string;
    followers: number;
    publishedAgents: Agent[];
    publishedTools: Tool[];
}

export type FollowState = {
    [userId: string]: boolean;
};


// --- PromptFlow AI Feature Types ---

export enum AIType {
    Sora = 'Sora',
    Veo = 'Veo',
    Grok = 'Grok',
    Terminal = 'Terminal',
}

export enum NodeType {
    Text = 'text',
    Image = 'image',
    Video = 'video',
}

interface BaseNodeData {
    id: string;
    isCollapsed: boolean;
}

export interface PromptNodeData extends BaseNodeData {
    type: NodeType.Text;
    content: string;
    aiType: AIType;
}

export interface ImageNodeData extends BaseNodeData {
    type: NodeType.Image;
    prompt: string;
    base64Image: string;
    isLoading: boolean;
}

export interface VideoNodeData extends BaseNodeData {
    type: NodeType.Video;
    prompt: string;
    base64SeedImage?: string;
    videoUrl: string; 
    isLoading: boolean;
    statusMessage: string;
}

export type NodeData = PromptNodeData | ImageNodeData | VideoNodeData;

export interface Project {
    id: string;
    name: string;
    promptCount: number;
    lastEdited: string;
    nodes: NodeData[];
}
