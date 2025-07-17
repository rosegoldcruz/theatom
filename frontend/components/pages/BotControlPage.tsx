'use client';

import React from 'react';
import { BotControls } from '@/components/BotControls';

export function BotControlPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bot Control</h1>
        <p className="text-gray-500 mt-2">
          Configure and manage your arbitrage trading bot
        </p>
      </div>
      
      <BotControls />
    </div>
  );
}
