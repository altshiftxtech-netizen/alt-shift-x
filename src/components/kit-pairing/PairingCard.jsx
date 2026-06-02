import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import IpStatementDialog from "./IpStatementDialog";

const STATUS_COLORS = {
  pending: "bg-yellow-50 border-yellow-200",
  accepted: "bg-green-50 border-green-200",
  declined: "bg-red-50 border-red-200",
};

const STATUS_BADGES = {
  pending: { color: "yellow", icon: Clock, label: "Pending" },
  accepted: { color: "green", icon: CheckCircle, label: "Active" },
  declined: { color: "red", icon: XCircle, label: "Declined" },
};

export default function PairingCard({ pairing, isRequester, onRespond, onRevoke }) {
  const [showIp, setShowIp] = useState(false);
  const [responding, setResponding] = useState(false);

  const badge = STATUS_BADGES[pairing.status] || STATUS_BADGES.pending;
  const BadgeIcon = badge.icon;

  const handleRespond = async (action) => {
    setResponding(true);
    try {
      await base44.functions.invoke("respondKitPairing", {
        pairing_id: pairing.id,
        action,
      });
      onRespond?.();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setResponding(false);
    }
  };

  return (
    <>
      <Card className={`${STATUS_COLORS[pairing.status]} border-2`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{pairing.kit_name}</CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                {isRequester
                  ? `Paired with ${pairing.partner_name}`
                  : `Requested by ${pairing.requester_name}`}
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <BadgeIcon className="w-3 h-3" />
              {badge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-500">Your Component</p>
              <p className="font-semibold">
                {isRequester ? pairing.requester_component_name : pairing.partner_component_name}
              </p>
              <p className="text-slate-400">
                ${isRequester ? pairing.requester_component_price : pairing.partner_component_price}/mo
              </p>
            </div>
            <div>
              <p className="text-slate-500">Partner Component</p>
              <p className="font-semibold">
                {isRequester ? pairing.partner_component_name : pairing.requester_component_name}
              </p>
              <p className="text-slate-400">
                ${isRequester ? pairing.partner_component_price : pairing.requester_component_price}/mo
              </p>
            </div>
          </div>

          {pairing.revenue_split && (
            <div className="bg-white/60 rounded p-2 text-xs">
              <p className="text-slate-500 mb-1">Revenue Split</p>
              <div className="flex gap-2">
                {isRequester ? (
                  <>
                    <span className="font-semibold text-violet-700">
                      You: {(pairing.revenue_split.requester_pct * 100).toFixed(0)}%
                    </span>
                    <span className="text-slate-500">
                      Partner: {(pairing.revenue_split.partner_pct * 100).toFixed(0)}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-500">
                      Requester: {(pairing.revenue_split.requester_pct * 100).toFixed(0)}%
                    </span>
                    <span className="font-semibold text-violet-700">
                      You: {(pairing.revenue_split.partner_pct * 100).toFixed(0)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIp(true)}
              className="gap-1 text-xs"
            >
              <Eye className="w-3 h-3" />
              IP Statement
            </Button>

            {pairing.status === "pending" && !isRequester && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleRespond("accept")}
                  disabled={responding}
                  className="bg-green-600 hover:bg-green-700 gap-1 text-xs"
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRespond("decline")}
                  disabled={responding}
                  className="text-xs"
                >
                  Decline
                </Button>
              </>
            )}

            {(pairing.status === "accepted" || pairing.status === "pending") && isRequester && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRespond("revoke")}
                disabled={responding}
                className="text-xs"
              >
                Revoke
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <IpStatementDialog open={showIp} onOpenChange={setShowIp} pairing={pairing} />
    </>
  );
}