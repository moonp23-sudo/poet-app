import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Generate Poem using Gemini 3.5 Flash
  app.post("/api/poem/generate", async (req: express.Request, res: express.Response) => {
    try {
      const { topic } = req.body;
      if (!topic || typeof topic !== "string") {
        res.status(400).json({ error: "주제(topic)를 입력해주세요." });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ 
          error: "Gemini API 키가 설정되지 않았습니다. AI Studio의 Settings > Secrets에서 GEMINI_API_KEY를 입력해주세요." 
        });
        return;
      }

      // Initialize Gemini Client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Create a beautiful educational poem in Korean about the topic: "${topic}" and fill out the schema.
      
      Guidelines:
      - content: Exactly 4 emotional, short, easy-to-read lines of poetry. Keep words easy but emotionally rich.
      - subjects: Exactly 4 distinct objects or ideas. 2 must appear in the poem (isCorrect: true) with helpful hints explaining where/why they are in the poem. 2 must not appear in the poem (isCorrect: false) with hints explaining they don't appear in the poem, guiding the child to think. Include a cute emoji for each.
      - academicQuestion: Select a relevant reading skill (word, e.g. '비유하기', '묘사하기', '상상하기', '비교하기', '표현하기') with a child-friendly simplified explanation (simplifiedWord), a deep yet easy-to-answer reading comprehension question (questionText), 3 choices (1 correct, 2 incorrect, each with an emoji), and a teacher/parent guidelines context (guideline).
      - sentenceCards: Choose 3 sentence segments that combine into a unified summary/feeling sentence representing the poem. Card 1 must be subject, Card 2 must be action, Card 3 must be feeling.
      - translations: Translate the poem's title, content, guide (explaining the poem's context and message to a multicultural parent), and homeworkGuide (suggesting a cute warm parent-child interactive activity related to the topic at home) into English (en), Vietnamese (vi), Chinese (zh), and Japanese (ja). Use the language code (en, vi, zh, ja) for the keys.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert Korean educational AI Poet and Curriculum Specialist. Your goal is to write highly emotional, warm, and beautiful educational poems in Korean (exactly 4 lines long) for elementary school students (including multicultural and slow learning children) based on a topic, and then generate highly structured comprehension activities, translation guides, and exercises matching a strict JSON schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The Korean title of the poem" },
              content: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 lines of poem in Korean"
              },
              subjects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the object/subject" },
                    emoji: { type: Type.STRING, description: "One single emoji matching this object" },
                    isCorrect: { type: Type.BOOLEAN, description: "true if it directly appears/is mentioned in the poem, false if not" },
                    hint: { type: Type.STRING, description: "A friendly Korean hint explaining its presence or absence in the poem" }
                  },
                  required: ["name", "emoji", "isCorrect", "hint"]
                },
                description: "Exactly 4 subject items (2 correct, 2 incorrect)"
              },
              academicQuestion: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: "An academic vocab word in Korean (e.g., '비유하기', '묘사하기', '상상하기', '비교하기')" },
                  simplifiedWord: { type: Type.STRING, description: "Simplified explanation of that word for children in Korean" },
                  questionText: { type: Type.STRING, description: "Reading comprehension/feeling question in Korean" },
                  choices: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING, description: "Choice text in Korean" },
                        emoji: { type: Type.STRING, description: "One matching emoji" },
                        isCorrect: { type: Type.BOOLEAN, description: "true for the single correct option, false otherwise" }
                      },
                      required: ["text", "emoji", "isCorrect"]
                    },
                    description: "Exactly 3 choice items"
                  },
                  guideline: { type: Type.STRING, description: "A friendly Korean coaching guideline/advice for teachers or parents" }
                },
                required: ["word", "simplifiedWord", "questionText", "choices", "guideline"]
              },
              sentenceCards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: "Card text in Korean (e.g. '🐱 아기 고양이는' or '🐾 발바닥을 내밀고')" },
                    category: { type: Type.STRING, description: "Must be 'subject', 'action', or 'feeling'" },
                    order: { type: Type.INTEGER, description: "1 for subject, 2 for action, 3 for feeling" }
                  },
                  required: ["text", "category", "order"]
                },
                description: "Exactly 3 sentence cards"
              },
              translations: {
                type: Type.OBJECT,
                properties: {
                  en: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.ARRAY, items: { type: Type.STRING } },
                      guide: { type: Type.STRING },
                      homeworkGuide: { type: Type.STRING }
                    },
                    required: ["title", "content", "guide", "homeworkGuide"]
                  },
                  vi: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.ARRAY, items: { type: Type.STRING } },
                      guide: { type: Type.STRING },
                      homeworkGuide: { type: Type.STRING }
                    },
                    required: ["title", "content", "guide", "homeworkGuide"]
                  },
                  zh: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.ARRAY, items: { type: Type.STRING } },
                      guide: { type: Type.STRING },
                      homeworkGuide: { type: Type.STRING }
                    },
                    required: ["title", "content", "guide", "homeworkGuide"]
                  },
                  ja: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.ARRAY, items: { type: Type.STRING } },
                      guide: { type: Type.STRING },
                      homeworkGuide: { type: Type.STRING }
                    },
                    required: ["title", "content", "guide", "homeworkGuide"]
                  }
                },
                required: ["en", "vi", "zh", "ja"]
              }
            },
            required: ["title", "content", "subjects", "academicQuestion", "sentenceCards", "translations"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("AI가 시 내용을 비어있는 값으로 생성했습니다.");
      }

      const generatedData = JSON.parse(responseText.trim());

      // Assign logical or randomized IDs to match our React local state structure
      const uniqueSuffix = Date.now().toString(36);
      
      const formattedPoem = {
        id: `ai_${uniqueSuffix}`,
        title: generatedData.title,
        author: "AI 시인",
        content: generatedData.content,
        subjects: generatedData.subjects.map((sub: any, idx: number) => ({
          id: `ai_sub_${idx}_${uniqueSuffix}`,
          name: sub.name,
          emoji: sub.emoji,
          isCorrect: sub.isCorrect,
          hint: sub.hint
        })),
        academicQuestion: {
          word: generatedData.academicQuestion.word,
          simplifiedWord: generatedData.academicQuestion.simplifiedWord,
          questionText: generatedData.academicQuestion.questionText,
          choices: generatedData.academicQuestion.choices.map((ch: any, idx: number) => ({
            id: `ai_ch_${idx}_${uniqueSuffix}`,
            text: ch.text,
            emoji: ch.emoji,
            isCorrect: ch.isCorrect
          })),
          guideline: generatedData.academicQuestion.guideline
        },
        sentenceCards: generatedData.sentenceCards.map((card: any, idx: number) => ({
          id: `ai_card_${idx}_${uniqueSuffix}`,
          text: card.text,
          category: card.category,
          order: card.order
        })),
        // Sort and map the sequence of Card IDs by order (1 -> 2 -> 3)
        correctSequence: [] as string[],
        translations: generatedData.translations
      };

      // Populate correctSequence based on sorted order
      const cardsSorted = [...formattedPoem.sentenceCards].sort((a, b) => a.order - b.order);
      formattedPoem.correctSequence = cardsSorted.map(c => c.id);

      res.json(formattedPoem);
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: error?.message || "시 생성 중 오류가 발생했습니다." });
    }
  });

  // Serve static assets in production, otherwise pass to Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
