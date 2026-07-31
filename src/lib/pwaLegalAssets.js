// The four Sovereign PWA legal assets injected into every download package.
// Real policy text — displayed in the portal and bundled into the ZIP root.

const EFFECTIVE_DATE = "July 31, 2026";

export const MASTER_EULA = `MASTER END-USER LICENSE AGREEMENT (EULA)
Sovereign PWA Shell — Alt+Shift+X
Effective Date: ${EFFECTIVE_DATE}

1. ACCEPTANCE
By downloading, installing, booting, or otherwise operating this PWA package
(the "Software"), you ("Operator", "you", or "User") acknowledge that you have
read, understood, and agree to be bound by this Master EULA. If you do not agree,
do not install or operate the Software and delete all copies immediately.

2. LICENSE GRANT
Alt+Shift+X grants you a limited, non-exclusive, non-transferable, revocable
license to install and operate the Software as a standalone Progressive Web
Application on devices you own or control, solely for your own operational use.
This license does not grant any right to resell, sublicense, host as a service
to third parties, or rebrand the Software as your own product.

3. OPERATIONAL RISK ALLOCATION
THE SOFTWARE IS PROVIDED AS AN INERT ARCHITECTURAL SHELL. ALL OPERATIONAL RISK —
including but not limited to data loss, business decisions made using the
Software, downstream actions of any AI agent or automation running inside the
shell, security incidents, regulatory non-compliance, and third-party claims —
IS BORNE SOLELY BY THE OPERATOR. Alt+Shift+X, its developers, and affiliates
assume NO responsibility for outcomes produced by operator-directed activity
inside the shell.

4. NO WARRANTY
The Software is provided "AS IS" and "AS AVAILABLE", without warranty of any
kind, express or implied, including but not limited to warranties of
merchantability, fitness for a particular purpose, title, or non-infringement.
Alt+Shift+X does not warrant that the Software will be error-free, uninterrupted,
or secure.

5. LIMITATION OF LIABILITY
To the maximum extent permitted by law, in no event shall Alt+Shift+X be liable
for any indirect, incidental, special, consequential, or punitive damages, or
any loss of profits or revenues, arising out of or related to your use of the
Software, whether in contract, tort, or any other theory, even if advised of the
possibility of such damages. Aggregate liability shall not exceed the amount
paid by you for the Software (if any).

6. LOCAL-FIRST ARCHITECTURE
The Software is designed to operate locally on the Operator's device. Alt+Shift+X
does not receive, process, or store data produced inside the shell. The Operator
is solely responsible for the security, backup, and retention of all data.

7. INDEMNIFICATION
The Operator agrees to indemnify, defend, and hold harmless Alt+Shift+X from and
against any and all claims, damages, losses, and expenses (including reasonable
attorneys' fees) arising out of or related to the Operator's use of the Software
or any breach of this EULA.

8. TERMINATION
This license terminates automatically upon your failure to comply with any term.
Upon termination, you must cease all use of and destroy all copies of the Software.

9. GOVERNING LAW
This EULA shall be governed by the laws of the jurisdiction in which the
Operator resides, without regard to conflict-of-law principles.

10. ENTIRE AGREEMENT
This Master EULA, together with the Portable Disclaimer and Privacy Manifest
bundled in the same download package, constitutes the entire agreement between
you and Alt+Shift+X regarding the Software.

— END OF MASTER EULA —
`;

export const PORTABLE_DISCLAIMER = `PORTABLE DISCLAIMER — NO-AGREEMENT NOTICE
Sovereign PWA Shell
Effective Date: ${EFFECTIVE_DATE}

1. NO CONTRACT FORMATION
This PWA is delivered as an inert, neutral architectural shell. Downloading,
installing, or operating the shell does NOT create a service agreement,
partnership, agency, employment, or fiduciary relationship between you and
Alt+Shift+X. No implied contract arises from the mere act of operating the
Software.

2. NEUTRAL SHELL
The shell contains no embedded intent, governance directive, or agency. It is a
blank container. Any intent, logic, or automated behavior inside the shell is
supplied entirely by the Operator. Alt+Shift+X does not direct, endorse, or
control the Operator's use of the shell.

3. NO ENDORSEMENT OF OUTPUT
Any output, recommendation, communication, or action produced by agents or
automations running inside the shell is the Operator's product, not Alt+Shift+X's.
Alt+Shift+X does not endorse, verify, or warrant any such output.

4. NO IMPLIED WARRANTIES
No statement, marketing material, or communication — other than the express
terms of the Master EULA — shall create any warranty or obligation. The shell's
inertness means it performs no function until the Operator directs it.

5. SEVERABILITY
If any provision of this disclaimer is held unenforceable, the remainder
remains in full force and effect.

— END OF PORTABLE DISCLAIMER —
`;

