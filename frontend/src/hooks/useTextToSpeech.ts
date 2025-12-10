import { useRef, useCallback } from 'react';

/**
 * Hook for text-to-speech functionality
 * Uses the Web Speech API to read notes aloud
 */
export const useTextToSpeech = () => {
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const speak = useCallback((text: string) => {
        // Stop any current speech
        window.speechSynthesis.cancel();

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to use a natural-sounding voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Samantha') ||
            v.name.includes('Google') ||
            v.lang.startsWith('en')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
    }, []);

    const isSpeaking = useCallback(() => {
        return window.speechSynthesis.speaking;
    }, []);

    return { speak, stop, isSpeaking };
};
