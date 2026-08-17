"use client";

import { useRef, useState } from "react";

import { transcribeAudio } from "@/lib/api";

interface UseVoiceRecordingOptions {
    disabled: boolean;
    onTranscript: (transcript: string) => void;
}

export function useVoiceRecording({
    disabled,
    onTranscript,
    }: UseVoiceRecordingOptions) {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    async function handleVoice() {
        if (disabled || isTranscribing) {
        return;
        }

        // Stop an in-progress recording
        if (isRecording) {
        mediaRecorderRef.current?.stop();
        return;
        }

        // Check browser support
        if (
        typeof window === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
        ) {
        alert("Ellen want you to grant access the microphone.");
        return;
        }

        if (!window.MediaRecorder) {
        alert("Your browser does not support audio.");
        return;
        }

        try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        // Determine supported MIME type
        let mimeType = "";

        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
            mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
            mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
        }

        const recorder = mimeType
            ? new MediaRecorder(stream, { mimeType })
            : new MediaRecorder(stream);

        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            }
        };

        recorder.onstop = async () => {
            setIsRecording(false);
            setIsTranscribing(true);

            try {
            const actualMimeType = recorder.mimeType || mimeType || "audio/webm";
            const audioBlob = new Blob(audioChunksRef.current, {
                type: actualMimeType,
            });

            // Stop microphone
            stream.getTracks().forEach((track) => track.stop());

            if (audioBlob.size === 0) {
                console.warn("Recorded audio is empty.");
                return;
            }

            const transcript = await transcribeAudio(audioBlob);

            if (!transcript.trim()) {
                alert("Ellen doesn't hear anything.");
                return;
            }

            onTranscript(transcript.trim());
            } catch (error) {
            console.error("Voice transcription error:", error);
            alert("Ellen has failed to convert speech to text.");
            } finally {
            mediaRecorderRef.current = null;
            audioChunksRef.current = [];
            setIsTranscribing(false);
            }
        };

        recorder.onerror = (event) => {
            console.error("MediaRecorder error:", event);

            setIsRecording(false);
            stream.getTracks().forEach((track) => track.stop());

            mediaRecorderRef.current = null;
            audioChunksRef.current = [];
        };

        recorder.start();
        setIsRecording(true);
        } catch (error) {
        console.error("Microphone error:", error);
        setIsRecording(false);

        if (error instanceof DOMException && error.name === "NotAllowedError") {
            alert("Microphone access denied. How can Ellen hear you?");
        } else {
            alert("Failed to access microphone, buy a new PC please.");
        }
        }
    }

    return { isRecording, isTranscribing, handleVoice };
}