export const PRIVACY_MANIFEST = `PRIVACY MANIFEST — LOCAL-FIRST DATA ARCHITECTURE
Sovereign PWA Shell
Effective Date: ${EFFECTIVE_DATE}

1. LOCAL-FIRST DESIGN
This PWA is engineered as a Local-First application. All data created, stored,
or processed inside the shell resides on the Operator's device. Alt+Shift+X
operates no backend database that receives or stores operator data from the
shell.

2. NO TELEMETRY
The shell does not transmit analytics, usage metrics, behavioral data, or
telemetry to Alt+Shift+X or any third party. No background "phone-home" calls
are embedded in the core shell.

3. DATA ENCRYPTION
Data at rest on the device is protected by the browser's origin-based storage
isolation and, where the Operator configures it, by the device's native disk
encryption. The shell's service worker caches only the shell's own static
assets (HTML, CSS, JS, manifest) — never operator data.

4. OPERATOR CONTROL
The Operator has full and exclusive control over all data inside the shell,
including the right to export, modify, or delete it at any time via the browser's
storage controls. Uninstalling the PWA removes its cached assets and local
storage.

5. THIRD-PARTY DEPENDENCIES
If the Operator directs the shell to connect to external services (APIs,
databases, or agents of the Operator's choosing), data exchanged with those
services is governed solely by the Operator's relationship with those providers.
Alt+Shift+X is not a party to such exchanges.

6. COOKIES & TRACKING
The core shell uses only essential browser storage (service worker cache and
local/session storage) required for PWA functionality. No advertising or
cross-site tracking cookies are set by the shell itself.

7. COMPLIANCE POSTURE
Because the shell holds no operator data on Alt+Shift+X infrastructure, the
Operator's own data-compliance obligations (GDPR, CCPA, HIPAA, etc.) are
satisfied by the Operator's handling of their local data. This manifest serves
as technical proof of the Local-First architecture.

— END OF PRIVACY MANIFEST —
`;

export const OPERATOR_GUIDE = `OPERATOR GUIDE — CLEAN & LEGAL HANDBOOK
Sovereign PWA Shell
Effective Date: ${EFFECTIVE_DATE}

This handbook helps you operate your Sovereign PWA asset in a compliant,
low-risk manner.

1. FIRST BOOT — ACCEPT THE GATE
On first launch after download, you will see an acceptance modal containing the
Master EULA and Shell Disclaimer. Read both. You must explicitly accept them
before the shell becomes operational. This acceptance is logged locally on your
device as a consent record.

2. KEEP IT LOCAL-FIRST
Your data stays on your device by default. Do not configure the shell to upload
sensitive data to third-party services unless you have reviewed that provider's
privacy and security terms. The Local-First architecture is your strongest
compliance shield — preserve it.

3. REVIEW OUTPUTS BEFORE ACTING
Any output produced by an agent or automation inside the shell is YOUR product,
not Alt+Shift+X's. Before relying on or transmitting any output — especially
legal, financial, or medical content — review it for accuracy and compliance
with your own professional obligations.

4. SECURE YOUR DEVICE
The shell's security is only as strong as the device it runs on. Enable disk
encryption, a strong device password, and keep your browser updated. Anyone
with physical access to your unlocked device can access the shell's local data.

5. BACKUP YOUR DATA
Because data is local, you are responsible for backups. Periodically export
critical data from the shell's local storage to a secure, encrypted location
you control.

6. NO REDISTRIBUTION
This license is personal to you. Do not resell, rebrand, or host the shell as
a paid service to others. If you wish to deploy the shell organizationally,
contact Alt+Shift+X for an enterprise license.

7. KEEP THE LEGAL BUNDLE INTACT
The LEGAL.md file bundled in this download's root folder contains the full text
of the Master EULA, Portable Disclaimer, Privacy Manifest, and this Operator
Guide. Keep it with your copy of the Software for your records and for audit
purposes.

8. TERMINATION & REMOVAL
If you wish to stop using the Software, uninstall the PWA through your browser's
site controls. This removes cached assets and local storage. Retain a copy of
your local data export before uninstalling.

— END OF OPERATOR GUIDE —
`;

// Combined LEGAL.md placed at the ZIP root for easy access.
export const LEGAL_MD = `# Sovereign PWA — Legal Bundle
Effective Date: ${EFFECTIVE_DATE}

This file consolidates the four legal assets bundled with every Sovereign PWA
download package. Keep it with your copy of the Software.

---

${MASTER_EULA}

---

${PORTABLE_DISCLAIMER}

---

${PRIVACY_MANIFEST}

---

${OPERATOR_GUIDE}
`;

export const PWA_LEGAL_ASSETS = [
  {
    key: "eula",
    fileName: "MASTER_EULA.txt",
    title: "Master EULA",
    subtitle: "Primary license — shifts operational risk to the Operator.",
    body: MASTER_EULA,
  },
  {
    key: "disclaimer",
    fileName: "PORTABLE_DISCLAIMER.txt",
    title: "Portable Disclaimer",
    subtitle: "No-Agreement notice — prevents unintended contract formation.",
    body: PORTABLE_DISCLAIMER,
  },
  {
    key: "privacy",
    fileName: "PRIVACY_MANIFEST.txt",
    title: "Privacy Manifest",
    subtitle: "Technical proof of Local-First, encrypted data architecture.",
    body: PRIVACY_MANIFEST,
  },
  {
    key: "guide",
    fileName: "OPERATOR_GUIDE.txt",
    title: "Operator Guide",
    subtitle: "Clean & Legal handbook for compliant operation.",
    body: OPERATOR_GUIDE,
  },
];