'use client';

/**
 * Home/Landing Page
 * Beautiful introduction to CarConvo with CTA to start personality test
 */

import { useRouter } from 'next/navigation';
import { Car, Sparkles, MessageCircle, TrendingUp, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Natural Conversations',
      description: 'Chat naturally with our AI to discover your perfect car',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Personality Matching',
      description: 'Take a quick test to understand your driving lifestyle',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Smart Recommendations',
      description: 'Get personalized car suggestions based on your profile',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Complete Analysis',
      description: 'Compare features, costs, and find the best value',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden flex-1">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 opacity-10"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Logo/Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-2xl">
                <Car className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            >
              Find Your Perfect Car
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-2xl text-gray-800 mb-8"
            >
              Let AI understand your lifestyle and recommend the ideal vehicle for you
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <button
                onClick={() => router.push('/personality-test')}
                className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Start Your Journey
              </button>
              
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
          >
            {[
              { number: '100+', label: 'Vehicles in Database' },
              { number: '10', label: 'Lifestyle Dimensions' },
              { number: 'AI', label: 'Powered Conversations' },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg text-center card-hover border border-blue-100"
              >
                <div className="text-4xl font-bold text-blue-700 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-800">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How CarConvo Works</h2>
            <p className="text-xl text-gray-700">
              A smarter way to find your next vehicle
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 card-hover border border-blue-200"
              >
                <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-blue-700 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Find Your Dream Car?
            </h2>
            <p className="text-xl text-blue-50 mb-8">
              Take our personality test and start chatting with our AI assistant
            </p>
            <button
              onClick={() => router.push('/personality-test')}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-4 px-12 rounded-lg text-lg shadow-xl transform transition-all duration-200 hover:scale-105"
            >
              Get Started Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-200">
            © 2024 CarConvo. AI-powered car recommendations made simple.
          </p>
        </div>
      </footer>
    </div>
  );
}
