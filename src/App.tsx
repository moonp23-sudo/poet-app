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
  const [poems] = useState<Poem[]>(poemsData);
  const [selectedPoemId, setSelectedPoemId] = useState<string>(poemsData[0].id);
  const currentPoem = poems.find(p => p.id === selectedPoemId) || poemsData[0];

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

  // Load logs on startup
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading logs', e);
      }
    } else {
      // Initialize logs
      const initialLogs: Record<string, EvaluationLog> = {};
      poemsData.forEach(p => {
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
    }
  }, []);

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
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {poems.map((poem) => (
              <button
                key={poem.id}
                onClick={() => handlePoemSelect(poem.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedPoemId === poem.id
                    ? 'bg-natural-green text-white shadow-sm'
                    : 'bg-natural-green-light/60 text-natural-dark hover:bg-natural-green-light'
                }`}
              >
                {poem.title}
              </button>
            ))}
          </div>

          {/* Support options shortcut */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { sound.playPop(); setGuideVisible(!guideVisible); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                guideVisible 
                  ? 'bg-natural-amber text-white shadow-sm' 
                  : 'bg-natural-amber-light text-natural-amber-dark border border-natural-amber-border hover:bg-natural-amber-bg'
              }`}
            >
              <Languages size={14} />
              <span>다문화 학부모 안내</span>
            </button>
            <button
              onClick={() => { sound.playPop(); setDashboardVisible(!dashboardVisible); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dashboardVisible 
                  ? 'bg-natural-green text-white shadow-sm' 
                  : 'bg-natural-green-light text-natural-green-dark border border-natural-green-border hover:bg-natural-green-hover hover:text-white'
              }`}
            >
              <UserCheck size={14} />
              <span>교사 관찰 기록</span>
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
