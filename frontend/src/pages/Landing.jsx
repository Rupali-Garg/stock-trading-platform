import { Link } from 'react-router-dom';
import { TrendingUp, Shield, BarChart3, Star } from 'lucide-react';

const features = [
  { icon: BarChart3, title: 'Portfolio Tracking',
    desc: 'Track all your holdings with real-time P&L calculations.' },
  { icon: Star,      title: 'Watchlists',
    desc: 'Monitor stocks you are interested in before buying.' },
  { icon: Shield,    title: 'Secure Auth',
    desc: 'JWT authentication with refresh tokens keeps you safe.' },
  { icon: TrendingUp,title: 'Trade Stocks',
    desc: 'Buy and sell stocks with instant portfolio updates.' },
];

const Landing = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    {/* Navbar */}
    <nav className="flex items-center justify-between
                    max-w-6xl mx-auto px-6 py-5">
      <div className="flex items-center gap-2 font-bold text-xl">
        <TrendingUp className="text-primary-500" size={24} />
        StockApp
      </div>
      <div className="flex gap-3">
        <Link to="/login"  className="btn-secondary text-sm">Login</Link>
        <Link to="/signup" className="btn-primary  text-sm">Get Started</Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="max-w-4xl mx-auto px-6 py-24 text-center">
      <div className="inline-block bg-primary-600/20 text-primary-400
                      text-sm font-medium px-4 py-1.5 rounded-full mb-6">
        Portfolio Management Platform
      </div>
      <h1 className="text-5xl font-bold leading-tight mb-6">
        Track Your Portfolio.<br />
        <span className="text-primary-500">Grow Your Wealth.</span>
      </h1>
      <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
        A full-featured stock trading simulator with real portfolio
        tracking, watchlists, and transaction history.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/signup" className="btn-primary text-base px-8 py-3">
          Start Trading Free
        </Link>
        <Link to="/login" className="btn-secondary text-base px-8 py-3">
          Sign In
        </Link>
      </div>
    </section>

    {/* Features */}
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">
        Everything You Need
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card text-center group
                hover:border-primary-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary-600/20
                            flex items-center justify-center mx-auto mb-4">
              <Icon className="text-primary-400" size={22} />
            </div>
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-slate-800 text-center
                       py-8 text-slate-500 text-sm">
      Built with Node.js · React · MongoDB · AWS
    </footer>
  </div>
);

export default Landing;