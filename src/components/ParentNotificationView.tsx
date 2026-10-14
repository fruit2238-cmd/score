import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  FileSpreadsheet,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Users,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { ChatSpace, ParentReport, StudentProfile } from '../types';
import { listChatSpaces, sendMessageToChatSpace, sendMessageViaWebhook } from '../services/googleChat';
import { exportStudentToGoogleSheets } from '../services/googleSheets';
import { ConfirmationModal } from './ConfirmationModal';
import { requestParentReport } from '../services/api';
import confetti from 'canvas-confetti';

interface ParentNotificationViewProps {
  student: StudentProfile;
  accessToken: string | null;
  onOpenSignIn: () => void;
  onUpdateParentReport: (report: ParentReport) => void;
}

export const ParentNotificationView: React.FC<ParentNotificationViewProps> = ({
  student,
  accessToken,
  onOpenSignIn,
  onUpdateParentReport,
}) => {
  const [report, setReport] = useState<ParentReport>(() => {
    if (student.parentReport) return student.parentReport;
    return {
      studentName: student.name,
      gradeLevel: student.gradeLevel,
      consultationDate: new Date().toLocaleDateString('ko-KR'),
      counselorName: '에듀코치 AI 수석 학습 코치',
      overallSummary: `${student.name} 학생은 목표 달성을 위한 학업 의지와 책상 앞 끈기가 매우 훌륭합니다. 과목별 학습시간 대비 효율(ROI) 면에서 발견된 일부 비효율을 개선하기 위한 맞춤 플랜을 가동하였습니다.`,
      strengths: ['성실한 자습 시간 확보 능력', '언어 및 개념 이해 직관력 우수'],
      growthAreas: ['수학 해설지 의존도 낮추기', '인강 시청 위주에서 백지 복습으로 전환'],
      midtermFinalGoalSummary: `${student.targetExam} 목표: 주요 과목 평균 +8점 이상 상승 및 1~2등급 도약`,
      habitAnalysis: student.surveyResult?.archetype.tagline || '성실하나 오답 분석 및 복습 보완 필요',
      parentSupportAdvice: '가정에서는 문제 수보다 "오늘 스스로 원인을 찾은 오답이 무엇인지" 대화를 나누어주시고 충분한 수면(7시간 이상)을 격려해 주세요.',
      weeklyPlanSummary: `주간 ${student.weeklyPlan?.weeklyGoalHours || 40}시간 고효율 자습 계획표 연동됨`,
      customMessage: `${student.name} 학생의 잠재력을 믿고 끝까지 응원하겠습니다.`,
    };
  });

  const [counselorNote, setCounselorNote] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copied, setCopied] = useState(false);

  // Google Chat state
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [useWebhook, setUseWebhook] = useState<boolean>(false);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState<boolean>(false);
  const [chatStatusMessage, setChatStatusMessage] = useState<string | null>(null);
  const [chatErrorMessage, setChatErrorMessage] = useState<string | null>(null);
  const [chatConfigUrl, setChatConfigUrl] = useState<string | null>(null);

  // Google Sheets state
  const [sheetsResultUrl, setSheetsResultUrl] = useState<string | null>(null);
  const [isExportingSheets, setIsExportingSheets] = useState<boolean>(false);
  const [sheetsStatusMessage, setSheetsStatusMessage] = useState<string | null>(null);

  // Confirmation Modals
  const [chatConfirmOpen, setChatConfirmOpen] = useState(false);
  const [sheetsConfirmOpen, setSheetsConfirmOpen] = useState(false);

  // Fetch Chat Spaces when accessToken is available
  useEffect(() => {
    if (accessToken) {
      loadSpaces();
    }
  }, [accessToken]);

  const loadSpaces = async () => {
    if (!accessToken) return;
    setIsLoadingSpaces(true);
    setChatErrorMessage(null);
    try {
      const spaceList = await listChatSpaces(accessToken);
      setSpaces(spaceList);
      if (spaceList.length > 0) {
        setSelectedSpace(spaceList[0].name);
      }
    } catch (err: any) {
      console.warn('Failed to list spaces:', err);
      setChatErrorMessage(err.message || '스페이스 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const handleRegenerateReportAI = async () => {
    setIsGeneratingAI(true);
    try {
      const generatedText = await requestParentReport(student, counselorNote);
      const updated: ParentReport = {
        ...report,
        overallSummary: generatedText.slice(0, 300) + '...',
        customMessage: generatedText,
      };
      setReport(updated);
      onUpdateParentReport(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCopyClipboard = () => {
    const fullText = `[에듀코치 AI 학습 코칭 센터] ${student.name} 학생 성적 상담 및 맞춤 전략 리포트
    
학부모님 안녕하십니까. 에듀코치 AI 학습 상담 센터입니다.
${report.consultationDate} 기준 ${student.name} 학생의 과목별 성적 및 학습시간 효율 분석 결과와 맞춤형 지원 계획을 안내해 드립니다.

■ 1. 학생 강점
${report.strengths.map((s) => `• ${s}`).join('\n')}

■ 2. 이번 학기 보완 및 지도 중점
${report.growthAreas.map((g) => `• ${g}`).join('\n')}

■ 3. ${student.targetExam} 목표 시뮬레이션
${report.midtermFinalGoalSummary}

■ 4. 학습 습관 진단 결과
${report.habitAnalysis}

■ 5. 가정 내 학부모 권장 지도법
${report.parentSupportAdvice}

■ 6. 담당 코치 총평
"${report.customMessage || report.overallSummary}"

※ 상세 과목별 성적표 및 주간 타임테이블은 Google Sheets를 통해 확인하실 수 있습니다.`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Google Chat Send Handler (triggered after modal confirmation)
  const handleConfirmSendChat = async () => {
    setChatConfirmOpen(false);
    setChatStatusMessage('Google Chat으로 상담 알림을 전송 중입니다...');
    setChatErrorMessage(null);
    setChatConfigUrl(null);

    try {
      if (useWebhook) {
        if (!webhookUrl) {
          throw new Error('웹훅 URL을 입력해주세요.');
        }
        const res = await sendMessageViaWebhook(webhookUrl, student, report);
        if (res.success) {
          setChatStatusMessage('Google Chat 스페이스에 웹훅으로 상담 알림이 전송되었습니다!');
          confetti({ particleCount: 60, spread: 60 });
        } else {
          setChatErrorMessage(res.error || '웹훅 전송에 실패했습니다.');
          setChatStatusMessage(null);
        }
      } else {
        if (!accessToken) {
          throw new Error('Google 로그인이 필요합니다.');
        }
        if (!selectedSpace) {
          throw new Error('메시지를 전송할 Google Chat 스페이스를 선택해주세요.');
        }

        const res = await sendMessageToChatSpace(accessToken, selectedSpace, student, report);
        if (res.success) {
          setChatStatusMessage('Google Chat 스페이스로 알림 카드가 성공적으로 전송되었습니다!');
          confetti({ particleCount: 70, spread: 60 });
        } else {
          setChatErrorMessage(res.error || 'Google Chat 전송에 실패했습니다.');
          if (res.isConfigurationNeeded && res.configUrl) {
            setChatConfigUrl(res.configUrl);
          }
          setChatStatusMessage(null);
        }
      }
    } catch (err: any) {
      setChatErrorMessage(err.message || '전송 중 오류가 발생했습니다.');
      setChatStatusMessage(null);
    }
  };

  // Google Sheets Export Handler (triggered after modal confirmation)
  const handleConfirmExportSheets = async () => {
    setSheetsConfirmOpen(false);
    if (!accessToken) {
      onOpenSignIn();
      return;
    }

    setIsExportingSheets(true);
    setSheetsStatusMessage('Google Sheets 문서를 생성하고 데이터를 동기화하고 있습니다...');
    try {
      const result = await exportStudentToGoogleSheets(accessToken, student);
      setSheetsResultUrl(result.spreadsheetUrl);
      setSheetsStatusMessage('Google Sheets에 모든 성적, 시뮬레이션, 계획표가 성공적으로 저장되었습니다!');
      confetti({ particleCount: 80, spread: 70 });
    } catch (err: any) {
      console.error('Export Sheets Error:', err);
      alert(`Google Sheets 내보내기 실패: ${err.message}`);
      setSheetsStatusMessage(null);
    } finally {
      setIsExportingSheets(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              학부모 성적 상담 리포트 & Google Workspace 전송 센터
            </h3>
            <p className="text-xs text-slate-500">
              전문적이고 따뜻한 학부모 상담 안내문을 자동 생성하고, Google Chat과 Google Sheets로 원클릭 공유합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSheetsConfirmOpen(true)}
            className="px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Sheets 동기화</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout: Left (Editor & Settings) / Right (Message Preview & Dispatch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report Contents & Counselor Notes (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Counselor Note & AI Generation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI 학부모 리포트 정밀 생성기</span>
              </h4>
              <span className="text-xs text-slate-400">Gemini 3.8 Flash</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                상담 교사 특별 메모 (선택 입력)
              </label>
              <textarea
                value={counselorNote}
                onChange={(e) => setCounselorNote(e.target.value)}
                placeholder="예: 민준이가 수학 인강을 줄이고 오답 복습을 시작했습니다. 가정에서는 스마트폰 시간만 조금 격려해 주시면 좋겠습니다."
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleRegenerateReportAI}
              disabled={isGeneratingAI}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>{isGeneratingAI ? '리포트 생성 중...' : 'AI 학부모 상담문 맞춤 재생성'}</span>
            </button>
          </div>

          {/* Detailed Content Fields */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">상담 리포트 세부 항목 편집</h4>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                종합 소견 요약
              </label>
              <textarea
                value={report.overallSummary}
                onChange={(e) => setReport({ ...report, overallSummary: e.target.value })}
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                가정 내 지도 및 대화법 조언
              </label>
              <textarea
                value={report.parentSupportAdvice}
                onChange={(e) => setReport({ ...report, parentSupportAdvice: e.target.value })}
                rows={2}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                학부모님께 드리는 격려의 한마디
              </label>
              <input
                type="text"
                value={report.customMessage}
                onChange={(e) => setReport({ ...report, customMessage: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Mobile Preview & Google Chat Dispatch (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Mobile Preview Bubble */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                📱 문자 / 카카오톡 전송 미리보기
              </span>
              <button
                onClick={handleCopyClipboard}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사 완료!' : '텍스트 복사'}</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed font-sans max-h-72 overflow-y-auto space-y-3">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                [에듀코치 AI] {student.name} 학생 성적 상담 및 맞춤 전략 리포트
              </div>
              <p>
                학부모님 안녕하십니까. {report.consultationDate} 기준 {student.name} 학생의 과목별
                성적과 학습시간 효율 분석 결과를 공유해 드립니다.
              </p>
              <div>
                <strong>[주요 강점]</strong>
                <ul className="list-disc list-inside mt-0.5 text-slate-600">
                  {report.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>[이번 학기 목표 & 시뮬레이션]</strong>
                <p className="text-blue-700 font-semibold">{report.midtermFinalGoalSummary}</p>
              </div>
              <div>
                <strong>[가정 내 권장 지도법]</strong>
                <p className="text-slate-600">{report.parentSupportAdvice}</p>
              </div>
              <div className="italic text-slate-500 pt-1">
                "{report.customMessage || report.overallSummary}"
              </div>
            </div>
          </div>

          {/* Google Chat Space Dispatch Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  💬
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Google Chat으로 알림 전송</h4>
                  <span className="text-[11px] text-slate-400">구글 챗 상담 채널 및 스페이스 연동</span>
                </div>
              </div>

              {!accessToken && (
                <button
                  onClick={onOpenSignIn}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                >
                  Google 로그인 필요
                </button>
              )}
            </div>

            {/* Toggle: User Space vs Webhook */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setUseWebhook(false)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  !useWebhook
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Google Chat 스페이스 선택
              </button>
              <button
                onClick={() => setUseWebhook(true)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  useWebhook
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                웹훅 (Webhook URL) 전송
              </button>
            </div>

            {/* Space Dropdown / Webhook input */}
            {useWebhook ? (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Google Chat Space Webhook URL
                </label>
                <input
                  type="text"
                  placeholder="https://chat.googleapis.com/v1/spaces/.../messages?key=...&token=..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 block">
                  구글 챗 스페이스 설정 &gt; 앱 및 통합 &gt; 웹훅 추가에서 URL 복사
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600">
                    전송할 Chat 스페이스
                  </label>
                  {accessToken && (
                    <button
                      onClick={loadSpaces}
                      disabled={isLoadingSpaces}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
                      목록 새로고침
                    </button>
                  )}
                </div>

                {spaces.length > 0 ? (
                  <select
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
                  >
                    {spaces.map((sp) => (
                      <option key={sp.name} value={sp.name}>
                        {sp.displayName} ({sp.name})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="spaces/XXXXXXXX (스페이스 ID 직접 입력 또는 위 웹훅 탭 이용)"
                      value={selectedSpace}
                      onChange={(e) => setSelectedSpace(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Google Chat API 안내사항</span>
                      </div>
                      <p>
                        일반 개인(@gmail.com) 계정이거나 Google Cloud Console에서 Chat App 구성을 아직 하지 않은 경우,
                        상단의 <strong>"웹훅 전송"</strong> 탭을 이용하면 즉시 간편하게 전송할 수 있습니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status & Error Display */}
            {chatStatusMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{chatStatusMessage}</span>
              </div>
            )}

            {chatErrorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>전송 실패 안내</span>
                </div>
                <p className="text-[11px] leading-relaxed">{chatErrorMessage}</p>
                {chatConfigUrl && (
                  <a
                    href={chatConfigUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-bold underline hover:text-blue-800 mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Google Cloud 콘솔 Chat API 앱 구성 바로가기
                  </a>
                )}
              </div>
            )}

            {/* Dispatch Button (opens ConfirmationModal per Workspace guidelines) */}
            <button
              onClick={() => setChatConfirmOpen(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Google Chat으로 상담 카드 발송</span>
            </button>
          </div>

          {/* Google Sheets Synchronization Result Card */}
          {sheetsResultUrl && (
            <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                <div>
                  <h5 className="text-xs font-bold text-emerald-900">
                    Google Sheets 스프레드시트가 생성되었습니다!
                  </h5>
                  <p className="text-[11px] text-emerald-700">
                    성적 분석, 시뮬레이션, 주간 계획, 학부모 상담 4개 탭이 저장되었습니다.
                  </p>
                </div>
              </div>
              <a
                href={sheetsResultUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <span>시트 열기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Google Chat Sending (MANDATORY per Workspace Skill) */}
      <ConfirmationModal
        isOpen={chatConfirmOpen}
        title="Google Chat으로 학부모 상담 리포트 발송"
        description={`${student.name} 학생의 과목별 성적, 학습 효율 진단, 목표 시뮬레이션 및 가정 지도 가이드가 포함된 리포트 카드를 Google Chat 채널에 발송하시겠습니까?`}
        confirmText="전송 확정"
        cancelText="취소"
        affectedItems={[
          `수신 대상 채널: ${useWebhook ? '지정된 Webhook 스페이스' : selectedSpace || '선택된 스페이스'}`,
          `학생명: ${student.name} (${student.gradeLevel})`,
          `포함 내용: 전과목 성적 요약, D-${student.dDay} 목표 시뮬레이션, 학부모 상담 가이드`,
        ]}
        onConfirm={handleConfirmSendChat}
        onCancel={() => setChatConfirmOpen(false)}
      />

      {/* Confirmation Modal for Google Sheets Export (MANDATORY per Workspace Skill) */}
      <ConfirmationModal
        isOpen={sheetsConfirmOpen}
        title="Google Sheets로 학생 성적 및 계획표 내보내기"
        description={`${student.name} 학생의 성적 데이터, 과목별 학습시간, 목표 시뮬레이션, 7일 맞춤 학습 계획표를 사용자의 Google Drive에 새 스프레드시트로 생성 및 저장하시겠습니까?`}
        confirmText="스프레드시트 생성"
        cancelText="취소"
        affectedItems={[
          `스프레드시트 제목: [에듀코치 AI 성적상담] ${student.name} 학생 성적 및 학습전략 보고서`,
          '생성되는 탭: 과목별성적_및_학습시간, 목표성적_시뮬레이션, 맞춤_주간학습계획, 학습습관_및_학부모상담',
        ]}
        onConfirm={handleConfirmExportSheets}
        onCancel={() => setSheetsConfirmOpen(false)}
      />
    </div>
  );
};
