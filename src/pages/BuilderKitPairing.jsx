import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Link2, Tag } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import RequestPairingDialog from "@/components/kit-pairing/RequestPairingDialog";
import CreateDiscountDialog from "@/components/kit-pairing/CreateDiscountDialog";
import PairingCard from "@/components/kit-pairing/PairingCard";

export default function BuilderKitPairing() {
  const [user, setUser] = useState(null);
  const [components, setComponents] = useState([]);
  const [pairings, setPairings] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);

      const comps = await base44.entities.Component.filter({ builder_id: me.id });
      setComponents(comps);

      const pairs = await base44.entities.KitPairing.filter({
        $or: [{ requester_id: me.id }, { partner_id: me.id }],
      });
      setPairings(pairs);

      const discs = await base44.entities.BuilderDiscount.filter({ builder_id: me.id });
      setDiscounts(discs);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SharedNav mode="builder" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  const myPairings = pairings.filter((p) => p.requester_id === user?.id);
  const incomingPairings = pairings.filter((p) => p.partner_id === user?.id);

  return (
    <div className="min-h-screen bg-background">
      <SharedNav mode="builder" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Kit Pairing & Discounts</h1>
            <p className="text-slate-600">
              Request partnerships with other builders and create discount codes for your components.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setShowRequestDialog(true)}
              className="gap-2 bg-violet-600 hover:bg-violet-700"
            >
              <Link2 className="w-4 h-4" />
              Request Pairing
            </Button>
            <Button
              onClick={() => setShowDiscountDialog(true)}
              variant="outline"
              className="gap-2"
            >
              <Tag className="w-4 h-4" />
              Create Discount Code
            </Button>
          </div>

          {/* My Pairings */}
          {myPairings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">My Pairings</h2>
              <div className="grid gap-3">
                {myPairings.map((p) => (
                  <PairingCard
                    key={p.id}
                    pairing={p}
                    isRequester={true}
                    onRespond={loadData}
                    onRevoke={loadData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Incoming Pairings */}
          {incomingPairings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Pairing Requests</h2>
              <div className="grid gap-3">
                {incomingPairings.map((p) => (
                  <PairingCard
                    key={p.id}
                    pairing={p}
                    isRequester={false}
                    onRespond={loadData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Discount Codes */}
          {discounts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Your Discount Codes</h2>
              <div className="grid gap-3">
                {discounts.map((d) => (
                  <Card key={d.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{d.code}</p>
                          <p className="text-xs text-slate-500">
                            {d.component_name} — {d.percent_off}% off
                          </p>
                          {d.expires_at && (
                            <p className="text-xs text-slate-400 mt-1">
                              Expires: {new Date(d.expires_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-violet-600">{d.redemptions}</p>
                          <p className="text-xs text-slate-500">redeemed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {myPairings.length === 0 &&
            incomingPairings.length === 0 &&
            discounts.length === 0 && (
              <Card className="bg-slate-50 border-2 border-dashed">
                <CardContent className="pt-6 text-center">
                  <p className="text-slate-600 text-sm">
                    No pairings or discounts yet. Start by requesting a pairing or creating a discount code.
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      <RequestPairingDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        components={components}
        onSuccess={loadData}
      />
      <CreateDiscountDialog
        open={showDiscountDialog}
        onOpenChange={setShowDiscountDialog}
        components={components}
        onSuccess={loadData}
      />
    </div>
  );
}