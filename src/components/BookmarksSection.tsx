import { useState } from "react";
import { List, ChevronLeft, ExternalLink } from "lucide-react";
import { useBookmarks, useCategories, useCategoryCoverImages } from "@/hooks/use-db-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const BookmarksSection = () => {
  const { data: categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState("Apps & Tools");
  const [mobileView, setMobileView] = useState<"list" | "detail" | { type: "detail-modal", item: any }>("list");
  const { data: categoryImages } = useCategoryCoverImages();

  // Find active category ID to filter bookmarks
  const activeCategoryId = categories.find(c => c.name === activeCategory)?.id;
  const { data: bookmarks, loading } = useBookmarks(activeCategoryId);

  if (!categories.length) return null;

  return (
    <section id="bookmarks" className="min-h-screen flex w-full bg-background border-t border-border">
      {/* Desktop Categories Sidebar */}
      <div className="w-64 shrink-0 border-r border-border p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-foreground font-semibold text-xl">Bookmarks</h2>
          <List size={18} className="text-muted-foreground" />
        </div>

        <div className="space-y-1">
          <Accordion type="single" collapsible className="w-full">
            {/* 1. Render Root Categories (those without parent) */}
            {categories.filter(c => !c.parentId).map((category) => {
              const children = categories.filter(c => c.parentId === category.id);

              if (children.length > 0) {
                return (
                  <AccordionItem key={category.id} value={category.id.toString()} className="border-b-0">
                    <AccordionTrigger className="py-2 hover:no-underline px-3 hover:bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{category.name}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pt-0">
                      <div className="flex flex-col gap-1 pl-4 border-l ml-2 mt-1">
                        <button
                          onClick={() => setActiveCategory(category.name)}
                          className={`text-left px-3 py-1.5 rounded-md text-xs transition-colors ${activeCategory === category.name ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          All {category.name}
                        </button>
                        {children.map(child => (
                          <button
                            key={child.id}
                            onClick={() => setActiveCategory(child.name)}
                            className={`text-left px-3 py-1.5 rounded-md text-xs transition-colors flex justify-between ${activeCategory === child.name ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            <span>{child.name}</span>
                            <span className="opacity-50 text-[10px]">{child.count}</span>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }

              // No children, simple button
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${activeCategory === category.name
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  <span className="text-sm truncate mr-2">{category.name}</span>
                  <span className="text-xs text-muted-foreground bg-muted-foreground/10 px-1.5 py-0.5 rounded-full">{category.count}</span>
                </button>
              );
            })}
          </Accordion>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">

          {/* Mobile: Category Grid View */}
          <div className={`lg:hidden ${mobileView === 'detail' ? 'hidden' : 'block'}`}>
            <h2 className="text-2xl font-semibold text-foreground mb-6 pl-14 -mt-2 md:pl-0 md:mt-0">Collections</h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.filter(c => !c.parentId).map((category) => {
                const children = categories.filter(c => c.parentId === category.id);
                return (
                  <div key={category.id} className="contents">
                    <button
                      onClick={() => {
                        setActiveCategory(category.name);
                        setMobileView('detail');
                      }}
                      className="p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all text-left flex flex-col gap-2 group relative overflow-hidden"
                    >
                      {/* Background Image on Hover */}
                      {categoryImages[category.id] && (
                        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 bg-black/60 z-10" />
                          <img
                            src={categoryImages[category.id]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="relative z-10">
                        <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <span className="text-sm text-muted-foreground">{category.count} bookmarks</span>
                      </div>
                    </button>

                    {/* Children */}
                    {children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setActiveCategory(child.name);
                          setMobileView('detail');
                        }}
                        className="p-6 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-all text-left flex flex-col gap-2 group relative overflow-hidden"
                      >
                        {/* Background Image on Hover for children too if available */}
                        {categoryImages[child.id] && (
                          <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-0 bg-black/60 z-10" />
                            <img
                              src={categoryImages[child.id]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="absolute top-3 right-3 text-xs text-muted-foreground px-2 py-1 bg-background rounded-full border z-20">
                          in {category.name}
                        </div>
                        <div className="relative z-10">
                          <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                            {child.name}
                          </h3>
                          <span className="text-sm text-muted-foreground">{child.count} bookmarks</span>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile & Desktop: Bookmarks Detail View */}
          <div className={`${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
            {/* Mobile Header with Back Button */}
            <div className="flex items-center gap-4 mb-8 lg:hidden pl-14 -mt-2 md:pl-0 md:mt-0">
              <button
                onClick={() => setMobileView('list')}
                className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Back to collections"
              >
                <ChevronLeft size={24} className="text-foreground" />
              </button>
              <h3 className="text-2xl font-semibold text-foreground">{activeCategory}</h3>
            </div>

            {/* Desktop Header */}
            <h3 className="text-3xl font-semibold text-foreground mb-8 hidden lg:block">{activeCategory}</h3>

            {loading ? (
              <div>Loading bookmarks...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      onClick={() => setMobileView({ type: 'detail-modal', item: bookmark })}
                      className="rounded-xl border border-border bg-card overflow-hidden hover:border-muted-foreground/50 transition-colors cursor-pointer group flex flex-col h-full"
                    >
                      {/* Image area */}
                      <div className="h-32 bg-muted/30 relative overflow-hidden shrink-0">
                        {bookmark.image ? (
                          <img
                            src={bookmark.image}
                            alt={bookmark.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/10 text-muted-foreground">
                            <List size={24} opacity={0.2} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3 flex flex-col flex-1">
                        <h4 className="text-foreground font-medium text-sm mb-1 leading-tight">{bookmark.title}</h4>
                        <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed flex-1">{bookmark.description}</p>

                        <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{bookmark.count || 0} saves</span>
                          {bookmark.link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 -mr-2 px-3 hover:bg-primary/10 hover:text-primary text-primary font-medium"
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a
                                href={bookmark.link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Visit
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Dialog open={typeof mobileView === 'object' && mobileView?.type === 'detail-modal'} onOpenChange={(open) => !open && setMobileView('list')}>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{(mobileView as any).item?.title}</DialogTitle>
                    </DialogHeader>
                    {(mobileView as any).item && (
                      <div className="space-y-6">
                        {(mobileView as any).item.image && (
                          <div className="rounded-md overflow-hidden border">
                            <img
                              src={(mobileView as any).item.image}
                              alt={(mobileView as any).item.title}
                              className="w-full h-auto max-h-[400px] object-contain bg-background"
                            />
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {(mobileView as any).item.description || "No description provided."}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground block mb-1">Category</span>
                            <span className="font-medium">{activeCategory}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-1">Saves/Visits</span>
                            <span className="font-medium">{(mobileView as any).item.count}</span>
                          </div>
                        </div>

                        {(mobileView as any).item.link && (
                          <div className="pt-4">
                            <Button asChild className="w-full size-lg text-lg h-12">
                              <a href={(mobileView as any).item.link} target="_blank" rel="noopener noreferrer">
                                Visit Resource <ExternalLink className="ml-2 size-5" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookmarksSection;
