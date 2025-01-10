export function QuizLayout({
  children,
  LeadingWidget,
  TrailingWidget,
}: {
  LeadingWidget?: React.ReactNode;
  TrailingWidget?: React.ReactNode;
  
  children: React.ReactNode;
}) {
  return (
    <div className="w-full px-4 inset-0 text-sm max-w-7xl h-[85vh] m-auto absolute">
      <div className="w-full flex items-center mb-2 justify-between">
        {LeadingWidget}
        {TrailingWidget}
      </div>
      <div className="w-full h-full bg-white rounded-lg border">{children}</div>
    </div>
  );
}
