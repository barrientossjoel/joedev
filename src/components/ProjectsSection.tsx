import { useProjects } from "@/hooks/use-db-data";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowUpRight, Eye } from "lucide-react";
import { getOptimizedUrl } from "@/utils/image-utils";

export function ProjectsSection() {
  const { t } = useTranslation();
  const { data: projects, loading } = useProjects();

  if (loading) return <div>Loading...</div>;

  return (
    <section id="projects" className="h-screen w-full pt-16 pb-0 bg-background flex flex-col">
      <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 text-center px-6 shrink-0 font-heading tracking-tight">
        {t("projects.title")}
      </h2>
      <div className="grid grid-cols-2 gap-0 w-full flex-1 min-h-0">
        {projects.map((project) => {
          const title = i18n.language === 'es' ? (project.title_es || project.title) : project.title;
          const description = i18n.language === 'es' ? (project.description_es || project.description) : project.description;
          return (
            <Dialog key={project.id}>
              <div className="group relative overflow-hidden cursor-pointer border border-border bg-card h-full w-full">
                <DialogTrigger asChild>
                  <div className="absolute inset-0 z-10" />
                </DialogTrigger>

                {/* Image filling the block with CLS protection */}
                <div className="absolute inset-0 bg-muted/20">
                  <img
                    src={getOptimizedUrl(project.image)}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Uniform overlay for readability and premium look */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-500" />

                  {/* Hover overlay for 'View Details' */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-30">
                    <span className="text-white font-medium flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye size={20} /> {t("projects.viewDetails")}
                    </span>
                  </div>

                  {/* Direct Visit Link on Hover */}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 z-40 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm pointer-events-auto"
                      onClick={(e) => e.stopPropagation()}
                      title={t("projects.visitProject") as any}
                    >
                      <ArrowUpRight size={20} />
                    </a>
                  )}
                </div>

                {/* Text Content - Positioned at the very bottom to avoid hover overlap in center */}
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-14 z-20 pointer-events-none flex flex-col justify-end pb-6 md:pb-10">
                  <span className="text-xs font-mono text-gray-400 mb-2 block">{project.number}</span>
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <p className="text-gray-400 line-clamp-3 text-sm max-w-[85%] leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 pt-12 rounded-none sm:rounded-none">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{title}</DialogTitle>
                  <DialogDescription className="text-sm font-mono">{project.number}</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="rounded-none overflow-hidden border border-border">
                    <img
                      src={getOptimizedUrl(project.image)}
                      alt={title}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <p className="whitespace-pre-line">{description}</p>
                  </div>
                  {project.link && (
                    <div className="pt-4 flex justify-end">
                      <Button asChild>
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-none">
                          {t("projects.visitProject")} <ArrowUpRight size={16} />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

    </section >
  );
};

export default ProjectsSection;
