import React, { useState } from 'react';
import { X, UserPlus, GraduationCap, Check } from 'lucide-react';
import { StudentProfile, SubjectScore } from '../types';

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: StudentProfile) => void;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('고등학교 2학년');
  const [track, setTrack] = useState<StudentProfile['track']>('인문계열');
  const [targetGoal, setTargetGoal] = useState('주요 상위 10개 대학 / 내신 2.0등급 목표');
  const [targetExam, setTargetExam] = useState('2026학년도 2학기 중간고사');
  const [dDay, setDDay] = useState(28);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const defaultScores: SubjectScore[] = [
      {
        id: `sub-${Date.now()}-1`,
        name: '국어',
        currentScore: 78,
        previousScore: 75,
        midtermScore: 76,
        finalScore: 78,
        mockScore: 80,
        grade: 3,
        percentile: 77,
        classRank: 7,
        totalClassStudents: 28,
        classAverage: 67,
        weeklyStudyHours: 7,
        selfStudyHours: 4,
        lectureHours: 3,
        efficiencyScore: 75,
        weakPoints: ['독서 비문학 과학 지문'],
        keyIssue: '독해 시간 안배 부족',
      },
      {
        id: `sub-${Date.now()}-2`,
        name: '수학',
        currentScore: 65,
        previousScore: 68,
        midtermScore: 62,
        finalScore: 65,
        mockScore: 64,
        grade: 4,
        percentile: 60,
        classRank: 12,
        totalClassStudents: 28,
        classAverage: 63,
        weeklyStudyHours: 18,
        selfStudyHours: 10,
        lectureHours: 8,
        efficiencyScore: 42,
        weakPoints: ['수열의 귀납적 정의', '삼각함수 공식'],
        keyIssue: '시간 투자 대비 오답 복습 미흡',
      },
      {
        id: `sub-${Date.now()}-3`,
        name: '영어',
        currentScore: 85,
        previousScore: 82,
        midtermScore: 84,
        finalScore: 85,
        mockScore: 88,
        grade: 2,
        percentile: 88,
        classRank: 4,
        totalClassStudents: 28,
        classAverage: 65,
        weeklyStudyHours: 8,
        selfStudyHours: 5,
        lectureHours: 3,
        efficiencyScore: 85,
        weakPoints: ['빈칸추론 34번'],
        keyIssue: '안정적 성적 유지 중',
      },
      {
        id: `sub-${Date.now()}-4`,
        name: '탐구1',
        currentScore: 72,
        previousScore: 70,
        midtermScore: 70,
        finalScore: 72,
        mockScore: 75,
        grade: 3,
        percentile: 71,
        classRank: 8,
        totalClassStudents: 28,
        classAverage: 64,
        weeklyStudyHours: 5,
        selfStudyHours: 3,
        lectureHours: 2,
        efficiencyScore: 70,
        weakPoints: ['핵심 단원 기출'],
        keyIssue: '개념 완성 후 기출 회독 필요',
      },
    ];

    const newStudent: StudentProfile = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      gradeLevel,
      track,
      targetUniversityOrGoal: targetGoal,
      targetExam,
      dDay: Number(dDay) || 30,
      scores: defaultScores,
      simulationGoals: defaultScores.map((s) => ({
        subjectId: s.id,
        subjectName: s.name,
        currentScore: s.currentScore,
        targetMidtermScore: Math.min(s.currentScore + 8, 100),
        targetFinalScore: Math.min(s.currentScore + 12, 100),
        targetGrade: Math.max(s.grade - 1, 1),
        recommendedWeeklyHours: Math.round(s.weeklyStudyHours * 1.1),
        hoursIncreaseNeeded: 1,
        successProbability: 80,
        difficultyLevel: '도전',
        strategyAdvice: '기초 개념 복습 및 오답 분석 3회독',
      })),
      weaknessAlerts: [
        {
          id: `alt-${Date.now()}`,
          severity: 'warning',
          subject: '수학',
          title: '학습시간 대비 효율성 점검 필요',
          description: '수학 투자 시간에 비해 성적 정체 위험이 있으니 오답 복습을 강화하세요.',
          inefficiencyType: '시간과다_정체',
          urgentAction: '새 문제집 풀기 중단 후 틀린 문제 3회독 복습',
          detectedDate: new Date().toLocaleDateString('ko-KR'),
        },
      ],
      lastUpdated: new Date().toLocaleDateString('ko-KR'),
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">새 학생 프로필 등록</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">학생 이름 *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 박서연"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">학년</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
              >
                <option value="중학교 3학년">중학교 3학년</option>
                <option value="고등학교 1학년">고등학교 1학년</option>
                <option value="고등학교 2학년">고등학교 2학년</option>
                <option value="고등학교 3학년 (N수)">고등학교 3학년 (N수)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">계열</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
              >
                <option value="공통">공통</option>
                <option value="인문계열">인문계열</option>
                <option value="자연계열">자연계열</option>
                <option value="예체능계열">예체능계열</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">목표 대학 또는 목표</label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="예: 연세대 언론홍보영상학부 / 내신 1.8등급"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">대비 시험</label>
              <input
                type="text"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">시험 D-Day</label>
              <input
                type="number"
                min="1"
                max="365"
                value={dDay}
                onChange={(e) => setDDay(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>학생 등록 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
