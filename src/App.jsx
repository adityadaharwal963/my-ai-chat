import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Sparkles ,
  MessageCircleDashedIcon
} from 'lucide-react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";


export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "नमस्कार! मी आपला AI सहाय्यक आहे. महाराष्ट्र शासनाच्या विधिमंडळ अधिवेशन, दूरध्वनी सेवा व व्यवस्थेसंबंधी कोणतीही माहिती तुम्ही मला विचारू शकता.", sender: 'ai', timestamp: new Date().toISOString() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Generate a unique session ID once on mount to track this specific conversation
  const sessionId = useRef(`chat_${Math.random().toString(36).slice(2)}_${Date.now()}`);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Capture the text immediately before clearing input
    const userMessageText = inputText;

    const newUserMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_API_KEY_HERE' // Uncomment if you need auth
        },
        body: JSON.stringify({ 
          query: userMessageText,
          user_id: sessionId.current // Sending the unique session ID
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // 2. ADJUST this to match your backend's response structure
      // Example: if your backend returns { "reply": "Hello" }, use data.reply
      const aiResponseText = data.answer || data.message || data.text || "I received the message but got no text back.";

      const newAiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      // console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the server. Please try again.\nमाफ करा, सर्व्हरशी जोडणी करण्यात अडचण येत आहे. कृपया पुन्हा प्रयत्न करा.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <MessageCircleDashedIcon size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              🇮🇳 Vidhan Bhavan Directory 2025 Assistant | महाराष्ट्र शासन विधिमंडळ अधिवेशन २०२५ दूरध्वनी व व्यवस्थेसंबंधी माहिती
            </h1>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Empty State / Welcome (Only if messages are empty, though we init with one) */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-20">
              <Bot size={64} className="mb-4 opacity-20" />
              <p>Start a conversation...</p>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} group animate-in slide-in-from-bottom-2 duration-300`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-slate-200 text-slate-600' 
                  : 'bg-indigo-600 text-white'
              }`}>
                {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`px-4 py-3 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-white text-slate-800 border border-slate-100 rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code({ inline, className, children }) {
                        const language = className?.replace("language-", "");
                        const code = children.join("");
                        return !inline ? (
                          <pre className="overflow-x-auto">
                            <code
                              dangerouslySetInnerHTML={{
                                __html: language
                                  ? hljs.highlight(code, { language }).value
                                  : hljs.highlightAuto(code).value
                              }}
                            />
                          </pre>
                        ) : (
                          <code className="bg-slate-200 rounded px-1 py-[2px]">{code}</code>
                        );
                      },
                      table({ children }) {
                        return <table className="border border-slate-200">{children}</table>;
                      },
                      th({ children }) {
                        return <th className="border border-slate-200 px-2 py-1 bg-slate-100">{children}</th>;
                      },
                      td({ children }) {
                        return <td className="border border-slate-200 px-2 py-1">{children}</td>;
                      },
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatTime(msg.timestamp)}
                </span>
              </div>


            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 animate-in fade-in duration-300">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-slate-100 px-4 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSend}
            className="relative flex items-end gap-2 bg-slate-100 border border-slate-200 rounded-xl p-2 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all"
          >
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Message AI..."
              className="flex-1 max-h-32 min-h-[44px] py-2.5 px-2 bg-transparent border-none focus:ring-0 resize-none text-slate-800 placeholder:text-slate-400 text-sm sm:text-base"
              rows={1}
            />

            <button 
              type="submit" 
              disabled={!inputText.trim() || isTyping}
              className={`p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                inputText.trim() && !isTyping
                  ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send size={20} className={inputText.trim() && !isTyping ? 'ml-0.5' : ''} />
            </button>
          </form>
          <p className="text-center text-[10px] sm:text-xs text-slate-600 mt-2">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </footer>
    </div>
  );
}