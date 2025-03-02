export function MetricCard({
    metric,
    title,
    subTitle,
  }: {
    metric: string;
    title: string;
    subTitle: string;
  }) {
    return (
      <div className="w-full px-4 py-6 h-24 flex items-center justify-start gap-3 bg-white border rounded-lg">
        <p className="font-semibold gradient-text bg-basePrimary text-lg sm:text-2xl">
          {metric}
        </p>
        <div className="flex flex-col items-start justify-start gap-2">
          <p className="font-semibold text-base sm:text-base">{title}</p>
          <p className="text-xs">{subTitle}</p>
        </div>
      </div>
    );
  }
  