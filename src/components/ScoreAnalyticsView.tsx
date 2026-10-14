import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  Zap,
  Edit3,
  Plus,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { StudentProfile, SubjectScore } from '../types';

interface ScoreAnalyticsViewProps {
  student: StudentProfile;
  onUpdateScores: (newScores: SubjectScore[]) => void;
  onRunAICounsel: () => void;
  aiCounselingText: string;
  isLoadingAI: boolean;
}

export const ScoreAnalyticsView: React.FC<ScoreAnalyticsViewProps> = ({
  student,
  onUpdateScores,
  onRunAICounsel,
  aiCounselingText,
  isLoadingAI,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScores, setEditedScores] = useState<SubjectScore[]>(student.scores);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(student.scores[0]?.id || '');

  // Calculate aggregates
  const totalScoreSum = student.scores.reduce((acc, s) => acc + s.currentScore, 0);
  const avgScore = Math.round((totalScoreSum / (student.scores.length || 1)) * 10) / 10;
  const avgGrade =
    Math.round(
      (student.scores.reduce((acc, s) => acc + s.grade, 0) / (student.scores.length || 1)) * 10
    ) / 10;
  const totalWeeklyHours = student.scores.reduce((acc, s) => acc + s.weeklyStudyHours, 0);
  const avgEfficiency = Math.round(
    student.scores.reduce((acc, s) => acc + s.efficiencyScore, 0) / (student.scores.length || 1)
  );

  const handleScoreChange = (id: string, field: keyof SubjectScore, value: any) => {
    setEditedScores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveScores = () => {
    onUpdateScores(editedScores);
    setIsEditing(false);
  };

  const handleAddNewSubject = () => {
    const newSub: SubjectScore = {
      id: `sub-${Date.now()}`,
      name: '새 과목',
      currentScore: 70,
      previousScore: 68,
      midtermScore: 70,
      finalScore: 70,
      mockScore: 72,
      grade: 3,
      percentile: 70,
      classRank: 10,
      totalClassStudents: 30,
      classAverage: 65,
      weeklyStudyHours: 5,
      selfStudyHours: 3,
      lectureHours: 2,
      efficiencyScore: 70,
      weakPoints: ['기초 개념'],
      keyIssue: '기본기 정립 필요',
    };
    setEditedScores([...editedScores, newSub]);
  };

  const selectedSubject =
    student.scores.find((s) => s.id === selectedSubjectId) || student.scores[0];

  // Helper for Radar Chart SVG
  const radarRadius = 110;
  const centerX = 160;
  const centerY = 140;
  const numPoints = student.scores.length;

  const getCoordinates = (index: number, value: number, max: number = 100) => {
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const r = (value / max) * radarRadius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const studentPolygonPoints = student.scores
    .map((s, idx) => {
      const { x, y } = getCoordinates(idx, s.currentScore);
      return `${x},${y}`;
    })
    .join(' ');

  const classAvgPolygonPoints = student.scores
    .map((s, idx) => {
      const { x, y } = getCoordinates(idx, s.classAverage);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              전과목 평균 점수
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{avgScore}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100점</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
            <span>반 평균 대비 +{(avgScore - 67.5).toFixed(1)}점 우수</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              예상 종합 내신 등급
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">{avgGrade}</span>
            <span className="text-sm font-semibold text-slate-400">등급대</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>목표 대학 안정권 진입 사정권</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              주당 총 학습 투입시간
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalWeeklyHours}</span>
            <span className="text-sm font-semibold text-slate-400">시간 / 주</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
            <span>순수 자습 {student.scores.reduce((a, s) => a + s.selfStudyHours, 0)}h (약 60%)</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              종합 학습 효율 지수
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                avgEfficiency < 50
                  ? 'text-red-500'
                  : avgEfficiency < 75
                  ? 'text-amber-500'
                  : 'text-emerald-600'
              }`}
            >
              {avgEfficiency}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100점</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            {avgEfficiency < 60 ? (
              <span className="text-red-600 font-semibold">⚠️ 일부 과목 시간 낭비 진단됨</span>
            ) : (
              <span className="text-emerald-600 font-semibold">✓ 양호한 시간 투입 효율성</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts Row: Radar Chart + Exam Trend Line */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">과목별 성적 레이더 밸런스</h3>
              <p className="text-xs text-slate-500">학생 점수(파랑) vs 반 평균(회색 점선)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> 학생
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> 반평균
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <svg viewBox="0 0 320 280" className="w-full max-w-[340px] overflow-visible">
              {/* Background Concentric Circles */}
              {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                <circle
                  key={i}
                  cx={centerX}
                  cy={centerY}
                  r={radarRadius * scale}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              ))}

              {/* Axis lines */}
              {student.scores.map((_, idx) => {
                const { x, y } = getCoordinates(idx, 100);
                return (
                  <line
                    key={idx}
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Class Average Polygon */}
              <polygon
                points={classAvgPolygonPoints}
                fill="#94A3B8"
                fillOpacity="0.15"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Student Polygon */}
              <polygon
                points={studentPolygonPoints}
                fill="#3B82F6"
                fillOpacity="0.25"
                stroke="#2563EB"
                strokeWidth="2.5"
              />

              {/* Data points & Labels */}
              {student.scores.map((s, idx) => {
                const pt = getCoordinates(idx, s.currentScore);
                const labelCoord = getCoordinates(idx, 122);
                return (
                  <g key={s.id}>
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                    <text
                      x={labelCoord.x}
                      y={labelCoord.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[11px] font-bold fill-slate-700"
                    >
                      {s.name.split(' ')[0]} ({s.currentScore}점)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">
              💡 최강점 과목: <strong className="text-blue-600">{[...student.scores].sort((a,b)=>b.currentScore - a.currentScore)[0]?.name}</strong>
            </span>
            <span className="font-medium">
              집중 보완: <strong className="text-red-500">{[...student.scores].sort((a,b)=>a.currentScore - b.currentScore)[0]?.name}</strong>
            </span>
          </div>
        </div>

        {/* Multi-Exam Trend & Subject Drilldown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">과목별 시험 성적 추이 & 분석</h3>
              <p className="text-xs text-slate-500">1학기 중간 ➔ 1학기 기말 ➔ 최근 모의 ➔ 현재 점수</p>
            </div>
            {/* Subject Selector Pills */}
            <div className="flex flex-wrap gap-1.5">
              {student.scores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                    s.id === selectedSubject.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Trend Bar & Line visualizer */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 my-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-800">{selectedSubject.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                  {selectedSubject.grade}등급
                </span>
                <span className="text-xs text-slate-500">
                  반 석차 {selectedSubject.classRank}/{selectedSubject.totalClassStudents}등 (상위 {100 - selectedSubject.percentile}%)
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-600">
                주당 학습: <strong className="text-blue-600">{selectedSubject.weeklyStudyHours}시간</strong> (효율 {selectedSubject.efficiencyScore}점)
              </div>
            </div>

            {/* 4-Period Progression Bars */}
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: '1학기 중간', score: selectedSubject.midtermScore, color: 'bg-slate-400' },
                { label: '1학기 기말', score: selectedSubject.finalScore, color: 'bg-indigo-400' },
                { label: '최근 모의', score: selectedSubject.mockScore, color: 'bg-purple-500' },
                { label: '현재 점수', score: selectedSubject.currentScore, color: 'bg-blue-600' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-slate-500 mb-2">{item.label}</span>
                  <div className="w-full bg-slate-200 rounded-xl h-28 relative flex items-end justify-center p-1 overflow-hidden">
                    <div
                      className={`w-full rounded-lg ${item.color} transition-all duration-500 flex items-center justify-center text-white text-xs font-bold shadow-xs`}
                      style={{ height: `${item.score}%` }}
                    >
                      <span className="drop-shadow-xs">{item.score}</span>
                    </div>
                  </div>
                  <span className="mt-2 text-xs font-bold text-slate-700">{item.score}점</span>
                </div>
              ))}
            </div>

            {/* Subject Specific Diagnosis Highlight */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  <strong>주요 취약점:</strong> {selectedSubject.weakPoints.join(', ')}
                </span>
              </div>
              <div className="text-slate-500 italic">{selectedSubject.keyIssue}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>과목별 성적 변동 추이를 기반으로 AI가 취약점과 학습 비효율을 자동 진단합니다.</span>
          </div>
        </div>
      </div>

      {/* Editable Scores Table & Management */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">과목별 성적 및 학습시간 상세 관리표</h3>
            <p className="text-xs text-slate-500">
              실제 시험 성적, 등급, 백분위, 주당 학습시간을 직접 수정하고 추가할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleAddNewSubject}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> 과목 추가
                </button>
                <button
                  onClick={handleSaveScores}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 변경사항 저장
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditedScores(student.scores);
                  setIsEditing(true);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" /> 성적 데이터 편집
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">과목명</th>
                <th className="py-3 px-3">현재 점수</th>
                <th className="py-3 px-3">내신 등급</th>
                <th className="py-3 px-3">백분위</th>
                <th className="py-3 px-3">반 석차</th>
                <th className="py-3 px-3">반 평균</th>
                <th className="py-3 px-3">주당 학습시간</th>
                <th className="py-3 px-3">순자습 시간</th>
                <th className="py-3 px-3">학습 효율</th>
                <th className="py-3 px-4">취약 단원 및 진단</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(isEditing ? editedScores : student.scores).map((score) => (
                <tr key={score.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={score.name}
                        onChange={(e) => handleScoreChange(score.id, 'name', e.target.value)}
                        className="w-28 px-2 py-1 border border-slate-300 rounded-md text-xs font-semibold"
                      />
                    ) : (
                      score.name
                    )}
                  </td>

                  {/* Current Score */}
                  <td className="py-3 px-3">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score.currentScore}
                        onChange={(e) =>
                          handleScoreChange(score.id, 'currentScore', Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 border border-slate-300 rounded-md text-xs font-bold"
                      />
                    ) : (
                      <span className="font-extrabold text-blue-700">{score.currentScore}점</span>
                    )}
                  </td>

                  {/* Grade */}
                  <td className="py-3 px-3">
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        max="9"
                        value={score.grade}
                        onChange={(e) =>
                          handleScoreChange(score.id, 'grade', Number(e.target.value))
                        }
                        className="w-12 px-2 py-1 border border-slate-300 rounded-md text-xs font-bold"
                      />
                    ) : (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          score.grade <= 2
                            ? 'bg-emerald-100 text-emerald-800'
                            : score.grade <= 4
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {score.grade}등급
                      </span>
                    )}
                  </td>

                  {/* Percentile */}
                  <td className="py-3 px-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={score.percentile}
                        onChange={(e) =>
                          handleScoreChange(score.id, 'percentile', Number(e.target.value))
                        }
                        className="w-14 px-2 py-1 border border-slate-300 rounded-md text-xs"
                      />
                    ) : (
                      `${score.percentile}%`
                    )}
                  </td>

                  {/* Rank */}
                  <td className="py-3 px-3">
                    {score.classRank} / {score.totalClassStudents}등
                  </td>

                  {/* Average */}
                  <td className="py-3 px-3 text-slate-500">{score.classAverage}점</td>

                  {/* Study Hours */}
                  <td className="py-3 px-3 font-semibold">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.5"
                        value={score.weeklyStudyHours}
                        onChange={(e) =>
                          handleScoreChange(score.id, 'weeklyStudyHours', Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 border border-slate-300 rounded-md text-xs"
                      />
                    ) : (
                      `${score.weeklyStudyHours}시간`
                    )}
                  </td>

                  {/* Self Study */}
                  <td className="py-3 px-3 text-slate-600">{score.selfStudyHours}시간</td>

                  {/* Efficiency Score */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block font-extrabold ${
                        score.efficiencyScore < 50
                          ? 'text-red-500'
                          : score.efficiencyScore < 75
                          ? 'text-amber-500'
                          : 'text-emerald-600'
                      }`}
                    >
                      {score.efficiencyScore}점
                    </span>
                  </td>

                  {/* Weak Points & Key Issue */}
                  <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                    <span className="font-semibold text-slate-800">{score.weakPoints.join(', ')}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{score.keyIssue}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Comprehensive Counseling Callout Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI 입시·성적 전문 컨설턴트
              </span>
              <span className="text-xs text-blue-200">Gemini 3.8 Flash 엔진</span>
            </div>
            <h4 className="text-xl font-black tracking-tight text-white">
              {student.name} 학생만을 위한 AI 심층 성적 성장 진단서 생성
            </h4>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              과목별 성적, 주당 학습시간 비효율, 취약 단원 데이터를 종합 연산하여 1~2등급 도약을 위한
              핵심 처방과 주간 시간 재배분 가이드를 실시간 도출합니다.
            </p>
          </div>

          <button
            onClick={onRunAICounsel}
            disabled={isLoadingAI}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>{isLoadingAI ? 'AI 정밀 진단 분석 중...' : 'AI 맞춤 상담 리포트 생성'}</span>
          </button>
        </div>

        {/* AI Output Card if generated */}
        {aiCounselingText && (
          <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in-50">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 text-slate-100 text-xs leading-relaxed whitespace-pre-line font-mono">
              {aiCounselingText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
