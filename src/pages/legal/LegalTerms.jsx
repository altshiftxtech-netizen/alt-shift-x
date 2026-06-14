import React from "react";
import LegalPage from "@/components/legal/LegalPage";

export default function LegalTerms() {
  return <LegalPage contentKeys={["terms_of_service_part1", "terms_of_service_part2"]} crumb="Terms of Service" />;
}