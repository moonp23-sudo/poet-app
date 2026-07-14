import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  Star, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle2, 
  Smile, 
  ChevronRight, 
  ChevronLeft, 
  Info,
  Award,
  BookMarked,
  UserCheck,
  Languages,
  ArrowRight,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Poem, EvaluationLog, SubjectItem, Choice, SentenceCard } from './types';
import { poemsData } from './data';
import { AudioFacilitator } from './components/AudioFacilitator';
import { MulticulturalGuide } from './components/MulticulturalGuide';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { sound } from './sound';

const STORAGE_KEY = 'si_neukkim_eval_logs_v1';

export default function App() {
  const [poems, setPoems] = useState<Poem[]>(() => {
    const saved = localStorage.getItem('custom_poems_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...poemsData, ...parsed];
      } catch (e) {
        console.error('Error loading custom poems:', e);
      }
    }
    return poemsData;
  });
  const [selectedPoemId, setSelectedPoemId] = useState<string>(poemsData[0].id);
  const currentPoem = poems.find(p => p.id === selectedPoemId) || poemsData[0];

  // Poem Creator Modal States
  const [isPoemCreatorOpen, setIsPoemCreatorOpen] = useState<boolean>(false);
  const [creatorTab, setCreatorTab] = useState<'ai' | 'manual'>('ai');
  
  // AI generation states
  const [aiTopic, setAiTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Manual generation states
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualLines, setManualLines] = useState<string[]>(['', '', '', '']);
  const [manualKeyword1, setManualKeyword1] = useState<string>('');
  const [manualKeyword1Emoji, setManualKeyword1Emoji] = useState<string>('🌸');
  const [manualKeyword1Hint, setManualKeyword1Hint] = useState<string>('');
  const [manualKeyword2, setManualKeyword2] = useState<string>('');
  const [manualKeyword2Emoji, setManualKeyword2Emoji] = useState<string>('🍃');
  const [manualKeyword2Hint, setManualKeyword2Hint] = useState<string>('');
  const [manualWrong1, setManualWrong1] = useState<string>('');
  const [manualWrong1Emoji, setManualWrong1Emoji] = useState<string>('🚗');
  const [manualWrong1Hint, setManualWrong1Hint] = useState<string>('');
  const [manualWrong2, setManualWrong2] = useState<string>('');
  const [manualWrong2Emoji, setManualWrong2Emoji] = useState<string>('🤖');
  const [manualWrong2Hint, setManualWrong2Hint] = useState<string>('');

  const [manualWord, setManualWord] = useState<string>('묘사하기');
  const [manualWordSimple, setManualWordSimple] = useState<string>('눈에 보이듯이 그리기');
  const [manualQuestionText, setManualQuestionText] = useState<string>('');
  const [manualChoice1, setManualChoice1] = useState<string>('');
  const [manualChoice1Emoji, setManualChoice1Emoji] = useState<string>('😊');
  const [manualChoice2, setManualChoice2] = useState<string>('');
  const [manualChoice2Emoji, setManualChoice2Emoji] = useState<string>('😢');
  const [manualChoice3, setManualChoice3] = useState<string>('');
  const [manualChoice3Emoji, setManualChoice3Emoji] = useState<string>('😡');
  
  const [manualCardSubject, setManualCardSubject] = useState<string>('');
  const [manualCardAction, setManualCardAction] = useState<string>('');
  const [manualCardFeeling, setManualCardFeeling] = useState<string>('');

  // Learning steps:
  // 0: 시 감상하기 (Read & Listen Poem)
  // 1: 1단계 - 대상 찾기 (Find key subjects)
  // 2: 2단계 - 느낌 고르기 (Choose feeling with simplified academic words)
  // 3: 3단계 - 문장 카드 조립하기 (Assemble sentence cards)
  const [activeStep, setActiveStep] = useState<number>(0);

  // Persistence for teacher observation log
  const [logs, setLogs] = useState<Record<string, EvaluationLog>>({});

  // Step 1 State: Correct subjects found
  const [step1Selected, setStep1Selected] = useState<string[]>([]);
  const [step1WrongChoices, setStep1WrongChoices] = useState<string[]>([]);
  const [step1Tries, setStep1Tries] = useState<number>(0);
  const [step1Feedback, setStep1Feedback] = useState<string>('');

  // Step 2 State: Selected feeling choice
  const [step2SelectedChoiceId, setStep2SelectedChoiceId] = useState<string | null>(null);

  // Step 3 State: Sentence assembly pegboard slots
  // slot 1 (subject), slot 2 (action), slot 3 (feeling)
  const [slot1, setSlot1] = useState<SentenceCard | null>(null);
  const [slot2, setSlot2] = useState<SentenceCard | null>(null);
  const [slot3, setSlot3] = useState<SentenceCard | null>(null);
  const [step3Tries, setStep3Tries] = useState<number>(0);
  const [step3Feedback, setStep3Feedback] = useState<string>('');

  // UI state
  const [celebrationActive, setCelebrationActive] = useState<boolean>(false);
  const [guideVisible, setGuideVisible] = useState<boolean>(false);
  const [dashboardVisible, setDashboardVisible] = useState<boolean>(true); // default visible so teacher sees progress tracker immediately
  const [stampFeedbackText, setStampFeedbackText] = useState<string>('');

  // Load and sync logs on startup and whenever poems list changes
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let initialLogs: Record<string, EvaluationLog> = {};
    if (saved) {
      try {
        initialLogs = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading logs', e);
      }
    }

    // Merge in any missing poems (original or custom)
    let changed = false;
    poems.forEach(p => {
      if (!initialLogs[p.id]) {
        initialLogs[p.id] = {
          poemId: p.id,
          poemTitle: p.title,
          step1Completed: false,
          step1Tries: 0,
          step1SelectedWrong: [],
          step2Completed: false,
          step3Completed: false,
          step3Tries: 0,
          stampsEarned: 0,
          teacherObservation: '',
          updatedAt: new Date().toISOString()
        };
        changed = true;
      }
    });

    setLogs(initialLogs);
    if (changed || !saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLogs));
    }
  }, [poems]);

  // Update specific log
  const updateLog = (updatedFields: Partial<EvaluationLog>) => {
    const currentLog = logs[selectedPoemId] || {
      poemId: currentPoem.id,
      poemTitle: currentPoem.title,
      step1Completed: false,
      step1Tries: 0,
      step1SelectedWrong: [],
      step2Completed: false,
      step3Completed: false,
      step3Tries: 0,
      stampsEarned: 0,
      teacherObservation: '',
      updatedAt: new Date().toISOString()
    };

    const newLog: EvaluationLog = {
      ...currentLog,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };

    // Calculate stamps earned based on steps completed
    let stamps = 0;
    if (newLog.step1Completed) stamps += 1;
    if (newLog.step2Completed) stamps += 1;
    if (newLog.step3Completed) stamps += 1;
    newLog.stampsEarned = stamps;

    const newLogs = {
      ...logs,
      [selectedPoemId]: newLog
    };

    setLogs(newLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
  };

  // Reset all state for new poem selection
  const handlePoemSelect = (id: string) => {
    sound.playPop();
    setSelectedPoemId(id);
    setActiveStep(0);
    resetStepStates();
  };

  const addCustomPoem = (newPoem: Poem) => {
    const updated = [...poems, newPoem];
    setPoems(updated);
    
    // Save only custom ones to localStorage
    const customOnly = updated.filter(p => !poemsData.some(original => original.id === p.id));
    localStorage.setItem('custom_poems_v1', JSON.stringify(customOnly));
    
    // Also initialize logs for this new poem immediately
    const newLogs = {
      ...logs,
      [newPoem.id]: {
        poemId: newPoem.id,
        poemTitle: newPoem.title,
        step1Completed: false,
        step1Tries: 0,
        step1SelectedWrong: [],
        step2Completed: false,
        step3Completed: false,
        step3Tries: 0,
        stampsEarned: 0,
        teacherObservation: '',
        updatedAt: new Date().toISOString()
      }
    };
    setLogs(newLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
    
    // Switch to the newly created poem!
    setSelectedPoemId(newPoem.id);
    setActiveStep(0);
    resetStepStates();
  };

  const deleteCustomPoem = (poemId: string) => {
    if (poemsData.some(original => original.id === poemId)) {
      alert("기본으로 탑재된 시는 삭제할 수 없습니다.");
      return;
    }
    if (window.confirm("이 시를 삭제하시겠습니까? 관련 학습 기록도 함께 삭제됩니다.")) {
      sound.playPop();
      const updated = poems.filter(p => p.id !== poemId);
      setPoems(updated);
      
      const customOnly = updated.filter(p => !poemsData.some(original => original.id === p.id));
      localStorage.setItem('custom_poems_v1', JSON.stringify(customOnly));
      
      // Select another poem
      const fallbackPoem = updated[0] || poemsData[0];
      setSelectedPoemId(fallbackPoem.id);
      setActiveStep(0);
      resetStepStates();
      
      // Clean up logs
      const updatedLogs = { ...logs };
      delete updatedLogs[poemId];
      setLogs(updatedLogs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    }
  };

  const handleGenerateAIPoem = async () => {
    if (!aiTopic.trim()) {
      setGenerationError("주제를 입력해주세요! (예: 가을 낙엽, 귀여운 아기새)");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    sound.playPop();

    try {
      const response = await fetch("/api/poem/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim() })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "시 생성 실패" }));
        throw new Error(errData.error || "시 생성 중 오류가 발생했습니다.");
      }

      const newPoem = await response.json();
      addCustomPoem(newPoem);
      setIsPoemCreatorOpen(false);
      setAiTopic('');
      
      // Play high-quality sound & flash celebration
      sound.playVictory();
      setStampFeedbackText(`✨ 와! AI 시인이 '${aiTopic}' 주제로 아름다운 동시를 완성했어요! 🌸`);
      setCelebrationActive(true);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err?.message || "시 생성 중 서버와 통신하는 데 실패했습니다. Settings > Secrets에서 GEMINI_API_KEY가 등록되어 있는지 다시 확인해 주세요.");
      sound.playError();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveManualPoem = () => {
    const titleVal = manualTitle.trim() || "새 시화판";
    if (manualLines.some(line => !line.trim())) {
      alert("시 4줄을 모두 채워주세요!");
      return;
    }
    
    const kw1 = manualKeyword1.trim() || "첫째 낱말";
    const kw2 = manualKeyword2.trim() || "둘째 낱말";
    const wr1 = manualWrong1.trim() || "엉뚱한 낱말1";
    const wr2 = manualWrong2.trim() || "엉뚱한 낱말2";
    
    const qText = manualQuestionText.trim() || "이 시를 읽고 나니 어떤 느낌과 생각이 드나요?";
    const c1 = manualChoice1.trim() || "마음이 따뜻해지고 고와져요.";
    const c2 = manualChoice2.trim() || "슬프거나 무서운 생각만 나요.";
    const c3 = manualChoice3.trim() || "화가 나고 짜증나요.";

    const cardSub = manualCardSubject.trim() || "🌸 시 속 친구가";
    const cardAct = manualCardAction.trim() || "💖 따스한 말을 건네서";
    const cardFeel = manualCardFeeling.trim() || "🥰 우리 기분이 참 좋아져요.";

    sound.playPop();

    const uniqueSuffix = Date.now().toString(36);
    
    // Create custom manual poem object
    const newPoem: Poem = {
      id: `manual_${uniqueSuffix}`,
      title: titleVal,
      author: "선생님 시인",
      content: manualLines.map(line => line.trim()),
      subjects: [
        { id: `manual_sub_1_${uniqueSuffix}`, name: kw1, emoji: manualKeyword1Emoji, isCorrect: true, hint: manualKeyword1Hint.trim() || "시 속에 직접 언급되는 고마운 단어예요!" },
        { id: `manual_sub_2_${uniqueSuffix}`, name: kw2, emoji: manualKeyword2Emoji, isCorrect: true, hint: manualKeyword2Hint.trim() || "시 속에 들어있는 즐거운 단어예요!" },
        { id: `manual_sub_3_${uniqueSuffix}`, name: wr1, emoji: manualWrong1Emoji, isCorrect: false, hint: manualWrong1Hint.trim() || "시 본문에 나오지 않는 단어랍니다." },
        { id: `manual_sub_4_${uniqueSuffix}`, name: wr2, emoji: manualWrong2Emoji, isCorrect: false, hint: manualWrong2Hint.trim() || "이 단어는 시 속에 들어있지 않아요." }
      ],
      academicQuestion: {
        word: manualWord.trim(),
        simplifiedWord: manualWordSimple.trim(),
        questionText: qText,
        choices: [
          { id: `manual_ch_1_${uniqueSuffix}`, text: c1, emoji: manualChoice1Emoji, isCorrect: true },
          { id: `manual_ch_2_${uniqueSuffix}`, text: c2, emoji: manualChoice2Emoji, isCorrect: false },
          { id: `manual_ch_3_${uniqueSuffix}`, text: c3, emoji: manualChoice3Emoji, isCorrect: false }
        ],
        guideline: "선생님이 아이에게 질문을 상냥하게 읽어주고, 시를 다시 소리 내어 읽으며 어떤 기분이 들었을지 함께 마음을 보살펴주세요."
      },
      sentenceCards: [
        { id: `manual_card_1_${uniqueSuffix}`, text: cardSub, category: 'subject', order: 1 },
        { id: `manual_card_2_${uniqueSuffix}`, text: cardAct, category: 'action', order: 2 },
        { id: `manual_card_3_${uniqueSuffix}`, text: cardFeel, category: 'feeling', order: 3 }
      ],
      correctSequence: [
        `manual_card_1_${uniqueSuffix}`,
        `manual_card_2_${uniqueSuffix}`,
        `manual_card_3_${uniqueSuffix}`
      ],
      translations: {
        en: {
          title: titleVal + " (Translated)",
          content: manualLines.map(line => "⭐ " + line.trim()),
          guide: "Please read this custom poem written by the teacher with your child. Focus on key words and share warm feelings.",
          homeworkGuide: "Do a cute interactive family session with your child related to the poem topic."
        },
        vi: {
          title: titleVal + " (Dịch nghĩa)",
          content: manualLines.map(line => "⭐ " + line.trim()),
          guide: "Hãy cùng con đọc bài thơ do cô giáo tự sáng tác này. Trao đổi về những từ khóa quan trọng và chia sẻ cảm xúc ấm áp.",
          homeworkGuide: "Hãy làm một hoạt động gia đình dễ thương và ấm áp cùng con liên quan đến chủ đề bài thơ."
        },
        zh: {
          title: titleVal + " (翻译)",
          content: manualLines.map(line => "⭐ " + line.trim()),
          guide: "请和孩子一起阅读老师创作的这首新诗。关注核心词汇并分享温暖的感觉。",
          homeworkGuide: "和孩子一起做个与诗歌主题相关的可爱亲子互动活动吧。"
        },
        ja: {
          title: titleVal + " (翻訳)",
          content: manualLines.map(line => "⭐ " + line.trim()),
          guide: "先生가 새로 만든 이 시를 자녀와 함께 읽어보세요. 주요 낱말에 주목하고 따뜻한 느낌을 함께 나누어 보세요.",
          homeworkGuide: "가정에서 시의 주제와 연관된 재미있는 놀이 활동을 자녀와 함께 해 보세요."
        }
      }
    };

    addCustomPoem(newPoem);
    setIsPoemCreatorOpen(false);
    
    sound.playVictory();
    setStampFeedbackText(`✍️ 선생님이 직접 만든 새로운 시 '${titleVal}'가 성공적으로 등록되었습니다! 🌸`);
    setCelebrationActive(true);

    // Reset fields
    setManualTitle('');
    setManualLines(['', '', '', '']);
    setManualKeyword1('');
    setManualKeyword2('');
    setManualWrong1('');
    setManualWrong2('');
    setManualQuestionText('');
    setManualCardSubject('');
    setManualCardAction('');
    setManualCardFeeling('');
  };

  const resetStepStates = () => {
    setStep1Selected([]);
    setStep1WrongChoices([]);
    setStep1Tries(0);
    setStep1Feedback('');
    setStep2SelectedChoiceId(null);
    setSlot1(null);
    setSlot2(null);
    setSlot3(null);
    setStep3Tries(0);
    setStep3Feedback('');
    setCelebrationActive(false);
  };

  // --- STEP 1: FIND SUBJECTS ---
  const handleSubjectClick = (item: SubjectItem) => {
    if (step1Selected.includes(item.id) || step1WrongChoices.includes(item.id)) return;

    setStep1Tries(prev => prev + 1);

    if (item.isCorrect) {
      sound.playPop();
      const updated = [...step1Selected, item.id];
      setStep1Selected(updated);
      setStep1Feedback(`딩동댕! '${item.name}'은(는) 시 속에 있는 소중한 친구가 맞아요!`);

      // Check if all correct subjects are found
      const correctIds = currentPoem.subjects.filter(s => s.isCorrect).map(s => s.id);
      const isFinished = correctIds.every(id => updated.includes(id));

      if (isFinished) {
        sound.playSuccess();
        updateLog({
          step1Completed: true,
          step1Tries: step1Tries + 1,
          step1SelectedWrong: step1WrongChoices
        });
        setStampFeedbackText('우와! 1단계를 참 잘했어요! 첫 번째 노란 별 도장을 찍었어요! ⭐');
        setCelebrationActive(true);
      }
    } else {
      sound.playError();
      setStep1WrongChoices(prev => [...prev, item.name]);
      setStep1Feedback(`앗! '${item.name}'은(는) 시 속에 없어요. 힌트: ${item.hint}`);
    }
  };

  // --- STEP 2: CHOOSE FEELINGS ---
  const handleChoiceClick = (choice: Choice) => {
    sound.playPop();
    setStep2SelectedChoiceId(choice.id);

    if (choice.isCorrect) {
      sound.playSuccess();
      updateLog({
        step2Completed: true,
        step2SelectedChoiceId: choice.id
      });
      setStampFeedbackText('참 신통해요! 시의 따뜻한 감정을 바르게 찾아내어 두 번째 별 도장을 찍었어요! ⭐⭐');
      setCelebrationActive(true);
    } else {
      sound.playError();
      setStampFeedbackText('');
    }
  };

  // --- STEP 3: ASSEMBLE SENTENCE CARDS ---
  const handleCardClick = (card: SentenceCard) => {
    sound.playPop();
    setStep3Tries(prev => prev + 1);

    // Step-by-step pegboard assignment
    if (card.order === 1) {
      setSlot1(card);
      setStep3Feedback('참 잘했어요! "누가/무엇이" 주어 카드가 첫 칸에 쏙 들어갔어요!');
    } else if (card.order === 2) {
      if (!slot1) {
        sound.playError();
        setStep3Feedback('힌트: 먼저 "누가/무엇이"가 쓰여진 1번 카드부터 빈칸에 꽂아주세요!');
        return;
      }
      setSlot2(card);
      setStep3Feedback('완벽해요! "무엇을 하며" 행동 카드가 두 번째 칸에 꽂혔어요!');
    } else if (card.order === 3) {
      if (!slot1 || !slot2) {
        sound.playError();
        setStep3Feedback('힌트: 먼저 1번과 2번 카드들을 빈칸에 순서대로 꽂아주세요!');
        return;
      }
      setSlot3(card);
      
      // All slotted!
      sound.playVictory();
      updateLog({
        step3Completed: true,
        step3Tries: step3Tries + 1
      });
      setStampFeedbackText('축하합니다! 문장 퍼즐을 완성했어요! 마지막 세 번째 도장까지 완성했습니다! ⭐⭐⭐');
      setCelebrationActive(true);
    }
  };

  const handleResetStep3 = () => {
    sound.playPop();
    setSlot1(null);
    setSlot2(null);
    setSlot3(null);
    setStep3Feedback('퍼즐 판을 깨끗하게 정리했어요. 다시 알맞게 카드를 꽂아보세요!');
  };

  // Teacher manual observation entry update
  const handleUpdateObservation = (poemId: string, notes: string) => {
    const currentLog = logs[poemId] || {
      poemId,
      poemTitle: poems.find(p => p.id === poemId)?.title || '국어 활동',
      step1Completed: false,
      step1Tries: 0,
      step1SelectedWrong: [],
      step2Completed: false,
      step3Completed: false,
      step3Tries: 0,
      stampsEarned: 0,
      teacherObservation: '',
      updatedAt: new Date().toISOString()
    };

    const newLogs = {
      ...logs,
      [poemId]: {
        ...currentLog,
        teacherObservation: notes,
        updatedAt: new Date().toISOString()
      }
    };
    setLogs(newLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
  };

  // Reset all records
  const handleResetAllLogs = () => {
    if (window.confirm('정말로 학생의 모든 학습 진행 기록과 관찰 기록을 삭제하고 초기화하시겠습니까?')) {
      const initialLogs: Record<string, EvaluationLog> = {};
      poems.forEach(p => {
        initialLogs[p.id] = {
          poemId: p.id,
          poemTitle: p.title,
          step1Completed: false,
          step1Tries: 0,
          step1SelectedWrong: [],
          step2Completed: false,
          step3Completed: false,
          step3Tries: 0,
          stampsEarned: 0,
          teacherObservation: '',
          updatedAt: new Date().toISOString()
        };
      });
      setLogs(initialLogs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLogs));
      resetStepStates();
      alert('기록이 초기화되었습니다.');
    }
  };

  const currentLog = logs[selectedPoemId] || {
    poemId: currentPoem.id,
    poemTitle: currentPoem.title,
    step1Completed: false,
    step1Tries: 0,
    step1SelectedWrong: [],
    step2Completed: false,
    step3Completed: false,
    step3Tries: 0,
    stampsEarned: 0,
    teacherObservation: '',
    updatedAt: '-'
  };

  // Read current poem and title
  const currentPoemSpeechText = [
    `제목: ${currentPoem.title}`,
    `시인: ${currentPoem.author}`,
    ...currentPoem.content,
    '시 낭독을 다 들었다면 아래의 다음 단계 화살표 버튼을 누르고 퀴즈 활동을 시작해 보아요!'
  ];

  return (
    <div className="min-h-screen bg-natural-bg font-sans text-natural-text pb-16 antialiased print:bg-white print:pb-0">
      {/* Decorative colored clouds background */}
      <div className="absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b from-natural-green-light/50 via-natural-amber-light/40 to-transparent pointer-events-none" />

      {/* Primary Header - Sticky for easy access */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-natural-border px-4 py-3.5 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-natural-green flex items-center justify-center text-white shadow-sm">
              <BookMarked className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-natural-green-dark bg-natural-green-light px-2 py-0.5 border border-natural-green-border/50 rounded-md">
                  초등 국어 생각과 느낌 나누기
                </span>
                <span className="text-xs font-bold text-natural-amber-dark bg-natural-amber-light px-2 py-0.5 border border-natural-amber-border/50 rounded-md">
                  특수/다문화 맞춤형
                </span>
              </div>
              <h1 className="text-base font-extrabold text-natural-text tracking-tight mt-0.5">
                시와 생각 느낌 나누기 꽃밭 🌸
              </h1>
            </div>
          </div>

          {/* Poem Quick Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 max-w-full md:max-w-[40%] px-1">
            {poems.map((poem) => {
              const isOriginal = poemsData.some(original => original.id === poem.id);
              const isSelected = selectedPoemId === poem.id;
              return (
                <div key={poem.id} className="relative shrink-0">
                  <button
                    onClick={() => handlePoemSelect(poem.id)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-natural-green text-white shadow-sm'
                        : 'bg-natural-green-light/60 text-natural-dark hover:bg-natural-green-light'
                    }`}
                  >
                    {poem.title}
                  </button>
                  {!isOriginal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomPoem(poem.id);
                      }}
                      className="absolute -top-1.5 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] font-extrabold shadow-sm cursor-pointer z-10"
                      title="시 삭제하기"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Support options shortcut */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { sound.playPop(); setIsPoemCreatorOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer animate-none"
            >
              <Sparkles size={13} className="animate-pulse" />
              <span>새 시 만들기</span>
            </button>
            <button
              onClick={() => { sound.playPop(); setGuideVisible(!guideVisible); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                guideVisible 
                  ? 'bg-natural-amber text-white shadow-sm' 
                  : 'bg-natural-amber-light text-natural-amber-dark border border-natural-amber-border hover:bg-natural-amber-bg'
              }`}
            >
              <Languages size={13} />
              <span>다문화 안내</span>
            </button>
            <button
              onClick={() => { sound.playPop(); setDashboardVisible(!dashboardVisible); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dashboardVisible 
                  ? 'bg-natural-green text-white shadow-sm' 
                  : 'bg-natural-green-light text-natural-green-dark border border-natural-green-border hover:bg-natural-green-hover hover:text-white'
              }`}
            >
              <UserCheck size={13} />
              <span>관찰 기록</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 relative z-10 print:mt-0 print:px-0">
        
        {/* Progress Tracker Banner & Active Stamp Indicator */}
        <section className="bg-white rounded-3xl border border-natural-border shadow-sm p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-natural-amber-light border-2 border-natural-amber flex items-center justify-center text-natural-amber shadow-sm">
                <Star className="h-7 w-7 fill-current animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-natural-green text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                {currentLog.stampsEarned}
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-natural-text">
                "{currentPoem.title}" 학습 꽃밭
              </h2>
              <p className="text-xs text-natural-muted mt-1">
                시를 듣고 느낌을 나누는 3단계 놀이 활동을 하며 귀여운 노란 별 도장을 모아보세요!
              </p>
            </div>
          </div>

          {/* Steps Indicator Bar */}
          <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-1 md:pb-0">
            {[
              { idx: 0, label: '시 읽고 감상하기 📖' },
              { idx: 1, label: '1단계: 주요 낱말 찾기 🔎' },
              { idx: 2, label: '2단계: 감정 느낌 찾기 💭' },
              { idx: 3, label: '3단계: 생각 문장 잇기 🧩' }
            ].map((step) => {
              const isPassed = activeStep > step.idx;
              const isCurrent = activeStep === step.idx;
              return (
                <button
                  key={step.idx}
                  onClick={() => { sound.playPop(); setActiveStep(step.idx); }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-natural-text text-white shadow-sm scale-105'
                      : isPassed
                      ? 'bg-natural-green-light text-natural-green-dark border border-natural-green-border'
                      : 'bg-natural-green-light/40 text-natural-muted hover:bg-natural-green-light/80'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle className="h-3.5 w-3.5 fill-natural-green-light text-natural-green shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-natural-border text-[10px] flex items-center justify-center text-natural-dark shrink-0">
                      {step.idx + 1}
                    </span>
                  )}
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Outer Split Layout: Left side displays Poem, Right side displays Active Step Game Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 5-COLUMNS: The Poem Presentation Board */}
          <section className="lg:col-span-5 bg-white rounded-3xl border border-natural-border shadow-sm p-6 md:p-8 relative print:border-none print:shadow-none print:p-0">
            {/* Decorative background stripes */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-natural-amber-border/40" />
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-natural-amber-border/40" />

            <div className="pl-6">
              <div className="flex items-center justify-between gap-3 mb-6 border-b border-natural-border pb-4 print:hidden">
                <span className="text-xs font-bold text-natural-green-dark tracking-wider flex items-center gap-1">
                  <BookOpen size={13} />
                  <span>소리나는 한국 시화판</span>
                </span>
                
                {/* Single tap speaker for entire poem */}
                <AudioFacilitator
                  inline
                  customButtonLabel="전체 낭독 듣기"
                  textToSpeak={currentPoemSpeechText}
                />
              </div>

              {/* Poem Frame */}
              <div className="text-center py-6">
                <h3 className="font-extrabold text-xl text-natural-text tracking-tight flex justify-center items-center gap-2">
                  <span>{currentPoem.title}</span>
                  <AudioFacilitator inline customButtonLabel="제목 듣기" textToSpeak={currentPoem.title} />
                </h3>
                <p className="text-xs text-natural-muted mt-1 mb-8">지은이: {currentPoem.author}</p>
                
                <div className="space-y-4">
                  {currentPoem.content.map((line, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="group p-2 rounded-xl hover:bg-natural-green-light transition-all flex items-center justify-center gap-2 relative cursor-help"
                      title="이 줄만 소리 내어 듣기"
                      onClick={() => {
                        sound.playPop();
                        // Synthesize speak for this single line
                        if (typeof window !== 'undefined' && window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                          const utterance = new SpeechSynthesisUtterance(line);
                          utterance.lang = 'ko-KR';
                          utterance.rate = 0.85;
                          window.speechSynthesis.speak(utterance);
                        }
                      }}
                    >
                      <p className="text-base font-bold text-natural-dark leading-relaxed tracking-wide group-hover:text-natural-green-dark transition-colors">
                        {line}
                      </p>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-natural-green-light text-natural-green-dark rounded-full cursor-pointer">
                        <Volume2 size={11} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Read Aloud Trigger Tip */}
              <div className="mt-8 bg-natural-green-light/40 rounded-2xl p-4 border border-natural-green-border/50 text-xs text-natural-dark leading-relaxed flex items-start gap-2.5 print:hidden">
                <Info size={14} className="text-natural-muted mt-0.5 shrink-0" />
                <span>
                  <strong>청각 학습 팁:</strong> 시의 한 줄을 가볍게 누르면 선생님이 읽어주는 것처럼 친근하고 느린 속도로 그 줄만 읽어줘요. 눈으로 따라 읽으며 소리를 들어보세요!
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT 7-COLUMNS: Dynamic Active Step Stage */}
          <section className="lg:col-span-7 space-y-6 print:hidden">
            
            {/* STAGE 0: POEM APPRECIATION INTRO SCREEN */}
            {activeStep === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-natural-border shadow-sm p-6 md:p-8 space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-natural-border pb-4">
                  <div className="p-3 bg-natural-green-light text-natural-green-dark rounded-2xl">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-natural-text">시를 눈과 귀로 신나게 느껴보아요!</h3>
                    <p className="text-xs text-natural-muted">지시문을 소리로 듣고, 시를 충분히 읽은 뒤에 퀴즈 놀이를 시작하세요.</p>
                  </div>
                </div>

                {/* Smart TTS Panel */}
                <AudioFacilitator
                  textToSpeak={[
                    '첫 번째 마당: 시 읽고 느끼기.',
                    '왼쪽에 있는 아름다운 시판을 보면서 글을 눈으로 따라가 보아요.',
                    '혹시 글씨가 너무 많아 답답하거나 소리로 듣는 게 더 좋다면, 초록색 낭독 버튼을 눌러보세요.',
                    '선생님이 상냥한 목소리로 시를 자세히 읽어 줄게요.',
                    '다 읽고 난 후에는 아래의 다음 단계 버튼을 눌러 일단계 퀴즈에 도전하세요!'
                  ]}
                  autoPlay
                />

                <div className="space-y-4 py-4">
                  <div className="bg-natural-green-light/60 border border-natural-green-border rounded-2xl p-5">
                    <h4 className="text-sm font-bold text-natural-green-dark flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={16} className="text-natural-green fill-natural-green-light" />
                      <span>이번 단원의 공부 약속</span>
                    </h4>
                    <p className="text-xs text-natural-dark leading-relaxed">
                      글이 너무 길어도 걱정하지 마세요! 우리 앱은 소리로 설명해 주는 친구들이 아주 많아요. 
                      언제든 마음에 드는 그림 카드와 도장을 꾹 누르며, 손을 바쁘게 움직여 놀이하듯 공부해요!
                    </p>
                  </div>

                  {/* Stamp Card Preview */}
                  <div className="bg-natural-green-light/30 border border-natural-green-border/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h5 className="text-xs font-bold text-natural-muted uppercase tracking-wider">나의 이번 시 참여 도장 모음판</h5>
                      <p className="text-sm font-extrabold text-natural-text mt-1">참여 도장 3개를 모두 모으면 보상이 열려요!</p>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((num) => (
                        <div
                          key={num}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold shadow-sm transition-all ${
                            num <= currentLog.stampsEarned
                              ? 'bg-natural-amber-light border-natural-amber text-natural-amber-dark scale-105'
                              : 'bg-white border-natural-border text-natural-muted'
                          }`}
                        >
                          <Star size={18} className={num <= currentLog.stampsEarned ? 'fill-natural-amber text-natural-amber' : ''} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => { sound.playPop(); setActiveStep(1); }}
                    className="flex items-center gap-2 px-6 py-3 bg-natural-green hover:bg-natural-green-hover text-white font-bold text-sm rounded-2xl transition-all shadow-sm cursor-pointer"
                  >
                    <span>1단계로 출발하기 (대상 찾기)</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}


            {/* STAGE 1: FIND SUBJECTS */}
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-natural-border shadow-sm p-6 md:p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-natural-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-natural-amber-light text-natural-amber rounded-2xl">
                      <Star className="h-6 w-6 fill-natural-amber/20" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-natural-text">1단계: 시 속에 나온 대상 찾기 🔎</h3>
                      <p className="text-xs text-natural-muted">시를 잘 기억하며 알맞은 그림 카드를 터치하여 골라보세요!</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-natural-amber-dark bg-natural-amber-light border border-natural-amber-border px-3 py-1 rounded-full">
                    첫 번째 도장 도전
                  </span>
                </div>

                {/* Task Instructions Speech TTS */}
                <AudioFacilitator
                  textToSpeak={[
                    '일단계 퀴즈 활동입니다. 시 속의 주요 낱말이나 대상을 골라보세요.',
                    '아래의 네 가지 그림 카드 중에서, 우리가 읽은 시 속에 꼭 등장한 대상을 마우스로 눌러보세요.',
                    '알맞은 대상을 두 개 모두 찾으면 반짝이는 노란 별 도장을 찍어줄게요!'
                  ]}
                  autoPlay
                />

                {/* Subtitle task card */}
                <div className="p-4 bg-natural-amber-light/40 border border-natural-amber-border rounded-2xl text-xs text-natural-amber-dark font-semibold leading-relaxed">
                  📢 <strong>지시 사항:</strong> 아래 그림 카드 4개 중에서 <strong>시 속에 등장하는 알맞은 대상 2개</strong>를 골라보세요! (한 개씩 꾹 누르면 소리와 설명이 나와요)
                </div>

                {/* 2x2 Tactile Card Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {currentPoem.subjects.map((item) => {
                    const isSelected = step1Selected.includes(item.id);
                    const isWrong = step1WrongChoices.includes(item.name);

                    return (
                      <motion.button
                        key={item.id}
                        whileHover={!isSelected && !isWrong ? { scale: 1.03 } : {}}
                        whileTap={!isSelected && !isWrong ? { scale: 0.97 } : {}}
                        onClick={() => handleSubjectClick(item)}
                        disabled={isSelected || isWrong}
                        className={`p-6 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-3 h-40 cursor-pointer ${
                          isSelected
                            ? 'bg-natural-green-light border-natural-green shadow-sm'
                            : isWrong
                            ? 'bg-natural-amber-light border-natural-amber-border/80 opacity-60 line-through'
                            : 'bg-white border-natural-border hover:border-natural-green hover:shadow-sm'
                        }`}
                      >
                        {/* Huge Emoji and Card Name */}
                        <div className="text-5xl select-none filter drop-shadow-sm">{item.emoji}</div>
                        <div className="font-extrabold text-base text-natural-text">{item.name}</div>
                        
                        {/* Little helper badge inside card */}
                        {isSelected && (
                          <div className="text-[10px] font-bold text-natural-green-dark bg-natural-green-light px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={10} className="fill-natural-green-light" />
                            <span>찾았어요!</span>
                          </div>
                        )}
                        {isWrong && (
                          <div className="text-[10px] font-bold text-natural-amber-dark bg-natural-amber-light px-2 py-0.5 rounded-full">
                            다시 생각해요
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Active Dynamic Feedback Panel */}
                {step1Feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-2.5 ${
                      step1Feedback.includes('딩동댕')
                        ? 'bg-natural-green-light border-natural-green-border text-natural-green-dark'
                        : 'bg-natural-amber-light border-natural-amber-border text-natural-amber-dark'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-white shrink-0 shadow-sm text-base">
                      {step1Feedback.includes('딩동댕') ? '🎉' : '💡'}
                    </div>
                    <span>{step1Feedback}</span>
                    <AudioFacilitator inline customButtonLabel="설명 듣기" textToSpeak={step1Feedback} />
                  </motion.div>
                )}

                {/* Navigation panel */}
                <div className="flex justify-between items-center pt-2 border-t border-natural-border">
                  <button
                    onClick={() => { sound.playPop(); setActiveStep(0); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-natural-dark bg-natural-green-light/40 hover:bg-natural-green-light/80 rounded-xl transition-all cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>이전 마당</span>
                  </button>

                  {currentLog.step1Completed ? (
                    <button
                      onClick={() => { sound.playPop(); setActiveStep(2); setCelebrationActive(false); }}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-natural-green hover:bg-natural-green-hover rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <span>2단계 도전하러 가기</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <span className="text-xs text-natural-muted font-bold italic">
                      대상 카드 2개를 모두 고르면 다음 마당이 열려요!
                    </span>
                  )}
                </div>
              </motion.div>
            )}


            {/* STAGE 2: SIMPLE QUESTION ABOUT ACADEMIC WORDS */}
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-natural-border shadow-sm p-6 md:p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-natural-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-natural-green-light text-natural-green-dark rounded-2xl">
                      <HelpCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-natural-text">2단계: 학습 도구어 풀이와 느낌 고르기 💭</h3>
                      <p className="text-xs text-natural-muted">어려운 낱말은 쉽게 말로 풀어줄게요! 나의 마음속 정답을 고르세요.</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-natural-amber-dark bg-natural-amber-light border border-natural-amber-border px-3 py-1 rounded-full">
                    두 번째 도장 도전
                  </span>
                </div>

                {/* Audio voice read of Academic term and question */}
                <AudioFacilitator
                  textToSpeak={[
                    '이단계 퀴즈 활동입니다. 학습 도구어의 뜻을 쉽게 풀어서 이해해 보아요.',
                    `이번에 배울 도구어는 바로 ${currentPoem.academicQuestion.word} 입니다.`,
                    `이 말의 진짜 뜻은, ${currentPoem.academicQuestion.simplifiedWord} 라는 뜻이에요.`,
                    `선생님이 질문할게요. ${currentPoem.academicQuestion.questionText}`,
                    '아래의 세 가지 느낌 선택지 중에서, 시를 읽으며 떠오른 마음의 정답을 골라보세요!'
                  ]}
                  autoPlay
                />

                {/* Academic Word Explanation Box */}
                <div className="bg-natural-text rounded-2xl p-5 text-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-md text-natural-green-light">
                      초등 국어 필수 도구어 학습
                    </span>
                  </div>
                  <h4 className="text-lg font-black mt-1 flex items-center gap-2">
                    <span>{currentPoem.academicQuestion.word}</span>
                    <span className="text-xs font-medium text-natural-green-light font-mono">(Academic Word)</span>
                  </h4>
                  <div className="h-px bg-white/20 my-3" />
                  <div className="flex gap-2.5 items-start text-sm">
                    <span className="text-base select-none mt-0.5">💡</span>
                    <div>
                      <span className="font-extrabold text-natural-amber">쉬운 구어체 설명:</span>
                      <p className="text-natural-green-light font-medium mt-0.5 leading-relaxed">
                        "{currentPoem.academicQuestion.simplifiedWord}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simplified Question Content */}
                <div className="bg-natural-green-light/40 rounded-2xl p-5 border border-natural-green-border/50 space-y-3">
                  <h5 className="text-xs font-bold text-natural-muted uppercase tracking-wider">선생님의 쉬운 질문 말 상자</h5>
                  <p className="text-sm font-bold text-natural-text leading-relaxed">
                    🙋‍♂️ "{currentPoem.academicQuestion.questionText}"
                  </p>
                </div>

                {/* 3 Choices selection (Slightly larger targets, touch-able) */}
                <div className="space-y-3">
                  {currentPoem.academicQuestion.choices.map((choice) => {
                    const isSelected = step2SelectedChoiceId === choice.id;
                    const isCorrect = choice.isCorrect;

                    return (
                      <motion.button
                        key={choice.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleChoiceClick(choice)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all cursor-pointer ${
                          isSelected
                            ? isCorrect
                              ? 'bg-natural-green-light border-natural-green text-natural-green-dark font-bold'
                              : 'bg-natural-amber-light border-natural-amber-border text-natural-amber-dark line-through'
                            : 'bg-white border-natural-border hover:border-natural-green hover:bg-natural-green-light/20'
                        }`}
                      >
                        <div className="text-3xl select-none filter drop-shadow-sm shrink-0">{choice.emoji}</div>
                        <div className="flex-1 text-sm font-semibold">{choice.text}</div>
                        
                        {/* Speaker inside choice */}
                        <AudioFacilitator inline customButtonLabel="듣기" textToSpeak={choice.text} />
                        
                        {/* Stamp check on choice */}
                        {isSelected && isCorrect && (
                          <div className="w-6 h-6 rounded-full bg-natural-green text-white flex items-center justify-center text-xs shrink-0 font-extrabold shadow-sm animate-bounce">
                            ✓
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Teacher/Parent support tooltip */}
                <div className="bg-natural-green-light/40 rounded-xl p-3 border border-natural-green-border/50 text-xs text-natural-muted flex items-start gap-2">
                  <Info size={14} className="text-natural-muted mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-natural-text">보호자 지도 길잡이:</span>
                    <p className="mt-0.5 text-natural-muted leading-relaxed italic">
                      "{currentPoem.academicQuestion.guideline}"
                    </p>
                  </div>
                </div>

                {/* Navigation panel */}
                <div className="flex justify-between items-center pt-2 border-t border-natural-border">
                  <button
                    onClick={() => { sound.playPop(); setActiveStep(1); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-natural-dark bg-natural-green-light/40 hover:bg-natural-green-light/80 rounded-xl transition-all cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>이전 마당</span>
                  </button>

                  {currentLog.step2Completed ? (
                    <button
                      onClick={() => { sound.playPop(); setActiveStep(3); setCelebrationActive(false); }}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-natural-green hover:bg-natural-green-hover rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <span>3단계 도전하러 가기</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <span className="text-xs text-natural-muted font-bold italic">
                      정답인 생각 선택지를 터치하면 세 번째 마당이 열려요!
                    </span>
                  )}
                </div>
              </motion.div>
            )}


            {/* STAGE 3: 3-SUBSTEP STRUCTURED SENTENCE PUZZLE CARDS */}
            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-natural-border shadow-sm p-6 md:p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-natural-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-natural-green-light text-natural-green-dark rounded-2xl">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-natural-text">3단계: 내 느낌을 담은 문장 퍼즐 카드 🧩</h3>
                      <p className="text-xs text-natural-muted">순서대로 알맞은 카드를 꽂아 멋진 느낌 문장을 완성해 보세요!</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-natural-green-dark bg-natural-green-light border border-natural-green-border px-3 py-1 rounded-full">
                    마지막 도장 도전
                  </span>
                </div>

                {/* Substep TTS instructions */}
                <AudioFacilitator
                  textToSpeak={[
                    '삼단계 문장 만들기 활동입니다. 세 개의 빈 슬롯에 맞는 알맞은 단어 카드를 차례대로 꽂아주세요.',
                    '첫 번째 칸에는 주인공 카드를 꽂아야 해요.',
                    '두 번째 칸에는 주인공이 무엇을 마시거나 하고 있는지 행동 카드를 꽂으세요.',
                    '마지막 세 번째 칸에는 어떤 마음이 들었는지 감정 느낌 카드를 완성하세요.',
                    '성공하면 세 번째 노란 별 도장을 찍고 오늘의 대단원 꽃밭 공부를 우수하게 졸업하게 될 거예요!'
                  ]}
                  autoPlay
                />

                {/* Reset button inside task bar */}
                <div className="flex justify-between items-center gap-4 bg-natural-green-light/40 border border-natural-green-border/50 p-3 rounded-2xl">
                  <span className="text-xs font-bold text-natural-dark">
                    💡 아래 단어 카드를 1번부터 순서대로 눌러 슬롯에 꽂아보세요!
                  </span>
                  <button
                    onClick={handleResetStep3}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-natural-muted bg-white hover:bg-natural-green-light/50 border border-natural-border rounded-lg cursor-pointer transition-all"
                  >
                    <RotateCcw size={10} />
                    <span>카드 정리하기</span>
                  </button>
                </div>

                {/* The Pegboard Puzzle Plate with 3 Slots */}
                <div className="bg-natural-green-light/20 rounded-3xl p-6 border-2 border-dashed border-natural-border flex flex-col md:flex-row items-stretch gap-4">
                  
                  {/* Slot 1: Subject (order 1) */}
                  <div className={`flex-1 min-h-[90px] rounded-2xl p-3 border-2 transition-all flex flex-col justify-between items-center ${
                    slot1 
                      ? 'bg-natural-amber-light/80 border-natural-amber-border' 
                      : 'bg-white border-dashed border-natural-border animate-pulse'
                  }`}>
                    <span className="text-[10px] font-bold text-natural-muted">1. 누가 / 무엇이</span>
                    {slot1 ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="font-bold text-sm bg-white border border-natural-border shadow-sm p-3 rounded-xl text-center w-full select-none"
                      >
                        {slot1.text}
                      </motion.div>
                    ) : (
                      <div className="text-xs text-natural-muted font-bold italic py-2">
                        비어있음 🕳️
                      </div>
                    )}
                    {slot1 && <span className="text-[10px] font-extrabold text-natural-green-dark flex items-center gap-1">✓ 완료</span>}
                  </div>

                  {/* Arrow separator */}
                  <div className="flex items-center justify-center text-natural-muted">
                    <ArrowRight size={20} className="rotate-90 md:rotate-0" />
                  </div>

                  {/* Slot 2: Action (order 2) */}
                  <div className={`flex-1 min-h-[90px] rounded-2xl p-3 border-2 transition-all flex flex-col justify-between items-center ${
                    slot2 
                      ? 'bg-natural-green-light/50 border-natural-green-border' 
                      : slot1
                      ? 'bg-white border-dashed border-natural-green-border animate-pulse'
                      : 'bg-natural-green-light/10 border-dashed border-natural-border opacity-50'
                  }`}>
                    <span className="text-[10px] font-bold text-natural-muted">2. 어떻게 하며</span>
                    {slot2 ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="font-bold text-sm bg-white border border-natural-border shadow-sm p-3 rounded-xl text-center w-full select-none"
                      >
                        {slot2.text}
                      </motion.div>
                    ) : (
                      <div className="text-xs text-natural-muted font-bold italic py-2">
                        {slot1 ? '여기에 꽂으세요 🕳️' : '1번 먼저 채우기'}
                      </div>
                    )}
                    {slot2 && <span className="text-[10px] font-extrabold text-natural-green-dark flex items-center gap-1">✓ 완료</span>}
                  </div>

                  {/* Arrow separator */}
                  <div className="flex items-center justify-center text-natural-muted">
                    <ArrowRight size={20} className="rotate-90 md:rotate-0" />
                  </div>

                  {/* Slot 3: Feeling (order 3) */}
                  <div className={`flex-1 min-h-[90px] rounded-2xl p-3 border-2 transition-all flex flex-col justify-between items-center ${
                    slot3 
                      ? 'bg-natural-amber-light/80 border-natural-amber-border' 
                      : slot2
                      ? 'bg-white border-dashed border-natural-amber-border animate-pulse'
                      : 'bg-natural-green-light/10 border-dashed border-natural-border opacity-50'
                  }`}>
                    <span className="text-[10px] font-bold text-natural-muted">3. 어떤 마음인지</span>
                    {slot3 ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="font-bold text-sm bg-white border border-natural-border shadow-sm p-3 rounded-xl text-center w-full select-none"
                      >
                        {slot3.text}
                      </motion.div>
                    ) : (
                      <div className="text-xs text-natural-muted font-bold italic py-2">
                        {slot2 ? '여기에 꽂으세요 🕳️' : '2번 먼저 채우기'}
                      </div>
                    )}
                    {slot3 && <span className="text-[10px] font-extrabold text-natural-green-dark flex items-center gap-1">✓ 완료</span>}
                  </div>

                </div>

                {/* Substep Feedback text with sound trigger */}
                {step3Feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-natural-green-light border border-natural-green-border rounded-2xl text-xs font-bold text-natural-green-dark flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Smile size={14} className="text-natural-green-dark shrink-0" />
                      <span>{step3Feedback}</span>
                    </div>
                    <AudioFacilitator inline customButtonLabel="설명 듣기" textToSpeak={step3Feedback} />
                  </motion.div>
                )}

                {/* Available Card Pool for the student to select */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-natural-muted uppercase tracking-wider">단어 카드 꽃밭 서랍</h4>
                  
                  {/* Category Lists to provide absolute structured support */}
                  <div className="space-y-3">
                    {/* 1. Subjects Cards Pool */}
                    <div className={`p-4 rounded-2xl border-2 transition-all ${!slot1 ? 'bg-natural-amber-light/30 border-natural-amber-border' : 'bg-natural-green-light/10 border-natural-border opacity-70'}`}>
                      <div className="text-[10px] font-bold text-natural-muted uppercase mb-2">1번 카드들 (주인공)</div>
                      <div className="flex flex-wrap gap-2.5">
                        {currentPoem.sentenceCards
                          .filter(c => c.category === 'subject')
                          .map(card => {
                            const isSlotted = slot1?.id === card.id;
                            return (
                              <button
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                disabled={isSlotted}
                                className={`px-4 py-3 rounded-xl font-bold text-sm border-2 cursor-pointer transition-all ${
                                  isSlotted
                                    ? 'bg-natural-green-light/20 border-natural-border text-natural-muted line-through'
                                    : 'bg-white border-natural-amber-border text-natural-text hover:bg-natural-amber-light hover:border-natural-amber shadow-sm'
                                }`}
                              >
                                {card.text}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* 2. Actions Cards Pool */}
                    <div className={`p-4 rounded-2xl border-2 transition-all ${slot1 && !slot2 ? 'bg-natural-green-light/30 border-natural-green-border' : 'bg-natural-green-light/10 border-natural-border opacity-70'}`}>
                      <div className="text-[10px] font-bold text-natural-muted uppercase mb-2">2번 카드들 (행동/모습)</div>
                      <div className="flex flex-wrap gap-2.5">
                        {currentPoem.sentenceCards
                          .filter(c => c.category === 'action')
                          .map(card => {
                            const isSlotted = slot2?.id === card.id;
                            return (
                              <button
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                disabled={isSlotted || !slot1}
                                className={`px-4 py-3 rounded-xl font-bold text-sm border-2 cursor-pointer transition-all ${
                                  isSlotted
                                    ? 'bg-natural-green-light/20 border-natural-border text-natural-muted line-through'
                                    : !slot1
                                    ? 'bg-natural-green-light/10 border-natural-border text-natural-muted opacity-50 cursor-not-allowed'
                                    : 'bg-white border-natural-green-border text-natural-text hover:bg-natural-green-light hover:border-natural-green shadow-sm'
                                }`}
                              >
                                {card.text}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* 3. Feelings Cards Pool */}
                    <div className={`p-4 rounded-2xl border-2 transition-all ${slot2 && !slot3 ? 'bg-natural-amber-light/30 border-natural-amber-border' : 'bg-natural-green-light/10 border-natural-border opacity-70'}`}>
                      <div className="text-[10px] font-bold text-natural-muted uppercase mb-2">3번 카드들 (감정/느낌)</div>
                      <div className="flex flex-wrap gap-2.5">
                        {currentPoem.sentenceCards
                          .filter(c => c.category === 'feeling')
                          .map(card => {
                            const isSlotted = slot3?.id === card.id;
                            return (
                              <button
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                disabled={isSlotted || !slot2}
                                className={`px-4 py-3 rounded-xl font-bold text-sm border-2 cursor-pointer transition-all ${
                                  isSlotted
                                    ? 'bg-natural-green-light/20 border-natural-border text-natural-muted line-through'
                                    : !slot2
                                    ? 'bg-natural-green-light/10 border-natural-border text-natural-muted opacity-50 cursor-not-allowed'
                                    : 'bg-white border-natural-amber-border text-natural-text hover:bg-natural-amber-light hover:border-natural-amber shadow-sm'
                                }`}
                              >
                                {card.text}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Navigation panel */}
                <div className="flex justify-between items-center pt-2 border-t border-natural-border">
                  <button
                    onClick={() => { sound.playPop(); setActiveStep(2); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-natural-dark bg-natural-green-light/40 hover:bg-natural-green-light/80 rounded-xl transition-all cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>이전 마당</span>
                  </button>

                  <div className="text-xs text-natural-green-dark font-bold italic">
                    {currentLog.step3Completed ? '🎉 축하합니다! 세 장의 도장을 모두 모았습니다.' : '3단계 카드 조립을 완료해 보세요!'}
                  </div>
                </div>
              </motion.div>
            )}

          </section>

        </div>

        {/* INTERACTIVE FULL-SCREEN STAMP CELEBRATION MODAL OVERLAY */}
        <AnimatePresence>
          {celebrationActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-natural-text/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 text-center border border-natural-border shadow-sm relative overflow-hidden"
              >
                {/* Visual confetti ribbons */}
                <div className="absolute -top-12 -left-12 w-28 h-28 bg-natural-green-light rounded-full blur-2xl opacity-60 pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-natural-amber-light rounded-full blur-2xl opacity-60 pointer-events-none" />

                <div className="text-6xl animate-bounce mb-4 select-none">🎉</div>
                
                <h3 className="text-xl font-extrabold text-natural-text leading-tight">
                  참 잘했어요! 미션 대성공!
                </h3>
                
                <p className="text-sm text-natural-muted mt-2">
                  학생의 뛰어난 집중력과 적극적인 조작 능력을 칭찬합니다!
                </p>

                {/* The Stamp Graphic with Animation */}
                <div className="my-8 flex justify-center">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                    transition={{ duration: 0.6 }}
                    className="w-28 h-28 rounded-full border-4 border-natural-amber bg-natural-amber-light flex flex-col items-center justify-center text-natural-amber shadow-sm relative"
                  >
                    <Star className="h-14 w-14 fill-current text-natural-amber" />
                    <span className="text-[10px] font-black tracking-wider uppercase text-natural-amber-dark mt-0.5">
                      참 잘했어요
                    </span>
                    {/* Outer ring */}
                    <div className="absolute inset-1 border border-natural-amber-border rounded-full border-dashed" />
                  </motion.div>
                </div>

                {/* Feedback TTS block */}
                <div className="p-4 bg-natural-green-light/40 border border-natural-green-border/50 rounded-2xl mb-6 text-sm font-bold text-natural-dark leading-relaxed flex items-center justify-between">
                  <span className="flex-1 text-left">
                    "{stampFeedbackText}"
                  </span>
                  <AudioFacilitator inline customButtonLabel="도장 칭찬 듣기" textToSpeak={stampFeedbackText} />
                </div>

                {/* Close/Proceed Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => setCelebrationActive(false)}
                    className="w-full px-5 py-3 bg-natural-green-light hover:bg-natural-green-light/80 text-natural-dark font-bold text-sm rounded-2xl cursor-pointer transition-all"
                  >
                    화면 닫고 계속하기
                  </button>
                  
                  {activeStep < 3 ? (
                    <button
                      onClick={() => {
                        sound.playPop();
                        setCelebrationActive(false);
                        setActiveStep(prev => prev + 1);
                      }}
                      className="w-full px-5 py-3 bg-natural-green hover:bg-natural-green-hover text-white font-bold text-sm rounded-2xl cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1"
                    >
                      <span>다음 단계로 넘어가기</span>
                      <ChevronRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playPop();
                        setCelebrationActive(false);
                        // Open teacher dashboard or multicultural guide automatically for comprehensive wrap up
                        setDashboardVisible(true);
                        const element = document.getElementById('evaluation-anchor');
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full px-5 py-3 bg-natural-text hover:bg-natural-text/90 text-white font-bold text-sm rounded-2xl cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1"
                    >
                      <span>최종 평가 보고서 확인하기</span>
                      <ChevronRight size={15} />
                    </button>
                  )}
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* POEM CREATOR MODAL OVERLAY */}
        <AnimatePresence>
          {isPoemCreatorOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl max-w-2xl w-full border border-natural-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-5 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-white animate-pulse" />
                    <h3 className="text-base font-extrabold tracking-tight">새로운 국어 학습 시화판 만들기</h3>
                  </div>
                  <button
                    onClick={() => { sound.playPop(); setIsPoemCreatorOpen(false); }}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center font-bold text-white transition-all cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Tab Headers */}
                <div className="flex border-b border-natural-border bg-natural-green-light/25 shrink-0">
                  <button
                    onClick={() => { sound.playPop(); setCreatorTab('ai'); }}
                    className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      creatorTab === 'ai'
                        ? 'border-rose-500 text-rose-600 bg-white'
                        : 'border-transparent text-natural-muted hover:text-natural-dark hover:bg-natural-green-light/30'
                    }`}
                  >
                    🤖 AI 시인에게 자동 제작 부탁하기
                  </button>
                  <button
                    onClick={() => { sound.playPop(); setCreatorTab('manual'); }}
                    className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      creatorTab === 'manual'
                        ? 'border-pink-500 text-pink-600 bg-white'
                        : 'border-transparent text-natural-muted hover:text-natural-dark hover:bg-natural-green-light/30'
                    }`}
                  >
                    ✍️ 내가 직접 맞춤 시화 퀴즈 쓰기
                  </button>
                </div>

                {/* Modal Scrollable Content Container */}
                <div className="p-6 overflow-y-auto space-y-5 text-sm leading-relaxed">
                  
                  {creatorTab === 'ai' && (
                    <div className="space-y-4">
                      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-800 leading-relaxed">
                        <p className="font-bold flex items-center gap-1.5 mb-1 text-rose-900">
                          <Sparkles size={14} className="text-rose-500 fill-rose-100" />
                          <span>AI 시인의 생각 상자</span>
                        </p>
                        주제(예: 가을 낙엽, 아기 오리, 하얀 눈사람, 소중한 친구)를 입력하면, 초등 3학년 국어 교육과정에 맞춘 따스한 4줄 동시, 주요 낱말 돋보기 퀴즈, 감정 생각 잇기 낱말 카드, 그리고 다문화 부모님을 위한 4개 국어 번역 가이드까지 완벽한 전체 패키지를 AI가 자동으로 뚝딱 완성해 줍니다!
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-natural-text block">새 시의 예쁜 주제를 적어주세요</label>
                        <input
                          type="text"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          placeholder="예: 여름바다, 노란 은행잎, 우리 강아지, 가을바람"
                          disabled={isGenerating}
                          className="w-full px-4 py-3 rounded-xl border border-natural-border bg-natural-bg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all text-natural-text"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isGenerating) handleGenerateAIPoem();
                          }}
                        />
                      </div>

                      {generationError && (
                        <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold leading-relaxed">
                          ⚠️ 생성 실패: {generationError}
                        </div>
                      )}

                      {isGenerating ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                          <div className="text-sm font-extrabold text-rose-600 tracking-tight animate-pulse mt-2">
                            AI 시인이 아름다운 생각을 모아 시를 짓는 중... ✍️🌸
                          </div>
                          <p className="text-xs text-natural-muted">
                            이 작업은 약 5~10초 정도 소요되며 완성 즉시 학습 꽃밭에 자동으로 심어집니다!
                          </p>
                        </div>
                      ) : (
                        <div className="pt-4 flex justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => { sound.playPop(); setIsPoemCreatorOpen(false); }}
                            className="px-4 py-2.5 rounded-xl border border-natural-border text-xs font-bold text-natural-dark hover:bg-natural-green-light/40 transition-all cursor-pointer"
                          >
                            닫기
                          </button>
                          <button
                            type="button"
                            onClick={handleGenerateAIPoem}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-extrabold hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <Sparkles size={14} />
                            <span>아름다운 시화 생성하기 ✨</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {creatorTab === 'manual' && (
                    <div className="space-y-5 text-xs text-natural-dark">
                      <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 text-xs text-pink-800 leading-relaxed">
                        선생님이 원하는 맞춤형 동시와 교과 활동 퀴즈 데이터를 직접 정성껏 입력하여 단 몇 초 만에 학생만을 위한 전용 학습 마당을 개설할 수 있습니다.
                      </div>

                      {/* Title & Author */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-natural-text block">1. 시 제목</label>
                          <input
                            type="text"
                            value={manualTitle}
                            onChange={(e) => setManualTitle(e.target.value)}
                            placeholder="예: 가을 낙엽"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-natural-border bg-natural-bg text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-natural-muted block">지은이</label>
                          <input
                            type="text"
                            disabled
                            value="선생님 시인 (수정불가)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-natural-border bg-gray-50 text-xs text-gray-400"
                          />
                        </div>
                      </div>

                      {/* Poem 4 Lines */}
                      <div className="space-y-2">
                        <label className="font-bold text-natural-text block">2. 시 내용 (느낌 가득 4줄)</label>
                        <div className="space-y-1.5">
                          {[0, 1, 2, 3].map((idx) => (
                            <input
                              key={idx}
                              type="text"
                              value={manualLines[idx]}
                              onChange={(e) => {
                                const copy = [...manualLines];
                                copy[idx] = e.target.value;
                                setManualLines(copy);
                              }}
                              placeholder={`${idx + 1}째 줄 내용을 적어주세요.`}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-natural-border bg-natural-bg text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Step 1 Quiz: Subjects (2 correct, 2 wrong) */}
                      <div className="space-y-3 pt-2 border-t border-natural-border">
                        <label className="font-bold text-natural-text block">3. [1단계] 돋보기 주요 낱말 4개</label>
                        <p className="text-[10px] text-natural-muted mb-2">시 본문에 직접 등장하는 단어 2개(정답)와 등장하지 않는 단어 2개(오답)를 각각의 힌트와 함께 넣어주세요.</p>
                        
                        <div className="space-y-3 bg-natural-green-light/25 p-4 rounded-2xl border border-natural-green-border/50">
                          {/* Correct Words */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-natural-green-dark">🟢 정답 단어 1</span>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  maxLength={1}
                                  value={manualKeyword1Emoji}
                                  onChange={(e) => setManualKeyword1Emoji(e.target.value)}
                                  placeholder="🌸"
                                  className="w-10 text-center px-1 py-2 rounded-lg border border-natural-border bg-white text-xs"
                                  title="매칭 이모지"
                                />
                                <input
                                  type="text"
                                  value={manualKeyword1}
                                  onChange={(e) => setManualKeyword1(e.target.value)}
                                  placeholder="예: 예쁜 꽃"
                                  className="flex-1 px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                                />
                              </div>
                              <input
                                type="text"
                                value={manualKeyword1Hint}
                                onChange={(e) => setManualKeyword1Hint(e.target.value)}
                                placeholder="정답 힌트 (예: 시 속 두 번째 줄에 나와요.)"
                                className="w-full px-2 py-1.5 rounded-lg border border-natural-border/60 bg-white text-[10px]"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-natural-green-dark">🟢 정답 단어 2</span>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  maxLength={1}
                                  value={manualKeyword2Emoji}
                                  onChange={(e) => setManualKeyword2Emoji(e.target.value)}
                                  placeholder="🍃"
                                  className="w-10 text-center px-1 py-2 rounded-lg border border-natural-border bg-white text-xs"
                                  title="매칭 이모지"
                                />
                                <input
                                  type="text"
                                  value={manualKeyword2}
                                  onChange={(e) => setManualKeyword2(e.target.value)}
                                  placeholder="예: 향기"
                                  className="flex-1 px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                                />
                              </div>
                              <input
                                type="text"
                                value={manualKeyword2Hint}
                                onChange={(e) => setManualKeyword2Hint(e.target.value)}
                                placeholder="정답 힌트 (예: 시 속에 향기가 가득 퍼져요.)"
                                className="w-full px-2 py-1.5 rounded-lg border border-natural-border/60 bg-white text-[10px]"
                              />
                            </div>
                          </div>

                          {/* Incorrect Words */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-natural-green-border/30 pt-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-500">🔴 오답 단어 1</span>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  maxLength={1}
                                  value={manualWrong1Emoji}
                                  onChange={(e) => setManualWrong1Emoji(e.target.value)}
                                  placeholder="🚒"
                                  className="w-10 text-center px-1 py-2 rounded-lg border border-natural-border bg-white text-xs"
                                />
                                <input
                                  type="text"
                                  value={manualWrong1}
                                  onChange={(e) => setManualWrong1(e.target.value)}
                                  placeholder="예: 소방차"
                                  className="flex-1 px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                                />
                              </div>
                              <input
                                type="text"
                                value={manualWrong1Hint}
                                onChange={(e) => setManualWrong1Hint(e.target.value)}
                                placeholder="오답 힌트 (예: 시 속에는 소방차가 없답니다.)"
                                className="w-full px-2 py-1.5 rounded-lg border border-natural-border/60 bg-white text-[10px]"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-500">🔴 오답 단어 2</span>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  maxLength={1}
                                  value={manualWrong2Emoji}
                                  onChange={(e) => setManualWrong2Emoji(e.target.value)}
                                  placeholder="⛄"
                                  className="w-10 text-center px-1 py-2 rounded-lg border border-natural-border bg-white text-xs"
                                />
                                <input
                                  type="text"
                                  value={manualWrong2}
                                  onChange={(e) => setManualWrong2(e.target.value)}
                                  placeholder="예: 눈사람"
                                  className="flex-1 px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                                />
                              </div>
                              <input
                                type="text"
                                value={manualWrong2Hint}
                                onChange={(e) => setManualWrong2Hint(e.target.value)}
                                placeholder="오답 힌트 (예: 겨울 시가 아니라 눈사람은 없어요.)"
                                className="w-full px-2 py-1.5 rounded-lg border border-natural-border/60 bg-white text-[10px]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 Quiz: Feelings Choice */}
                      <div className="space-y-3 pt-2 border-t border-natural-border">
                        <label className="font-bold text-natural-text block">4. [2단계] 학술 학습어 결합형 감정 퀴즈</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-natural-amber-light/20 p-4 rounded-2xl border border-natural-amber-border/40">
                          <div className="space-y-1.5 sm:col-span-2">
                            <span className="text-[10px] font-bold text-natural-amber-dark">사용할 교과 학습 어휘 & 쉬운 풀이</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={manualWord}
                                onChange={(e) => setManualWord(e.target.value)}
                                placeholder="예: 상상하기"
                                className="px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                              />
                              <input
                                type="text"
                                value={manualWordSimple}
                                onChange={(e) => setManualWordSimple(e.target.value)}
                                placeholder="예: 머릿속으로 그림 그려보기"
                                className="px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2 border-t border-natural-amber-border/20 pt-2">
                            <span className="text-[10px] font-bold text-natural-amber-dark">학생에게 물어볼 친절한 퀴즈 질문</span>
                            <input
                              type="text"
                              value={manualQuestionText}
                              onChange={(e) => setManualQuestionText(e.target.value)}
                              placeholder="예: 꽃이 피고 향기가 날 때 마음이 어땠을까요?"
                              className="w-full px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs font-bold"
                            />
                          </div>

                          {/* Options (1 correct, 2 wrong) */}
                          <div className="space-y-1.5 sm:col-span-2">
                            <span className="text-[10px] font-bold text-natural-green-dark">🟢 올바른 감정 설명 (선택지 1 - 정답)</span>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                maxLength={1}
                                value={manualChoice1Emoji}
                                onChange={(e) => setManualChoice1Emoji(e.target.value)}
                                className="w-10 text-center px-1 py-2 rounded-lg border border-natural-border bg-white text-xs"
                              />
                              <input
                                type="text"
                                value={manualChoice1}
                                onChange={(e) => setManualChoice1(e.target.value)}
                                placeholder="정답 텍스트 (예: 꽃향기처럼 내 마음에 기쁨이 가득해져요.)"
                                className="flex-1 px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-red-500">🔴 틀린 감정 1 (선택지 2 - 오답)</span>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                maxLength={1}
                                value={manualChoice2Emoji}
                                onChange={(e) => setManualChoice2Emoji(e.target.value)}
                                className="w-10 text-center px-1 py-2 rounded-lg border border-natural-border bg-white text-xs"
                              />
                              <input
                                type="text"
                                value={manualChoice2}
                                onChange={(e) => setManualChoice2(e.target.value)}
                                placeholder="오답 텍스트 (예: 어둡고 슬픈 비가 내리는 기분이에요.)"
                                className="flex-1 px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-red-500">🔴 틀린 감정 2 (선택지 3 - 오답)</span>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                maxLength={1}
                                value={manualChoice3Emoji}
                                onChange={(e) => setManualChoice3Emoji(e.target.value)}
                                className="w-10 text-center px-1 py-2 rounded-lg border border-natural-border bg-white text-xs"
                              />
                              <input
                                type="text"
                                value={manualChoice3}
                                onChange={(e) => setManualChoice3(e.target.value)}
                                placeholder="오답 텍스트 (예: 장난감이 망가져 잔뜩 화가 나요.)"
                                className="flex-1 px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Sentence Cards assembly */}
                      <div className="space-y-3 pt-2 border-t border-natural-border">
                        <label className="font-bold text-natural-text block">5. [3단계] 한 문장 만들기 완성 조각 카드</label>
                        <p className="text-[10px] text-natural-muted">누가(주어) &rarr; 무엇을 하여(행동) &rarr; 어떠하다(느낌) 세 개의 카드가 순서대로 꽂혔을 때 하나의 알맞은 완성형 느낌 문장이 되도록 조합해 주세요.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-blue-50/20 p-4 rounded-2xl border border-blue-100">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-blue-600">🧩 1번 카드 (누가/주어)</span>
                            <input
                              type="text"
                              value={manualCardSubject}
                              onChange={(e) => setManualCardSubject(e.target.value)}
                              placeholder="예: 🌸 예쁜 꽃과 향기가"
                              className="w-full px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-blue-600">🧩 2번 카드 (어떻게 하여/행동)</span>
                            <input
                              type="text"
                              value={manualCardAction}
                              onChange={(e) => setManualCardAction(e.target.value)}
                              placeholder="예: 💖 온 마음으로 활짝 펼쳐져"
                              className="w-full px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-blue-600">🧩 3번 카드 (어떠한가/느낌)</span>
                            <input
                              type="text"
                              value={manualCardFeeling}
                              onChange={(e) => setManualCardFeeling(e.target.value)}
                              placeholder="예: 🥰 우리를 정말 행복하게 해줘요."
                              className="w-full px-2.5 py-2 rounded-lg border border-natural-border bg-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-2.5 border-t border-natural-border">
                        <button
                          type="button"
                          onClick={() => { sound.playPop(); setIsPoemCreatorOpen(false); }}
                          className="px-4 py-2 text-xs font-bold border border-natural-border rounded-xl text-natural-dark hover:bg-natural-green-light/40 transition-all cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveManualPoem}
                          className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-extrabold transition-all cursor-pointer shadow-sm"
                        >
                          선생님 시화판 만들기 완료!
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MULTICULTURAL FAMILY GUIDE SECTION */}
        {guideVisible && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="print:hidden"
          >
            <MulticulturalGuide currentPoem={currentPoem} />
          </motion.section>
        )}

        {/* TEACHER EVALUATION & OBSERVATION DASHBOARD SECTION */}
        <div id="evaluation-anchor" />
        {dashboardVisible && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EvaluationDashboard
              logs={logs}
              onUpdateObservation={handleUpdateObservation}
              onResetLogs={handleResetAllLogs}
              poems={poems}
            />
          </motion.section>
        )}

      </main>

      {/* Persistent soft watermark footer - clean and elegant */}
      <footer className="text-center text-natural-muted text-xs mt-16 max-w-md mx-auto px-4 border-t border-natural-border pt-6 print:hidden">
        <p>초등 3학년 국어 "생각과 느낌을 나누어요" 단원 특수교육용 학습 공작실</p>
        <p className="mt-1">© 2026 국어 생각과 느낌 나누기 학습 꽃밭. All rights reserved.</p>
      </footer>
    </div>
  );
}
