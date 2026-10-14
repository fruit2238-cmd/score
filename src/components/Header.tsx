import React from 'react';
import {
  GraduationCap,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  MessageSquare,
  LogOut,
  UserCheck,
  ChevronDown,
  PlusCircle,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  students: StudentProfile[];
  currentStudent: StudentProfile;
  onSelectStudent: (student: StudentProfile) => void;
  onOpenNewStudentModal: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onExportSheetsClick: () => void;
  onOpenAICoach: () => void;
  isExportingSheets?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  students,
  currentStudent,
  onSelectStudent,
  onOpenNewStudentModal,
  user,
  onSignIn,
  onSignOut,
  activeTab,
  onChangeTab,
  onExportSheetsClick,
  onOpenAICoach,
  isExportingSheets,
}) => {
  const tabs = [
    { id: 'analytics', label: '📊 성적 분석 & 추이' },
    { id: 'efficiency', label: '⏱️ 학습시간 & 비효율 진단' },
    { id: 'simulation', label: '🎯 목표 성적 시뮬레이션' },
    { id: 'schedule', label: '📅 맞춤 학습 계획표' },
    { id: 'weakness', label: '⚠️ 취약점 긴급 진단' },
    { id: 'survey', label: '📝 학습 습관 진단' },
    { id: 'parent', label: '👨‍👩‍👧 학부모 상담 & 알림' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Student Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-slate-900">에듀코치 AI</h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">
                    EduCoach
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  스마트 학생 성적 상담 & 맞춤 학습 전략 솔루션
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* Student Switcher Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl cursor-pointer transition-colors border border-slate-200/60">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {currentStudent.name.slice(0, 1)}
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                    {currentStudent.name} ({currentStudent.gradeLevel.slice(0, 3)})
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-none">
                    {currentStudent.track}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 hidden group-hover:block hover:block z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  상담 학생 선택
                </div>
                {students.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => onSelectStudent(st)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50/70 transition-colors ${
                      st.id === currentStudent.id
                        ? 'text-blue-700 font-bold bg-blue-50/50'
                        : 'text-slate-700 font-medium'
                    }`}
                  >
                    <span>
                      {st.name} <span className="text-slate-400">({st.gradeLevel})</span>
                    </span>
                    {st.id === currentStudent.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={onOpenNewStudentModal}
                    className="w-full text-left px-3 py-2 text-xs text-blue-600 font-semibold hover:bg-blue-50 flex items-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    새 학생 프로필 등록
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Tools: D-Day, Workspace Auth, Sheets Quick Export, AI Advisor */}
          <div className="flex items-center gap-2.5">
            {/* D-Day Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentStudent.targetExam}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-[11px]">
                D-{currentStudent.dDay}
              </span>
            </div>

            {/* Quick Google Sheets Export */}
            <button
              onClick={onExportSheetsClick}
              disabled={isExportingSheets}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Google Sheets에 학생 성적 및 시간표 내보내기"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isExportingSheets ? '스프레드시트 동기화 중...' : 'Google Sheets 내보내기'}</span>
            </button>

            {/* AI Advisor Chatbot Trigger */}
            <button
              onClick={onOpenAICoach}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI 1:1 상담실</span>
              <span className="sm:hidden">AI 코치</span>
            </button>

            {/* Google Workspace Account Sign-in / User Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-7 h-7 rounded-full border border-slate-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs flex items-center justify-center font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="hidden xl:block text-left">
                  <span className="text-[11px] font-bold text-slate-700 block leading-tight">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-medium block leading-none">
                    Google Workspace 연동됨
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="gsi-material-button inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                title="Google Sheets & Google Chat 연동을 위해 로그인"
              >
                <div className="w-4 h-4 flex-shrink-0">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span className="font-semibold text-slate-800">Google 연동</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="border-t border-slate-200/80 bg-slate-50/70 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
