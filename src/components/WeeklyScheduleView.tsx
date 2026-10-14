import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  Bookmark,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';
import { StudentProfile, WeeklyStudyPlan, DailyScheduleBlock } from '../types';
import { requestAutoSchedule } from '../services/api';

interface WeeklyScheduleViewProps {
  student: StudentProfile;
  onUpdateWeeklyPlan: (plan: WeeklyStudyPlan) => void;
  onExportSheetsClick: () => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  student,
  onUpdateWeeklyPlan,
  onExportSheetsClick,
}) => {
  const plan = student.weeklyPlan;
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [targetHours, setTargetHours] = useState(40);
  const [prioritySubjects, setPrioritySubjects] = useState('수학, 국어 비문학');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const daysList: ('월' | '화' | '수' | '목' | '금' | '토' | '일')[] = [
    '월',
    '화',
    '수',
    '목',
    '금',
    '토',
    '일',
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAi(true);
    try {
      await requestAutoSchedule({
        studentName: student.name,
        targetExam: student.targetExam,
        dDay: student.dDay,
        availableHours: targetHours,
        weakSubjects: prioritySubjects,
      });

      // Update plan with refreshed structure tailored to hours
      const refreshedPlan: WeeklyStudyPlan = {
        title: `${student.name} 학생 고효율 맞춤 주간 플랜 (목표 ${targetHours}h)`,
        targetExam: student.targetExam,
        dDay: student.dDay,
        weeklyGoalHours: targetHours,
        weeklyMilestone: `${prioritySubjects} 취약 파트 오답 3회독 및 개념 백지 복습 완수`,
        strategySummary: `인강 시청 위주에서 벗어나 매일 3.5시간의 순공 몰입 블록을 확보하고 ${prioritySubjects}에 60% 이상 집중 배치`,
        days: daysList.map((day) => {
          const isWeekend = day === '토' || day === '일';
          const dailyHours = isWeekend ? 7.5 : Math.round((targetHours - 15) / 5 * 10) / 10;
          return {
            day,
            focusSubject:
              day === '월' || day === '목'
                ? '수학 I/II 개념 & 오답 3회독'
                : day === '화' || day === '금'
                ? '국어 독서 & 탐구 킬러'
                : day === '수'
                ? '영어 고난도 빈칸 & 서술형'
                : '전과목 실전 모의고사 & 백지 총정리',
            totalHours: dailyHours,
            blocks: [
              {
                time: isWeekend ? '09:30 - 12:00' : '18:00 - 19:30',
                subject: '수학',
                task: '기출 취약 단원 15제 자습 풀이 (해설지 없이)',
                type: 'problems',
                focusLevel: 'high',
              },
              {
                time: isWeekend ? '13:30 - 15:30' : '20:00 - 21:15',
                subject: '국어/영어',
                task: '독해 지문 문단별 논리 분석 및 단어 암기',
                type: 'concept',
                focusLevel: 'high',
              },
              {
                time: isWeekend ? '16:00 - 18:00' : '21:30 - 22:30',
                subject: '복습/오답',
                task: '당일 틀린 문제 백지에 스스로 설명하며 정리',
                type: 'review',
                focusLevel: 'medium',
              },
            ],
          };
        }),
      };

      onUpdateWeeklyPlan(refreshedPlan);
      setIsAiModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const currentDayData = plan?.days[selectedDayIndex] || plan?.days[0];

  const getTypeBadge = (type: DailyScheduleBlock['type']) => {
    switch (type) {
      case 'concept':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">개념 정리</span>;
      case 'problems':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">기출/문제풀이</span>;
      case 'review':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">오답 백지복습</span>;
      case 'mock_exam':
        return <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold">실전 모의고사</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Schedule Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {plan?.title || '성적 향상을 위한 맞춤형 주간 학습 시간표'}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold">
                  D-{plan?.dDay || student.dDay}일
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                주간 목표 순공 시간: <strong>{plan?.weeklyGoalHours || 42}시간</strong> • {plan?.strategySummary}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 학습 계획표 재편성</span>
          </button>

          <button
            onClick={onExportSheetsClick}
            className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheets 동기화</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>인쇄 / PDF</span>
          </button>
        </div>
      </div>

      {/* Weekly Milestone Banner */}
      <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-indigo-900">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>
            <strong>이번 주 핵심 마일스톤:</strong> {plan?.weeklyMilestone}
          </span>
        </div>
        <span className="hidden sm:inline font-semibold text-indigo-700">실천율 목표 85% 이상</span>
      </div>

      {/* 7-Days Tab Bar */}
      <div className="grid grid-cols-7 gap-2">
        {plan?.days.map((d, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={d.day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span className={`text-xs block font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {d.day}요일
              </span>
              <span className={`text-[10px] block mt-1 ${isSelected ? 'text-blue-100 font-bold' : 'text-slate-400'}`}>
                {d.totalHours}시간
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Schedule Detail Card */}
      {currentDayData && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900">
                  {currentDayData.day}요일 맞춤 학습 블록
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                  총 {currentDayData.totalHours}시간 계획
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                오늘의 집중 테마: <strong className="text-slate-800">{currentDayData.focusSubject}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> 몰입도 상 (High)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 몰입도 중 (Medium)
              </span>
            </div>
          </div>

          {/* Time Blocks List */}
          <div className="space-y-3">
            {currentDayData.blocks.map((block, bIdx) => (
              <div
                key={bIdx}
                className="bg-slate-50/70 hover:bg-blue-50/40 p-4 rounded-xl border border-slate-200/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-28 text-xs font-extrabold text-blue-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/70 text-center flex-shrink-0">
                    <Clock className="w-3 h-3 inline mr-1 text-blue-500" />
                    {block.time}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{block.subject}</span>
                      {getTypeBadge(block.type)}
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          block.focusLevel === 'high'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        집중도 {block.focusLevel.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{block.task}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
                    완료 체크
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Schedule Generation Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">AI 맞춤 학습 계획표 자동 편성</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  주간 목표 순공 시간 (시간/주)
                </label>
                <input
                  type="number"
                  min="20"
                  max="65"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  현재 기준 추천: 주당 35~45시간
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  우선 집중 보완 과목 및 영역
                </label>
                <input
                  type="text"
                  value={prioritySubjects}
                  onChange={(e) => setPrioritySubjects(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="예: 수학 수열/미분, 국어 비문학"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  비효율이 진단된 과목에 오답 복습 블록이 우선 배치됩니다.
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                취소
              </button>
              <button
                onClick={handleGenerateAI}
                disabled={isGeneratingAi}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingAi ? '계획표 최적화 중...' : '계획표 생성 및 적용'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
