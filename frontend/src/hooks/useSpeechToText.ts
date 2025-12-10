import { useEffect, useRef, useState } from "react";

// Add specific types for Speech API if not globally available
// We'll use any for the window augmentation as per the snippet
// and define the interfaces if they are missing, but usually we just use 'any' 
// if we want to be safe without extra deps.
// However, I will trust the snippet and add a small type definition block 
// at the top to satisfy TS if needed, or just use `any` for the events if strictly necessary.
// For safety/speed, I'll define them loosely here if they aren't global.

interface UseSpeechToTextResult {
    supported: boolean;
    listening: boolean;
    transcript: string;
    error?: string;
    start: () => void;
    stop: () => void;
    reset: () => void;
}

export function useSpeechToText(): UseSpeechToTextResult {
    const [supported, setSupported] = useState(false);
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);

    const recognitionRef = useRef<any>(null); // Using any for the recognition instance to avoid type hell

    useEffect(() => {
        // @ts-ignore - vendor prefix
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setListening(true);
            setError(undefined);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setError(event.error);
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.onresult = (event: any) => {
            const result = event.results[0][0].transcript;
            console.log("Speech transcript:", result);
            setTranscript(result);
        };

        recognitionRef.current = recognition;
        setSupported(true);

        return () => {
            try {
                recognition.stop();
            } catch (e) {
                // ignore
            }
            recognitionRef.current = null;
        };
    }, []);

    const start = () => {
        if (!recognitionRef.current) return;
        try {
            setTranscript("");
            setError(undefined);
            recognitionRef.current.start();
        } catch (err: any) {
            console.error("Error starting recognition:", err);
            setError(err?.message || "Failed to start speech recognition");
        }
    };

    const stop = () => {
        try {
            recognitionRef.current?.stop();
        } catch (err) {
            console.error("Error stopping recognition:", err);
        }
    };

    const reset = () => {
        setTranscript("");
        setError(undefined);
    };

    return { supported, listening, transcript, error, start, stop, reset };
}
