import React from 'react';

export default function LoadingState({ message = "Loading groundwater intelligence..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-ping"></div>
        <div className="w-14 h-14 rounded-full border-4 border-t-teal-400 border-r-transparent border-b-teal-500/30 border-l-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-300">{message}</p>
      <span className="text-xs text-gray-400 mt-1">Interfacing with Hydrogeological Machine Learning Pipeline</span>
    </div>
  );
}
