import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { StudentProfile, WeaknessAlert } from '../types';

interface WeaknessDiagnosisViewProps {
  student: StudentProfile;
  onUpdateAlerts: (alerts: WeaknessAlert[]) => void;
}

export const WeaknessDiagnosisView: React.FC<WeaknessDiagnosisViewProps> = ({
  student,
  onUpdateAlerts,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'danger' | 'warning' | 'info'>('all');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleComplete = (id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAlerts = student.weaknessAlerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPercent = Math.round(
    (completedCount / (student.weaknessAlerts.length || 1)) * 100
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100 text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                과목별 취약점 & 비효율 긴급 진단 알림 센터
              </h3>
              <p className="text-xs text-slate-500">
                모의고사 및 내신 시험에서 오답률이 급증하거나 학습시간 대비 효율이 저하된 단원을 실시간 감지합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              filterSeverity === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            전체 ({student.weaknessAlerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('danger')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              filterSeverity === 'danger'
                ? 'bg-red-500 text-white shadow-xs'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            위험 (
            {student.weaknessAlerts.filter((a) => a.severity === 'danger').length}
            )
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              filterSeverity === 'warning'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-600 hover:bg-amber-50'
            }`}
          >
            경고 (
            {student.weaknessAlerts.filter((a) => a.severity === 'warning').length}
            )
          </button>
        </div>
      </div>

      {/* Weakness Progress Tracker */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              시험 D-{student.dDay} 취약점 극복 완료율
            </span>
          </div>
          <span className="text-sm font-black text-emerald-400">
            {completedCount} / {student.weaknessAlerts.length}건 해결 ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isDone = completedItems[alert.id];

          const borderStyle =
            alert.severity === 'danger'
              ? 'border-red-200 hover:border-red-400 bg-red-50/20'
              : alert.severity === 'warning'
              ? 'border-amber-200 hover:border-amber-400 bg-amber-50/20'
              : 'border-blue-200 hover:border-blue-400 bg-blue-50/20';

          const icon =
            alert.severity === 'danger' ? (
              <AlertOctagon className="w-5 h-5 text-red-600" />
            ) : alert.severity === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : (
              <Info className="w-5 h-5 text-blue-600" />
            );

          return (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${borderStyle} ${
                isDone ? 'opacity-60 bg-slate-50' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      alert.severity === 'danger'
                        ? 'bg-red-100'
                        : alert.severity === 'warning'
                        ? 'bg-amber-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    {icon}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 text-white font-black">
                        {alert.subject}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{alert.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        감지일: {alert.detectedDate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {alert.description}
                    </p>

                    {/* Urgent Action Prescription */}
                    <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-blue-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>긴급 처방 (3일 이내 실천):</span>
                      </div>
                      <p className="text-slate-800 font-semibold">{alert.urgentAction}</p>
                    </div>
                  </div>
                </div>

                {/* Complete Button */}
                <button
                  onClick={() => toggleComplete(alert.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-end sm:self-start flex-shrink-0 cursor-pointer ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isDone ? '보완 완료됨' : '보완 체크'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
