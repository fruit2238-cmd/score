import { HabitSurveyQuestion, HabitSurveyResult } from '../types';

export const HABIT_QUESTIONS: HabitSurveyQuestion[] = [
  {
    id: 1,
    category: 'concentration',
    question: '공부할 때 스마트폰이나 태블릿 알림을 어떻게 관리하나요?',
    options: [
      { text: '스마트폰을 다른 방에 두거나 전원을 끄고 공부에만 몰입한다.', score: 5 },
      { text: '방해금지 모드로 두고 책상 옆에 둔다.', score: 4 },
      { text: '알림이 올 때마다 잠깐씩 확인하며 공부한다.', score: 2 },
      { text: '공부 도중 유튜브, SNS, 웹툰을 자주 확인해 흐름이 자주 끊긴다.', score: 1 },
    ],
  },
  {
    id: 2,
    category: 'planning',
    question: '주간 또는 일일 학습 플래너(계획표)를 어떻게 작성하고 지키나요?',
    options: [
      { text: '구체적인 시간과 분량(과목/페이지/문항수)을 정해 80% 이상 매일 실천한다.', score: 5 },
      { text: '할 일 목록은 적어두지만 우선순위 없이 손이 가는 대로 공부한다.', score: 3 },
      { text: '시험 1~2주 전에만 대략적인 계획을 세우고 평소엔 거의 안 쓴다.', score: 2 },
      { text: '계획표를 세워도 거의 지키지 못하거나 전혀 작성하지 않는다.', score: 1 },
    ],
  },
  {
    id: 3,
    category: 'review',
    question: '틀린 문제를 대할 때 오답 정리와 복습은 어떻게 진행하나요?',
    options: [
      { text: '해설지를 바로 보지 않고 스스로 3회 이상 고민 후 원인 분석 및 재풀이를 한다.', score: 5 },
      { text: '해설지를 보고 이해한 뒤 표시만 해두고 주말에 다시 풀어본다.', score: 4 },
      { text: '해설지를 보면 이해가 되므로 그냥 넘어가고 다시 풀지는 않는다.', score: 2 },
      { text: '정답만 체크하고 해설지조차 꼼꼼히 보지 않고 새 문제집으로 넘어간다.', score: 1 },
    ],
  },
  {
    id: 4,
    category: 'problem_solving',
    question: '과목별 공부 시 개념 학습과 문제 풀이의 비율은 어떤가요?',
    options: [
      { text: '개념 원리를 남에게 완벽히 설명할 수 있을 때까지 다진 후 문제에 적용한다.', score: 5 },
      { text: '개념을 1~2회 훑어본 뒤 바로 많은 양의 기출 문제를 푼다.', score: 3 },
      { text: '개념 강의는 빠르게 듣기만 하고, 문제 풀이 요령 위주로 공부한다.', score: 2 },
      { text: '개념 이해 없이 공식이나 풀이 패턴만 외워서 기계적으로 푼다.', score: 1 },
    ],
  },
  {
    id: 5,
    category: 'concentration',
    question: '한 번 앉아서 딴짓 없이 순수하게 집중할 수 있는 시간(순공 유지력)은?',
    options: [
      { text: '90분 이상 높은 몰입 상태로 집중을 유지할 수 있다.', score: 5 },
      { text: '50~60분 정도 집중하고 10분 휴식하는 사이클을 잘 지킨다.', score: 4 },
      { text: '20~30분만 지나도 집중력이 흐려지고 잡생각이 든다.', score: 2 },
      { text: '10분도 채 집중하기 어렵고 자주 자리를 일어난다.', score: 1 },
    ],
  },
  {
    id: 6,
    category: 'review',
    question: '오늘 배운 내용이나 수업 내용을 당일 및 주말에 복습하나요?',
    options: [
      { text: '당일 10분 백지 복습 + 주말 누적 복습 루틴을 철저히 지킨다.', score: 5 },
      { text: '주말에만 지난 한 주간 배운 내용을 요약 복습한다.', score: 4 },
      { text: '학원 숙제 할 때만 보고 별도의 자발적 복습은 거의 하지 않는다.', score: 2 },
      { text: '시험 기간 직전까지는 복습을 전혀 하지 않는다.', score: 1 },
    ],
  },
  {
    id: 7,
    category: 'exam_anxiety',
    question: '시험 볼 때 불안감이나 킬러 문항에 대한 멘탈 관리는 어떤가요?',
    options: [
      { text: '시간 분배 전략이 확실하여 어려운 문제는 넘기고 나중에 침착하게 푼다.', score: 5 },
      { text: '약간 긴장되지만 평소 실력의 90% 이상은 발휘한다.', score: 4 },
      { text: '막히는 문제가 나오면 심장이 두근거리고 뒤쪽 아는 문제까지 망친다.', score: 2 },
      { text: '시험 시작 전부터 극심한 불안으로 평소보다 성적이 15점 이상 떨어진다.', score: 1 },
    ],
  },
  {
    id: 8,
    category: 'smartphone',
    question: '인강(인터넷 강의) 수강 시 학생의 수강 태도는 어떤가요?',
    options: [
      { text: '배속 수강을 무리하게 하지 않고, 일시정지 후 필기 및 스스로 생각하며 듣는다.', score: 5 },
      { text: '정상 배속으로 집중해서 들은 후 강의 직후 20분간 핵심을 요약한다.', score: 4 },
      { text: '1.5~2.0 빠른 배속으로 틀어놓고 멍하니 보기만 해 완강만 채운다.', score: 2 },
      { text: '인강을 틀어놓고 다른 창을 띄우거나 딴짓을 하며 시간만 보낸다.', score: 1 },
    ],
  },
];

