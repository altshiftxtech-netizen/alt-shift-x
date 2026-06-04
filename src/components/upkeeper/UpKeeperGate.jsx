import React from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

const AVATAR = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/3f9a15d43_generated_image.png";

// Blocks anyone who isn't admin or staff from The UpKeeper.
export default function UpKeeperGate({ checking, role }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a120d] via-[#2a1d16] to-[#1a120d] px-4 text-center">
      <img src={AVATAR} alt="The UpKeeper" className="w-24 h-24 rounded-full object-cover mb-6 ring-4 ring-orange-500/30 opacity-80" />
      {checking ? (
        <p className="text-orange-200/70 text-sm">Verifying access…</p>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-orange-950/60 border border-orange-800/50 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-orange-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">The UpKeeper is staff-only</h1>
          <p className="text-orange-200/60 text-sm max-w-sm mb-6">
            This site superintendent is restricted to admins and authorized staff.
            {role ? ` Your current role is "${role}".` : ""}
          </p>
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl transition-colors">
            <Lock className="w-4 h-4" /> Back to safety
          </Link>
        </>
      )}
    </div>
  );
}