import React from "react";
import LegalPage from "@/components/legal/LegalPage";

export default function LegalBuilderAgreement() {
  return (
    <LegalPage
      contentKeys={["builder_agreement_part1", "builder_agreement_part2", "builder_agreement_part3"]}
      crumb="Builder Agreement"
    />
  );
}