'use client';

/**
 * Chat Page - Main conversational interface
 * Natural language interaction with AI for car recommendations
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, Loader2, Home } from 'lucide-react';
import { sendChatMessage } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import CarCard from '@/components/CarCard';
import ProfileSummary from '@/components/ProfileSummary';
import Swal from 'sweetalert2';
import { CarIcon } from '@/components/Icons';

export default function ChatPage() {
  const router = useRouter();
  const {
    sessionId,
    lifestyleProfile,
    messages,
    addMessage,
    clearMessages,
    recommendedCars,
    setRecommendedCars,
    budget,
    setBudget,
    isLoading,
    setIsLoading,
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const [recommendationVersion, setRecommendationVersion] = useState(0);
  const hasInitializedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if no session
  useEffect(() => {
    if (!sessionId || !lifestyleProfile) {
      router.push('/personality-test');
    }
  }, [sessionId, lifestyleProfile, router]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show welcome message and fetch initial recommendations
  useEffect(() => {
    // Reset loading state on mount (in case it was left true from previous page)
    if (isLoading) {
      setIsLoading(false);
    }
    
    // Use ref to prevent multiple initializations (React Strict Mode protection)
    if (sessionId && !hasInitializedRef.current && messages.length === 0) {
      hasInitializedRef.current = true;
      
      // Send automatic first message to get car recommendations
      // Use setTimeout to ensure isLoading has been reset
      setTimeout(() => {
        handleSendMessage("Hello! Please show me my top car recommendations based on my profile.");
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputMessage;
    
    if (!messageToSend.trim() || !sessionId || isLoading) {
      return;
    }

    // Add user message
    addMessage({
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    });

    setInputMessage('');
    setIsLoading(true);

    try {
      
      // Add a timeout wrapper
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );
      
      const result = await Promise.race([
        sendChatMessage(sessionId, messageToSend, budget || undefined),
        timeoutPromise
      ]) as any;
      
      // Add AI response
      addMessage({
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      });

      // Update recommendations if provided
      if (result.recommended_cars && result.recommended_cars.length > 0) {
        
        // Check if recommendations actually changed
        const oldTopCarId = recommendedCars[0]?.id;
        const newTopCarId = result.recommended_cars[0]?.id;
        const recommendationsChanged = oldTopCarId !== newTopCarId;
        
        setRecommendedCars(result.recommended_cars);
        
        // Increment version to trigger re-animation
        if (recommendationsChanged) {
          setRecommendationVersion(prev => prev + 1);
        }
        
        // Show success notification for first recommendations
        if (recommendedCars.length === 0) {
          await Swal.fire({
            title: '🚗 Perfect Matches Found!',
            text: 'Check out your personalized recommendations on the right',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            customClass: {
              popup: 'rounded-xl'
            }
          });
        } 
        // Show notification when recommendations actually change
        else if (recommendationsChanged) {
          await Swal.fire({
            title: '🔄 Recommendations Updated!',
            text: `New top match: ${result.recommended_cars[0].basic_info.make} ${result.recommended_cars[0].basic_info.model}`,
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            customClass: {
              popup: 'rounded-xl'
            }
          });
        }
      }
    } catch (error: any) {
      
      const errorMsg = "I apologize, but I'm having trouble connecting. Please ensure the backend server is running.";
      
      addMessage({
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date(),
      });
      
      // Show error alert with SweetAlert2
      await Swal.fire({
        title: '❌ Connection Failed',
        html: `
          <p style="color: #4B5563; margin-bottom: 8px;">
            Could not connect to the backend server.
          </p>
          <p style="color: #6B7280; font-size: 14px;">
            Make sure Flask is running on port 5000.<br/>
            ${error.message ? `<br/><code style="background: #F3F4F6; padding: 4px 8px; border-radius: 4px;">${error.message}</code>` : ''}
          </p>
        `,
        icon: 'error',
        confirmButtonText: 'Okay',
        confirmButtonColor: '#EF4444',
        customClass: {
          popup: 'rounded-xl'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!sessionId || !lifestyleProfile) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go Home"
              >
                <Home className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">CarConvo AI Assistant</h1>
            </div>
            <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const result = await Swal.fire({
                  title: '🔄 Update Your Preferences?',
                  html: `
                    <p style="color: #4B5563; margin-bottom: 8px;">
                      You'll retake the personality test to get fresh recommendations.
                    </p>
                    <p style="color: #6B7280; font-size: 14px;">
                      ✅ Your chat history will be preserved<br/>
                      🔄 New car matches will be generated
                    </p>
                  `,
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Yes, Update Preferences',
                  cancelButtonText: 'Cancel',
                  confirmButtonColor: '#3B82F6',
                  cancelButtonColor: '#6B7280',
                  customClass: {
                    popup: 'rounded-xl',
                    confirmButton: 'rounded-lg px-6 py-2',
                    cancelButton: 'rounded-lg px-6 py-2'
                  }
                });
                
                if (result.isConfirmed) {
                  // Only clear recommendations, not chat messages
                  setRecommendedCars([]);
                  
                  Swal.fire({
                    title: 'Redirecting...',
                    text: 'Taking you to the personality test',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                      popup: 'rounded-xl'
                    }
                  });
                  
                  setTimeout(() => {
                    router.push('/personality-test');
                  }, 1500);
                }
              }}
              className="text-sm px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold transition-colors"
              title="Retake Personality Test"
            >
              Change Preferences
            </button>
              <ProfileSummary profile={lifestyleProfile} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Messages */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6 overflow-y-auto mb-4 max-h-[500px]">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">
                      {message.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < message.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs opacity-70 mt-2 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about features, compare cars, or request more details..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 disabled:bg-gray-100"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • Ask about specific features, compare cars, or request cost estimates
            </p>
          </div>
        </div>

        {/* Recommendations Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              Your Top Matches
            </h2>
            {recommendedCars.length > 0 ? (
              <div className="space-y-4">
                {recommendedCars.map((car, index) => (
                  <motion.div 
                    key={`${car.id}-v${recommendationVersion}`}
                    className="relative"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {/* Rank Badge */}
                    <div className="absolute -left-2 -top-2 z-10 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      #{index + 1}
                    </div>
                    <CarCard 
                      car={car} 
                      compact 
                      onSelect={() => {
                        const make = car.basic_info.make;
                        const model = car.basic_info.model;
                        const price = car.basic_info.msrp.toLocaleString();
                        handleSendMessage(`Tell me more about the ${make} ${model}. Why did you recommend this specific car for me? Is the $${price} price point good value?`);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                <CarIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-700">
                  Your personalized matches will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
