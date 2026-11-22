'use client';

import React, { useEffect, useState } from 'react';
import { CriadorArtigosAbntPage } from '@/components/abnt/CriadorArtigosAbntPage';
import { getAuthorizedUserInfo } from '@/lib/authConfig';
import { supabase } from '@/lib/supabaseClient';

export function ArtigosAbntPageClient() {
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lms_active_user_email') || '';
    }
    return '';
  });
  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('lms_active_user_email');
      if (email) {
        return getAuthorizedUserInfo(email).user?.name || email;
      }
    }
    return '';
  });

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        const sessionEmail = data?.session?.user?.email;
        if (sessionEmail) {
          setUserEmail(sessionEmail);
          const info = getAuthorizedUserInfo(sessionEmail);
          const metaName =
            data.session?.user?.user_metadata?.full_name ||
            data.session?.user?.user_metadata?.name;
          setUserName(info.user?.name || metaName || sessionEmail);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#090d16] text-gray-900 dark:text-slate-100">
      <CriadorArtigosAbntPage
        userEmail={userEmail}
        userName={userName}
        isStandalonePage
      />
    </div>
  );
}
