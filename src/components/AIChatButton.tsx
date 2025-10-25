import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Minus, Send, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { chatService, ChatMessage } from '../lib/chatService';

export default function AIChatButton() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your AI assistant. I can help you:\n\n• Create proposals and jobs\n• Check job status\n• Manage invoices and payments\n• Find customers\n• Answer questions\n\nWhat can I help with?",
        timestamp: Date.now(),
        quickReplies: [
          'Create new job',
          'Check overdue invoices',
          'List customers',
          'What can you do?'
        ],
        source: 'rule'
      };
      setMessages([welcomeMessage]);
      setQuickReplies(welcomeMessage.quickReplies || []);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setQuickReplies([]);
    setIsTyping(true);

    try {
      const response = await chatService.handleMessage(messageText);

      setMessages((prev) => [...prev, response]);

      if (response.quickReplies) {
        setQuickReplies(response.quickReplies);
      }

      if (response.actions) {
        // Actions are available but user needs to click them
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble right now. Please try again or use the navigation menu.",
        timestamp: Date.now(),
        quickReplies: ['Create new job', 'View jobs', 'View invoices'],
        source: 'rule'
      };
      setMessages((prev) => [...prev, errorMessage]);
      setQuickReplies(errorMessage.quickReplies || []);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = (type: string, value: string) => {
    if (type === 'navigate') {
      setIsOpen(false);
      navigate(value);
    } else if (type === 'function') {
      // Handle function calls
      console.log('Execute function:', value);
    } else if (type === 'external') {
      window.open(value, '_blank');
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleFeedback = (messageId: string, rating: 'positive' | 'negative') => {
    console.log('Feedback:', messageId, rating);
    // Track feedback analytics
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center group hover:scale-110 active:scale-95"
        aria-label="Open AI Chat Assistant"
      >
        <MessageSquare className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          AI
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl transition-all ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      } max-w-[calc(100vw-3rem)] flex flex-col`}
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white/20 rounded-full p-2 mr-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">AI Assistant</h3>
            <p className="text-xs text-blue-100 flex items-center">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                          AI
                        </div>
                        <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      </div>
                      {message.source === 'ai' && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleFeedback(message.id, 'positive')}
                            className="text-gray-400 hover:text-green-600 p-1 transition-colors"
                            aria-label="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, 'negative')}
                            className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                            aria-label="Not helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                  {message.role === 'user' && (
                    <p className="text-xs text-blue-100 mt-1 text-right">
                      {formatTime(message.timestamp)}
                    </p>
                  )}
                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                      {message.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAction(action.type, action.value)}
                          className="bg-blue-600 text-white hover:bg-blue-700 text-xs px-4 py-2 rounded-lg transition-colors font-semibold shadow-sm"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      AI
                    </div>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {quickReplies.length > 0 && (
            <div className="px-4 py-2 bg-white border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickReply(reply)}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs px-3 py-1.5 rounded-full transition-colors font-medium border border-blue-200"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask me anything..."
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                aria-label="Send message"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by AI • May make mistakes
            </p>
          </div>
        </>
      )}
    </div>
  );
}
