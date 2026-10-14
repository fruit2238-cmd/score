import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BarChart,
  Brain,
  ShieldCheck,
  Smartphone,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, HabitSurveyResult } from '../types';
import { HABIT_QUESTIONS, calculateSurveyResult } from '../data/habitSurveyQuestions';

interface HabitSurveyViewProps {
  student: StudentProfile;
  onSaveSurveyResult: (result: HabitSurveyResult) => void;
}

export const HabitSurveyView: React.FC<HabitSurveyViewProps> = ({
  student,
  onSaveSurveyResult,
}) => {
  const [isSurveyActive, setIsSurveyActive] = useState<boolean>(!student.surveyResult);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const handleSelectOption = (questionId: number, score: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < HABIT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finished all questions
      const finalResult = calculateSurveyResult(selectedAnswers);
      onSaveSurveyResult(finalResult);
      setIsSurveyActive(false);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleRestartSurvey = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsSurveyActive(true);
  };

  const currentQ = HABIT_QUESTIONS[currentQuestionIndex];
  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / HABIT_QUESTIONS.length) * 100
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              학생 학습 습관 및 메타인지 정밀 진단 설문
            </h3>
            <p className="text-xs text-slate-500">
              집중도, 스마트폰 사용 통제력, 계획 수립, 복습 주기, 오답 분석 태도 등 8대 핵심 학습 습관을 진단합니다.
            </p>
          </div>
        </div>

        {!isSurveyActive && student.surveyResult && (
          <button
            onClick={handleRestartSurvey}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors self-start md:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>설문 다시 검사하기</span>
          </button>
        )}
      </div>

      {/* Survey In-Progress Card */}
      {isSurveyActive ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>
                문항 {currentQuestionIndex + 1} / {HABIT_QUESTIONS.length}
              </span>
              <span className="text-purple-600">{progressPercent}% 완료</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
              카테고리: {currentQ.category.toUpperCase()}
            </span>
            <h4 className="text-lg font-extrabold text-slate-900 mt-3 leading-snug">
              Q{currentQ.id}. {currentQ.question}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.score;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(currentQ.id, opt.score)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/80 border-purple-500 text-purple-900 ring-2 ring-purple-200 shadow-xs'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="leading-relaxed">{opt.text}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ml-3 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
            >
              이전 문항
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQ.id]}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>
                {currentQuestionIndex === HABIT_QUESTIONS.length - 1
                  ? '진단 결과 제출'
                  : '다음 문항'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Diagnostic Results View */
        student.surveyResult && (
          <div className="space-y-6">
            {/* Archetype Main Card */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs font-bold uppercase tracking-wider">
                      학습 습관 진단 결과
                    </span>
                    <span className="text-xs text-purple-200">
                      진단일: {student.surveyResult.completedAt}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {student.surveyResult.archetype.title}
                  </h3>
                  <p className="text-sm font-semibold text-purple-200">
                    "{student.surveyResult.archetype.tagline}"
                  </p>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed pt-2">
                    {student.surveyResult.archetype.description}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center flex-shrink-0 min-w-[160px]">
                  <span className="text-xs font-semibold text-purple-200 block">종합 진단 레벨</span>
                  <span className="text-3xl font-black text-white mt-1 block">
                    {student.surveyResult.level}
                  </span>
                  <span className="text-[11px] text-slate-300 mt-1 block">
                    총점 {student.surveyResult.totalScore} / 40점
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Category Scores Bar Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">영역별 세부 습관 점수 분석</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    name: '집중 몰입도',
                    score: student.surveyResult.categoryScores.concentration,
                    icon: Brain,
                  },
                  {
                    name: '계획 실천력',
                    score: student.surveyResult.categoryScores.planning,
                    icon: ClipboardCheck,
                  },
                  {
                    name: '스마트폰 통제',
                    score: student.surveyResult.categoryScores.smartphoneControl,
                    icon: Smartphone,
                  },
                  {
                    name: '오답/복습 습관',
                    score: student.surveyResult.categoryScores.reviewHabit,
                    icon: BookOpen,
                  },
                  {
                    name: '시험 멘탈 관리',
                    score: student.surveyResult.categoryScores.stressControl,
                    icon: ShieldCheck,
                  },
                ].map((cat, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                      <cat.icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900">{cat.score}</span>
                      <span className="text-xs text-slate-400">/ 100점</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cat.score >= 70
                            ? 'bg-emerald-500'
                            : cat.score >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/80 space-y-3">
                <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>학생의 핵심 강점 (Strengths)</span>
                </h4>
                <ul className="text-xs text-emerald-950 space-y-2">
                  {student.surveyResult.archetype.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/80 space-y-3">
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>극복해야 할 주의점 (Areas for Growth)</span>
                </h4>
                <ul className="text-xs text-amber-950 space-y-2">
                  {student.surveyResult.archetype.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Custom 3-Step Action Prescription */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  {student.name} 학생을 위한 맞춤 습관 교정 처방전
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {student.surveyResult.archetype.actionGuide.map((action, aIdx) => (
                  <div
                    key={aIdx}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-1.5"
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                      {aIdx + 1}
                    </span>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed pt-1">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
