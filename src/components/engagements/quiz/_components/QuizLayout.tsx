export function QuizLayout({
  children,
  LeadingWidget,
  TrailingWidget,
}: {
  LeadingWidget?: React.ElementType;
  TrailingWidget?: React.ElementType;
  
  children: React.ReactNode;
}) {
  return (
    <div className="w-full inset-0 text-sm max-w-7xl h-[80vh] m-auto absolute">
      <div className="w-full flex items-center justify-between">
        {LeadingWidget && <LeadingWidget />}
        {TrailingWidget && <TrailingWidget />}
      </div>
      <div className="w-full h-full bg-white rounded-lg border">{children}</div>
    </div>
  );
}
