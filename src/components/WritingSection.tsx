import { useWritings } from "@/hooks/use-db-data";

const WritingSection = () => {
  const { data: writings, loading } = useWritings();

  if (loading) return <div className="py-20 text-center">Loading writings...</div>;

  return (
    <section id="writing" className="min-h-screen flex flex-col justify-center py-20 px-6 md:px-12 lg:px-20 max-w-5xl mx-auto w-full">
      <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-12">
        Writing
      </h2>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 text-muted-foreground text-sm pb-4 border-b border-border">
        <div className="col-span-2">Year</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-6">Title</div>
        <div className="col-span-2 text-right">Views</div>
      </div>

      {/* Table Rows */}
      {writings.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-12 gap-4 py-4 border-b border-border transition-colors cursor-pointer group"
        >
          <div className="col-span-2 text-muted-foreground text-sm group-hover:text-primary transition-colors">{item.year}</div>
          <div className="col-span-2 text-muted-foreground text-sm group-hover:text-primary transition-colors">{item.date}</div>
          <div className="col-span-6 text-sm text-muted-foreground group-hover:text-primary transition-colors">
            {item.title}
          </div>
          <div className="col-span-2 text-muted-foreground text-sm text-right group-hover:text-primary transition-colors">{item.views}</div>
        </div>
      ))}
    </section>
  );
};

export default WritingSection;
