import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@shared/schema";

interface CategoryWithCount extends Category {
  documentCount: number;
  weeklyIncrease: number;
}

const categoryIconColors = {
  factures: { icon: "fas fa-file-invoice", color: "text-blue-600", bg: "bg-blue-500/10" },
  contrats: { icon: "fas fa-file-contract", color: "text-green-600", bg: "bg-green-500/10" },
  medical: { icon: "fas fa-file-medical", color: "text-purple-600", bg: "bg-purple-500/10" },
  legal: { icon: "fas fa-gavel", color: "text-red-600", bg: "bg-red-500/10" },
  correspondence: { icon: "fas fa-envelope", color: "text-yellow-600", bg: "bg-yellow-500/10" },
  financial: { icon: "fas fa-chart-line", color: "text-indigo-600", bg: "bg-indigo-500/10" },
  administrative: { icon: "fas fa-building", color: "text-gray-600", bg: "bg-gray-500/10" },
  other: { icon: "fas fa-file-alt", color: "text-orange-600", bg: "bg-orange-500/10" },
};

export function DocumentCategories() {
  const { t } = useTranslation();

  const { data: categories, isLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ['/api/categories/with-counts'],
    queryFn: async () => {
      // This would be replaced with actual API call
      const [categoriesRes, statsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/statistics')
      ]);
      
      const categories: Category[] = await categoriesRes.json();
      const stats = await statsRes.json();
      
      return categories.map(category => ({
        ...category,
        documentCount: stats.categoryCounts[category.name] || 0,
        weeklyIncrease: Math.floor(Math.random() * 10) // This would come from real stats
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">
          {t('categories.title')}
        </h3>
        <Button
          data-testid="button-categories-view-all"
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          {t('categories.viewAll')} <i className="fas fa-arrow-right ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {categories?.map((category) => {
          const styling = categoryIconColors[category.name as keyof typeof categoryIconColors] || categoryIconColors.other;
          
          return (
            <Card
              key={category.id}
              data-testid={`card-category-${category.name}`}
              className="hover-lift cursor-pointer group transition-all duration-200"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${styling.bg} rounded-lg flex items-center justify-center`}>
                      <i className={`${styling.icon} ${styling.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {t(`categories.${category.name}`)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <span data-testid={`text-category-count-${category.name}`}>
                          {category.documentCount}
                        </span> {t('stats.documents').toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent">
                      {category.weeklyIncrease > 0 && '+'}
                      <span data-testid={`text-category-increase-${category.name}`}>
                        {category.weeklyIncrease}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('categories.thisWeek')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
