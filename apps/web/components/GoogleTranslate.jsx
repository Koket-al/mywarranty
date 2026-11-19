'use client';

import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

export default function GoogleTranslate() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Check initial language from cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return '';
    };

    const cookieLang = getCookie('googtrans');
    if (cookieLang.includes('/am')) {
      setCurrentLang('am');
    } else {
      setCurrentLang('en');
    }

    // Define the global Google Translate init callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,am',
          autoDisplay: false
        }, 'google_translate_element');
        setIsScriptLoaded(true);
      }
    };

    // Load Google Translate script if not already added
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      setIsScriptLoaded(true);
    }
  }, []);

  const changeLanguage = (targetLang) => {
    if (targetLang === currentLang) return;

    const domain = window.location.hostname;
    const cookieValue = targetLang === 'am' ? '/auto/am' : '/auto/en';

    // Set translation cookies across paths and hostnames
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain};`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${domain};`;

    setCurrentLang(targetLang);

    // Try updating Google Translate combo directly, or reload smoothly
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {/* Hidden container for Google Translate element */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Styled Language Toggle Pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '2px',
        fontSize: '0.78rem',
        fontWeight: 600
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px', color: 'var(--text-muted)' }}>
          <Globe size={13} />
        </div>

        <button
          type="button"
          onClick={() => changeLanguage('en')}
          style={{
            border: 'none',
            background: currentLang === 'en' ? '#ffffff' : 'transparent',
            color: currentLang === 'en' ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: '16px',
            padding: '3px 8px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: currentLang === 'en' ? 700 : 500,
            boxShadow: currentLang === 'en' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
          title="Switch to English"
        >
          EN
        </button>

        <button
          type="button"
          onClick={() => changeLanguage('am')}
          style={{
            border: 'none',
            background: currentLang === 'am' ? '#ffffff' : 'transparent',
            color: currentLang === 'am' ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: '16px',
            padding: '3px 9px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: currentLang === 'am' ? 700 : 500,
            boxShadow: currentLang === 'am' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
          title="ወደ አማርኛ ቀይር (Switch to Amharic)"
        >
          አማርኛ
        </button>
      </div>
    </div>
  );
}
