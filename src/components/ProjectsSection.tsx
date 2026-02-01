import { useProjects } from "@/hooks/use-db-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowUpRight, Eye } from "lucide-react";

export function ProjectsSection() {
  const { data: projects, loading } = useProjects();

  if (loading) return <div>Loading...</div>;

  return (
    <section id="projects" className="h-screen w-full pt-16 pb-0 bg-background flex flex-col">
      <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 text-center px-6 shrink-0">
        Projects
      </h2>
      <div className="grid grid-cols-2 gap-0 w-full flex-1 min-h-0">
        {projects.map((project) => (
          <Dialog key={project.id}>
            <div className="group relative overflow-hidden cursor-pointer border border-border bg-card h-full w-full">
              <DialogTrigger asChild>
                <div className="absolute inset-0 z-10" />
              </DialogTrigger>

              {/* Image filling the block */}
              <div className="absolute inset-0">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Gradient overlay for text readability - always visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Hover overlay for 'View Details' - darker */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-white font-medium flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <Eye size={20} /> View Details
                  </span>
                </div>
              </div>

              {/* Text Content - Always Visible over image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pointer-events-none">
                <span className="text-xs font-mono text-gray-300 mb-2 block">{project.number}</span>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-gray-300 line-clamp-2 text-sm max-w-[90%]">{project.description}</p>
              </div>
            </div>

            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{project.title}</DialogTitle>
                <DialogDescription className="text-sm font-mono">{project.number}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-auto"
                  />
                </div>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                  <p className="whitespace-pre-line">{project.description}</p>
                </div>
                {project.link && (
                  <div className="pt-4 flex justify-end">
                    <Button asChild>
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        Visit Project <ArrowUpRight size={16} />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

    </section >
  );
};

export default ProjectsSection;
