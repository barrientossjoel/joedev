import { useJourney } from "@/hooks/use-db-data";

interface JourneyEvent {
  year: string;
  events: {
    title: string;
    description: string;
  }[];
}

const JourneySection = () => {
  const { data: journeyEvents, loading } = useJourney();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Group events by year
  const groupedData: JourneyEvent[] = [];

  // Sort by year descending (implied by order in seed, but explicit sort is safer)
  // Assuming seed order 1 is top? The seed used years mixed. 
  // Let's sort the raw events by year (descending) and then order (ascending/descending?)
  // Actually, the seed has an 'order' field. Let's rely on the DB sort if possible, 
  // but DB sort was only by 'order' in the hook.
  // Let's group locally.

  // Helper to find existing group
  const getGroup = (year: string) => groupedData.find(g => g.year === year);

  journeyEvents.forEach(event => {
    let group = getGroup(event.year);
    if (!group) {
      group = { year: event.year, events: [] };
      groupedData.push(group);
    }
    group.events.push({ title: event.title, description: event.description });
  });

  // Sort groups by year descending
  groupedData.sort((a, b) => parseInt(b.year) - parseInt(a.year));


  return (
    <section id="journey" className="min-h-screen flex flex-col justify-center py-20 px-6 md:px-12 lg:px-20 max-w-5xl mx-auto w-full">
      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-12">
        Journey
      </h2>

      <div className="space-y-0">
        {groupedData.map((yearData, yearIndex) => (
          <div key={yearIndex} className="contents">
            {yearData.events.map((event, eventIndex) => {
              const isLastEventOfYear = eventIndex === yearData.events.length - 1;

              return (
                <div key={`${yearIndex}-${eventIndex}`} className="flex gap-8 relative">
                  {/* Year Column */}
                  <div className="w-20 shrink-0 text-right pt-0.5">
                    {eventIndex === 0 && (
                      <span className="text-foreground font-semibold text-lg">{yearData.year}</span>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="flex flex-col items-center relative px-1">
                    {/* Circle */}
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground bg-background z-10 my-1.5" />

                    {/* Line - Renders ONLY if it's NOT the last event of the current year */}
                    {!isLastEventOfYear && (
                      <div className="absolute top-6 bottom-[-6px] w-0.5 bg-muted-foreground/30" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-12 pt-0.5">
                    <h3 className="text-foreground font-medium mb-1 leading-snug">{event.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
};

export default JourneySection;
