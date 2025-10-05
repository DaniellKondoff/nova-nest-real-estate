"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "green" | "yellow" | "purple" | "indigo";
  trend?: string;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-100",
    icon: "text-blue-600",
  },
  green: {
    bg: "bg-green-100", 
    icon: "text-green-600",
  },
  yellow: {
    bg: "bg-yellow-100",
    icon: "text-yellow-600",
  },
  purple: {
    bg: "bg-purple-100",
    icon: "text-purple-600",
  },
  indigo: {
    bg: "bg-indigo-100",
    icon: "text-indigo-600",
  },
};

export function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        {/* Icon */}
        <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>

        {/* Content */}
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {title}
          </div>
          {trend && (
            <div className="text-xs text-gray-500 mt-1">
              {trend}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
