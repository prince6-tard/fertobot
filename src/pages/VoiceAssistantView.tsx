import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SensorTelemetry } from '../types';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  Copy,
  Check,
  HelpCircle
} from 'lucide-react';

interface VoiceAssistantViewProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  telemetry: SensorTelemetry;
}

export const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({
  messages,
  setMessages,
  telemetry,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    'Meri fasal ki condition kya hai?',
    'Aaj paani dena hai kya?',
    'Kitna fertilizer daalna hai?',
    'What is current soil pH and NPK balance?',
    'Khet mein koi warning ya alert hai?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let reply = '';
      const q = prompt.toLowerCase();

      if (q.includes('fasal') || q.includes('condition') || q.includes('health')) {
        reply = `Aapki fasal (Wheat) ki sthiti acchi hai! 🌱 Soil Moisture is ${telemetry.soilMoisture.toFixed(1)}%, pH is ${telemetry.pH}, and Soil Temp is ${telemetry.temperature.toFixed(1)}°C. Farm health score 96% hai.`;
      } else if (q.includes('paani') || q.includes('water') || q.includes('irrigation')) {
        reply = `Sector 1 (Wheat) mein moisture 64% hai aur kal barish ke aasaar hain, isliye wahan paani rokna behtar hai. Sector 4 (Nursery) mein 10 min sprinkler chalane ki salah di jaati hai. 💧`;
      } else if (q.includes('fertilizer') || q.includes('khad') || q.includes('npk')) {
        reply = `Current soil test: Nitrogen=${telemetry.nitrogen} ppm, Phosphorus=${telemetry.phosphorus} ppm, Potassium=${telemetry.potassium} ppm. Tillering stage ke liye 35 kg/ha Urea ka spray kal shaam anukool rahega. 🌾`;
      } else if (q.includes('warning') || q.includes('alert')) {
        reply = `Koi critical warning nahi hai. Kal shaam ko हल्की boonda-baandi ho sakti hai (75% probability). 🛡️`;
      } else {
        reply = `Namaskar! FertoBot AI here. Current soil moisture is ${telemetry.soilMoisture.toFixed(1)}% and pH is ${telemetry.pH}. All 5 probes are responsive. How can I help with your field today? 🙏`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(reply);
    }, 400);
  };

  const handleToggleMic = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleSend('Meri fasal ki condition kya hai aur kab paani dena chahiye?');
      }, 2000);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="matte-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-xs font-medium mb-1.5">
            <Bot className="w-3.5 h-3.5" />
            <span>AI VOICE & TEXT AGRONOMIST</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Ask FertoBot Agronomist
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Multilingual agronomy assistant supporting spoken Hindi and English. Ask questions about irrigation, soil nutrients, or crop advisory.
          </p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="space-y-1.5">
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick Prompts:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-lg bg-[#121820] hover:bg-[#161F2A] border border-slate-800 text-xs text-slate-300 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Message History */}
      <div className="matte-card rounded-2xl p-5 min-h-[380px] max-h-[500px] overflow-y-auto space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  isUser ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-emerald-400'
                }`}
              >
                {isUser ? 'P' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-lg p-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-[#0D131A] border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-emerald-400 flex items-center gap-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Speak</span>
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-emerald-400"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="matte-card rounded-xl p-2 flex items-center gap-2">
        <button
          onClick={handleToggleMic}
          className={`p-2.5 rounded-lg transition-colors ${
            isListening ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Voice input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask in Hindi or English..."
          className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
