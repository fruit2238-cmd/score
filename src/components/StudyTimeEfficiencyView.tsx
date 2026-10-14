import React, { useState } from 'react';
import {
  Clock,
  Zap,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { StudentProfile, SubjectScore } from '../types';
import { requestSubjectStrategy } from '../services/api';

interface StudyTimeEfficiencyViewProps {
  student: StudentProfile;
}

export const StudyTimeEfficiencyView: React.FC<StudyTimeEfficiencyViewProps> = ({ student }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectScore>(student.scores[0]);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [strategyResult, setStrategyResult] = useState<string>('');
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);

  const handleOpenStrategy = async (subject: SubjectScore) => {
    setSelectedSubject(subject);
    setStrategyModalOpen(true);
    setIsLoadingStrategy(true);
    try {
      const result = await requestSubjectStrategy({
        subject: subject.name,
        currentScore: subject.currentScore,
        weeklyHours: subject.weeklyStudyHours,
        efficiencyScore: subject.efficiencyScore,
        weakPoints: subject.weakPoints,
        keyIssue: subject.keyIssue,
      });
      setStrategyResult(result);
    } catch (e: any) {
      setStrategyResult('공부 전략을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingStrategy(false);
    }
  };

  // Find the most inefficient subject (lowest efficiencyScore)
  const sortedByEfficiency = [...student.scores].sort(
    (a, b) => a.efficiencyScore - b.efficiencyScore
  );
  const worstEfficiencySubject = sortedByEfficiency[0];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Urgent Inefficiency Highlight Card */}
      {worstEfficiencySubject && worstEfficiencySubject.efficiencyScore < 50 && (
        <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border-l-4 border-red-500 bg-white p-6 rounded-2xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 긴급 비효율 학습 감지
                </span>
                <span className="text-xs font-bold text-slate-800">
                  [{worstEfficiencySubject.name}] 효율 지수 {worstEfficiencySubject.efficiencyScore}점 (경고)
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {student.name} 학생은 <strong>{worstEfficiencySubject.name}</strong>에 주당{' '}
                <span className="text-red-600 font-extrabold">
                  {worstEfficiencySubject.weeklyStudyHours}시간
                </span>
                (전체의{' '}
                {Math.round(
                  (worstEfficiencySubject.weeklyStudyHours /
                    (student.scores.reduce((a, s) => a + s.weeklyStudyHours, 0) || 1)) *
                    100
                )}
                %)을 쏟고 있으나 점수는 {worstEfficiencySubject.currentScore}점({worstEfficiencySubject.grade}등급)에 정체되어 있습니다.
              </p>
              <p className="text-xs text-slate-500">
                원인: {worstEfficiencySubject.keyIssue}
              </p>
            </div>

            <button
              onClick={() => handleOpenStrategy(worstEfficiencySubject)}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{worstEfficiencySubject.name} 긴급 처방전 보기</span>
            </button>
          </div>
        </div>
      )}

      {/* 4-Quadrant Visual Matrix: Study Time (X) vs Score (Y) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">과목별 학습시간 vs 성적 사분면 매트릭스</h3>
            <p className="text-xs text-slate-500">
              투자한 시간 대비 성과(ROI)를 한눈에 파악하여 비효율적인 과목을 즉시 선별합니다.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> 고효율 우수
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-3 h-3 rounded-full bg-red-500" /> 비효율 정체 (개선필요)
            </span>
          </div>
        </div>

        {/* Quadrant Canvas */}
        <div className="relative w-full h-80 bg-slate-50/60 rounded-2xl border border-slate-200 overflow-hidden p-6">
          {/* Axis Labels */}
          <div className="absolute top-3 left-4 text-[11px] font-bold text-slate-400">
            ▲ 성적 (100점)
          </div>
          <div className="absolute bottom-3 right-4 text-[11px] font-bold text-slate-400">
            학습 시간 (주당 시간) ▶
          </div>

          {/* Center Dividing Lines */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed border-slate-300" />
          <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-slate-300" />

          {/* Quadrant Background Badges */}
          <div className="absolute top-4 left-6 text-xs font-bold text-blue-600/60 bg-blue-50/80 px-2 py-1 rounded-md">
            2사분면: 고효율 잠재력형 (적은 시간, 높은 성취)
          </div>
          <div className="absolute top-4 right-6 text-xs font-bold text-emerald-600/60 bg-emerald-50/80 px-2 py-1 rounded-md">
            1사분면: 성실 모범형 (많은 시간, 높은 성취)
          </div>
          <div className="absolute bottom-4 left-6 text-xs font-bold text-slate-500/60 bg-slate-100/80 px-2 py-1 rounded-md">
            3사분면: 투자 부족형 (학습량 확대 필요)
          </div>
          <div className="absolute bottom-4 right-6 text-xs font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
            ⚠️ 4사분면: 비효율 정체형 (긴급 학습법 전환 필요!)
          </div>

          {/* Subject Scatter Nodes */}
          {student.scores.map((s) => {
            // X: 0 ~ 25 hours mapped to 8% ~ 92%
            const posX = Math.min(Math.max((s.weeklyStudyHours / 25) * 84 + 8, 8), 92);
            // Y: 0 ~ 100 score mapped to bottom (92%) to top (8%)
            const posY = 100 - (s.currentScore / 100) * 84 - 8;

            const isInefficient = s.efficiencyScore < 50;

            return (
              <div
                key={s.id}
                onClick={() => handleOpenStrategy(s)}
                style={{ left: `${posX}%`, top: `${posY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all transform group-hover:scale-110 ${
                    isInefficient
                      ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse'
                      : s.efficiencyScore >= 80
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <span>{s.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-90">({s.currentScore}점/{s.weeklyStudyHours}h)</span>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-30 pointer-events-none">
                  <div className="font-bold text-blue-300 mb-1">{s.name}</div>
                  <div>효율 점수: {s.efficiencyScore}점</div>
                  <div>순자습 {s.selfStudyHours}h / 강의 {s.lectureHours}h</div>
                  <div className="text-slate-300 mt-1">{s.keyIssue}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject by Subject Inefficiency Diagnosis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {student.scores.map((s) => {
          const efficiencyColor =
            s.efficiencyScore < 50
              ? 'border-red-200 bg-red-50/20'
              : s.efficiencyScore < 75
              ? 'border-amber-200 bg-amber-50/20'
              : 'border-emerald-200 bg-emerald-50/20';

          const badgeColor =
            s.efficiencyScore < 50
              ? 'bg-red-100 text-red-700'
              : s.efficiencyScore < 75
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700';

          return (
            <div
              key={s.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${efficiencyColor}`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                      {s.grade}등급
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold ${badgeColor}`}>
                    효율 {s.efficiencyScore}점
                  </span>
                </div>

                {/* Score & Hours Row */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">현재 점수</span>
                    <span className="text-sm font-extrabold text-slate-900">{s.currentScore}점</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">주당 공부</span>
                    <span className="text-sm font-extrabold text-blue-600">{s.weeklyStudyHours}h</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">순자습 비율</span>
                    <span className="text-sm font-extrabold text-emerald-600">
                      {Math.round((s.selfStudyHours / (s.weeklyStudyHours || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Hours Breakdown Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>자습 {s.selfStudyHours}h</span>
                    <span>인강/학원 {s.lectureHours}h</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-600 h-full"
                      style={{
                        width: `${(s.selfStudyHours / (s.weeklyStudyHours || 1)) * 100}%`,
                      }}
                      title="순수 자습"
                    />
                    <div
                      className="bg-indigo-300 h-full"
                      style={{
                        width: `${(s.lectureHours / (s.weeklyStudyHours || 1)) * 100}%`,
                      }}
                      title="인강/학원"
                    />
                  </div>
                </div>

                {/* Key Issue & Diagnosis */}
                <div className="text-xs text-slate-700 space-y-1 mb-4">
                  <div className="font-semibold text-slate-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>진단 내용:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-200/50">
                    {s.keyIssue}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenStrategy(s)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200/60"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI 맞춤 공부 전략 보기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Strategy Detail Modal */}
      {strategyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    [{selectedSubject.name}] 1~2등급 도약 맞춤 공부 전략
                  </h3>
                  <p className="text-xs text-slate-500">
                    현재 {selectedSubject.currentScore}점 ({selectedSubject.grade}등급) ➔ 목표 1등급 솔루션
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStrategyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">
              {isLoadingStrategy ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Sparkles className="w-6 h-6 text-blue-500 animate-spin" />
                  <span>Gemini AI가 과목별 초밀착 맞춤 전략을 연산 중입니다...</span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-200/70 font-sans">
                  {strategyResult}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setStrategyModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
