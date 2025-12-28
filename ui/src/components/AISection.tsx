
import React, { useState } from 'react';
import { Sparkles, Send, Bot } from 'lucide-react';
import ComponentCard from './ComponentCard';
import { GoogleGenerativeAI, type GenerateContentRequest } from '@google/generative-ai';

export const ClarityAssistantCard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const askGemini = async () => {
    if (!prompt.trim() || !apiKey) {
      setResponse(
        !apiKey
          ? 'Missing Gemini API key. Add VITE_GEMINI_API_KEY in your .env file.'
          : response,
      );
      return;
    }
    setIsThinking(true);
    try {
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const request = {
        systemInstruction: {
          role: 'system',
          parts: [
            {
              text:
                'You are a senior Clarity engineer. Provide concise, actionable explanations.',
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Explain this Clarity smart contract concept or code snippet: ${prompt}`,
              },
            ],
          },
        ],
      } satisfies GenerateContentRequest;

      const result = await model.generateContent(request);
      setResponse(result.response.text() || 'No response received.');
    } catch (error) {
      console.error(error);
      setResponse('Error connecting to Gemini API.');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <ComponentCard
      title="Clarity Assistant"
      description="Instant debugging and code explanation powered by Gemini for Stacks developers."
      category="AI"
    >
      <div className="space-y-4">
        <div className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste code or ask: How do I define a map?"
            className="w-full h-24 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 resize-none transition-all"
          />
          <button
            onClick={askGemini}
            disabled={isThinking || !prompt}
            className="absolute bottom-3 right-3 p-2 bg-zinc-100 rounded-lg text-black hover:bg-white disabled:opacity-20 transition-all shadow-xl"
          >
            {isThinking ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {response ? (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-[11px] leading-relaxed text-zinc-300 max-h-40 overflow-y-auto font-mono">
            <div className="flex items-center gap-2 text-zinc-500 mb-2 border-b border-zinc-800 pb-2">
              <Bot className="w-3.5 h-3.5" />
              <span className="font-bold uppercase tracking-widest text-[9px]">Assistant Response</span>
            </div>
            <div className="whitespace-pre-wrap">{response}</div>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 bg-zinc-900/30 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-zinc-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tip</p>
              <p className="text-[11px] text-zinc-500 leading-snug">
                Ask about "Post-Conditions" or "Principal types" for specialized Clarity help.
              </p>
            </div>
          </div>
        )}
      </div>
    </ComponentCard>
  );
};
