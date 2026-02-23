'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardsProps {
  contentIds: string[];
}

export default function Flashcards({ contentIds }: FlashcardsProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFlashcards();
  }, [contentIds]);

  const loadFlashcards = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/generate-flashcards`, {
        content_ids: contentIds,
      });
      setFlashcards(response.data.flashcards);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-purple-400" />
          <div className="absolute inset-0 blur-xl bg-purple-500/40 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-6 text-purple-300 text-lg font-semibold shimmer">Generating flashcards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-900/40 border-2 border-red-500/50 text-red-200 px-6 py-4 rounded-2xl backdrop-blur-xl inline-block">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-purple-300 text-lg">No flashcards generated yet.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold gradient-text mb-2">Flashcards</h2>
        <div className="inline-flex items-center gap-2 bg-purple-900/40 px-3 py-1.5 rounded-full border border-purple-500/40">
          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
          <p className="text-purple-200 text-xs font-semibold">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
      </div>

      <div
        className="relative h-72 cursor-pointer perspective-1000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`absolute w-full h-full transition-all duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-2xl p-6 flex items-center justify-center shadow-xl border border-purple-500/40 group-hover:border-purple-400/60 transition-all">
            <div className="text-center">
              <div className="text-xs text-purple-300 mb-3 font-semibold uppercase tracking-wider">Question</div>
              <p className="text-xl font-bold text-white leading-relaxed">
                {currentCard.front}
              </p>
              <div className="mt-4 text-purple-400 text-xs">Click to reveal answer</div>
            </div>
          </div>
          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-xl rounded-2xl p-6 flex items-center justify-center shadow-xl border border-indigo-500/40 group-hover:border-indigo-400/60 transition-all rotate-y-180">
            <div className="text-center">
              <div className="text-xs text-indigo-300 mb-3 font-semibold uppercase tracking-wider">Answer</div>
              <p className="text-lg text-white leading-relaxed">{currentCard.back}</p>
              <div className="mt-4 text-indigo-400 text-xs">Click to flip back</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button 
          onClick={(e) => { e.stopPropagation(); prevCard(); }} 
          className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }} 
          className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm"
        >
          <RotateCw className="w-4 h-4" />
          <span>Flip</span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextCard(); }} 
          className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
