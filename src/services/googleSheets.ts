import { StudentProfile } from '../types';

export interface CreateSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export const exportStudentToGoogleSheets = async (
  accessToken: string,
  student: StudentProfile
): Promise<CreateSpreadsheetResult> => {
  const title = `[에듀코치 AI 성적상담] ${student.name} 학생 성적 및 학습전략 보고서 (${new Date().toLocaleDateString('ko-KR')})`;

  // 1. Create a new Spreadsheet with sheets/tabs
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: '1.과목별성적_및_학습시간' } },
        { properties: { title: '2.목표성적_시뮬레이션' } },
        { properties: { title: '3.맞춤_주간학습계획' } },
        { properties: { title: '4.학습습관_및_학부모상담' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `스프레드시트 생성 실패 (상태코드: ${createRes.status})`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Tab 1 Values: 과목별성적_및_학습시간
  const tab1Values = [
    ['[에듀코치 AI 학생 성적 및 학습시간 효율 분석표]'],
    [`학생명: ${student.name}`, `학년/계열: ${student.gradeLevel} (${student.track})`, `목표: ${student.targetUniversityOrGoal}`, `작성일: ${new Date().toLocaleDateString('ko-KR')}`],
    [],
    ['과목명', '현재 점수', '직전 점수', '1학기중간', '1학기기말', '최근모의고사', '등급', '백분위(%)', '반석차', '반평균', '주당학습(h)', '순자습(h)', '학습효율(100점)', '주요 취약점 및 비효율 원인'],
    ...student.scores.map((s) => [
      s.name,
      s.currentScore,
      s.previousScore,
      s.midtermScore,
      s.finalScore,
      s.mockScore,
      `${s.grade}등급`,
      `${s.percentile}%`,
      `${s.classRank}/${s.totalClassStudents}`,
      s.classAverage,
      `${s.weeklyStudyHours}시간`,
      `${s.selfStudyHours}시간`,
      `${s.efficiencyScore}점`,
      `${s.weakPoints.join(', ')} | ${s.keyIssue}`,
    ]),
  ];

  // 3. Prepare Tab 2 Values: 목표성적_시뮬레이션
  const tab2Values = [
    ['[이번 학기 중간/기말고사 목표 성적 시뮬레이션]'],
    [`목표 시험: ${student.targetExam}`, `시험 D-Day: D-${student.dDay}일`],
    [],
    ['과목명', '현재 점수', '중간고사 목표', '기말고사 목표', '목표 등급', '권장 주당 학습시간', '필요 추가 시간', '달성 확률', '난이도', '맞춤 달성 전략'],
    ...student.simulationGoals.map((g) => [
      g.subjectName,
      g.currentScore,
      g.targetMidtermScore,
      g.targetFinalScore,
      `${g.targetGrade}등급`,
      `${g.recommendedWeeklyHours}시간`,
      `+${g.hoursIncreaseNeeded}시간`,
      `${g.successProbability}%`,
      g.difficultyLevel,
      g.strategyAdvice,
    ]),
  ];

  // 4. Prepare Tab 3 Values: 맞춤_주간학습계획
  const tab3Values = [
    ['[성적 향상을 위한 맞춤형 주간 학습 시간표]'],
    [`플랜 제목: ${student.weeklyPlan?.title || '주간 고효율 학습 계획표'}`, `주간 목표 총 자습시간: ${student.weeklyPlan?.weeklyGoalHours || 35}시간`],
    [`이번 주 핵심 목표: ${student.weeklyPlan?.weeklyMilestone || '취약 과목 개념 복습 및 오답 분석'}`],
    [],
    ['요일', '집중 과목', '총 학습시간', '시간대', '세부 학습 과제', '학습 유형', '몰입도'],
  ];

  if (student.weeklyPlan?.days) {
    student.weeklyPlan.days.forEach((d) => {
      if (d.blocks && d.blocks.length > 0) {
        d.blocks.forEach((b, idx) => {
          tab3Values.push([
            idx === 0 ? `${d.day}요일` : '',
            idx === 0 ? d.focusSubject : '',
            idx === 0 ? `${d.totalHours}시간` : '',
            b.time,
            b.task,
            b.type === 'concept' ? '개념 정리' : b.type === 'problems' ? '기출/문제풀이' : b.type === 'review' ? '오답 복습' : '실전 모의',
            b.focusLevel === 'high' ? '집중도 상' : b.focusLevel === 'medium' ? '집중도 중' : '집중도 하',
          ]);
        });
      }
    });
  }

  // 5. Prepare Tab 4 Values: 학습습관_및_학부모상담
  const tab4Values = [
    ['[학습 습관 진단 결과 및 학부모 상담 요약]'],
    [`학생명: ${student.name}`, `진단일: ${student.surveyResult?.completedAt || new Date().toLocaleDateString('ko-KR')}`],
    [],
    ['[1. 학습 습관 진단 요약]'],
    ['진단 유형', student.surveyResult?.archetype.title || '성실 탐구형'],
    ['유형 슬로건', student.surveyResult?.archetype.tagline || '꾸준히 노력하나 학습 효율 개선 필요'],
    ['진단 총평', student.surveyResult?.archetype.description || ''],
    ['주요 강점', student.surveyResult?.archetype.strengths.join(', ') || ''],
    ['개선 필요점', student.surveyResult?.archetype.weaknesses.join(', ') || ''],
    [],
    ['[2. 과목별 취약점 긴급 진단 알림]'],
    ['과목', '경고 수준', '진단 내용', '비효율 원인', '긴급 해결책'],
    ...student.weaknessAlerts.map((w) => [
      w.subject,
      w.severity.toUpperCase(),
      w.title + ' - ' + w.description,
      w.inefficiencyType,
      w.urgentAction,
    ]),
    [],
    ['[3. 학부모 전달 상담 요약]'],
    ['종합 의견', student.parentReport?.overallSummary || ''],
    ['가정 내 지원 조언', student.parentReport?.parentSupportAdvice || ''],
    ['상담 담당', '에듀코치 AI 학습 코칭 연구센터'],
  ];

  // Batch update all values
  const batchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: "'1.과목별성적_및_학습시간'!A1", values: tab1Values },
          { range: "'2.목표성적_시뮬레이션'!A1", values: tab2Values },
          { range: "'3.맞춤_주간학습계획'!A1", values: tab3Values },
          { range: "'4.학습습관_및_학부모상담'!A1", values: tab4Values },
        ],
      }),
    }
  );

  if (!batchRes.ok) {
    const errorData = await batchRes.json().catch(() => ({}));
    console.warn('Batch update values warning:', errorData);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
  };
};
