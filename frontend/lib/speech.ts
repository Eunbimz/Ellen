export type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;

  start: () => void;
  stop: () => void;

  onresult:
    | ((event: SpeechRecognitionEvent) => void)
    | null;

  onerror:
    | ((event: SpeechRecognitionErrorEvent) => void)
    | null;

  onend:
    | (() => void)
    | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function createSpeechRecognition() {
  if (typeof window === "undefined") {
    return null;
  }

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "id-ID";
  recognition.interimResults = false;
  recognition.continuous = false;

  return recognition;
}

export function speak(text: string) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return;
  }

  stopSpeaking();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = "id-ID";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(
    utterance
  );
}

export function stopSpeaking() {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return;
  }

  window.speechSynthesis.cancel();
}

export async function transcribeAudio(
  audioBlob: Blob
): Promise<string> {
  const formData = new FormData();

  formData.append(
    "audio",
    audioBlob,
    "voice.webm"
  );

  const response = await fetch(
    `${API_URL}/api/voice/transcribe`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Voice transcription failed: ${errorText}`
    );
  }

  const data = await response.json();

  return data.text ?? "";
}