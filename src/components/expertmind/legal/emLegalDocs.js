// EXPERT-MINDS legal repository — the source text for the three governing
// documents. Forensic Noir: these are surfaced as amber mono-spaced records.
//
//   EXPERT-MINDS-ENTERPRISE-MSA-1.0        — Master Service Agreement
//   EXPERT-MINDS-DPA-1.0                    — Data Processing Addendum
//   EXPERT-MINDS-PAYMENT-DISCLAIMER-1.0     — Payment / AI-output disclaimer

export const EM_MSA_CODE = "EXPERT-MINDS-ENTERPRISE-MSA-1.0";
export const EM_DPA_CODE = "EXPERT-MINDS-DPA-1.0";
export const EM_PAYMENT_DISCLAIMER_CODE = "EXPERT-MINDS-PAYMENT-DISCLAIMER-1.0";

// Short, high-contrast disclaimer shown inside the amber box above the
// "Activate Enterprise Tier" button.
export const EM_PAYMENT_DISCLAIMER_TEXT =
  "PAYMENT PROTOCOL — EXPERT-MINDS-PAYMENT-DISCLAIMER-1.0. This is a recurring " +
  "enterprise subscription billed monthly until cancelled. All intelligence, " +
  "reports, and assets produced by ExpertMinds are AI-generated and are provided " +
  "for informational purposes only. They do NOT constitute legal, financial, " +
  "medical, or other professional advice. AI output may contain errors or " +
  "omissions and REQUIRES independent human verification before any reliance or " +
  "deployment. By activating, you accept the Master Service Agreement and the " +
  "Data Processing Addendum in full.";

export const EM_CLICKWRAP_TEXT =
  "I affirm that I have read and agree to the Master Service Agreement and Data " +
  "Processing Addendum, and I acknowledge that AI-generated content requires " +
  "independent human verification.";

export const EM_AI_NOTICE_TEXT =
  "AI Protocol Active: No Professional Advice / Human Verification Required.";

export const EM_LEGAL_DOCS = {
  [EM_MSA_CODE]: {
    code: EM_MSA_CODE,
    title: "Master Service Agreement",
    updated: "2026-07-06",
    body: `EXPERT-MINDS-ENTERPRISE-MSA-1.0 — MASTER SERVICE AGREEMENT

1. SCOPE OF SERVICE
ExpertMinds ("the Service") provides AI-assisted capture, structuring, and
licensing of human expertise. This Agreement governs all access to the Service
by the subscribing organization ("Customer") and its authorized members.

2. SUBSCRIPTION & BILLING
Enterprise access is provided under a recurring monthly subscription. Fees are
billed in advance and are non-refundable except where required by law. Seats and
core licenses activate only upon successful payment and, where applicable,
completion of the biological handshake verification.

3. AI-GENERATED OUTPUT — NO PROFESSIONAL ADVICE
All output produced by the Service is generated in whole or in part by automated
systems. Such output is provided "AS IS", for informational purposes only, and
does NOT constitute legal, financial, tax, medical, or other professional advice.
Customer is solely responsible for the independent human verification of any
output prior to reliance, publication, or deployment.

4. LICENSE & INTELLECTUAL PROPERTY
Structured knowledge assets are licensed, not sold. Customer receives a
non-exclusive, non-transferable license to use assets within its organization.
Contributor consent and attribution obligations survive termination.

5. ACCEPTABLE USE
Customer shall not use the Service to violate law, infringe third-party rights,
or generate output intended to deceive as professional advice without disclosure.

6. WARRANTIES & DISCLAIMER
The Service is provided without warranty of any kind. ExpertMinds disclaims all
implied warranties, including merchantability and fitness for a particular
purpose, to the maximum extent permitted by law.

7. LIMITATION OF LIABILITY
To the maximum extent permitted by law, ExpertMinds' aggregate liability shall
not exceed the fees paid by Customer in the twelve (12) months preceding the
claim. ExpertMinds shall not be liable for indirect, incidental, or consequential
damages.

8. TERM & TERMINATION
This Agreement remains in effect while any subscription is active. Either party
may terminate for material breach after a thirty (30) day cure period.

9. GOVERNING LAW
This Agreement is governed by the laws of the State of Delaware, USA, without
regard to conflict-of-laws principles.

10. CONSENT RECORD
Acceptance of this Agreement is time-stamped and recorded under
GSP-MASTER-INDEX-1.0 with a unique legal hash proving the moment of consent.`,
  },

  [EM_DPA_CODE]: {
    code: EM_DPA_CODE,
    title: "Data Processing Addendum",
    updated: "2026-07-06",
    body: `EXPERT-MINDS-DPA-1.0 — DATA PROCESSING ADDENDUM

1. ROLES
For personal data processed on Customer's behalf, Customer is the Controller and
ExpertMinds is the Processor. This Addendum forms part of the Master Service
Agreement (EXPERT-MINDS-ENTERPRISE-MSA-1.0).

2. SCOPE & PURPOSE
ExpertMinds processes personal data solely to provide the Service: capturing
expert contributions, structuring knowledge, and delivering intelligence assets.

3. CONTRIBUTOR CONSENT
All expert contributions are captured on a consent basis. Contributors are
informed that their input is used to train and produce AI-assisted assets.

4. SUB-PROCESSORS
ExpertMinds may engage vetted sub-processors (including AI model providers and
cloud infrastructure) under written obligations no less protective than this
Addendum. A current list is available on request.

5. SECURITY MEASURES
ExpertMinds maintains appropriate technical and organizational measures including
encryption in transit and at rest, access controls, and audit logging.

6. INTERNATIONAL TRANSFERS
Where personal data is transferred across borders, ExpertMinds relies on lawful
transfer mechanisms such as Standard Contractual Clauses.

7. DATA SUBJECT RIGHTS
ExpertMinds will assist Customer in responding to data-subject requests for
access, correction, deletion, and portability, taking into account the nature of
processing.

8. BREACH NOTIFICATION
ExpertMinds will notify Customer without undue delay upon becoming aware of a
personal-data breach affecting Customer data.

9. RETURN & DELETION
Upon termination, ExpertMinds will, at Customer's choice, return or delete
personal data, except where retention is required by law.

10. AUDIT & RECORDS
Processing records and acceptance of this Addendum are logged under
GSP-MASTER-INDEX-1.0 with a time-stamped legal hash.`,
  },

  [EM_PAYMENT_DISCLAIMER_CODE]: {
    code: EM_PAYMENT_DISCLAIMER_CODE,
    title: "Payment & AI-Output Disclaimer",
    updated: "2026-07-06",
    body: `EXPERT-MINDS-PAYMENT-DISCLAIMER-1.0 — PAYMENT & AI-OUTPUT DISCLAIMER

${EM_PAYMENT_DISCLAIMER_TEXT}

BILLING TERMS
• Recurring monthly subscription, billed in advance.
• Continues until cancelled by the account holder.
• Fees are non-refundable except where required by law.

AI-OUTPUT PROTOCOL
• Output is AI-generated and provided for informational purposes only.
• Output is NOT professional advice of any kind.
• Independent human verification is REQUIRED before reliance or deployment.

Acceptance of this disclaimer is time-stamped and recorded under
GSP-MASTER-INDEX-1.0 with a unique legal hash.`,
  },
};

export function getEmLegalDoc(code) {
  return EM_LEGAL_DOCS[code] || null;
}