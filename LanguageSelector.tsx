import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-testid="button-language-selector"
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 px-3 py-2 bg-muted hover:bg-secondary transition-colors duration-200"
        >
          <i className="fas fa-globe text-muted-foreground" />
          <span className="text-sm font-medium hidden sm:inline">
            {currentLanguage.code.toUpperCase()}
          </span>
          <i className="fas fa-chevron-down text-xs text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        <div className="space-y-1">
          {languages.map((language) => (
            <button
              key={language.code}
              data-testid={`option-language-${language.code}`}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-sm hover:bg-muted transition-colors ${
                i18n.language === language.code 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground'
              }`}
            >
              <span className="mr-3">{language.flag}</span>
              {language.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
