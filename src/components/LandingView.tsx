import { motion } from 'motion/react';
import { 
  PlusCircle, 
  Layers, 
  Users, 
  TrendingUp, 
  FileText, 
  Briefcase, 
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface LandingViewProps {
  onNavigate: (route: string) => void;
}

export default function LandingView({ onNavigate }: LandingViewProps) {
  const features = [
    {
      icon: <PlusCircle className="w-6 h-6 text-emerald-600" />,
      title: "Daily Expense Tracking",
      description: "Quick, single-click entry for snacks, groceries, auto-rickshaw rides with no complicated forms."
    },
    {
      icon: <Layers className="w-6 h-6 text-blue-600" />,
      title: "Needs vs Wants System",
      description: "Direct classification that helps you spot visual habits without accounting codes."
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      title: "Family Budgeting",
      description: "Calculate per-person monthly expenditure to see how you support your entire household."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      title: "Savings Goals",
      description: "Set targets for festivals, school fees, or emergency funds. We show you exactly what to save."
    },
    {
      icon: <FileText className="w-6 h-6 text-amber-600" />,
      title: "Daily Expense Notes",
      description: "A fast dry-erase sticky pad to write 'Tea 20, Bus 30' throughout the day, and convert them later."
    },
    {
      icon: <Briefcase className="w-6 h-6 text-purple-600" />,
      title: "Multiple Income Sources",
      description: "Combine traditional salary, side business earnings, pension, chitti returns, or rental inflows."
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between">
      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-lg font-mono">
            B
          </div>
          <span className="font-bold tracking-tight text-xl text-neutral-900 font-sans">
            BUDGETY
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            id="btn-nav-login"
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Login
          </button>
          <button 
            id="btn-nav-signup"
            onClick={() => onNavigate('signup')}
            className="bg-neutral-900 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-all font-sans cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex-grow flex flex-col justify-center">
        <div className="max-w-3xl text-left md:text-center md:mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 text-white mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Secure & Offline. Your data stays on your device.
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1] mb-6 font-sans"
          >
            Budgeting for people who <br className="hidden md:inline" />
            <span className="text-neutral-900 font-extrabold relative inline-block">never budgeted</span>.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-neutral-600 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl md:mx-auto font-sans font-light"
          >
            Track spending, understand needs vs wants, and build better money habits — without the headache of spreadsheets or complicated finance tools. Designed for real Indian households.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 sm:justify-center mb-8"
          >
            <button
              id="landing-hero-signup"
              onClick={() => onNavigate('signup')}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 font-sans cursor-pointer"
            >
              Start Free Budgeting
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="landing-hero-login"
              onClick={() => onNavigate('login')}
              className="bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-800 font-medium text-sm px-6 py-3.5 rounded-xl transition-all font-sans cursor-pointer"
            >
              Log In to My Budget
            </button>
          </motion.div>

          {/* Animated scroll down indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 6, 0] }}
            transition={{ 
              opacity: { delay: 0.4, duration: 0.5 },
              y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
            }}
            className="flex flex-col items-center justify-center gap-1.5 text-xs text-neutral-400 mt-2 mb-16 cursor-pointer select-none"
            onClick={() => {
              const el = document.getElementById('feature-scroll-target');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="font-light tracking-wide">Scroll to explore details</span>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div id="feature-scroll-target" className="mt-8 border-t border-neutral-250 pt-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-10 font-sans tracking-tight md:text-center">
            How BUDGETY supports your family
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => (
              <motion.div
                id={`feature-card-${index}`}
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-neutral-200 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-neutral-50 rounded-xl w-12 h-12 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-2 font-sans">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed font-sans font-light">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 px-6 mt-16 font-sans">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-white text-black font-bold flex items-center justify-center font-mono text-sm leading-none">
              B
            </div>
            <span className="font-semibold text-white tracking-tight">
              BUDGETY
            </span>
          </div>
          <p className="text-xs text-neutral-500 text-center md:text-right">
            &copy; 2026 BUDGETY. Made with care for families looking to secure their financial future. No trackers, fully stored in-browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
