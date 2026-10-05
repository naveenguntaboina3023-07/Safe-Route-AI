import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Map, FileWarning, Star, ChevronRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Map,          title: 'Smart Route Comparison',  desc: 'Compare 2–3 campus routes with distance, time, and safety scores side by side.' },
  { icon: Shield,       title: 'AI Safety Analysis',       desc: 'AI-powered recommendations backed by lighting, CCTV coverage, and crowd data.' },
  { icon: FileWarning,  title: 'Community Reporting',      desc: 'Report unsafe locations. Admin-reviewed reports feed directly into scoring.' },
  { icon: Star,         title: 'Explainable Scores',       desc: 'Every score comes with clear reasons — not a black-box number.' },
];

const steps = [
  { n: '1', title: 'Register & Log in',       desc: 'Create your free student account.' },
  { n: '2', title: 'Pick start & destination', desc: 'Select locations on the map or from the list.' },
  { n: '3', title: 'Get your safe route',       desc: 'View scored routes and AI recommendation instantly.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">SafeRoute AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star size={14} fill="currentColor" /> AI-Powered Campus Safety
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
            Navigate Campus <br className="hidden sm:block" />
            <span className="text-yellow-300">Safer, Smarter</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            SafeRoute AI compares campus routes using lighting, security points, approved
            safety reports, and crowd activity — then recommends the route with the better
            estimated safety profile.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
              Start for free <ChevronRight size={16} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors border border-white/30">
              Sign in
            </Link>
          </div>
          <p className="mt-5 text-xs text-blue-200">
            ⚠️ Safety scores are estimates based on available data and are not guarantees of real-world safety.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need for safer navigation</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Built for students. Powered by community data and AI.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-primary-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">{n}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer banner */}
      <section className="bg-amber-50 border-y border-amber-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-amber-800">
            <strong>Prototype Disclaimer:</strong> SafeRoute AI is a college-level academic prototype.
            Safety scores are estimates based on available data and are not guarantees of real-world safety.
            This is not an emergency or security system.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-700 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to navigate smarter?</h2>
        <p className="text-blue-200 mb-6 text-sm">Join your campus community on SafeRoute AI.</p>
        <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
          Create free account <ChevronRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} SafeRoute AI — Academic Prototype &nbsp;|&nbsp; Not for emergency use
      </footer>
    </div>
  );
}
