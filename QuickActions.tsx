import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface QuickAction {
  href: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  hoverBgColor: string;
  title: string;
  description: string;
  extra?: React.ReactNode;
  testId: string;
}

export function QuickActions() {
  const { t } = useTranslation();

  const actions: QuickAction[] = [
    {
      href: "/scan",
      icon: "fas fa-camera",
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      hoverBgColor: "group-hover:bg-primary/20",
      title: t('actions.scan.title'),
      description: t('actions.scan.description'),
      testId: "card-action-scan",
      extra: (
        <div className="mt-4 scan-animation">
          <div className="w-full h-1 bg-muted rounded-full" />
        </div>
      ),
    },
    {
      href: "/upload",
      icon: "fas fa-cloud-upload-alt",
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
      hoverBgColor: "group-hover:bg-accent/20",
      title: t('actions.upload.title'),
      description: t('actions.upload.description'),
      testId: "card-action-upload",
      extra: (
        <div className="mt-4">
          <div className="text-xs text-muted-foreground">
            {t('actions.upload.formats')}
          </div>
        </div>
      ),
    },
    {
      href: "/analysis",
      icon: "fas fa-brain",
      iconColor: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
      hoverBgColor: "group-hover:from-purple-500/20 group-hover:to-pink-500/20",
      title: t('actions.ai.title'),
      description: t('actions.ai.description'),
      testId: "card-action-ai",
      extra: (
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-xs text-accent">{t('actions.ai.active')}</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card
            data-testid={action.testId}
            className="hover-lift cursor-pointer group transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${action.bgColor} ${action.hoverBgColor} rounded-lg flex items-center justify-center transition-all duration-200`}>
                  <i className={`${action.icon} ${action.iconColor} text-xl`} />
                </div>
                <i className={`fas fa-arrow-right text-muted-foreground group-hover:${action.iconColor} transition-colors duration-200`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {action.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {action.description}
              </p>
              {action.extra}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
