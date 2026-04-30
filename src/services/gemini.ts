import { GoogleGenAI, Type, Schema } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAPA-Gefvu5XoYnOXjT7-97E8AuKkoNjZc";
    if (!apiKey) {
      throw new Error("لم يتم العثور على مفتاح API الخاص بـ Gemini. يرجى إضافته كمتغير بيئة (GEMINI_API_KEY) في Vercel.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface AppIdea {
  title: string;
  description: string;
  features: string[];
  targetAudience: string;
}

export interface GenerationSettings {
  category?: string;
  focus?: string;
}

export async function generateNewAppIdea(settings?: GenerationSettings): Promise<AppIdea> {
  const categoryStr = settings?.category && settings.category !== 'الكل' ? `في مجال ${settings.category}` : 'في أي مجال';
  const focusStr = settings?.focus ? `بالتركيز على ${settings.focus}` : '';

  const prompt = `أنت خبير في ريادة الأعمال التقنية وتطوير المنتجات.
المهمة: اقترح فكرة تطبيق ذكي (موبايل أو ويب) جديدة، مبتكرة، وغير مكررة ${categoryStr} ${focusStr}. نريد فكرة تحل مشكلة حقيقية أو تقدم تجربة استثنائية. 
يجب أن يكون الرد باللغة العربية.`;
  
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "اسم التطبيق المقترح (قصير وجذاب)",
          },
          description: {
            type: Type.STRING,
            description: "وصف واضح للتطبيق وما يفعله (في جملة أو جملتين كحد أقصى)",
          },
          features: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "أهم 3 ميزات أساسية تميز هذا التطبيق",
          },
          targetAudience: {
            type: Type.STRING,
            description: "الجمهور المستهدف للتطبيق",
          },
        },
        required: ["title", "description", "features", "targetAudience"],
      } as Schema,
      temperature: 0.9,
    }
  });

  if (!response.text) {
    throw new Error("لم يتم توليد أي نص مسترجع من الذكاء الاصطناعي.");
  }

  return JSON.parse(response.text) as AppIdea;
}
