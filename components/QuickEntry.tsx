import React, { useState, useRef } from 'react';
import { Mic, Send, X, Tag, Check } from 'lucide-react';
import { NoteType, Intensity } from '../types';
import { PREDEFINED_TAGS, CONTEXTS, NOTE_TYPE_CONFIG } from '../constants';
import { Button } from './Button';
import { analyzeNote } from '../services/geminiService';

interface QuickEntryProps {
  onSave: (noteData: any) => void;
  onCancel: () => void;
}

export const QuickEntry: React.FC<QuickEntryProps> = ({ onSave, onCancel }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState<NoteType>(NoteType.OBSERVATION);
  const [intensity, setIntensity] = useState<Intensity>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [context, setContext] = useState(CONTEXTS[0]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      
      recognition.onresult = (event: any) => {
        const transcriptRaw = event.results[0][0].transcript;
        
        // Normalize text: lowercase, remove accents, remove punctuation
        const normalize = (str: string) => 
          str.toLowerCase()
             .normalize("NFD")
             .replace(/[\u0300-\u036f]/g, "")
             .replace(/[.,;:!?]/g, "")
             .trim();
             
        const normalizedTranscript = normalize(transcriptRaw);

        // Check for tag commands (e.g., "tag sono", "adicionar tag alimentação")
        const matchedTag = PREDEFINED_TAGS.find(tag => {
          const nTag = normalize(tag);
          // Regex matches "tag [name]", "adicionar tag [name]", "add tag [name]", "colocar tag [name]"
          const regex = new RegExp(`^(?:adicionar |add |colocar |inserir )?tag ${nTag}$`, 'i');
          return regex.test(normalizedTranscript);
        });

        if (matchedTag) {
          setSelectedTags(prev => {
            if (prev.includes(matchedTag)) {
              setVoiceFeedback(`Tag "${matchedTag}" já adicionada`);
              setTimeout(() => setVoiceFeedback(null), 2000);
              return prev;
            }
            setVoiceFeedback(`Tag "${matchedTag}" adicionada!`);
            setTimeout(() => setVoiceFeedback(null), 2000);
            return [...prev, matchedTag];
          });
        } else {
          setText((prev) => {
            const separator = prev ? ' ' : '';
            // Simple capitalization if starting new sentence
            let content = transcriptRaw;
            if (!prev) {
               content = content.charAt(0).toUpperCase() + content.slice(1);
            }
            return prev + separator + content;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      alert("Reconhecimento de voz não suportado neste navegador.");
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    
    // Call Gemini to get immediate analysis
    const analysis = await analyzeNote(text, type, intensity);

    const newNote = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      text,
      type,
      intensity: type === NoteType.EPISODE ? intensity : undefined,
      tags: [...selectedTags, ...(analysis?.tags || [])],
      context,
      aiAnalysis: analysis ? {
        summary: analysis.summary,
        suggestion: analysis.suggestion,
        patternDetected: analysis.patternDetected
      } : undefined
    };

    onSave(newNote);
    setIsProcessing(false);
  };

  const CurrentIcon = NOTE_TYPE_CONFIG[type].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        
        {/* Voice Feedback Toast */}
        {voiceFeedback && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-green-400" />
            {voiceFeedback}
          </div>
        )}

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <CurrentIcon className="w-5 h-5 text-brand-600" />
            Nova Nota
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-4 overflow-y-auto space-y-5">
          
          {/* Type Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.values(NoteType) as NoteType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`text-xs font-medium py-2 px-1 rounded-lg border transition-all ${
                  type === t 
                    ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <div className="relative">
            <textarea
              className="w-full p-4 pr-12 text-slate-800 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-brand-500 resize-none text-lg min-h-[120px]"
              placeholder="O que aconteceu? (Ex: Barulho alto, chorou...)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
            <button 
              onClick={toggleListening}
              className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 shadow-sm border'
              }`}
              title={isListening ? "Parar gravação" : "Gravar voz ou dizer 'tag [nome]'"}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Intensity Slider (Only for Episodes) */}
          {type === NoteType.EPISODE && (
            <div className="space-y-2 bg-red-50 p-3 rounded-xl border border-red-100">
              <div className="flex justify-between text-xs font-medium text-red-800">
                <span>Intensidade</span>
                <span>{intensity}/5</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={intensity} 
                onChange={(e) => setIntensity(Number(e.target.value) as Intensity)}
                className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-[10px] text-red-400">
                <span>Leve</span>
                <span>Crise</span>
              </div>
            </div>
          )}

          {/* Context & Tags */}
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CONTEXTS.map(c => (
                <button
                  key={c}
                  onClick={() => setContext(c)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${
                    context === c ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2 py-1 rounded-md text-xs border transition-colors flex items-center gap-1 ${
                    selectedTags.includes(tag)
                      ? 'bg-brand-100 text-brand-800 border-brand-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {selectedTags.includes(tag) && <Tag className="w-3 h-3" />}
                  #{tag}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-white">
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            size="lg"
            disabled={!text.trim() || isProcessing}
            icon={isProcessing ? undefined : <Send className="w-4 h-4" />}
          >
            {isProcessing ? 'Analisando...' : 'Registrar Agora'}
          </Button>
        </div>
      </div>
    </div>
  );
};
