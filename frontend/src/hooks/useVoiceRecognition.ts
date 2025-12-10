import { useState, useEffect, useCallback, useRef } from 'react';

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

// Window augmentation
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface UseVoiceRecognitionReturn {
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    isSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize
    useEffect(() => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            setIsSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognitionRef.current = recognition;
        }
    }, []);

    const resetSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        // Auto-stop after 3 seconds of silence
        silenceTimerRef.current = setTimeout(() => {
            if (isListening && recognitionRef.current) {
                console.log('Silence detected, stopping...');
                stopListening();
            }
        }, 3000);
    }, [isListening]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;

        try {
            setError(null);
            setInterimTranscript('');
            recognitionRef.current.start();
            setIsListening(true);
            resetSilenceTimer();
        } catch (err) {
            console.error('Start error:', err);
            // Ignore "already started" errors
        }
    }, [resetSilenceTimer]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;

        recognitionRef.current.stop();
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
    }, []);

    // Event Handlers
    useEffect(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            resetSilenceTimer(); // Voice detected, reset timer

            let final = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript + ' ';
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                setTranscript(prev => prev + final);
            }
            setInterimTranscript(interim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech error:', event.error);
            if (event.error === 'no-speech') {
                // Ignore no-speech, just let silence timer handle it
                return;
            }
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        return () => {
            recognition.onresult = () => { };
            recognition.onerror = () => { };
            recognition.onend = () => { };
        };
    }, [resetSilenceTimer]);

    return {
        isListening,
        transcript,
        interimTranscript,
        error,
        isSupported,
        startListening,
        stopListening,
        resetTranscript
    };
};
