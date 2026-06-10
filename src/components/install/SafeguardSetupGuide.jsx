import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Mail, MessageSquare, MapPin, Bell, Baby, Smartphone, Quote, Trash2, Sparkles } from "lucide-react";

// Plain-English instructions for SafeGuard parents:
//  • how to clear / start fresh
//  • what to expect when setting up email & text alerts + directions
//  • simple example prompts to say to the toy / phone agent that trigger an alert
//
// Honest framing: we describe what a parent will see and do — we never claim a
// third-party toy/phone is "connected" from this website.
export default function SafeguardSetupGuide() {
  return (
    <div className="space-y-5">
      {/* Clear / start fresh */}
      <Card className="border-violet-100">
        <CardContent className="py-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-violet-100"><ShieldCheck className="w-4 h-4 text-violet-700" /></span>
            <h3 className="text-sm font-bold text-slate-900">Clearing &amp; starting SafeGuard fresh</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            If you ever want a clean slate — a new child, a new device, or you're handing it to someone else — you
            can clear SafeGuard and set it up again from scratch. Here's what to do and what to expect:
          </p>
          <ol className="space-y-1.5 text-xs text-slate-600">
            {[
              ["Create a new access key", "Generating a fresh key in the steps above replaces the old one. The old key stops working immediately, so any device still using it will quietly stop until you paste in the new key."],
              ["Remove the key from the device", "Open your toy or phone assistant's settings and delete the old key from its AI / API field. This is what truly 'clears' it on the device side."],
              ["Re-enter who gets alerts", "After clearing, your email and text alert list starts empty. Add the parent/guardian email and phone number again (see below) so notifications resume."],
            ].map(([t, d], i) => (
              <li key={i} className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                <span><strong className="text-slate-800">{t}.</strong> {d}</span>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-amber-600 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5 shrink-0" /> Clearing the key here does not erase anything saved on the toy/phone itself — always remove it on the device too.
          </p>
        </CardContent>
      </Card>

      {/* Email, text & directions */}
      <Card className="border-violet-100">
        <CardContent className="py-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-violet-100"><Bell className="w-4 h-4 text-violet-700" /></span>
            <h3 className="text-sm font-bold text-slate-900">Setting up email, text &amp; directions — what to expect</h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <Mail className="w-4 h-4 text-violet-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Email alerts</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Add the email that should receive alerts. Expect a short note with the time, what was said, and why it
                was flagged. Tip: check your spam folder the first time and mark it "not spam".
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <MessageSquare className="w-4 h-4 text-violet-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Text (SMS) alerts</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Add a mobile number for instant texts when something urgent is flagged. Expect a brief message — just
                enough to know you should check in. Standard carrier rates may apply.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <MapPin className="w-4 h-4 text-violet-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Directions</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                If a location is shared in an alert, you'll get a tappable map link so you can see where to go and get
                directions in one tap from your phone.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Good to know:</strong> alerts arrive on the people you add, not on the
            child's device. Add as many guardians as you like — each one gets their own copy.
          </p>
        </CardContent>
      </Card>

      {/* Example prompts that trigger a notification */}
      <Card className="border-violet-100">
        <CardContent className="py-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-violet-100"><Sparkles className="w-4 h-4 text-violet-700" /></span>
            <h3 className="text-sm font-bold text-slate-900">Try it: simple things to say that trigger an alert</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Once your key is pasted into the device, test it. Have someone say one of these out loud to the toy or
            phone agent — within a moment you should see a notification arrive on the Welcome Guide and on the email/
            text you added.
          </p>

          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1.5"><Baby className="w-3.5 h-3.5 text-violet-600" /> To the smart toy</p>
              <div className="space-y-1.5">
                {[
                  "\"I'm scared and I don't know what to do.\"",
                  "\"A grown-up I don't know is talking to me.\"",
                  "\"Can you keep a secret from my mom and dad?\"",
                ].map((p, i) => <PromptLine key={i} text={p} />)}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1.5"><Smartphone className="w-3.5 h-3.5 text-violet-600" /> To the phone assistant</p>
              <div className="space-y-1.5">
                {[
                  "\"Help, I feel unsafe right now.\"",
                  "\"Someone is asking me to meet them.\"",
                  "\"Tell my parents I need them.\"",
                ].map((p, i) => <PromptLine key={i} text={p} />)}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-2.5">
            These are test phrases to confirm alerts are flowing. In everyday use SafeGuard listens for these kinds of
            worry signals on its own — you don't have to say anything special.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PromptLine({ text }) {
  return (
    <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
      <Quote className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
      <span className="text-xs text-violet-900 italic">{text}</span>
    </div>
  );
}