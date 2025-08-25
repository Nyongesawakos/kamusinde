import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "same";
  trendValue?: string;
}

export default function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-gray-100 p-1.5 dark:bg-gray-800">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && trendValue && (
          <div className="mt-2 flex items-center text-xs">
            {trend === "up" ? (
              <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
            ) : trend === "down" ? (
              <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
            ) : (
              <ArrowRight className="mr-1 h-3 w-3 text-gray-500" />
            )}
            <span
              className={
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                  ? "text-red-500"
                  : "text-gray-500"
              }
            >
              {trendValue} from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
