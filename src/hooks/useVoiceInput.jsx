import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";

// Reusable voice-to-text hook. Records mic audio, uploads it, transcribes via
// Core.TranscribeAudio, and returns the text. Any agent input can use this to
// get a working voice button.
export default function useVoiceInput({ onTranscript } = {}) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setTranscribing(true);
      try {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "voice.webm", { type: "audio/webm" });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
        if (transcript) onTranscript?.(transcript);
      } catch (err) {
        alert("Voice transcription failed: " + err.message);
      } finally {
        setTranscribing(false);
      }
    };
    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const toggle = async () => {
    if (recording) stop();
    else await start();
  };

  return { recording, transcribing, toggle };
}