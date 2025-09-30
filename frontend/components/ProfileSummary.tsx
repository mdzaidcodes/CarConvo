/**
 * ProfileSummary Component
 * Displays user's lifestyle profile with visual indicators
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, ChevronUp } from 'lucide-react';
import { LifestyleProfile } from '@/lib/api';

interface ProfileSummaryProps {
  profile: LifestyleProfile;
}

export default function ProfileSummary({ profile }: ProfileSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get top 3 dimensions
  const sortedDimensions = Object.entries(profile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const dimensionLabels: Record<string, string> = {
    family_friendly: 'Family',
    adventure: 'Adventure',
    eco_conscious: 'Eco',
    luxury: 'Luxury',
    performance: 'Performance',
    budget_conscious: 'Budget',
    city_driving: 'City',
    commuter: 'Commuter',
    tech_enthusiast: 'Tech',
    safety_focused: 'Safety',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
      >
        <User className="w-5 h-5 text-blue-600" />
        <span className="font-medium">Your Profile</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20"
          >
            <h3 className="font-semibold mb-3">Your Top Priorities</h3>
            <div className="space-y-3">
              {sortedDimensions.map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">
                      {dimensionLabels[key] || key}
                    </span>
                    <span className="text-gray-600">{value}/10</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(value / 10) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                We use this profile to match you with the perfect vehicles for your lifestyle.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

