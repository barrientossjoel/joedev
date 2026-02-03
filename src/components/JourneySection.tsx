import { useJourney } from "@/hooks/use-db-data";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";

interface JourneyEvent {
  year: string;
  events: {
    title: string;
    description: string;
  }[];
}

const JourneySection = () => {
  const { t } = useTranslation();
  const { data: journeyEvents, loading } = useJourney();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Group events by year
  const groupedData: JourneyEvent[] = [];

  // Helper to find existing group
  const getGroup = (year: string) => groupedData.find(g => g.year === year);

  journeyEvents.forEach(event => {
    let group = getGroup(event.year);
    if (!group) {
      group = { year: event.year, events: [] };
      groupedData.push(group);
    }
    const title = i18n.language === 'es' ? (event.title_es || event.title) : event.title;
    const description = i18n.language === 'es' ? (event.description_es || event.description) : event.description;
    group.events.push({ title, description });
  });

  // Sort groups by year descending
  groupedData.sort((a, b) => parseInt(b.year) - parseInt(a.year));


  return (
    <section id="journey" className="min-h-screen flex flex-col justify-center py-20 px-6 md:px-12 lg:px-20 max-w-5xl mx-auto w-full">
      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-12">
        {t("journey.title")}
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
