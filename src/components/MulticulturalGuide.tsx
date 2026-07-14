import React, { useState } from 'react';
import { Globe, BookOpen, Gift, ShieldAlert, CheckCircle, Volume2 } from 'lucide-react';
import { Poem, Language, PoemTranslation } from '../types';
import { translationLabels, guideWelcome } from '../data';
import { AudioFacilitator } from './AudioFacilitator';

interface MulticulturalGuideProps {
  currentPoem: Poem;
}

export const MulticulturalGuide: React.FC<MulticulturalGuideProps> = ({ currentPoem }) => {
  const [selectedLang, setSelectedLang] = useState<Exclude<Language, 'ko'>>('en');

  const trans: PoemTranslation = currentPoem.translations[selectedLang];

  return (
    <div className="bg-white rounded-3xl border border-natural-border shadow-sm p-6 md:p-8 mt-12 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-natural-green-light rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-natural-border pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-natural-green-light text-natural-green-dark rounded-2xl">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-natural-text flex items-center gap-2">
              <span>다문화 가정 연계 안내</span>
              <span className="text-xs bg-natural-green-light border border-natural-green-border text-natural-green-dark font-semibold px-2.5 py-0.5 rounded-full">
                Multicultural Family Support
              </span>
            </h3>
            <p className="text-xs text-natural-muted mt-0.5">
              가정에서도 학습 내용을 이해하고 언어적 성장을 도울 수 있도록 번역과 맞춤 가이드를 제공합니다.
            </p>
          </div>
        </div>

        {/* Language selector buttons */}
        <div className="flex items-center gap-1.5 bg-natural-green-light/40 p-1.5 rounded-2xl overflow-x-auto max-w-full">
          {(Object.keys(translationLabels) as Language[])
            .filter((l): l is Exclude<Language, 'ko'> => l !== 'ko')
            .map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedLang === lang
                    ? 'bg-natural-green text-white shadow-sm'
                    : 'text-natural-muted hover:bg-natural-green-light/60'
                }`}
              >
                {translationLabels[lang]}
              </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Translated Poem */}
        <div className="bg-natural-green-light/10 rounded-2xl border border-natural-border p-5 md:p-6">
          <div className="flex items-center justify-between mb-4 border-b border-natural-border pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-natural-green-dark" />
              <h4 className="text-sm font-bold text-natural-text">시 번역본 (Poem Translation)</h4>
            </div>
            {/* Audio speaker for parent reading */}
            <AudioFacilitator
              inline
              customButtonLabel="원어 낭독 (Korean TTS)"
              textToSpeak={[currentPoem.title, `시인 ${currentPoem.author}`, ...currentPoem.content]}
            />
          </div>

          <div className="text-center py-6">
            <h5 className="font-bold text-lg text-natural-text tracking-tight">{trans.title}</h5>
            <p className="text-xs text-natural-muted mt-1 mb-5">Poet: {currentPoem.author}</p>
            <div className="space-y-3.5">
              {trans.content.map((line, idx) => (
                <p key={idx} className="text-sm font-medium text-natural-dark leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Parent Guidelines & Activities */}
        <div className="space-y-6">
          {/* Main Welcome/Guideline message */}
          <div className="bg-natural-amber-light/80 border border-natural-amber-border rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-natural-amber-dark mb-1 flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5" />
              <span>{guideWelcome[selectedLang].title}</span>
            </h4>
            <p className="text-xs text-natural-dark leading-relaxed">
              {guideWelcome[selectedLang].desc}
            </p>
          </div>

          {/* Guidelines on teaching */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-0.5 p-1 bg-natural-green-light text-natural-green-dark rounded-lg shrink-0">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-natural-text uppercase tracking-wider mb-1">
                  How to Assist reading (이렇게 도와주세요)
                </h5>
                <p className="text-sm text-natural-muted leading-relaxed">
                  {trans.guide}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 p-1 bg-natural-green-light text-natural-green-dark rounded-lg shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-natural-text uppercase tracking-wider mb-1">
                  Play-based Homework (가정 연계 활동 과제)
                </h5>
                <p className="text-sm text-natural-muted leading-relaxed">
                  {trans.homeworkGuide}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 p-1 bg-natural-amber-light text-natural-amber-dark rounded-lg shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-natural-text uppercase tracking-wider mb-1">
                  Language Advice (다국어 언어 조언)
                </h5>
                <p className="text-sm text-natural-muted leading-relaxed">
                  이중 언어를 사용하는 환경에서 자란 학생이 국어 학습 도구어에 거부감을 줄일 수 있도록,
                  가정 내에서 모국어로 먼저 설명해 준 뒤 한국어 음성 낭독을 다시 들려주는 순서로 공부하면 크게 도움이 됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
