import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useQuotes, useProfile } from "@/hooks/use-db-data";
import { Particles } from "./Particles";

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: quotes, loading } = useQuotes();
  const { data: profile } = useProfile();
  // Allow full quote object or partial with optional text_es
  const [currentQuote, setCurrentQuote] = useState<{ text: string, text_es?: string | null, author: string, background?: string | null } | null>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!loading && quotes.length > 0) {
      // Pick random initial quote
      const random = quotes[Math.floor(Math.random() * quotes.length)];
      setCurrentQuote(random);

      // Change quote every 10 seconds
      const interval = setInterval(() => {
        setFade(true); // Start fade out
        setTimeout(() => {
          const nextRandom = quotes[Math.floor(Math.random() * quotes.length)];
          setCurrentQuote(nextRandom);
          setFade(false); // Fade in
        }, 500); // Wait for fade out transition
      }, 1800000); // 30 minutes

      return () => clearInterval(interval);
    }
  }, [loading, quotes]);

  // Fallback default quote if no data
  const defaultQuote = {
    text: "Learn who you are.\nUnlearn who they told you to be.",
    text_es: "Aprende quién eres.\nDesaprende quien te dijeron que fueras.",
    author: "s.mcnutt",
    background: null
  };

  const displayQuote = currentQuote || defaultQuote;
  const quoteText = i18n.language === 'es' ? (displayQuote.text_es || displayQuote.text) : displayQuote.text;

  // Function to determine background style
  const getBackgroundStyle = (bg?: string | null) => {
    if (!bg) return {}; // Use default CSS class
    if (bg.includes('http') || bg.includes('url')) {
      return { backgroundImage: bg.includes('url') ? bg : `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return { background: bg };
  };

  return (
    <section id="home" className="min-h-screen flex flex-col justify-center items-center py-20 px-6 md:px-12 lg:px-20 max-w-5xl mx-auto w-full relative bg-background z-0">
      <Particles />
      <div className="relative z-10 animate-fade-in text-center w-full">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-10">
          {t("hero.welcome")}
        </h1>

        <div className="space-y-4 mb-16">
          <div className="space-y-4 mb-16">
            {profile ? (
              <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-line max-w-3xl mx-auto">
                {i18n.language === 'es' ? (profile.bio_es || profile.bio) : (profile.bio || t("hero.description1"))}
              </p>
            ) : (
              <>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {t("hero.description1")}
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {t("hero.description2")}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Quote Card */}
        <div
          className={`relative rounded-2xl overflow-hidden p-12 border border-border transition-all duration-500 bg-card`}
          style={getBackgroundStyle(displayQuote.background)}
        >
          {/* Default pattern overlay if no custom background is set */}
          {!displayQuote.background && (
            <div className="absolute inset-0 opacity-10 bg-card">
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="topo" patternUnits="userSpaceOnUse" width="100" height="100">
                    <path d="M0 50 Q25 30 50 50 T100 50" fill="none" stroke="currentColor" strokeWidth="1" />
                    <path d="M0 70 Q25 50 50 70 T100 70" fill="none" stroke="currentColor" strokeWidth="1" />
                    <path d="M0 30 Q25 10 50 30 T100 30" fill="none" stroke="currentColor" strokeWidth="1" />
                    <path d="M0 90 Q25 70 50 90 T100 90" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#topo)" />
              </svg>
            </div>
          )}

          {/* Mobile overlay for readability if custom background */}
          {displayQuote.background && (
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]"></div>
          )}

          <div className={`relative z-10 text-center transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-foreground text-xl md:text-2xl font-serif italic mb-6 whitespace-pre-line">
              {quoteText.split('\n').map((line, i) => (
                <p key={i} className="mb-2 last:mb-0">{line}</p>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              - {displayQuote.author}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
