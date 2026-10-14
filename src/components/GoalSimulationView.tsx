import React, { useState } from 'react';
import {
  Target,
  Sliders,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Flame,
  Award,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SimulationGoal, StudentProfile } from '../types';

interface GoalSimulationViewProps {
  student: StudentProfile;
  onSaveSimulationGoals: (goals: SimulationGoal[]) => void;
}

export const GoalSimulationView: React.FC<GoalSimulationViewProps> = ({
  student,
  onSaveSimulationGoals,
}) => {
  // Initialize goals from student or generate defaults
  const [goals, setGoals] = useState<SimulationGoal[]>(() => {
    if (student.simulationGoals && student.simulationGoals.length > 0) {
      return student.simulationGoals;
    }
    return student.scores.map((s) => ({
      subjectId: s.id,
      subjectName: s.name,
      currentScore: s.currentScore,
      targetMidtermScore: Math.min(s.currentScore + 8, 100),
      targetFinalScore: Math.min(s.currentScore + 12, 100),
      targetGrade: Math.max(s.grade - 1, 1),
      recommendedWeeklyHours: Math.round(s.weeklyStudyHours * 1.15),
      hoursIncreaseNeeded: 1.5,
      successProbability: 80,
      difficultyLevel: '도전',
      strategyAdvice: `${s.weakPoints[0] || '기초 개념'} 집중 보완 및 오답 재풀이`,
    }));
  });

  const [activeScenario, setActiveScenario] = useState<'custom' | 'realistic' | 'leap' | 'breakthrough'>('custom');

  // Recalculate dependent metrics when slider moves
  const handleScoreChange = (
    subjectId: string,
    field: 'targetMidtermScore' | 'targetFinalScore',
    value: number
  ) => {
    setActiveScenario('custom');
    setGoals((prev) =>
      prev.map((g) => {
        if (g.subjectId !== subjectId) return g;

        const updated = { ...g, [field]: value };
        const scoreDiff = updated.targetMidtermScore - updated.currentScore;

        // Calculate Target Grade
        let targetGrade = 4;
        if (updated.targetMidtermScore >= 93) targetGrade = 1;
        else if (updated.targetMidtermScore >= 84) targetGrade = 2;
        else if (updated.targetMidtermScore >= 74) targetGrade = 3;
        else if (updated.targetMidtermScore >= 64) targetGrade = 4;
        else targetGrade = 5;

        // Calculate Success Probability & Difficulty
        let successProbability = 85;
        let difficultyLevel: SimulationGoal['difficultyLevel'] = '보통';

        if (scoreDiff <= 5) {
          successProbability = 90;
          difficultyLevel = '보통';
        } else if (scoreDiff <= 12) {
          successProbability = 78;
          difficultyLevel = '도전';
        } else if (scoreDiff <= 20) {
          successProbability = 65;
          difficultyLevel = '고난도';
        } else {
          successProbability = 52;
          difficultyLevel = '돌파형';
        }

        // Recommend Hours
        const originalScoreObj = student.scores.find((s) => s.id === subjectId);
        const baseHours = originalScoreObj?.weeklyStudyHours || 5;

        let hoursIncreaseNeeded = Math.round((scoreDiff / 4) * 10) / 10;
        if (originalScoreObj && originalScoreObj.efficiencyScore < 50) {
          // If already inefficient with too many hours (e.g. math 23h), don't just add hours, optimize quality!
          hoursIncreaseNeeded = -3;
        }

        const recommendedWeeklyHours = Math.max(baseHours + hoursIncreaseNeeded, 3);

        return {
          ...updated,
          targetGrade,
          successProbability,
          difficultyLevel,
          hoursIncreaseNeeded,
          recommendedWeeklyHours,
        };
      })
    );
  };

  // Scenario Presets
  const applyPreset = (preset: 'realistic' | 'leap' | 'breakthrough') => {
    setActiveScenario(preset);
    setGoals((prev) =>
      prev.map((g) => {
        let delta = 6;
        if (preset === 'realistic') delta = 7;
        if (preset === 'leap') delta = 14;
        if (preset === 'breakthrough') delta = g.currentScore < 70 ? 20 : 8;

        const targetMidterm = Math.min(g.currentScore + delta, 100);
        const targetFinal = Math.min(targetMidterm + 3, 100);

        let targetGrade = 1;
        if (targetMidterm < 74) targetGrade = 3;
        else if (targetMidterm < 84) targetGrade = 2;

        return {
          ...g,
          targetMidtermScore: targetMidterm,
          targetFinalScore: targetFinal,
          targetGrade,
          successProbability: preset === 'realistic' ? 88 : preset === 'leap' ? 76 : 68,
          difficultyLevel: preset === 'realistic' ? '보통' : preset === 'leap' ? '도전' : '돌파형',
          hoursIncreaseNeeded: preset === 'realistic' ? 1.0 : preset === 'leap' ? 2.5 : 3.0,
          recommendedWeeklyHours: Math.round((g.recommendedWeeklyHours || 6) * 1.1),
        };
      })
    );
  };

  const handleSaveAndConfetti = () => {
    onSaveSimulationGoals(goals);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Aggregate stats
  const totalTargetMidtermAvg = Math.round(
    (goals.reduce((acc, g) => acc + g.targetMidtermScore, 0) / (goals.length || 1)) * 10
  ) / 10;
  const currentAvg = Math.round(
    (student.scores.reduce((acc, s) => acc + s.currentScore, 0) / (student.scores.length || 1)) * 10
  ) / 10;
  const avgProbability = Math.round(
    goals.reduce((acc, g) => acc + g.successProbability, 0) / (goals.length || 1)
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header & Scenario Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                이번 학기 중간 & 기말고사 목표 성적 시뮬레이션
              </h3>
              <p className="text-xs text-slate-500">
                목표 점수 슬라이더를 조절하여 필요한 학습시간 증가량과 달성 확률을 실시간 시뮬레이션합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">
            원클릭 시나리오:
          </span>
          <button
            onClick={() => applyPreset('realistic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeScenario === 'realistic'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🌱 현실적 안정형 (+7점)
          </button>
          <button
            onClick={() => applyPreset('leap')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeScenario === 'leap'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🚀 1~2등급 도약형 (+14점)
          </button>
          <button
            onClick={() => applyPreset('breakthrough')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeScenario === 'breakthrough'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🔥 취약 과목 돌파형
          </button>
        </div>
      </div>

      {/* Aggregate Simulation Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-100 block">목표 중간고사 평균</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black">{totalTargetMidtermAvg}점</span>
              <span className="text-xs font-bold text-emerald-300">
                (+{(totalTargetMidtermAvg - currentAvg).toFixed(1)}점 상승)
              </span>
            </div>
            <span className="text-[11px] text-blue-200 mt-1 block">현재 평균 {currentAvg}점 대비</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
            <Award className="w-6 h-6 text-yellow-300" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">평균 시뮬레이션 달성 확률</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{avgProbability}%</span>
              <span className="text-xs font-bold text-blue-600">
                {avgProbability >= 80 ? '실현 가능성 높음' : '전략적 집중 필요'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              과목별 시간 효율 개선 시 15% 추가 상승
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">시험까지 남은 기간</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">D-{student.dDay}</span>
              <span className="text-xs font-bold text-amber-600">약 {Math.round(student.dDay / 7)}주 집중</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">{student.targetExam}</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Subject Sliders List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50">
          <h4 className="text-sm font-bold text-slate-800">과목별 실시간 목표 성적 시뮬레이터</h4>
          <span className="text-xs text-slate-500">슬라이더를 드래그하여 목표치를 설정하세요</span>
        </div>

        <div className="p-6 space-y-6">
          {goals.map((goal) => {
            const original = student.scores.find((s) => s.id === goal.subjectId);
            const midtermDelta = goal.targetMidtermScore - goal.currentScore;

            return (
              <div
                key={goal.subjectId}
                className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 hover:border-blue-300 transition-all space-y-4"
              >
                {/* Subject Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {goal.subjectName}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                      현재 {goal.currentScore}점 ({original?.grade || 3}등급)
                    </span>
                    <span className="text-xs font-extrabold text-blue-600">
                      ➔ 목표 {goal.targetGrade}등급 ({goal.targetMidtermScore}점)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        goal.difficultyLevel === '보통'
                          ? 'bg-emerald-100 text-emerald-800'
                          : goal.difficultyLevel === '도전'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      난이도: {goal.difficultyLevel}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      달성 확률 {goal.successProbability}%
                    </span>
                  </div>
                </div>

                {/* Sliders Grid: Midterm & Final */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Midterm Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">중간고사 목표 성적</span>
                      <span className="font-black text-blue-600 text-sm">
                        {goal.targetMidtermScore}점{' '}
                        <span className="text-xs font-semibold">
                          ({midtermDelta >= 0 ? `+${midtermDelta}` : midtermDelta}점)
                        </span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={Math.max(goal.currentScore - 10, 0)}
                      max="100"
                      value={goal.targetMidtermScore}
                      onChange={(e) =>
                        handleScoreChange(goal.subjectId, 'targetMidtermScore', Number(e.target.value))
                      }
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>현재 ({goal.currentScore}점)</span>
                      <span>100점 만점</span>
                    </div>
                  </div>

                  {/* Final Exam Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">기말고사 최종 목표 성적</span>
                      <span className="font-black text-indigo-600 text-sm">
                        {goal.targetFinalScore}점{' '}
                        <span className="text-xs font-semibold">
                          (+{goal.targetFinalScore - goal.currentScore}점)
                        </span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={Math.max(goal.targetMidtermScore, goal.currentScore)}
                      max="100"
                      value={goal.targetFinalScore}
                      onChange={(e) =>
                        handleScoreChange(goal.subjectId, 'targetFinalScore', Number(e.target.value))
                      }
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>중간 목표 ({goal.targetMidtermScore}점)</span>
                      <span>100점 만점</span>
                    </div>
                  </div>
                </div>

                {/* Simulation Guidance Banner */}
                <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>
                      권장 주당 학습시간: <strong>{goal.recommendedWeeklyHours}시간</strong>
                      {goal.hoursIncreaseNeeded > 0 ? (
                        <span className="text-amber-600 ml-1">
                          (주당 +{goal.hoursIncreaseNeeded}시간 추가 투입)
                        </span>
                      ) : goal.hoursIncreaseNeeded < 0 ? (
                        <span className="text-emerald-600 ml-1 font-semibold">
                          (오히려 {Math.abs(goal.hoursIncreaseNeeded)}시간 줄이고 질적 개선!)
                        </span>
                      ) : (
                        <span className="text-slate-500 ml-1">(현재 시간 유지)</span>
                      )}
                    </span>
                  </div>
                  <div className="text-slate-500 italic text-[11px]">
                    전략: {goal.strategyAdvice}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            설정된 시뮬레이션 목표치는 학습 계획표와 학부모 리포트에 자동 연동됩니다.
          </span>
          <button
            onClick={handleSaveAndConfetti}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>목표 시뮬레이션 확정 및 플래너 반영</span>
          </button>
        </div>
      </div>
    </div>
  );
};
