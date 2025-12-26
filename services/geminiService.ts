
import { GoogleGenAI, Type } from "@google/genai";
import { TestResult, MasteryAnalysis, TestConfig, Question } from "../types";

export async function generateAITest(config: TestConfig): Promise<Question[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";

  const prompt = `
    Generate a set of ${config.questionCount} multiple-choice questions for a student preparing for ${config.competition}.
    Level: ${config.className}
    Subject: ${config.subject}
    Selected Chapters: ${config.chapters.join(", ")}
    Difficulty: ${config.difficulty}

    Context: Distribute the questions fairly across the selected chapters. The style should match the rigor of ${config.competition} exams.
    
    Output valid JSON in this format:
    An array of objects with:
    - id: string (unique)
    - category: string (the subject)
    - topic: string (specific chapter name from the selected list)
    - question: string
    - options: string array (4 options)
    - correctAnswer: number (index 0-3)
    - explanation: string (A very brief 1-2 sentence solution or logic for the correct answer)
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              topic: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "category", "topic", "question", "options", "correctAnswer", "explanation"],
            propertyOrdering: ["id", "category", "topic", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Question generation failed:", error);
    throw error;
  }
}

export async function translateQuestion(question: Question, targetLang: string): Promise<Question> {
  if (targetLang === 'English') return question;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const prompt = `Translate the following educational question, its options, and the brief explanation into ${targetLang}. Keep the technical terms accurate.
  Question: ${question.question}
  Options: ${question.options.join(" | ")}
  Explanation: ${question.explanation}
  
  Return JSON with 'question' (string), 'options' (array of strings), and 'explanation' (string).`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "explanation"]
        }
      }
    });
    const result = JSON.parse(response.text);
    return { ...question, question: result.question, options: result.options, explanation: result.explanation };
  } catch (e) {
    console.error("Translation failed", e);
    return question;
  }
}

export async function analyzeTestPerformance(result: TestResult, questionMetadata: Question[]): Promise<MasteryAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const summaryData = result.attempts.reduce((acc: any, attempt) => {
    const q = questionMetadata.find(item => item.id === attempt.questionId);
    if (!q) return acc;
    if (!acc[q.topic]) acc[q.topic] = { correctFirstTry: 0, totalQuestions: 0, totalAttempts: 0 };
    
    if (attempt.round === 1 && attempt.isCorrect) {
      acc[q.topic].correctFirstTry += 1;
    }
    
    acc[q.topic].totalAttempts += 1;
    return acc;
  }, {});

  const prompt = `
    Analyze this student's revision test results for ${result.config.competition} preparation.
    Student: ${result.studentName}
    Exam: ${result.config.competition}
    Subject: ${result.config.subject}
    Chapters: ${result.config.chapters.join(", ")}
    Performance: ${JSON.stringify(summaryData)}

    Focus: Identify which of the selected chapters the student mastered and which need deep revision.
    Return JSON: strengths (array of topics), weaknesses (array of topics), recommendations (array), cognitiveSummary (string).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            cognitiveSummary: { type: Type.STRING }
          },
          required: ["strengths", "weaknesses", "recommendations", "cognitiveSummary"],
          propertyOrdering: ["strengths", "weaknesses", "recommendations", "cognitiveSummary"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Analysis failed:", error);
    return {
      strengths: ["Data error"],
      weaknesses: ["Data error"],
      recommendations: ["Check connection"],
      cognitiveSummary: "Error generating analysis."
    };
  }
}
