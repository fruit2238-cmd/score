import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { ScoreAnalyticsView } from './components/ScoreAnalyticsView';
import { StudyTimeEfficiencyView } from './components/StudyTimeEfficiencyView';
import { GoalSimulationView } from './components/GoalSimulationView';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { WeaknessDiagnosisView } from './components/WeaknessDiagnosisView';
import { HabitSurveyView } from './components/HabitSurveyView';
import { ParentNotificationView } from './components/ParentNotificationView';
import { AICounselorChat } from './components/AICounselorChat';
import { NewStudentModal } from './components/NewStudentModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SAMPLE_STUDENTS } from './data/sampleStudents';
import {
  StudentProfile,
  SubjectScore,
  SimulationGoal,
  WeeklyStudyPlan,
  WeaknessAlert,
  HabitSurveyResult,
  ParentReport,
} from './types';
import { initAuth, googleSignIn, logout } from './services/firebase';
import { exportStudentToGoogleSheets } from './services/googleSheets';
import { requestGeminiCounsel } from './services/api';
import { Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Load students from localStorage or fallback to SAMPLE_STUDENTS
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem('educoach_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load students from localStorage:', e);
    }
    return SAMPLE_STUDENTS;
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>(
    students[0]?.id || SAMPLE_STUDENTS[0].id
  );
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Firebase Auth & Workspace Tokens
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Modals & Drawers
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [isSheetsConfirmOpen, setIsSheetsConfirmOpen] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);

  // AI Counseling result state
  const [aiCounselingText, setAiCounselingText] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Save students to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('educoach_students', JSON.stringify(students));
    } catch (e) {
      console.warn('Failed to save students to localStorage:', e);
    }
  }, [students]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err: any) {
      console.error('Google Sign In Failed:', err);
      alert('Google 로그인에 실패했습니다. 팝업 차단 여부를 확인해 주세요.');
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  const currentStudent =
    students.find((s) => s.id === currentStudentId) || students[0] || SAMPLE_STUDENTS[0];

  const updateCurrentStudent = (updater: (prev: StudentProfile) => StudentProfile) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === currentStudent.id ? updater(s) : s))
    );
  };

  const handleUpdateScores = (newScores: SubjectScore[]) => {
    updateCurrentStudent((st) => ({
      ...st,
      scores: newScores,
      lastUpdated: new Date().toLocaleDateString('ko-KR'),
    }));
  };

  const handleSaveSimulationGoals = (newGoals: SimulationGoal[]) => {
    updateCurrentStudent((st) => ({
      ...st,
      simulationGoals: newGoals,
      lastUpdated: new Date().toLocaleDateString('ko-KR'),
    }));
  };

  const handleUpdateWeeklyPlan = (newPlan: WeeklyStudyPlan) => {
    updateCurrentStudent((st) => ({
      ...st,
      weeklyPlan: newPlan,
      lastUpdated: new Date().toLocaleDateString('ko-KR'),
    }));
  };

  const handleUpdateAlerts = (newAlerts: WeaknessAlert[]) => {
    updateCurrentStudent((st) => ({
      ...st,
      weaknessAlerts: newAlerts,
    }));
  };

  const handleSaveSurveyResult = (result: HabitSurveyResult) => {
    updateCurrentStudent((st) => ({
      ...st,
      surveyResult: result,
      lastUpdated: new Date().toLocaleDateString('ko-KR'),
    }));
  };

  const handleUpdateParentReport = (newReport: ParentReport) => {
    updateCurrentStudent((st) => ({
      ...st,
      parentReport: newReport,
      lastUpdated: new Date().toLocaleDateString('ko-KR'),
    }));
  };

  const handleAddStudent = (newStudent: StudentProfile) => {
    setStudents((prev) => [newStudent, ...prev]);
    setCurrentStudentId(newStudent.id);
  };

  // Run comprehensive Gemini AI counsel
  const handleRunAICounsel = async () => {
    setIsLoadingAI(true);
    try {
      const counselResult = await requestGeminiCounsel(currentStudent);
      setAiCounselingText(counselResult);
    } catch (err: any) {
      console.error('AI Counseling Error:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Top header quick Google Sheets export
  const handleConfirmTopSheetsExport = async () => {
    setIsSheetsConfirmOpen(false);
    if (!accessToken) {
      handleSignIn();
      return;
    }

    setIsExportingSheets(true);
    try {
      const res = await exportStudentToGoogleSheets(accessToken, currentStudent);
      confetti({ particleCount: 70, spread: 70 });
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: any) {
      alert(`Google Sheets 내보내기 실패: ${err.message}`);
    } finally {
      setIsExportingSheets(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-600 selection:text-white pb-16">
      {/* Header */}
      <Header
        students={students}
        currentStudent={currentStudent}
        onSelectStudent={(st) => {
          setCurrentStudentId(st.id);
          setAiCounselingText('');
        }}
        onOpenNewStudentModal={() => setIsNewStudentModalOpen(true)}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onExportSheetsClick={() => setIsSheetsConfirmOpen(true)}
        onOpenAICoach={() => setIsAIChatOpen(true)}
        isExportingSheets={isExportingSheets}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {activeTab === 'analytics' && (
          <ScoreAnalyticsView
            student={currentStudent}
            onUpdateScores={handleUpdateScores}
            onRunAICounsel={handleRunAICounsel}
            aiCounselingText={aiCounselingText}
            isLoadingAI={isLoadingAI}
          />
        )}

        {activeTab === 'efficiency' && (
          <StudyTimeEfficiencyView student={currentStudent} />
        )}

        {activeTab === 'simulation' && (
          <GoalSimulationView
            student={currentStudent}
            onSaveSimulationGoals={handleSaveSimulationGoals}
          />
        )}

        {activeTab === 'schedule' && (
          <WeeklyScheduleView
            student={currentStudent}
            onUpdateWeeklyPlan={handleUpdateWeeklyPlan}
            onExportSheetsClick={() => setIsSheetsConfirmOpen(true)}
          />
        )}

        {activeTab === 'weakness' && (
          <WeaknessDiagnosisView
            student={currentStudent}
            onUpdateAlerts={handleUpdateAlerts}
          />
        )}

        {activeTab === 'survey' && (
          <HabitSurveyView
            student={currentStudent}
            onSaveSurveyResult={handleSaveSurveyResult}
          />
        )}

        {activeTab === 'parent' && (
          <ParentNotificationView
            student={currentStudent}
            accessToken={accessToken}
            onOpenSignIn={handleSignIn}
            onUpdateParentReport={handleUpdateParentReport}
          />
        )}
      </main>

      {/* Floating 1:1 AI Study Coach Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border border-white/20"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1" />
          </div>
          <span>AI 성적 코칭 상담실</span>
        </button>
      </div>

      {/* 1:1 Live AI Coach Chat Drawer */}
      <AICounselorChat
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        student={currentStudent}
      />

      {/* New Student Registration Modal */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={() => setIsNewStudentModalOpen(false)}
        onAddStudent={handleAddStudent}
      />

      {/* Workspace Confirmation Modal for Quick Top Export (MANDATORY per Workspace Skill) */}
      <ConfirmationModal
        isOpen={isSheetsConfirmOpen}
        title="Google Sheets로 학생 성적 및 시간표 내보내기"
        description={`${currentStudent.name} 학생의 과목별 성적표, 주당 학습시간 분석, 목표 시뮬레이션, 7일 맞춤 학습 계획표를 Google Sheets 문서로 생성하고 사용자의 Google Drive에 저장하시겠습니까?`}
        confirmText="Google Sheets 생성"
        cancelText="취소"
        affectedItems={[
          `대상 학생: ${currentStudent.name} (${currentStudent.gradeLevel})`,
          `생성 파일: [에듀코치 AI 성적상담] ${currentStudent.name} 학생 성적 및 학습전략 보고서`,
          '포함 시트: 1.과목별성적_및_학습시간, 2.목표성적_시뮬레이션, 3.맞춤_주간학습계획, 4.학습습관_및_학부모상담',
        ]}
        onConfirm={handleConfirmTopSheetsExport}
        onCancel={() => setIsSheetsConfirmOpen(false)}
      />
    </div>
  );
}
