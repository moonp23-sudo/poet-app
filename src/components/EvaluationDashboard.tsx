import React, { useState } from 'react';
import { ClipboardList, Star, Award, Printer, CheckSquare, RefreshCw, Save, CheckCircle2, XCircle } from 'lucide-react';
import { EvaluationLog, Poem } from '../types';

interface EvaluationDashboardProps {
  logs: Record<string, EvaluationLog>;
  onUpdateObservation: (poemId: string, text: string) => void;
  onResetLogs: () => void;
  poems: Poem[];
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  logs,
  onUpdateObservation,
  onResetLogs,
  poems
}) => {
  const [editingPoemId, setEditingPoemId] = useState<string | null>(poems[0]?.id || null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  React.useEffect(() => {
    if (editingPoemId && logs[editingPoemId]) {
      setTempNotes(logs[editingPoemId].teacherObservation);
    }
  }, [editingPoemId, logs]);

  const handleSaveNotes = () => {
    if (editingPoemId) {
      onUpdateObservation(editingPoemId, tempNotes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-natural-border shadow-sm p-6 md:p-8 mt-12 print:shadow-none print:border-none print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-natural-border pb-5 mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-natural-green-light text-natural-green-dark rounded-2xl">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-natural-text">교사 관찰 기록 및 개별화 교육 평가서</h3>
            <p className="text-xs text-natural-muted mt-0.5">
              국어 교과 목표에 따른 학생의 학습 도달 수준, 문항 오답 기록, 교사 관찰 소견을 종합한 자동 보고서입니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-natural-muted bg-natural-green-light/40 hover:bg-natural-green-light/80 rounded-xl transition-all cursor-pointer"
            title="학습 데이터 초기화"
          >
            <RefreshCw size={13} />
            <span>기록 초기화</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-natural-green hover:bg-natural-green-hover rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Printer size={13} />
            <span>평가서 인쇄 / PDF 출력</span>
          </button>
        </div>
      </div>

      {/* Screen only - Poem Selector Tabs for Editing Notes */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-natural-green-light/40 rounded-2xl mb-6 max-w-full print:hidden">
        {poems.map((poem) => {
          const log = logs[poem.id];
          const hasStamps = log ? log.stampsEarned > 0 : false;
          return (
            <button
              key={poem.id}
              onClick={() => {
                setEditingPoemId(poem.id);
                setIsSaved(false);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                editingPoemId === poem.id
                  ? 'bg-white text-natural-green-dark shadow-sm'
                  : 'text-natural-muted hover:bg-natural-green-light/60'
              }`}
            >
              <span>{poem.title}</span>
              {hasStamps && (
                <div className="flex gap-0.5 text-natural-amber">
                  {Array.from({ length: log.stampsEarned }).map((_, i) => (
                    <Star key={i} size={10} className="fill-current" />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Observation input section - Screen only */}
      {editingPoemId && (
        <div className="bg-natural-green-light/10 border border-natural-border rounded-2xl p-5 mb-8 print:hidden">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="text-sm font-bold text-natural-text">
              [{logs[editingPoemId]?.poemTitle}] 교사 누가 기록 & 종합 관찰 소견
            </h4>
            <span className="text-xs text-natural-muted">학부모 피드백과 학교 기록용으로 활용하세요</span>
          </div>
          <div className="relative">
            <textarea
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              placeholder="예: 텍스트 분량이 작아 두통을 호소하지 않고 읽기 시작함. 교사의 TTS 낭독 촉진을 듣고 인물과 낱말 찾기(1단계)를 힌트 없이 스스로 성공함. 비교하시오 등의 학습 도구어는 말로 풀어서 설명해 주니 3지 선다 느낌 카드에서 긍정적인 반응을 보임. 3단계 문장 배열 카드 조립 시, 마우스 조작을 하며 신체적 조작에 즐거움을 표시함."
              className="w-full min-h-[120px] p-4 text-sm bg-white border border-natural-border rounded-xl focus:outline-none focus:ring-2 focus:ring-natural-green focus:border-natural-green placeholder-natural-muted/60 text-natural-text"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {isSaved && (
                <span className="text-xs text-natural-green-dark font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  저장되었습니다
                </span>
              )}
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-natural-green hover:bg-natural-green-hover rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <Save size={12} />
                <span>관찰 기록 저장</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable PDF/Print view starts here */}
      <div className="space-y-8">
        {/* Printable Profile Banner */}
        <div className="hidden print:flex items-center justify-between border-b-2 border-natural-green-dark pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-natural-green-dark">국어 생각과 느낌 나누기 교육 평가서</h1>
            <p className="text-xs text-natural-muted mt-1">대단원: 생각과 느낌을 나누어요 | 중단원: 시를 읽고 생각이나 느낌 나누기</p>
          </div>
          <div className="border border-natural-border p-2 text-xs rounded grid grid-cols-2 gap-x-4 gap-y-1">
            <div><strong>학생명:</strong> O O O</div>
            <div><strong>평가일:</strong> {new Date().toLocaleDateString('ko-KR')}</div>
            <div><strong>교과:</strong> 국어 3학년</div>
            <div><strong>교사 소속:</strong> 특수학급/초등</div>
          </div>
        </div>

        {/* List of Evaluation for all Poems */}
        <div className="space-y-6">
          {poems.map((poem) => {
            const log = logs[poem.id] || {
              poemId: poem.id,
              poemTitle: poem.title,
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

            return (
              <div
                key={poem.id}
                className="border border-natural-border rounded-2xl p-5 md:p-6 hover:shadow-md hover:border-natural-green-border/50 transition-all print:border-b print:border-slate-300 print:rounded-none print:p-0 print:pb-6 print:mb-6"
              >
                {/* Poem Title on Report Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-natural-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold px-2 py-0.5 bg-natural-green-light text-natural-green-dark rounded-md">
                      활동 시
                    </span>
                    <h4 className="text-base font-bold text-natural-text">{poem.title} ({poem.author})</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-natural-muted">참여 도장:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((num) => (
                        <div
                          key={num}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            num <= log.stampsEarned
                              ? 'bg-natural-amber-light border border-natural-amber-border text-natural-amber-dark shadow-sm animate-bounce'
                              : 'bg-natural-green-light/20 border border-natural-border text-natural-muted'
                          }`}
                        >
                          <Star size={14} className={num <= log.stampsEarned ? 'fill-natural-amber text-natural-amber' : ''} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid for Assessment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  {/* Step 1 Outcome */}
                  <div className="bg-natural-green-light/10 p-4 rounded-xl border border-natural-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-natural-muted">1단계: 주요 대상 찾기</span>
                      {log.step1Completed ? (
                        <span className="text-xs font-semibold text-natural-green-dark flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-natural-green fill-natural-green-light" /> 성공
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-natural-muted flex items-center gap-1">
                          미수행
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-natural-text">
                      시 속 주요 인물/대상 고르기
                    </p>
                    <div className="mt-2 text-xs text-natural-muted space-y-1">
                      <div>시도 횟수: <span className="font-semibold text-natural-dark">{log.step1Tries}회</span></div>
                      {log.step1SelectedWrong.length > 0 && (
                        <div className="text-natural-amber-dark font-semibold">
                          오답 시도: {log.step1SelectedWrong.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2 Outcome */}
                  <div className="bg-natural-green-light/10 p-4 rounded-xl border border-natural-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-natural-muted">2단계: 도구어 구어체 변환</span>
                      {log.step2Completed ? (
                        <span className="text-xs font-semibold text-natural-green-dark flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-natural-green fill-natural-green-light" /> 성공
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-natural-muted flex items-center gap-1">
                          미수행
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-natural-text">
                      학습 도구어 이해 및 감정 찾기
                    </p>
                    <div className="mt-2 text-xs text-natural-muted space-y-1">
                      <div>도구어: <span className="font-semibold text-natural-dark">{poem.academicQuestion.word}</span></div>
                      <div>쉬운 변환: <span className="italic text-natural-muted">"{poem.academicQuestion.simplifiedWord}"</span></div>
                      {log.step2SelectedChoiceId && (
                        <div className="text-natural-green-dark font-bold">
                          선택한 느낌: {poem.academicQuestion.choices.find(c => c.id === log.step2SelectedChoiceId)?.text}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3 Outcome */}
                  <div className="bg-natural-green-light/10 p-4 rounded-xl border border-natural-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-natural-muted">3단계: 핵심 문장 배열</span>
                      {log.step3Completed ? (
                        <span className="text-xs font-semibold text-natural-green-dark flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-natural-green fill-natural-green-light" /> 성공
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-natural-muted flex items-center gap-1">
                          미수행
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-natural-text">
                      문장 카드를 조합하여 느낌 표현
                    </p>
                    <div className="mt-2 text-xs text-natural-muted space-y-1">
                      <div>조립 소요시도: <span className="font-semibold text-natural-dark">{log.step3Tries}회</span></div>
                      <div className="text-natural-muted">
                        완성된 표현: <span className="font-semibold text-natural-dark">
                          {poem.sentenceCards.map(c => c.text.replace(/^[^\s]+ /, '')).join(' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualitative Report Section */}
                <div className="bg-natural-amber-light/20 p-4 rounded-xl border border-dashed border-natural-amber-border">
                  <h5 className="text-xs font-bold text-natural-amber-dark uppercase tracking-wider mb-2">
                    교사 관찰 소견 및 종합 평가 (누가 기록)
                  </h5>
                  {log.teacherObservation ? (
                    <p className="text-sm text-natural-text leading-relaxed whitespace-pre-line font-medium">
                      {log.teacherObservation}
                    </p>
                  ) : (
                    <p className="text-xs text-natural-muted italic">
                      등록된 관찰 기록이 없습니다. 위에 있는 관찰 기록 칸에 의견을 입력하고 '관찰 기록 저장' 버튼을 누르면 이 자리에 인쇄가 가능하게 깔끔하게 기재됩니다.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Printable Parent Guidelines (Optional) */}
        <div className="hidden print:block border-t border-natural-border pt-6 mt-12">
          <h3 className="text-sm font-bold text-natural-text mb-2">🏠 다문화 가정 및 개별 학습 지도 방향 제언</h3>
          <ul className="text-xs text-natural-muted space-y-1.5 list-disc pl-5 leading-relaxed">
            <li>본 아동은 텍스트 분량에 거부감이 뚜렷하므로, 집에서도 항상 <strong>청각적 읽어주기 촉진(TTS 낭독 활용)</strong>을 먼저 시행하는 것을 권고합니다.</li>
            <li><strong>학습 도구어(비교, 서술, 상징)</strong>는 한자어로 쓰기보다 구어로 바꾸어 주변 생활 사물로 실제 예시를 들어 학습할 때 거부감이 최소화됩니다.</li>
            <li>직접 손으로 카드를 드래그하여 조립하는 등 <strong>시각적 조작과 시 촉진</strong>을 계속 연계하여, 30분 이상 높은 집중을 보이는 강점을 학습에 활용하도록 유도합니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
