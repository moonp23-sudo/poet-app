import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Square, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface AudioFacilitatorProps {
  textToSpeak: string | string[];
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  inline?: boolean;
  customButtonLabel?: string;
}

export const AudioFacilitator: React.FC<AudioFacilitatorProps> = ({
  textToSpeak,
  autoPlay = false,
  onStart,
  onEnd,
  inline = false,
  customButtonLabel
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [speed, setSpeed] = useState<number>(0.9); // Slightly slower for better comprehension
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (autoPlay && isSupported) {
      const timer = setTimeout(() => {
        speak();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [textToSpeak, isSupported]);

  const speak = () => {
    if (!isSupported || !synthRef.current) return;

    // Stop current speech
    synthRef.current.cancel();

    const fullText = Array.isArray(textToSpeak) ? textToSpeak.join('\n') : textToSpeak;
    // Clean emojis from speech for natural reading, but keep simple punctuation
    const cleanText = fullText.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Set voice to Korean if available
    const voices = synthRef.current.getVoices();
    const koreanVoice = voices.find(voice => voice.lang.includes('ko-KR'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }
    
    utterance.lang = 'ko-KR';
    utterance.rate = speed;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (onEnd) onEnd();
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    if (onEnd) onEnd();
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speak();
    }
  };

  if (!isSupported) {
    return null;
  }

  if (inline) {
    return (
      <button
        id={`tts-inline-${Math.random().toString(36).substr(2, 5)}`}
        onClick={toggleSpeech}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          isPlaying
            ? 'bg-natural-green text-white animate-pulse'
            : 'bg-natural-green-light text-natural-green-dark hover:bg-natural-green-light/80 border border-natural-green-border/40'
        }`}
        title="소리 내어 읽어주기"
      >
        {isPlaying ? (
          <>
            <Square size={13} className="fill-current" />
            <span>멈춤</span>
          </>
        ) : (
          <>
            <Volume2 size={13} />
            <span>{customButtonLabel || '듣기'}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-natural-green-light/40 border border-natural-green-border/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full ${isPlaying ? 'bg-natural-green text-white' : 'bg-natural-green-light text-natural-green-dark'}`}>
          {isPlaying ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Volume2 className="h-5 w-5" />
            </motion.div>
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-natural-text flex items-center gap-1.5">
            <span>스마트 인공지능 낭독 툴</span>
            <Sparkles className="h-3.5 w-3.5 text-natural-amber fill-natural-amber" />
          </h4>
          <p className="text-xs text-natural-muted">
            {isPlaying ? '선생님의 목소리로 글을 읽어주고 있어요. 귀 기울여 들어보세요!' : '낭독 버튼을 누르면 이 화면의 한글 시와 안내말을 읽어줘요.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Speed Adjustment */}
        <div className="flex items-center gap-2 text-xs bg-white border border-natural-border rounded-lg px-2 py-1">
          <span className="text-natural-muted font-medium">읽는 속도:</span>
          <button
            onClick={() => { setSpeed(0.7); if (isPlaying) speak(); }}
            className={`px-2 py-0.5 rounded cursor-pointer ${speed === 0.7 ? 'bg-natural-green text-white font-bold' : 'text-natural-muted hover:bg-natural-green-light/50'}`}
          >
            느리게
          </button>
          <button
            onClick={() => { setSpeed(0.9); if (isPlaying) speak(); }}
            className={`px-2 py-0.5 rounded cursor-pointer ${speed === 0.9 ? 'bg-natural-green text-white font-bold' : 'text-natural-muted hover:bg-natural-green-light/50'}`}
          >
            보통
          </button>
          <button
            onClick={() => { setSpeed(1.1); if (isPlaying) speak(); }}
            className={`px-2 py-0.5 rounded cursor-pointer ${speed === 1.1 ? 'bg-natural-green text-white font-bold' : 'text-natural-muted hover:bg-natural-green-light/50'}`}
          >
            빠르게
          </button>
        </div>

        {/* Play / Stop Button */}
        <button
          onClick={toggleSpeech}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer shadow-sm transition-all ${
            isPlaying
              ? 'bg-natural-amber hover:bg-natural-amber/90 text-white'
              : 'bg-natural-green hover:bg-natural-green-hover text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Square size={15} className="fill-current" />
              <span>낭독 멈추기</span>
            </>
          ) : (
            <>
              <Play size={15} className="fill-current" />
              <span>전체 소리내어 듣기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
