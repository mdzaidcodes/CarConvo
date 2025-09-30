'use client';

/**
 * Personality Test Page
 * Interactive questionnaire to determine user's car preferences
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { getPersonalityQuestions, analyzePersonality, Question } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import Swal from 'sweetalert2';

export default function PersonalityTest() {
  const router = useRouter();
  const { setSessionId, setLifestyleProfile, setIsLoading, isLoading } = useAppStore();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const data = await getPersonalityQuestions();
        setQuestions(data);
      } catch (err) {
        setError('Failed to load questions. Please check if the backend is running.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [setIsLoading]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswered = currentQuestion && answers[currentQuestion.id] && answers[currentQuestion.id].length > 0;

  const handleAnswer = (value: string) => {
    if (!currentQuestion) return;
    
    setAnswers((prev) => {
      const currentAnswers = prev[currentQuestion.id] || [];
      
      // Single-select mode: replace the answer
      if (!currentQuestion.multiSelect) {
        return {
          ...prev,
          [currentQuestion.id]: [value],
        };
      }
      
      // Multi-select mode: toggle selection
      if (currentAnswers.includes(value)) {
        // Deselect
        return {
          ...prev,
          [currentQuestion.id]: currentAnswers.filter(v => v !== value),
        };
      } else {
        // Check max selections limit
        const maxSelections = currentQuestion.maxSelections || 999;
        if (currentAnswers.length >= maxSelections) {
          // Already at max, don't add more
          return prev;
        }
        
        // Add selection
        return {
          ...prev,
          [currentQuestion.id]: [...currentAnswers, value],
        };
      }
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const result = await analyzePersonality(answers);
      
      setSessionId(result.session_id);
      setLifestyleProfile(result.lifestyle_profile);
      
      // Show success message
      await Swal.fire({
        title: '✨ Profile Created!',
        html: `
          <p style="color: #4B5563; margin-bottom: 8px;">
            We've analyzed your preferences and found the perfect matches for you.
          </p>
          <p style="color: #6B7280; font-size: 14px;">
            🚗 Personalized recommendations are ready!
          </p>
        `,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-xl'
        }
      });
      
      // Navigate to chat page
      setIsLoading(false); // Reset loading state before navigation
      router.push('/chat');
    } catch (err: any) {
      setIsLoading(false);
      
      await Swal.fire({
        title: '❌ Analysis Failed',
        html: `
          <p style="color: #4B5563; margin-bottom: 8px;">
            Failed to analyze your responses. Please try again.
          </p>
          <p style="color: #6B7280; font-size: 14px;">
            ${err.message ? `<br/><code style="background: #F3F4F6; padding: 4px 8px; border-radius: 4px;">${err.message}</code>` : ''}
          </p>
        `,
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#EF4444',
        customClass: {
          popup: 'rounded-xl'
        }
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Your Car Personality</h1>
          <p className="text-gray-700">Answer a few questions to help us understand your preferences</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-700 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-800"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-6"
            >
              <div className="mb-6">
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                  {currentQuestion.category}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-blue-700 font-medium">
                  {currentQuestion.multiSelect 
                    ? `✓ Select up to ${currentQuestion.maxSelections || 'multiple'} option${(currentQuestion.maxSelections || 2) > 1 ? 's' : ''}`
                    : '○ Select one option'
                  }
                </p>
                {currentQuestion.multiSelect && answers[currentQuestion.id] && answers[currentQuestion.id].length > 0 && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                    {answers[currentQuestion.id].length} selected
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id]?.includes(option.value) || false;
                  
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{option.text}</span>
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!hasAnswered || isLoading}
            className="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : isLastQuestion ? (
              <>
                Complete
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
