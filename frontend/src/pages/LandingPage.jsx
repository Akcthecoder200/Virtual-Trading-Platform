import { Link } from "react-router-dom";
import {
  TrendingUp,
  Shield,
  DollarSign,
  BarChart3,
  Users,
  Star,
} from "lucide-react";
import { runAuthTests } from "../utils/authTest";
import ReduxTestComponent from "../components/ReduxTestComponent";

const LandingPage = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Real-Time Trading",
      description:
        "Trade with live market data and real-time price updates for authentic trading experience.",
    },
    {
      icon: Shield,
      title: "Risk-Free Environment",
      description:
        "Practice trading strategies without financial risk using virtual currency.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Track your performance with detailed charts and comprehensive trading analytics.",
    },
    {
      icon: DollarSign,
      title: "Virtual Portfolio",
      description:
        "Manage a diverse portfolio with $100,000 virtual starting capital.",
    },
    {
      icon: Users,
      title: "Community Features",
      description:
        "Learn from other traders and share your trading strategies with the community.",
    },
    {
      icon: Star,
      title: "Professional Tools",
      description:
        "Access professional-grade trading tools and market analysis features.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Investment Analyst",
      content:
        "This platform helped me master trading strategies before investing real money. The analytics are fantastic!",
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Day Trader",
      content:
        "Perfect for testing new strategies. The real-time data makes it feel like actual trading.",
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      role: "Finance Student",
      content:
        "As a beginner, this platform gave me the confidence to understand market dynamics safely.",
      avatar: "ER",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold">VirtualTrade</span>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Master Trading Without Risk
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Practice trading with real market data, virtual money, and
            professional tools. Build confidence before investing real capital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
            >
              Start Trading Free
              <TrendingUp className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="border border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
            >
              Login to Continue
            </Link>
          </div>

          {/* Temporary Test Button */}
          <div className="mt-8">
            <button
              onClick={runAuthTests}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              🧪 Test Authentication (Dev)
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Check browser console for test results
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose VirtualTrade?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to learn trading and improve your investment
              skills
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <feature.icon className="w-10 h-10 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">
            Join Thousands of Successful Traders
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
              <div className="text-4xl font-bold text-blue-500 mb-2">50K+</div>
              <div className="text-lg text-gray-300">Active Traders</div>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
              <div className="text-4xl font-bold text-green-500 mb-2">$2M+</div>
              <div className="text-lg text-gray-300">Virtual Trades Made</div>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
              <div className="text-4xl font-bold text-purple-500 mb-2">95%</div>
              <div className="text-lg text-gray-300">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-300">
              Real feedback from real traders
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-900 p-6 rounded-lg border border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Trading Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of traders who are already improving their skills
            with VirtualTrade
          </p>
          <Link
            to="/signup"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all inline-flex items-center justify-center"
          >
            Get Started Now - It's Free
            <TrendingUp className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Temporary Redux Test Component */}
      <section className="py-12 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <ReduxTestComponent />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <span className="ml-2 text-lg font-bold">VirtualTrade</span>
              </div>
              <p className="text-gray-400">
                The premier virtual trading platform for learning and practicing
                investment strategies.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VirtualTrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
