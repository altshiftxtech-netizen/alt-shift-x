import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import CommandPrompt from "@/lib/CommandPrompt";

export default function CommandPromptToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("command_prompt_enabled") === "true";
    setEnabled(saved);
  }, []);

  const handleToggle = (value) => {
    setEnabled(value);
    localStorage.setItem("command_prompt_enabled", value.toString());
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Developer Command Prompt (Press M+M to access)
        </label>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>
      <CommandPrompt enabled={enabled} />
    </>
  );
}