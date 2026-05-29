import { useNavigate } from 'react-router-dom';

export const detectTutorialRequest = (query) => {
  const lowerQuery = query.toLowerCase();
  
  const tutorialMap = {
    'getting-started': [
      'how do i get started',
      'new to the platform',
      'first time',
      'where do i start',
      'how to use',
      'getting started',
      'introduction',
      'onboarding'
    ],
    'marketplace': [
      'how to find components',
      'how to install',
      'marketplace',
      'browse components',
      'search components',
      'install components',
      'discover components'
    ],
    'api': [
      'how to use api',
      'api integration',
      'api key',
      'generate api key',
      'api documentation',
      'api reference',
      'integrate with'
    ],
    'billing': [
      'billing',
      'subscription',
      'payment',
      'plan',
      'pricing',
      'upgrade',
      'downgrade',
      'invoice',
      'charge',
      'refund'
    ],
    'analytics': [
      'analytics',
      'reports',
      'usage',
      'metrics',
      'performance',
      'statistics',
      'dashboard'
    ],
    'security': [
      'security',
      'password',
      'two-factor',
      '2fa',
      'authentication',
      'privacy',
      'data protection',
      'account safety'
    ]
  };

  for (const [tutorialId, keywords] of Object.entries(tutorialMap)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      return tutorialId;
    }
  }

  return null;
};

export const getTutorialSuggestion = (tutorialId) => {
  const suggestions = {
    'getting-started': "📚 Check out our Getting Started tutorial to learn the basics!",
    'marketplace': "🔍 Visit our Marketplace tutorial to discover and install components.",
    'api': "⚡ Our API Integration tutorial covers everything you need to connect external systems.",
    'billing': "💳 See our Billing & Subscriptions tutorial for payment management.",
    'analytics': "📊 Explore our Analytics & Reports tutorial to track performance.",
    'security': "🔒 Review our Security & Compliance tutorial to keep your data safe."
  };

  return suggestions[tutorialId] || null;
};

export const TutorialLink = ({ tutorialId, children }) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(`/tutorials?focus=${tutorialId}`)}
      className="text-primary hover:underline font-medium"
    >
      {children}
    </button>
  );
};