import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  BookOpen,
  Users,
  MessageCircle,
  Zap,
  Award,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="animate-fade-in bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 rounded-b-3xl overflow-hidden mb-16">
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center px-4 py-2 bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Peer-to-Peer Learning Reimagined
            </span>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-primary-400 dark:to-secondary-400">
              Welcome to <span className="text-primary-500 dark:text-primary-400">PeerBridge</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Connect with peers, solve doubts, and accelerate your learning journey in our
              <span className="text-primary-500 dark:text-primary-400 font-medium"> AI-powered knowledge network</span>.
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/dashboard"
                  className="btn-primary text-lg px-8 py-3.5 hover:shadow-lg hover:shadow-primary-500/20 dark:hover:shadow-primary-500/30 transition-all duration-300"
                >
                  Go to Dashboard
                </Link>
                {user.role === 'junior' && (
                  <Link
                    to="/post-doubt"
                    className="btn-outline text-lg px-8 py-3.5 border-gray-600 dark:border-gray-500 hover:bg-gray-800/50 dark:hover:bg-gray-700/50 hover:border-gray-500 dark:hover:border-gray-400 transition-colors"
                  >
                    Post Your First Doubt
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="btn-primary text-lg px-8 py-3.5 hover:shadow-lg hover:shadow-primary-500/20 dark:hover:shadow-primary-500/30 transition-all duration-300"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="btn-outline text-lg px-8 py-3.5 border-gray-600 dark:border-gray-500 hover:bg-gray-800/50 dark:hover:bg-gray-700/50 hover:border-gray-500 dark:hover:border-gray-400 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-200 dark:bg-gray-800 text-primary-500 dark:text-primary-400 mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Elevate Your <span className="text-primary-500 dark:text-primary-400">Learning Experience</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our platform combines cutting-edge technology with human expertise
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6 text-primary-500 dark:text-primary-400" />,
              title: "AI-Powered Matching",
              desc: "Our Gemini AI analyzes your doubts and matches them with the right mentors based on expertise.",
              bg: "from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/10"
            },
            {
              icon: <MessageCircle className="w-6 h-6 text-secondary-500 dark:text-secondary-400" />,
              title: "Real-time Communication",
              desc: "Connect instantly with mentors through our built-in chat system with markdown support.",
              bg: "from-secondary-100 to-secondary-50 dark:from-secondary-900/30 dark:to-secondary-900/10"
            },
            {
              icon: <Award className="w-6 h-6 text-accent-500 dark:text-accent-400" />,
              title: "Gamified Learning",
              desc: "Earn points, badges, and recognition for helping others. Make learning fun and rewarding.",
              bg: "from-accent-100 to-accent-50 dark:from-accent-900/30 dark:to-accent-900/10"
            },
            {
              icon: <Users className="w-6 h-6 text-green-500 dark:text-green-400" />,
              title: "Diverse Community",
              desc: "Join learners from different backgrounds, skills, and experience levels worldwide.",
              bg: "from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10"
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-orange-500 dark:text-orange-400" />,
              title: "Track Progress",
              desc: "Detailed analytics on doubts resolved, skills gained, and peer connections.",
              bg: "from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/10"
            },
            {
              icon: <BookOpen className="w-6 h-6 text-purple-500 dark:text-purple-400" />,
              title: "Knowledge Base",
              desc: "Searchable repository of solved doubts organized by topic and difficulty.",
              bg: "from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${feature.bg} border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group`}
            >
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl backdrop-blur-sm mx-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-primary-500 dark:text-primary-400 mb-4">
              Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="text-secondary-500 dark:text-secondary-400">PeerBridge</span> Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Simple steps to accelerate your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Juniors */}
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-8 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
              <div className="flex items-center mb-6">
                <span className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">J</span>
                <h3 className="text-2xl font-semibold text-primary-500 dark:text-primary-400">
                  For Juniors
                </h3>
              </div>
              <div className="space-y-5">
                {[
                  "Post your doubt with details, code snippets, or images",
                  "AI categorizes and tags your doubt for better matching",
                  "Get connected with qualified seniors in real-time"
                ].map((step, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Seniors */}
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-8 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
              <div className="flex items-center mb-6">
                <span className="w-10 h-10 bg-secondary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">S</span>
                <h3 className="text-2xl font-semibold text-secondary-500 dark:text-secondary-400">
                  For Seniors
                </h3>
              </div>
              <div className="space-y-5">
                {[
                  "Browse AI-filtered doubts matching your expertise",
                  "Claim and solve doubts you're confident about",
                  "Build reputation and earn rewards for contributions"
                ].map((step, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-secondary-500/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-24 px-6 max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 opacity-20 dark:opacity-10">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands who are already benefiting from our peer-to-peer knowledge network.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center btn-primary text-lg px-8 py-3.5 hover:shadow-lg hover:shadow-primary-500/30 dark:hover:shadow-primary-500/40 transition-all"
              >
                Join PeerBridge Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home