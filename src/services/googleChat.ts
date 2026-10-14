import { ChatSpace, ParentReport, StudentProfile } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

export interface ChatSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isConfigurationNeeded?: boolean;
  configUrl?: string;
}

// Fetch list of accessible Google Chat spaces
export const listChatSpaces = async (accessToken: string): Promise<ChatSpace[]> => {
  try {
    const res = await fetch('https://chat.googleapis.com/v1/spaces', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status === 404 || errorData.error?.message?.includes('Google Chat app not found')) {
        throw new Error(
          'Google Chat 앱 구성이 필요합니다. Google Cloud 콘솔에서 Chat API 앱 정보를 구성하거나 웹훅 URL을 사용해 주세요.'
        );
      }
      throw new Error(errorData.error?.message || `스페이스 목록 조회 실패 (${res.status})`);
    }

    const data = await res.json();
    return (data.spaces || []).map((s: any) => ({
      name: s.name,
      displayName: s.displayName || s.name.replace('spaces/', '스페이스 '),
      type: s.type,
    }));
  } catch (err: any) {
    console.error('List Chat Spaces Error:', err);
    throw err;
  }
};

// Build formatted message for Google Chat card
export const buildParentChatCard = (student: StudentProfile, report: ParentReport) => {
  const avgEfficiency = Math.round(
    student.scores.reduce((acc, s) => acc + s.efficiencyScore, 0) / (student.scores.length || 1)
  );

  const topScores = student.scores.map(
    (s) => `• ${s.name}: ${s.currentScore}점 (${s.grade}등급) / 주당 ${s.weeklyStudyHours}h / 효율 ${s.efficiencyScore}점`
  ).join('\n');

  const goals = student.simulationGoals
    .slice(0, 3)
    .map(
      (g) => `• ${g.subjectName}: 중간 ${g.targetMidtermScore}점 / 기말 ${g.targetFinalScore}점 (목표 ${g.targetGrade}등급, 달성률 ${g.successProbability}%)`
    )
    .join('\n');

  const textBody = `🎓 [에듀코치 AI] ${student.name} 학생 성적 상담 및 맞춤 학습전략 리포트

안녕하세요, ${student.name} 학생 학부모님!
에듀코치 AI 학습 코칭 센터에서 분석한 학생의 과목별 성적 및 학습시간 효율 분석 결과입니다.

━━━━━━━━━━━━━━━━━━━━━
📊 [과목별 성적 및 학습시간 현황]
${topScores}
- 전체 평균 학습 효율 지수: ${avgEfficiency}점 / 100점

🎯 [이번 학기 목표 성적 시뮬레이션]
- 목표 시험: ${student.targetExam} (D-${student.dDay})
${goals}

🧠 [학습 습관 & 비효율 진단]
${report.habitAnalysis}

📋 [가정 내 학부모 지원 권장사항]
${report.parentSupportAdvice}

💌 [선생님 및 AI 코치 한마디]
"${report.customMessage || report.overallSummary}"
━━━━━━━━━━━━━━━━━━━━━
※ 본 리포트는 Google Sheets에 상세 시트로도 함께 동기화되어 실시간 확인 가능합니다.`;

  return {
    text: textBody,
    cardsV2: [
      {
        cardId: `counseling-${student.id}-${Date.now()}`,
        card: {
          header: {
            title: `에듀코치 AI | ${student.name} 학생 성적 상담 리포트`,
            subtitle: `${student.gradeLevel} (${student.track}) • ${report.consultationDate}`,
            imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135755.png',
            imageType: 'CIRCLE',
          },
          sections: [
            {
              header: '📊 과목별 성적 & 학습효율',
              widgets: [
                {
                  textParagraph: {
                    text: `<b>과목 현황 요약</b><br>${topScores.replace(/\n/g, '<br>')}`,
                  },
                },
              ],
            },
            {
              header: '🎯 목표 시뮬레이션 & 주간 플랜',
              widgets: [
                {
                  textParagraph: {
                    text: `<b>${student.targetExam} (D-${student.dDay})</b><br>${goals.replace(/\n/g, '<br>')}`,
                  },
                },
              ],
            },
            {
              header: '💡 학부모 지도 가이드 & 총평',
              widgets: [
                {
                  textParagraph: {
                    text: `${report.overallSummary}<br><br><b>[가정 지도 팁]</b> ${report.parentSupportAdvice}`,
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  };
};

// Send message to Google Chat Space using User OAuth access token
export const sendMessageToChatSpace = async (
  accessToken: string,
  spaceName: string,
  student: StudentProfile,
  report: ParentReport
): Promise<ChatSendResult> => {
  const payload = buildParentChatCard(student, report);
  const projectId = firebaseConfig.projectId;
  const configUrl = `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${projectId}`;

  try {
    const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errMsg = errorData.error?.message || '';

      if (res.status === 404 || errMsg.includes('Google Chat app not found')) {
        return {
          success: false,
          isConfigurationNeeded: true,
          configUrl,
          error:
            'Google Chat 앱 구성이 아직 완료되지 않았습니다. Google Cloud Console에서 Chat API 구성을 활성화하거나, 개인 계정인 경우 웹훅 또는 알림 복사 기능을 사용해 주세요.',
        };
      }

      return {
        success: false,
        error: errMsg || `Google Chat 전송 실패 (상태코드: ${res.status})`,
      };
    }

    const resData = await res.json();
    return {
      success: true,
      messageId: resData.name,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '네트워크 오류로 Google Chat 전송에 실패했습니다.',
    };
  }
};

// Send message via Webhook URL (for quick testing with any Chat Space webhook)
export const sendMessageViaWebhook = async (
  webhookUrl: string,
  student: StudentProfile,
  report: ParentReport
): Promise<ChatSendResult> => {
  const payload = buildParentChatCard(student, report);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        error: `웹훅 전송 실패 (${res.status}): ${errText}`,
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '웹훅 전송 중 오류가 발생했습니다.',
    };
  }
};
