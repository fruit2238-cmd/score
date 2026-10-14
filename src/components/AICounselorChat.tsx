import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  User,
  Bot,
  Lightbulb,
  CornerDownLeft,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { sendCoachChatMessage } from '../services/api';

interface AICounselorChatProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export const AICounselorChat: React.FC<AICounselorChatProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `반가워요! ${student.name} 학생의 전담 AI 입시·학습 코치입니다. 🎓
현재 ${student.name} 학생의 과목별 성적, 주당 학습시간, 취약점 데이터를 모두 숙지하고 있습니다.
성적 향상 공부법, 시간 관리 비결, 슬럼프 대처법 등 무엇이든 편하게 물어보세요!`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const studentContext = {
        name: student.name,
        gradeLevel: student.gradeLevel,
        targetExam: student.targetExam,
        dDay: student.dDay,
        scores: student.scores.map((s) => ({
          name: s.name,
          score: s.currentScore,
          hours: s.weeklyStudyHours,
          efficiency: s.efficiencyScore,
          weakPoints: s.weakPoints,
        })),
      };

      const reply = await sendCoachChatMessage(text, history, studentContext);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '죄송합니다. 일시적인 연결 문제로 답변을 불러오지 못했습니다. 잠시 후 다시 질문해 주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    '수학 인강을 줄이면 자습 때 뭘 해야 하나요?',
    '시험 D-20일 전 과목별 복습 계획법',
    '책상에 앉으면 자꾸 딴짓하고 싶어요',
    '국어 비문학 시간 단축 노하우',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-4 h-4 text-indigo-200" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>AI 1:1 수험 코칭 상담실</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <span className="text-[10px] text-indigo-200 block">
              {student.name} 학생 맞춤 데이터 실시간 연동
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs font-medium'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs whitespace-pre-line'
              }`}
            >
              {m.content}
              <span
                className={`text-[9px] mt-1 block text-right ${
                  m.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400">
            <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span>AI 코치가 분석하여 답변을 작성하고 있습니다...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-2 border-t border-slate-100 bg-white">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-medium transition-colors border border-slate-200/60 flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="성적, 공부법, 시간 관리에 대해 질문하세요..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
