import React, { useState, useEffect } from "react";
import { X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CommandPrompt({ enabled, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState([]);
  const lastKeyTime = React.useRef(0);
  const keyLog = React.useRef([]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e) => {
      const now = Date.now();
      keyLog.current.push({ key: e.key, time: now });
      
      // Keep only last 2 keys within 500ms
      keyLog.current = keyLog.current.filter(k => now - k.time < 500);

      // Check for double-M
      if (keyLog.current.length >= 2) {
        const last2 = keyLog.current.slice(-2);
        if (last2.every(k => k.key.toLowerCase() === 'm') && 
            last2[1].time - last2[0].time < 300) {
          e.preventDefault();
          setIsOpen(true);
          keyLog.current = [];
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [enabled]);

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    let result = "";

    if (trimmed === "help") {
      result = "Available commands: help, status, test-mode, sandbox, clear, exit";
    } else if (trimmed === "status") {
      result = `App Status: Running | User: Admin | Mode: ${localStorage.getItem("dev_mode") ? "DEV" : "PROD"}`;
    } else if (trimmed === "test-mode") {
      localStorage.setItem("test_mode_enabled", "true");
      result = "Test Mode: ENABLED ✓";
    } else if (trimmed === "sandbox") {
      localStorage.setItem("sandbox_mode", "true");
      result = "Sandbox Mode: ACTIVATED ✓";
    } else if (trimmed === "clear") {
      setOutput([]);
      setInput("");
      return;
    } else if (trimmed === "exit") {
      setIsOpen(false);
      return;
    } else {
      result = `Unknown command: ${cmd}. Type 'help' for available commands.`;
    }

    setOutput([...output, { cmd, result }]);
    setInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-green-500 rounded-lg w-full max-w-2xl max-h-96 flex flex-col overflow-hidden font-mono text-sm">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-b border-green-500">
          <div className="flex items-center gap-2 text-green-400">
            <Terminal className="w-4 h-4" />
            <span>Command Prompt</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-green-400 hover:text-green-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Output */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-green-400">
          <div>$ Base44 Command Interface v1.0</div>
          <div>$ Type 'help' for available commands</div>
          <div className="text-slate-500">---</div>
          {output.map((line, i) => (
            <div key={i}>
              <div>$ {line.cmd}</div>
              <div className="text-amber-400">{line.result}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-green-500 px-4 py-3 bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="text-green-400">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCommand(input);
                if (e.key === "Escape") setIsOpen(false);
              }}
              autoFocus
              className="flex-1 bg-transparent text-green-400 outline-none"
              placeholder="Enter command..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}