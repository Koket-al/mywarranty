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
    if (cookieLang.includes('/om')) {
      setCurrentLang('om');
    } else if (cookieLang.includes('/am')) {
      setCurrentLang('am');
    } else {
      setCurrentLang('en');
    }

    // Define the global Google Translate init callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,am,om',
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

  // Proactively suppress Google Translate top toolbar banner & eliminate page shift
  useEffect(() => {
    const suppressGoogleBanner = () => {
      if (typeof document === 'undefined') return;

      // Force body top to 0px
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.setProperty('top', '0px', 'important');
      }
      if (document.body.style.position === 'relative') {
        document.body.style.setProperty('position', 'static', 'important');
      }

      // Hide all Google banner selectors
      const bannerSelectors = [
        '.goog-te-banner-frame',
        'iframe.skiptranslate',
        'iframe.goog-te-banner-frame',
        'iframe[id*=".container"]',
        '.VIpgJd-ZVi9od-ORHb-OEVmcd',
        '.VIpgJd-ZVi9od-ORHb-OEVmcd-ti6hGc',
        '.VIpgJd-ZVi9od-aZ2wEe-wOHMyf',
        '.VIpgJd-y6EKec',
        '#goog-gt-tt',
        '.goog-te-balloon-frame'
      ];

      bannerSelectors.forEach((sel) => {
        const elements = document.querySelectorAll(sel);
        elements.forEach((el) => {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('height', '0px', 'important');
          el.style.setProperty('width', '0px', 'important');
          el.style.setProperty('opacity', '0', 'important');
        });
      });

      // Clean up any extra skiptranslate banner wrappers directly attached to body
      const bodyChildren = document.body.children;
      for (let i = 0; i < bodyChildren.length; i++) {
        const child = bodyChildren[i];
        if (
          child.id !== 'google_translate_element' &&
          (child.classList?.contains('skiptranslate') || (child.tagName === 'IFRAME' && child.className?.includes('skiptranslate')))
        ) {
          child.style.setProperty('display', 'none', 'important');
          child.style.setProperty('visibility', 'hidden', 'important');
          child.style.setProperty('height', '0px', 'important');
          child.style.setProperty('opacity', '0', 'important');
        }
      }
    };

    suppressGoogleBanner();
    const interval = setInterval(suppressGoogleBanner, 150);

    const observer = new MutationObserver(() => {
      suppressGoogleBanner();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: false
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const changeLanguage = (targetLang) => {
    if (targetLang === currentLang) return;

    const domain = window.location.hostname;
    const cookieValue = `/auto/${targetLang}`;

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
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '9999px',
        padding: '2px 3px',
        fontSize: '0.78rem',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        whiteSpace: 'nowrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 5px', color: '#64748b' }}>
          <Globe size={13} />
        </div>

        <button
          type="button"
          onClick={() => changeLanguage('en')}
          style={{
            border: currentLang === 'en' ? '1px solid #e2e8f0' : '1px solid transparent',
            background: currentLang === 'en' ? '#ffffff' : 'transparent',
            color: currentLang === 'en' ? '#202223' : '#64748b',
            borderRadius: '9999px',
            padding: '3px 8px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: currentLang === 'en' ? 700 : 500,
            boxShadow: currentLang === 'en' ? '0 1px 2px rgba(32, 34, 35, 0.08)' : 'none',
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
            border: currentLang === 'am' ? '1px solid #e2e8f0' : '1px solid transparent',
            background: currentLang === 'am' ? '#ffffff' : 'transparent',
            color: currentLang === 'am' ? '#202223' : '#64748b',
            borderRadius: '9999px',
            padding: '3px 8px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: currentLang === 'am' ? 700 : 500,
            boxShadow: currentLang === 'am' ? '0 1px 2px rgba(32, 34, 35, 0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
          title="ወደ አማርኛ ቀይር (Switch to Amharic)"
        >
          አማርኛ
        </button>

        <button
          type="button"
          onClick={() => changeLanguage('om')}
          style={{
            border: currentLang === 'om' ? '1px solid #e2e8f0' : '1px solid transparent',
            background: currentLang === 'om' ? '#ffffff' : 'transparent',
            color: currentLang === 'om' ? '#202223' : '#64748b',
            borderRadius: '9999px',
            padding: '3px 8px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: currentLang === 'om' ? 700 : 500,
            boxShadow: currentLang === 'om' ? '0 1px 2px rgba(32, 34, 35, 0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
          title="Gara Afaan Oromootti jijjiiri (Switch to Afaan Oromoo)"
        >
          Oromoo
        </button>
      </div>
    </div>
  );
}

