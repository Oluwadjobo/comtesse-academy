import { useEffect, useMemo, useState } from "react";

type AudioLessonPlayerProps = {
  title: string;
  text: string;
};

/**
 * Lecteur vocal basé sur la synthèse vocale du navigateur.
 * Aucun fichier audio ni service externe n'est nécessaire.
 */
export default function AudioLessonPlayer({ title, text }: AudioLessonPlayerProps) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  const cleanText = useMemo(
    () => text.replace(/\s+/g, " ").replace(/([.!?])\s+/g, "$1 ").trim(),
    [text],
  );

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window,
    );

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function play() {
    if (!supported || !cleanText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`${title}. ${cleanText}`);
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice =
      voices.find((voice) => voice.lang.toLowerCase() === "fr-fr") ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("fr"));

    if (frenchVoice) utterance.voice = frenchVoice;
    utterance.lang = frenchVoice?.lang ?? "fr-FR";
    utterance.rate = 0.92;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
    };
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  function pauseOrResume() {
    if (!speaking) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  if (!supported) {
    return (
      <div className="audio-player audio-player-unavailable" role="status">
        La lecture vocale n’est pas prise en charge par ce navigateur. Essayez
        Chrome ou Edge à jour.
      </div>
    );
  }

  return (
    <div className="audio-player" aria-label={`Lecture audio : ${title}`}>
      <div className="audio-player-copy">
        <span className="audio-player-icon" aria-hidden="true">♫</span>
        <div>
          <strong>Écouter cette séquence</strong>
          <small>Lecture vocale en français</small>
        </div>
      </div>
      <div className="audio-player-actions">
        <button type="button" className="secondary-button" onClick={play} disabled={!cleanText}>
          ▶ Écouter
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={pauseOrResume}
          disabled={!speaking}
        >
          {paused ? "▶ Reprendre" : "Ⅱ Pause"}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={stop}
          disabled={!speaking && !paused}
        >
          ■ Arrêter
        </button>
      </div>
    </div>
  );
}
