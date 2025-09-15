import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const navigationItems = [
    { href: "/", label: t('nav.dashboard'), icon: "fas fa-tachometer-alt" },
    { href: "/documents", label: t('nav.documents'), icon: "fas fa-folder" },
    { href: "/analysis", label: t('nav.analysis'), icon: "fas fa-chart-bar" },
    { href: "/settings", label: t('nav.settings'), icon: "fas fa-cog" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-file-alt text-primary-foreground text-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{t('app.title')}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {t('app.subtitle')}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    data-testid={`link-nav-${item.href.replace('/', '') || 'dashboard'}`}
                    className={`transition-colors duration-200 font-medium ${
                      location === item.href
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <i className={`${item.icon} mr-2`} />
                    {item.label}
                  </button>
                </Link>
              ))}
            </nav>
          )}

          {/* Language Selector and User Menu */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />

            {/* Notifications */}
            <Button
              data-testid="button-notifications"
              variant="ghost"
              size="sm"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <i className="fas fa-bell text-lg" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
            </Button>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">JD</span>
            </div>

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                data-testid="button-mobile-menu"
                variant="ghost"
                size="sm"
                className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              >
                <i className="fas fa-bars text-lg" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
