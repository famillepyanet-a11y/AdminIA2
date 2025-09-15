import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileNavigation() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navigationItems = [
    { href: "/", label: t('mobile.home'), icon: "fas fa-home" },
    { href: "/documents", label: t('mobile.documents'), icon: "fas fa-folder" },
    { href: "/analysis", label: t('mobile.analysis'), icon: "fas fa-chart-bar" },
    { href: "/settings", label: t('mobile.settings'), icon: "fas fa-cog" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              data-testid={`link-mobile-nav-${item.href.replace('/', '') || 'home'}`}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${
                location === item.href 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <i className={`${item.icon} text-lg`} />
              <span className="text-xs">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
