import React from "react";
import LegalPage from "@/components/legal/LegalPage";

export default function LegalPrivacy() {
  return <LegalPage contentKeys={["privacy_policy_part1", "privacy_policy_part2"]} crumb="Privacy Policy" />;
}