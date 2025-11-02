
import React, { useState } from 'react';
import type { ProjectPlan, ProjectFile } from '../types';
import { FileIcon, CodeIcon } from './icons';

interface CodeViewerModalProps {
  project: ProjectPlan;
  onClose: () => void;
}

// Basic syntax highlighting logic
const SyntaxHighlighter: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const highlight = (text: string) => {
    let highlighted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (language === 'html') {
      highlighted = highlighted.replace(/(&lt;\/?[\w\s="/.':;-]+&gt;)/g, '<span class="text-pink-400">$1</span>'); // Tags
      highlighted = highlighted.replace(/(\s[\w-]+)=("[\w\s#:/.-]+")/, '<span class="text-purple-400">$1</span>=<span class="text-amber-400">$2</span>'); // Attributes
    } else if (language === 'css') {
      highlighted = highlighted.replace(/(^|[\s{;}])([\w-]+)\s*:/g, '$1<span class="text-purple-400">$2</span>:'); // Properties
      highlighted = highlighted.replace(/:\s*([^;]+);/g, ': <span class="text-amber-400">$1</span>;'); // Values
      highlighted = highlighted.replace(/([.#][\w-]+)/g, '<span class="text-teal-400">$1</span>'); // Selectors
    } else if (language === 'javascript') {
      highlighted = highlighted.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from)\b/g, '<span class="text-purple-400">$1</span>'); // Keywords
      highlighted = highlighted.replace(/('.*?'|".*?"|`.*?`)/g, '<span class="text-amber-400">$1</span>'); // Strings
      highlighted = highlighted.replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>'); // Comments
    }
    return <code dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <pre className="p-4 rounded-lg bg-[#1e1e1e] text-white text-sm overflow-auto scrollbar-thin">
      {highlight(code)}
    </pre>
  );
};


const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ project, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(project.files[0] || null);
  
  const getLanguage = (filename: string) => {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js')) return 'javascript';
    return 'plaintext';
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface/75 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-surface flex-shrink-0">
          <div className="flex items-center gap-2">
            <CodeIcon className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-primary">Code Viewer</h2>
          </div>
          <button
            onClick={onClose}
            className="w-full max-w-xs py-2 bg-accent text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </header>
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree */}
          <div className="w-1/4 bg-black/20 p-4 border-r border-surface overflow-y-auto scrollbar-thin">
            <h3 className="text-sm font-semibold text-secondary mb-3">Project Files</h3>
            <ul className="space-y-1">
              {project.files.map(file => (
                <li key={file.name}>
                  <button
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors text-sm ${selectedFile?.name === file.name ? 'bg-accent/20 text-accent font-semibold' : 'text-primary hover:bg-white/10'}`}
                  >
                    <FileIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{file.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Code Viewer */}
          <div className="w-3/4 flex-1 overflow-auto">
            {selectedFile ? (
              <SyntaxHighlighter code={selectedFile.content} language={getLanguage(selectedFile.name)} />
            ) : (
              <div className="flex items-center justify-center h-full text-secondary">
                <p>Select a file to view its code.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeViewerModal;
