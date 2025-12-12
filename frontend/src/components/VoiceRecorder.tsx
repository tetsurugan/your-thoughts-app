import { useRef, useEffect } from 'react';
import { Mic, X, Check } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

interface VoiceRecorderProps {
    onClose: () => void;
    onComplete: (text: string) => void;
}

export const VoiceRecorder = ({ onClose, onComplete }: VoiceRecorderProps) => {
    const {
        isListening,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        resetTranscript
    } = useVoiceRecognition();

    const hasStartedRef = useRef(false);

    // Auto-start
    useEffect(() => {
        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            startListening();
        }
    }, [startListening]);

    // Handle done
    const handleDone = () => {
        stopListening();
        const finalText = transcript + interimTranscript;
        if (finalText.trim()) {
            onComplete(finalText);
        } else {
            onClose(); // No text, just close
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-200">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="w-full max-w-lg px-6 flex flex-col items-center text-center">
                {/* Visual Feedback Circle */}
                <div className="relative mb-8">
                    {/* Ripple effects */}
                    {isListening && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping duration-[2s]"></div>
                            <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping delay-150 duration-[2s]"></div>
                        </>
                    )}

                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 scale-110 shadow-2xl shadow-blue-500/50'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                    >
                        <Mic className={`w-10 h-10 text-white ${isListening ? 'animate-pulse' : ''}`} />
                    </button>

                    {error && (
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-red-400 font-medium">
                            {error === 'not-allowed' ? 'Microphone permission denied' : 'Error hearing audio'}
                        </div>
                    )}
                </div>

                {/* Status Text */}
                <h2 className="text-2xl font-bold text-white mb-6">
                    {isListening ? "I'm listening..." : "Tap mic to speak"}
                </h2>

                {/* Live Transcript */}
                <div className="w-full min-h-[120px] max-h-[300px] overflow-y-auto mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
                    {transcript || interimTranscript ? (
                        <p className="text-2xl leading-relaxed font-medium text-white/90">
                            {transcript}
                            <span className="text-blue-300">{interimTranscript}</span>
                        </p>
                    ) : (
                        <p className="text-xl text-white/30 text-center italic mt-8">
                            Just talk naturally. I'll catch every word.
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 w-full">
                    <button
                        onClick={resetTranscript}
                        className="flex-1 py-4 rounded-xl font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleDone}
                        className="flex-1 py-4 rounded-xl font-bold bg-white text-slate-900 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
