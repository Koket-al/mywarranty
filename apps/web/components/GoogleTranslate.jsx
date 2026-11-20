'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

export default function GoogleTranslate() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'am', label: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
    { code: 'om', label: 'Oromo', native: 'Afaan Oromoo', flag: '🇪🇹' }
  ];

  const activeLangObj = languages.find(l => l.code === currentLang) || languages[0];

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Hidden container for Google Translate element */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Styled Translation Trigger Mark */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.42rem 0.95rem',
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--border)',
          borderRadius: '9999px',
          fontSize: '0.8125rem',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: 'var(--feature-primary)',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(9, 32, 50, 0.12)',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap'
        }}
        title="Translate / Change Language"
      >
        <Globe size={15} color="var(--feature-primary)" />
        <span>{activeLangObj.native}</span>
        <ChevronDown 
          size={13} 
          color="var(--feature-primary)" 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s ease' 
          }} 
        />
      </button>

      {/* Language Selection Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          minWidth: '195px',
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--border)',
          borderRadius: '14px',
          boxShadow: '0 12px 32px -4px rgba(9, 32, 50, 0.22), 0 2px 6px -1px rgba(9, 32, 50, 0.08)',
          padding: '0.35rem',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div style={{
            padding: '0.45rem 0.75rem 0.25rem',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)'
          }}>
            Select Language
          </div>

          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'var(--bg)' : 'transparent',
                  color: isSelected ? '#000000' : 'var(--primary)',
                  fontWeight: isSelected ? 800 : 500,
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#fcedcb';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ fontSize: '0.95rem' }}>{lang.flag}</span>
                  <div>
                    <div style={{ lineHeight: 1.2, fontWeight: 700 }}>{lang.native}</div>
                    <div style={{ fontSize: '0.68rem', color: isSelected ? '#092032' : 'var(--text-muted)', lineHeight: 1.2 }}>{lang.label}</div>
                  </div>
                </div>
                {isSelected && <Check size={14} color="#000000" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

