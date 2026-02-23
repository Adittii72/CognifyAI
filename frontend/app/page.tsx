'use client';

import { useState, useEffect } from 'react';
import { Upload, Youtube, Sparkles } from 'lucide-react';
import ProcessContent from '@/components/ProcessContent';
import Flashcards from '@/components/Flashcards';
import Quiz from '@/components/Quiz';
import Chat from '@/components/Chat';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'flashcards' | 'quiz' | 'chat'>('upload');
  const [contentIds, setContentIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleContentProcessed = (contentId: string) => {
    setContentIds(prev => [...prev, contentId]);
  };

  if (!mounted) {
    return null;
  }

  const hasContent = contentIds.length > 0;

  return (
    <main className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-start justify-center gap-3 mb-4">
            <div className="relative mt-1">
              <Sparkles className="w-8 h-8 text-pink-400" />
              <div className="absolute inset-0 blur-lg bg-pink-500/30 rounded-full"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent leading-tight pb-2">
              Cognify AI
            </h1>
          </div>
          <p className="text-purple-300 text-base font-light tracking-wide">
            Transform <span className="gradient-text font-semibold">YouTube videos</span> and{' '}
            <span className="gradient-text font-semibold">PDFs</span> into interactive learning materials
          </p>
        </div>

        {/* Content Counter */}
        {hasContent && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-900/40 to-pink-900/40 px-4 py-2 rounded-full border border-purple-500/40 backdrop-blur-xl pulse-glow">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-purple-200 text-xs font-semibold">
                {contentIds.length} content item{contentIds.length > 1 ? 's' : ''} uploaded
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('upload')}
            className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all transform text-sm ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                : 'bg-gray-800/60 text-purple-300 hover:bg-gray-700/80 hover:scale-105 border border-purple-500/30 hover:border-purple-400/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload Content</span>
            </div>
            {activeTab !== 'upload' && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-600/0 via-purple-600/0 to-indigo-600/0 group-hover:from-pink-600/10 group-hover:via-purple-600/10 group-hover:to-indigo-600/10 transition-all"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all transform text-sm ${
              activeTab === 'flashcards'
                ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                : 'bg-gray-800/60 text-purple-300 hover:bg-gray-700/80 hover:scale-105 border border-purple-500/30 hover:border-purple-400/50'
            }`}
            disabled={!hasContent}
          >
            <span>Flashcards</span>
            {activeTab !== 'flashcards' && hasContent && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-600/0 via-purple-600/0 to-indigo-600/0 group-hover:from-pink-600/10 group-hover:via-purple-600/10 group-hover:to-indigo-600/10 transition-all"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all transform text-sm ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                : 'bg-gray-800/60 text-purple-300 hover:bg-gray-700/80 hover:scale-105 border border-purple-500/30 hover:border-purple-400/50'
            }`}
            disabled={!hasContent}
          >
            <span>Quiz</span>
            {activeTab !== 'quiz' && hasContent && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-600/0 via-purple-600/0 to-indigo-600/0 group-hover:from-pink-600/10 group-hover:via-purple-600/10 group-hover:to-indigo-600/10 transition-all"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all transform text-sm ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                : 'bg-gray-800/60 text-purple-300 hover:bg-gray-700/80 hover:scale-105 border border-purple-500/30 hover:border-purple-400/50'
            }`}
            disabled={!hasContent}
          >
            <span>Chat</span>
            {activeTab !== 'chat' && hasContent && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-600/0 via-purple-600/0 to-indigo-600/0 group-hover:from-pink-600/10 group-hover:via-purple-600/10 group-hover:to-indigo-600/10 transition-all"></div>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="card">
          {activeTab === 'upload' && (
            <ProcessContent onContentProcessed={handleContentProcessed} />
          )}
          {activeTab === 'flashcards' && hasContent && (
            <Flashcards contentIds={contentIds} />
          )}
          {activeTab === 'quiz' && hasContent && (
            <Quiz contentIds={contentIds} />
          )}
          {activeTab === 'chat' && hasContent && (
            <Chat contentIds={contentIds} />
          )}
        </div>
      </div>
    </main>
  );
}
