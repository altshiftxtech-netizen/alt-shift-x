import { Play, BookOpen, Zap, Users, BarChart3, Lock, ShieldCheck, Bot, FileText, GitBranch, Sparkles, Trophy, DollarSign, Share2 } from "lucide-react";

// Each tutorial has sections; each section has step-by-step instructions and an optional video URL.
export const TUTORIALS = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of the platform",
    icon: Play,
    video: "https://www.youtube.com/embed/8jLOx1hD3_o",
    sections: [
      {
        title: "Creating your first account",
        steps: [
          "Click 'Sign up' in the top-right navigation.",
          "Enter your email address and choose a strong password.",
          "Check your inbox for the verification code and enter it.",
          "You'll be redirected to your dashboard once verified.",
        ],
      },
      {
        title: "Understanding the dashboard",
        steps: [
          "The left panel shows your installed components and quick links.",
          "The center displays usage stats and recent activity.",
          "Use the top nav to switch between Marketplace, Dashboard, and Builder Portal.",
        ],
      },
      {
        title: "Navigating the interface",
        steps: [
          "Use the global search to find components and pages quickly.",
          "Click any card to drill into details.",
          "Your profile menu lives in the top-right corner.",
        ],
      },
      {
        title: "Setting up your profile",
        steps: [
          "Go to Dashboard → Settings.",
          "Add your name, company, and notification preferences.",
          "Save changes — your profile is now complete.",
        ],
      },
    ],
  },
  {
    id: "marketplace",
    title: "Using the Marketplace",
    description: "Discover and install AI components",
    icon: BookOpen,
    video: "https://www.youtube.com/embed/2Vv-BfVoq4g",
    sections: [
      {
        title: "Browsing components",
        steps: [
          "Open the Marketplace from the top navigation.",
          "Try the AI Search Consultant at the top to find components by describing your need.",
          "Scroll through the grid to see available components, including the featured Super Dev Kit bundle.",
        ],
      },
      {
        title: "Filtering and searching",
        steps: [
          "Type keywords in the search bar at the top.",
          "Click the 'Filters' button to filter by type (X1–X5).",
          "Sort by Most Installed, Highest Rated, or Trust Score.",
        ],
      },
      {
        title: "Reading component details",
        steps: [
          "Click any component card to open its detail page.",
          "Review the description, features, trust score, and reviews.",
          "Check the pricing and what's included before installing.",
        ],
      },
      {
        title: "Installing components",
        steps: [
          "Click the 'Install' button on a component.",
          "Complete the secure Stripe checkout.",
          "The component appears in your dashboard once payment succeeds.",
        ],
      },
      {
        title: "Managing installations",
        steps: [
          "Go to Dashboard → Installed Components.",
          "View usage and status for each installed component.",
          "Use 'Uninstall' to remove one you no longer need.",
        ],
      },
    ],
  },
  {
    id: "api",
    title: "API Integration",
    description: "Connect with external systems",
    icon: Zap,
    video: "https://www.youtube.com/embed/GZvSYJDk-us",
    sections: [
      {
        title: "Generating API keys",
        steps: [
          "Go to Dashboard → API Keys.",
          "Click 'Generate New Key' and give it a descriptive name.",
          "Copy and store the key securely — it won't be shown again.",
        ],
      },
      {
        title: "Using the API reference",
        steps: [
          "Open the API documentation from your dashboard.",
          "Find the endpoint you need and review its parameters.",
          "Copy the example request to get started quickly.",
        ],
      },
      {
        title: "Making requests",
        steps: [
          "Include your API key in the 'x-api-key' header.",
          "Send a request to the desired endpoint.",
          "Parse the JSON response in your application.",
        ],
      },
      {
        title: "Error handling",
        steps: [
          "Check the HTTP status code on every response.",
          "401 means an invalid or missing API key.",
          "429 means you've hit the rate limit — back off and retry.",
        ],
      },
      {
        title: "Rate limiting",
        steps: [
          "Each plan has a monthly call quota.",
          "Monitor usage in Dashboard → Usage Analytics.",
          "Upgrade your plan if you consistently hit limits.",
        ],
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & Subscriptions",
    description: "Manage payments and plans",
    icon: Users,
    video: null,
    sections: [
      {
        title: "Viewing your subscription",
        steps: [
          "Go to Dashboard → Subscription.",
          "See your current plan, status, and renewal date.",
          "Review your included quota and usage.",
        ],
      },
      {
        title: "Changing your plan",
        steps: [
          "Open the Pricing page.",
          "Select the plan that fits your needs.",
          "Confirm via Stripe checkout — changes apply immediately.",
        ],
      },
      {
        title: "Payment methods",
        steps: [
          "Payment methods are managed securely through Stripe.",
          "Update your card during any checkout or renewal.",
        ],
      },
      {
        title: "Invoices and receipts",
        steps: [
          "Go to Dashboard → Subscription to see your invoice history.",
          "Click any invoice to download the PDF receipt.",
        ],
      },
      {
        title: "Cancellation policy",
        steps: [
          "Cancel anytime from your subscription page.",
          "Access continues until the end of your billing period.",
          "No further charges occur after cancellation.",
        ],
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    description: "Track usage and performance",
    icon: BarChart3,
    video: null,
    sections: [
      {
        title: "Understanding metrics",
        steps: [
          "Open Dashboard → Usage Analytics.",
          "Review API calls, active components, and trends.",
          "Hover over charts for detailed data points.",
        ],
      },
      {
        title: "Viewing analytics",
        steps: [
          "Select a date range to focus your view.",
          "Compare current vs previous periods.",
          "Drill into individual components for detail.",
        ],
      },
      {
        title: "Exporting reports",
        steps: [
          "Click 'Export' on any analytics view.",
          "Choose PDF or CSV format.",
          "The file downloads to your device.",
        ],
      },
      {
        title: "Trends and forecasts",
        steps: [
          "Review the forecast panel for projected usage.",
          "Use trends to plan plan upgrades ahead of time.",
        ],
      },
    ],
  },
  {
    id: "bob-builder",
    title: "Building with BOB",
    description: "Design, analyze, and deploy components with the BOB AI agent",
    icon: Bot,
    video: null,
    sections: [
      {
        title: "Starting a project",
        steps: [
          "Open Builder Portal → BOB Builder.",
          "Click 'Wipe Board' on the splash screen to start a fresh project.",
          "Describe what you want to build in plain language — BOB guides you from there.",
          "Use the Builder Dashboard button anytime to jump back to your portal.",
        ],
      },
      {
        title: "Using the Wipe Board (project history)",
        steps: [
          "Every BOB conversation is saved as a project in the Wipe Board panel.",
          "Click any past project to reopen and continue where you left off.",
          "Hit 'Wipe Board' to start a brand-new project without losing the old ones.",
        ],
      },
      {
        title: "Spinning off a project",
        steps: [
          "Find a project in the Wipe Board and click 'Spin Off'.",
          "BOB forks it into a ready-to-go copy you can take in a new direction.",
          "The original stays untouched so you can branch ideas freely.",
        ],
      },
      {
        title: "Configuring the framework & deploying",
        steps: [
          "Switch to the Framework tab to set component metadata, compliance, and branding.",
          "Use the Deploy tab to finalize and publish your component.",
          "Paid plans unlock document exports and advanced deployment tools.",
        ],
      },
    ],
  },
  {
    id: "esi-records",
    title: "ESI Legal Records",
    description: "Download, email, and share verifiable records of your projects",
    icon: FileText,
    video: null,
    sections: [
      {
        title: "What an ESI record is",
        steps: [
          "An ESI (Electronically Stored Information) record is a cryptographically verifiable PDF of your project.",
          "It includes your full conversation history, metadata, and a chain-of-custody attestation.",
          "Each record carries a SHA-256 integrity hash so it can be verified later.",
        ],
      },
      {
        title: "Downloading an ESI record",
        steps: [
          "In the Wipe Board, click 'ESI Record' on any project.",
          "Paid subscribers download instantly; others complete a one-time $10 unlock.",
          "The PDF saves directly to your device.",
        ],
      },
      {
        title: "Sharing & auto-email on delete",
        steps: [
          "Click 'Share' on a project to send the ESI record to Google Drive, Dropbox, OneDrive, email, and more.",
          "When you move a project to Trash, its ESI record is automatically emailed to you so you always keep a copy.",
          "Trashed projects can be restored, or permanently deleted with a two-step confirmation.",
        ],
      },
    ],
  },
  {
    id: "kit-pairing",
    title: "Kit Pairing & Discounts",
    description: "Pair components with other builders and create promo codes",
    icon: GitBranch,
    video: null,
    sections: [
      {
        title: "Requesting a pairing",
        steps: [
          "Open Builder Portal → Kit Pairing.",
          "Request a pairing with another builder's component — like sending a friend request.",
          "BOB generates an IP-protected pairing statement both sides must acknowledge.",
        ],
      },
      {
        title: "Accepting & revenue split",
        steps: [
          "The partner reviews and accepts or declines the request.",
          "On acceptance, a proportional revenue split is locked in based on each component's price.",
          "Either builder can revoke a pairing with a notice period.",
        ],
      },
      {
        title: "Creating discount codes",
        steps: [
          "From Kit Pairing, create a shareable promo code for your component.",
          "Set the percent off and optional redemption limits or expiry.",
          "Share the code — redemptions are tracked automatically.",
        ],
      },
    ],
  },
  {
    id: "leaderboard-payouts",
    title: "Leaderboard & Payouts",
    description: "Climb the builder ranks and get paid",
    icon: Trophy,
    video: null,
    sections: [
      {
        title: "Builder leaderboard",
        steps: [
          "Open Builder Portal → More → Leaderboard.",
          "See your rank, tier badge, installs, ratings, and momentum score.",
          "Higher activity and ratings boost your leaderboard score.",
        ],
      },
      {
        title: "Setting up payouts",
        steps: [
          "Go to Builder Portal → More → Payouts.",
          "Connect your Stripe account to receive earnings.",
          "Review your revenue share and approved splits before payout.",
        ],
      },
      {
        title: "Referrals",
        steps: [
          "Share your unique referral code from the Payouts page.",
          "Earn credit when referred builders join and publish.",
          "Track referral counts and earnings in your dashboard.",
        ],
      },
    ],
  },
  {
    id: "social-sharing",
    title: "Social Sharing",
    description: "Promote your components and stats across social platforms",
    icon: Share2,
    video: null,
    sections: [
      {
        title: "Sharing components",
        steps: [
          "Open Builder Portal → More → Social.",
          "Pick a component and share it to Twitter, LinkedIn, Instagram, Facebook, or TikTok.",
          "Copy a direct link to share anywhere else.",
        ],
      },
      {
        title: "Bragging your stats",
        steps: [
          "Use the stats share panel to post your install and rating milestones.",
          "Download the promo video to attach to your posts.",
          "Every share is tracked so you can see what drives traffic.",
        ],
      },
    ],
  },
  {
    id: "speakeasy",
    title: "The Speakeasy",
    description: "The members-only lounge for paying builders",
    icon: Sparkles,
    video: null,
    sections: [
      {
        title: "Getting access",
        steps: [
          "The Speakeasy is exclusive to paying builders and developers (Platinum perk).",
          "Once you're on a paid plan, find 'The Speakeasy' highlighted in the portal switcher.",
          "Free-tier users won't see it until they upgrade.",
        ],
      },
      {
        title: "Posting & the Front Man",
        steps: [
          "Share posts, videos, and memes with the community.",
          "@mention the AI Host (The Front Man) to ask questions or get help.",
          "React to posts and reply in threads.",
        ],
      },
      {
        title: "Inviting others",
        steps: [
          "Send Speakeasy invites to colleagues from inside the lounge.",
          "Invitees join once they sign up with your invite code.",
          "Help grow the inner circle of trusted builders.",
        ],
      },
    ],
  },
  {
    id: "ip-protection",
    title: "IP & Proprietary Protection",
    description: "How your IP and proprietary information stays protected — for every user, free or paid",
    icon: ShieldCheck,
    video: null,
    sections: [
      {
        title: "Protection applies to everyone",
        steps: [
          "IP and proprietary protection is built into the platform for ALL users — including free, non-paying accounts.",
          "You never have to pay or upgrade to receive these protections; they are on by default.",
          "Every document, input, and output you process is handled under the same protective scheme.",
        ],
      },
      {
        title: "How masking works",
        steps: [
          "Any IP, trade secrets, or proprietary information detected in your content is automatically masked in generated statements and reports.",
          "Sensitive identifiers are redacted or tokenized before any statement is produced, so raw proprietary data is never exposed.",
          "Masking is irreversible in shared outputs — the original sensitive values remain only inside your private session.",
        ],
      },
      {
        title: "Zero-persistence handling",
        steps: [
          "Your documents exist only in the runtime processing session and are never stored, cached, or logged.",
          "Once processing ends, the source material is discarded — nothing is retained on our servers.",
          "This zero-persistence rule is enforced platform-wide, regardless of plan or payment status.",
        ],
      },
      {
        title: "What you'll see in statements",
        steps: [
          "Generated statements (e.g. pairing or compliance statements) display only masked, protected values.",
          "Look for the protection indicator confirming IP and proprietary information has been masked.",
          "If you believe something was not masked correctly, contact support immediately so we can review it.",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security & Compliance",
    description: "Keep your data safe",
    icon: Lock,
    video: null,
    sections: [
      {
        title: "Password management",
        steps: [
          "Use a unique, strong password for your account.",
          "Update it anytime from Dashboard → Settings → Security.",
          "Never reuse passwords across services.",
        ],
      },
      {
        title: "Two-factor authentication",
        steps: [
          "Go to Dashboard → Settings → Security.",
          "Click 'Enable 2FA' and scan the QR code with an authenticator app.",
          "Enter the 6-digit code to confirm and activate.",
        ],
      },
      {
        title: "Data privacy",
        steps: [
          "Review our Privacy Policy for how data is handled.",
          "Your data is encrypted in transit and at rest.",
          "Request data export or deletion from support.",
        ],
      },
      {
        title: "Security best practices",
        steps: [
          "Enable 2FA on your account.",
          "Rotate API keys periodically.",
          "Review account activity regularly.",
        ],
      },
    ],
  },
];