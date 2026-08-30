'use client';

import React from 'react';
import { AdminTCCResearchView } from '@/components/AdminTCCResearchView';

export default function AdminTCCPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <AdminTCCResearchView />
      </div>
    </div>
  );
}
