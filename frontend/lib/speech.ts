export function speak(text: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (!("speechSynthesis" in window)) {
    console.error(
      "Speech synthesis is not supported by this browser."
    );

    return;
  }

  if (!text.trim()) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  utterance.lang = "id-ID";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(
    utterance
  );
}


export function stopSpeaking() {
  if (typeof window === "undefined") {
    return;
  }

  if (
    "speechSynthesis" in window
  ) {
    window.speechSynthesis.cancel();
  }
}