/**
 * CarCard Component
 * Displays car information with image, specs, and match score
 */

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Car as CarIcon, Fuel, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Car } from '@/lib/api';

interface CarCardProps {
  car: Car;
  compact?: boolean;
  onSelect?: () => void;
}

export default function CarCard({ car, compact = false, onSelect }: CarCardProps) {
  const { basic_info, specifications, match_score } = car;

  if (compact) {
    // Convert match score to star rating (out of 5)
    const starRating = match_score ? Math.round((match_score / 100) * 5) : 0;
    
    return (
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)" }}
        className="bg-white rounded-lg shadow-md p-4 cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all relative group"
        onClick={onSelect}
        title="Click to learn more about why this car matches you"
      >
        <div className="flex gap-3">
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
            {basic_info.image_url && basic_info.image_url !== 'placeholder.jpg' ? (
              <Image
                src={basic_info.image_url}
                alt={`${basic_info.make} ${basic_info.model}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <CarIcon className="w-10 h-10 text-blue-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate text-gray-900">
              {basic_info.make} {basic_info.model}
            </h3>
            <p className="text-xs text-gray-600 mb-1">{basic_info.year}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-700">
                ${basic_info.msrp.toLocaleString()}
              </span>
              {match_score && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < starRating ? 'text-yellow-500' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hover indicator */}
        <div className="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-blue-600 font-medium text-center">
            💬 Click to ask AI why this matches you
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer"
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
        {basic_info.image_url && basic_info.image_url !== 'placeholder.jpg' ? (
          <Image
            src={basic_info.image_url}
            alt={`${basic_info.make} ${basic_info.model}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CarIcon className="w-20 h-20 text-blue-300" />
          </div>
        )}
        
        {/* Match Badge */}
        {match_score && (
          <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-blue-700">
                {match_score >= 90 ? 'Excellent' : match_score >= 80 ? 'Great' : match_score >= 70 ? 'Good' : 'Fair'}
              </span>
              <span className="text-sm text-gray-500">Match</span>
            </div>
            <div className="flex gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => {
                const starValue = match_score ? Math.round((match_score / 100) * 5) : 0;
                return (
                  <span key={i} className={`text-sm ${i < starValue ? 'text-yellow-500' : 'text-gray-300'}`}>
                    ★
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold mb-1">
            {basic_info.make} {basic_info.model}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{basic_info.year} • {basic_info.trim}</span>
            <span className="text-2xl font-bold text-blue-600">
              ${basic_info.msrp.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <Fuel className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">MPG</p>
              <p className="font-semibold">{specifications.mpg_combined}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">HP</p>
              <p className="font-semibold">{specifications.horsepower}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Seats</p>
              <p className="font-semibold">{specifications.seating_capacity}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <CarIcon className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600">Type</p>
              <p className="font-semibold text-sm">{basic_info.body_type}</p>
            </div>
          </div>
        </div>

        {/* Engine Info */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Engine:</span> {specifications.engine}
          </p>
        </div>

        {/* Match Reasons (if available) */}
        {(car as any).match_reasons && (car as any).match_reasons.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-blue-800 mb-2">Why This Match:</h4>
            <div className="flex flex-wrap gap-2">
              {(car as any).match_reasons.map((reason: string, index: number) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Score Breakdown (if available) - Visual Bars */}
        {(car as any).score_breakdown && (
          <div className="mb-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Why This Match:</h4>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Lifestyle</span>
                  <span className="font-semibold text-blue-700">
                    {(car as any).score_breakdown.lifestyle_match >= 90 ? 'Excellent' : 
                     (car as any).score_breakdown.lifestyle_match >= 80 ? 'Great' : 
                     (car as any).score_breakdown.lifestyle_match >= 70 ? 'Good' : 'Fair'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(car as any).score_breakdown.lifestyle_match}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Budget</span>
                  <span className="font-semibold text-green-700">
                    {(car as any).score_breakdown.budget_fit >= 90 ? 'Perfect' : 
                     (car as any).score_breakdown.budget_fit >= 75 ? 'Good' : 'Stretch'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${(car as any).score_breakdown.budget_fit}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Features</span>
                  <span className="font-semibold text-purple-700">
                    {(car as any).score_breakdown.feature_quality >= 85 ? 'Excellent' : 'Good'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${(car as any).score_breakdown.feature_quality}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Value</span>
                  <span className="font-semibold text-orange-700">
                    {(car as any).score_breakdown.value_score >= 80 ? 'Great' : 'Good'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-600 rounded-full"
                    style={{ width: `${(car as any).score_breakdown.value_score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pros */}
        {car.pros && car.pros.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-green-700 mb-2">Top Features:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {car.pros.slice(0, 2).map((pro, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <button className="w-full btn-primary text-sm py-2">
          View Details
        </button>
      </div>
    </motion.div>
  );
}
