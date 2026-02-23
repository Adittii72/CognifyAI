'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

interface QuizProps {
  contentIds: string[];
}

export default function Quiz({ contentIds }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuiz();
  }, [contentIds]);

  const loadQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/generate-quiz`, {
        content_ids: contentIds,
      });
      setQuestions(response.data.questions);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(optionIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === questions[currentIndex].correct_answer;
    if (isCorrect) setScore(score + 1);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-pink-400" />
          <div className="absolute inset-0 blur-xl bg-pink-500/40 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-6 text-pink-300 text-lg font-semibold shimmer">Generating quiz...</p>
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

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-purple-300 text-lg">No quiz questions generated yet.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isQuizComplete = currentIndex === questions.length - 1 && showResult;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold gradient-text mb-3">Quiz Challenge</h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 bg-purple-900/40 px-3 py-1.5 rounded-full border border-purple-500/40">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
            <p className="text-purple-200 text-xs font-semibold">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-pink-900/40 px-3 py-1.5 rounded-full border border-pink-500/40">
            <p className="text-pink-200 text-xs font-semibold">
              Score: {score}/{questions.length}
            </p>
          </div>
        </div>
      </div>

      {!isQuizComplete ? (
        <>
          <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-500/40">
            <div className="mb-6">
              <div className="text-xs text-purple-300 mb-2 font-semibold uppercase tracking-wider">Question {currentIndex + 1}</div>
              <h3 className="text-lg font-bold text-white leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>
            <div className="space-y-2.5">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correct_answer;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`w-full text-left p-3.5 rounded-xl transition-all duration-300 transform text-sm ${
                      showCorrect
                        ? 'bg-gradient-to-r from-green-600 to-green-500 text-white scale-105 shadow-md shadow-green-500/50'
                        : showIncorrect
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white scale-95 shadow-md shadow-red-500/50'
                        : isSelected
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white scale-105 shadow-md shadow-purple-500/50'
                        : 'bg-gray-800/60 text-purple-200 hover:bg-gray-700/80 hover:scale-102 border border-purple-500/30 hover:border-purple-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {showCorrect && <CheckCircle className="w-5 h-5 animate-pulse" />}
                      {showIncorrect && <XCircle className="w-5 h-5 animate-pulse" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            {!showResult ? (
              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="btn-primary px-8 py-3 text-sm disabled:opacity-40"
              >
                Submit Answer
              </button>
            ) : (
              <button onClick={nextQuestion} className="btn-primary px-8 py-3 text-sm">
                {currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="inline-block bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-purple-500/40">
            <div className="mb-4">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-3xl font-black gradient-text mb-4">Quiz Complete!</h3>
            </div>
            <div className="mb-6">
              <p className="text-2xl font-bold text-white mb-1">
                {score} / {questions.length}
              </p>
              <p className="text-base text-purple-300">
                {Math.round((score / questions.length) * 100)}% Correct
              </p>
            </div>
            <button onClick={resetQuiz} className="btn-primary px-8 py-3 text-sm">
              Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
