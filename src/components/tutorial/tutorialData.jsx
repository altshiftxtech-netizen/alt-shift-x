import { Play, BookOpen, Zap, Users, BarChart3, Lock } from "lucide-react";

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
        title: "Browsing components by category",
        steps: [
          "Open the Marketplace from the top navigation.",
          "Use the left sidebar to filter by category (e.g. AI Agent Development).",
          "Scroll through the grid to see available components.",
        ],
      },
      {
        title: "Filtering and searching",
        steps: [
          "Type keywords in the search bar at the top.",
          "Filter by type (X1–X5) in the sidebar.",
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