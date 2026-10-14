import { StudentProfile } from '../types';

export const callGeminiApi = async (type: string, data: any): Promise<string> => {
  try {
    const res = await fetch(`/api/gemini/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`API 호출 실패 (${res.status})`);
    }

    const json = await res.json();
    if (!json.success && json.error) {
      throw new Error(json.error);
    }
    return json.text || '';
  } catch (err: any) {
    console.error(`Gemini API [${type}] error:`, err);
    throw err;
  }
};

export const requestGeminiCounsel = async (student: StudentProfile): Promise<string> => {
  return callGeminiApi('counsel', { student });
};

export const requestSubjectStrategy = async (subjectData: any): Promise<string> => {
  return callGeminiApi('strategy', subjectData);
};

export const requestAutoSchedule = async (params: {
  studentName: string;
  targetExam: string;
  dDay: number;
  availableHours: number;
  weakSubjects: string;
}): Promise<string> => {
  return callGeminiApi('schedule', params);
};

export const requestParentReport = async (student: StudentProfile, counselorNote?: string): Promise<string> => {
  return callGeminiApi('parent-report', { student, counselorNote });
};

export const sendCoachChatMessage = async (
  message: string,
  history: { role: string; content: string }[],
  studentContext: any
): Promise<string> => {
  return callGeminiApi('chat', { message, history, studentContext });
};
