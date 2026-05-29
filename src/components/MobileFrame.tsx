/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Clock } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, '0');
      let minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 md:p-6 font-sans select-none overflow-x-hidden">
      {/* Phone outer bezel */}
      <div className="w-full h-screen md:h-[840px] md:w-[410px] bg-slate-950 md:rounded-[48px] md:shadow-2xl md:border-[10px] md:border-slate-800 flex flex-col relative overflow-hidden transition-all duration-300">
        
        {/* Status Bar */}
        <div className="h-11 bg-slate-950 text-slate-100 flex items-center justify-between px-6 select-none relative shrink-0 z-50">
          {/* Time (Left side on modern Android / iOS style) */}
          <span className="text-xs font-semibold tracking-tight my-auto font-sans flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400 inline" />
            {currentTime || '12:45'}
          </span>

          {/* Speaker / Camera Notch (Pure visual polish - Only on desktop) */}
          <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50"></div>

          {/* Status Icons (Right side) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded tracking-wide mr-1 border border-emerald-500/20">MEI-NET</span>
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] font-semibold text-slate-400">98%</span>
              <Battery className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative text-slate-200">
          {children}
        </div>

        {/* Soft Home Indicator Bar (Mobile Navigation Line) - Only on Desktop */}
        <div className="hidden md:flex h-6 bg-slate-950 justify-center items-center shrink-0">
          <div className="w-32 h-1 bg-slate-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
