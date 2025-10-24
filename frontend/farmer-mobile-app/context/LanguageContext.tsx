import React, { createContext, useState, useContext, ReactNode } from 'react';
import { I18n } from 'i18n-js';
// We no longer need expo-localization
// import * as Localization from 'expo-localization'; 

// 1. Import all your translation files
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import pa from '@/locales/pa.json';
import ta from '@/locales/ta.json';
import te from '@/locales/te.json';

// 2. Set up i18n-js
const i18n = new I18n({
  en,
  hi,
  pa,
  ta,
  te,
  // ... add other languages here
});

// 3. Set 'en' as the hardcoded default language
// We removed the auto-detection logic
const defaultLocale = 'en';

i18n.defaultLocale = 'en'; // Fallback to English
i18n.locale = defaultLocale; // Set the active language
i18n.enableFallback = true; // Use English if a string is missing in another lang

// 4. Create the React Context
type LanguageContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  // This 't' function is our translator
  t: (scope: string, options?: any) => string; 
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 5. Create the Provider (this wraps your app)
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState(i18n.locale);

  const setLocale = (newLocale: string) => {
    i18n.locale = newLocale;
    setLocaleState(newLocale);
  };

  // The 't' function that our components will use
  const t = (scope: string, options?: any) => {
    return i18n.t(scope, { ...options, locale });
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 6. Create a custom hook to easily use the translator
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};