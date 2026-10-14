export interface SubjectScore {
  id: string;
  name: string; // 국어, 수학, 영어, 한국사, 탐구1(물리/생명/사문 등), 탐구2
  currentScore: number; // 0 - 100
  previousScore: number; // 직전 시험 점수
  midtermScore: number; // 1학기 중간
  finalScore: number; // 1학기 기말
  mockScore: number; // 최근 모의고사
  grade: number; // 1 ~ 9 등급
  percentile: number; // 백분위 (0 ~ 100)
  classRank: number; // 반 석차
  totalClassStudents: number;
  classAverage: number; // 반 평균
  weeklyStudyHours: number; // 주당 학습 시간 (시간)
  selfStudyHours: number; // 순수 자습 시간
  lectureHours: number; // 인강/학원 수업 시간
  efficiencyScore: number; // 1 ~ 100 효율 지수 (시간 대비 성취도)
  weakPoints: string[]; // 취약 단원/유형 (예: 미적분 극대극소, 빈칸추론 등)
  keyIssue: string; // 주요 비효율 원인 (예: "개념 미숙지 상태에서 무리한 기출 풀이")
}

export interface HabitSurveyQuestion {
  id: number;
  category: 'concentration' | 'planning' | 'smartphone' | 'review' | 'exam_anxiety' | 'problem_solving';
  question: string;
  options: {
    text: string;
    score: number; // 1 ~ 5
  }[];
}

export interface HabitSurveyResult {
  completedAt: string;
  totalScore: number; // out of 40 or 50
  level: '최상' | '우수' | '보통' | '개선필요' | '집중관리';
  archetype: {
    title: string;
    tagline: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    actionGuide: string[];
    badgeColor: string;
  };
  categoryScores: {
    concentration: number;
    planning: number;
    smartphoneControl: number;
    reviewHabit: number;
    stressControl: number;
  };
}

export interface SimulationGoal {
  subjectId: string;
  subjectName: string;
  currentScore: number;
  targetMidtermScore: number;
  targetFinalScore: number;
  targetGrade: number;
  recommendedWeeklyHours: number;
  hoursIncreaseNeeded: number;
  successProbability: number; // %
  difficultyLevel: '보통' | '도전' | '고난도' | '돌파형';
  strategyAdvice: string;
}

export interface DailyScheduleBlock {
  time: string; // "19:00 - 20:30"
  subject: string;
  task: string;
  type: 'concept' | 'problems' | 'review' | 'mock_exam';
  focusLevel: 'high' | 'medium' | 'low';
}

export interface WeeklyStudyPlan {
  title: string;
  targetExam: string;
  dDay: number;
  weeklyGoalHours: number;
  days: {
    day: '월' | '화' | '수' | '목' | '금' | '토' | '일';
    focusSubject: string;
    totalHours: number;
    blocks: DailyScheduleBlock[];
  }[];
  weeklyMilestone: string;
  strategySummary: string;
}

export interface WeaknessAlert {
  id: string;
  severity: 'danger' | 'warning' | 'info';
  subject: string;
  title: string;
  description: string;
  inefficiencyType: '시간과다_정체' | '시간부족_급락' | '인강의존_자기주도결핍' | '오답방치' | '개념구멍';
  urgentAction: string;
  detectedDate: string;
}

export interface ParentReport {
  studentName: string;
  gradeLevel: string;
  consultationDate: string;
  counselorName: string;
  overallSummary: string;
  strengths: string[];
  growthAreas: string[];
  midtermFinalGoalSummary: string;
  habitAnalysis: string;
  parentSupportAdvice: string;
  weeklyPlanSummary: string;
  customMessage: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  gradeLevel: string; // e.g., "고등학교 2학년"
  track: '인문계열' | '자연계열' | '예체능계열' | '공통';
  targetUniversityOrGoal: string; // e.g., "연세대 경영학과 / 내신 1.8등급"
  targetExam: string; // e.g., "2026학년도 2학기 중간고사"
  dDay: number; // e.g., 28
  scores: SubjectScore[];
  surveyResult?: HabitSurveyResult;
  simulationGoals: SimulationGoal[];
  weeklyPlan?: WeeklyStudyPlan;
  weaknessAlerts: WeaknessAlert[];
  parentReport?: ParentReport;
  lastUpdated: string;
}

export interface GoogleUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  accessToken: string;
}

export interface ChatSpace {
  name: string; // format: "spaces/XXXXXXXX"
  displayName: string;
  type?: string;
}