export const calculateSurveyResult = (answers: Record<number, number>): HabitSurveyResult => {
  let totalScore = 0;
  let concentration = 0;
  let planning = 0;
  let smartphoneControl = 0;
  let reviewHabit = 0;
  let stressControl = 0;

  HABIT_QUESTIONS.forEach((q) => {
    const score = answers[q.id] || 3;
    totalScore += score;

    if (q.category === 'concentration') concentration += score;
    if (q.category === 'planning') planning += score;
    if (q.category === 'smartphone') smartphoneControl += score;
    if (q.category === 'review' || q.category === 'problem_solving') reviewHabit += score;
    if (q.category === 'exam_anxiety') stressControl += score;
  });

  let level: HabitSurveyResult['level'] = '보통';
  if (totalScore >= 35) level = '최상';
  else if (totalScore >= 28) level = '우수';
  else if (totalScore >= 21) level = '보통';
  else if (totalScore >= 15) level = '개선필요';
  else level = '집중관리';

  // Determine Archetype based on category signatures
  let archetype;

  if (totalScore >= 34) {
    archetype = {
      title: '🎯 자기주도 완성형 (Master Strategist)',
      tagline: '메타인지와 실천력이 균형 잡힌 최상위권 도약 루틴',
      description: '자기 통제력과 계획 실천력이 매우 우수합니다. 현재의 올바른 공부 루틴을 유지하면서 고난도 킬러 문항에 대한 깊이 있는 분석과 실전 모의고사 시간 배분 연습에 집중하면 최상위권 유지가 가능합니다.',
      strengths: ['스마트폰 등 유혹 요소 완벽 차단', '일일/주간 플래너 실천율 85% 이상', '철저한 오답 복습과 개념 연계'],
      weaknesses: ['고난도 문제에 대한 과도한 완벽주의로 인한 에너지 소진 주의', '주기적인 멘탈 리프레시 필요'],
      actionGuide: [
        '주 1회 실전 모의고사 100% 동일 시간 시험 훈련',
        '틀린 문항에 대한 심층 출제 의도 분석 노트 작성',
        '최상위권 심화 킬러 문항 집중 공략',
      ],
      badgeColor: 'emerald',
    };
  } else if (reviewHabit <= 5 && totalScore >= 20) {
    archetype = {
      title: '📚 양치기 문제풀이형 (Formulaic Solver)',
      tagline: '문제는 많이 풀지만 오답과 개념 정리가 부족하여 점수 정체',
      description: '책상에 앉아있는 시간은 길고 문제집도 많이 풀지만, 틀린 문제의 본질적 개념을 깊이 파고들지 않고 해설지만 보고 넘어가는 경향이 있습니다. "아는 것 같은 착각(메타인지 오류)"을 해결해야 성적이 수직 상승합니다.',
      strengths: ['문제 풀이에 대한 거부감이 적고 성실함', '학습 지속 시간 확보 능력'],
      weaknesses: ['오답 원인 미분석으로 같은 유형 반복 오답', '개념 빈틈을 문제 암기로 때우려는 습관'],
      actionGuide: [
        '새 문제집 풀기 중단! 이미 푼 문제집의 틀린 문제만 3회독 재풀이',
        '백지 복습법 도입: 소단원 하나를 공부한 뒤 백지에 핵심 원리 적어보기',
        '해설지 의존도 낮추기 (막혔을 때 10분간 출제 개념 역추적)',
      ],
      badgeColor: 'amber',
    };
  } else if (planning <= 3) {
    archetype = {
      title: '⚡ 벼락치기 감정형 (Cramming Sprinter)',
      tagline: '순간 집중력은 뛰어나나 평소 누적 학습과 주기적 복습 부족',
      description: '시험이 임박했을 때는 놀라운 집중력을 발휘하지만, 평소에는 계획 없이 기분이나 당일 학원 숙제에 따라 공부합니다. 이로 인해 시험 범위가 넓어지거나 변별력 있는 심화 문제가 나오면 한계를 마주합니다.',
      strengths: ['단기 압박 상황에서의 빠른 습득력과 몰입도', '목표가 생겼을 때의 과감한 추진력'],
      weaknesses: ['장기 기억화 실패 (시험 끝나면 다 잊어버림)', '과목별 편식 및 평소 복습 루틴 부재'],
      actionGuide: [
        '일일 3-3-3 법칙: 매일 최소 3시간 고정 순공 시간 확보',
        '매주 일요일 저녁 30분 주간 플래너 작성 강제 루틴화',
        '시험 4주 전부터 과목별 3회독 캘린더 역산 스케줄링',
      ],
      badgeColor: 'orange',
    };
  } else if (smartphoneControl <= 3 || concentration <= 4) {
    archetype = {
      title: '📱 스마트폰 방황형 (Distracted Wanderer)',
      tagline: '공부 의지는 강하나 스마트폰 알림과 딴짓으로 집중 블록 분절',
      description: '책상에 앉아는 있으나 15~20분마다 스마트폰 확인, 쇼츠, 웹툰, 음악 재생목록 변경 등으로 인해 뇌가 깊은 몰입(Deep Work) 상태에 진입하지 못합니다. 3시간 앉아있어도 실제 순수 공부 시간은 1시간 미만일 위험이 큽니다.',
      strengths: ['새로운 정보를 빠르게 탐색하는 호기심', '친근하고 유연한 사고력'],
      weaknesses: ['집중 흐름 단절로 인한 학습 피로도 가중', '공부 시간 착각(체감 5시간 vs 실제 1.5시간)'],
      actionGuide: [
        '공부 시작 시 스마트폰 다른 방 보관 또는 타이머 잠금 앱 필수 활용',
        '뽀모도로 50분 집중 + 10분 온전한 스트레칭 휴식 타이머 시각화',
        '스톱워치 순공 시간 측정 (책상 이탈 시 일시정지)',
      ],
      badgeColor: 'rose',
    };
  } else {
    archetype = {
      title: '🌱 성장 잠재력형 (Balanced Learner)',
      tagline: '기본기는 갖추어져 있으나 전략적 효율화가 절실한 단계',
      description: '기본적인 태도는 바르나, 과목별 취약점 파악과 시간 대비 성과(ROI)를 높이는 구체적인 공부 기술이 부족합니다. 과목별 비효율적 시간 배분을 재조정하고 실천 가능한 계획표를 따르면 한 등급 이상 성적이 바로 오를 수 있습니다.',
      strengths: ['열린 피드백 수용 자세', '균형 잡힌 성실성'],
      weaknesses: ['자신에게 맞는 고유의 과목별 학습법 미정립', '시험 불안감으로 인한 실수'],
      actionGuide: [
        '가장 성적이 안 나오는 취약 과목 1개 선정해 일일 1순위로 배치',
        '학습 시간 대비 효율 지수(ROI) 주간 점검',
        '오답 노트 대신 문제집에 오답 이유 라벨링(계산실수/개념부족/조건미확인)',
      ],
      badgeColor: 'indigo',
    };
  }

  return {
    completedAt: new Date().toLocaleDateString('ko-KR'),
    totalScore,
    level,
    archetype,
    categoryScores: {
      concentration: Math.round((concentration / 10) * 100),
      planning: Math.round((planning / 5) * 100),
      smartphoneControl: Math.round((smartphoneControl / 5) * 100),
      reviewHabit: Math.round((reviewHabit / 15) * 100),
      stressControl: Math.round((stressControl / 5) * 100),
    },
  };
};
