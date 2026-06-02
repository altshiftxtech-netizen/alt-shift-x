import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import useVoiceInput from "@/hooks/useVoiceInput";

// Drop-in voice-to-text button for any agent input. Pass onTranscript to
// receive the spoken text (e.g. append it to the input field).
export default function VoiceButton({ onTranscript, size = "default", className = "" }) {
  const { recording, transcribing, toggle } = useVoiceInput({ onTranscript });

  return (
    <Button
      type="button"
      onClick={toggle}
      disabled={transcribing}
      size={size}
      title={recording ? "Stop recording" : "Speak your message"}
      className={`${recording ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-slate-700 hover:bg-slate-600"} ${className}`}
    >
      {transcribing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : recording ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
}