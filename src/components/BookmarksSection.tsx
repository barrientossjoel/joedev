import { useState, useRef, useEffect, useMemo } from "react";
import { List, ChevronLeft, ExternalLink, Search, LayoutList } from "lucide-react";
import { useBookmarks, useCategories, useCategoryCoverImages } from "@/hooks/use-db-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";

const VideoPreview = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => { });
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.2 } // Play when 20% visible for better responsiveness
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      muted
      loop
      playsInline
    />
  );
};

const BookmarkModalContent = ({ item, activeCategory }: { item: any, activeCategory: string }) => {
  const [layout, setLayout] = useState<"stacked" | "side-by-side">("stacked");
  // const { t } = useTranslation(); // Helper if needed, though mostly using i18n directly here

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight >= naturalWidth) {
      setLayout("side-by-side");
    }
  };

  const title = i18n.language === 'es' ? (item.title_es || item.title) : item.title;
  const description = i18n.language === 'es' ? (item.description_es || item.description) : item.description;

  return (
    <div className={`flex flex-col gap-6 ${layout === "side-by-side" ? "md:flex-row" : ""}`}>
      {/* Media Section */}
      <div className={`${layout === "side-by-side" ? "md:w-1/2 flex items-center justify-center bg-background/50 rounded-lg border border-border/50" : "w-full"}`}>
        {item.video ? (
          <div className="rounded-md overflow-hidden border bg-background w-full">
            <video
              src={item.video}
              className="w-full h-auto max-h-[60vh] object-contain"
              controls
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        ) : item.image && (
          <div className="rounded-md overflow-hidden border bg-background relative group w-full">
            <img
              src={item.image}
              alt={title}
              onLoad={handleImageLoad}
              className={`w-full h-auto object-contain ${layout === "side-by-side" ? "max-h-[70vh]" : "max-h-[50vh]"}`}
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={`flex flex-col gap-4 ${layout === "side-by-side" ? "md:w-1/2 justify-center" : "w-full"}`}>
        <div>
          <h4 className="font-semibold text-xl text-foreground mb-2 leading-tight">{title}</h4>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {description || "No description provided."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
            <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Category</span>
            <span className="font-medium text-foreground">{activeCategory}</span>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
            <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Saves/Visits</span>
            <span className="font-medium text-foreground">{item.count}</span>
          </div>
        </div>

        {item.link && (
          <div className="pt-4 mt-auto">
            <Button asChild className="w-full h-12 text-base shadow-sm hover:shadow-md transition-all">
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                Visit Resource <ExternalLink className="ml-2 size-5" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const BookmarksSection = () => {
  const { t } = useTranslation();
  const { data: categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState("Apps & Tools");
  const [mobileView, setMobileView] = useState<"list" | "detail" | { type: "detail-modal", item: any }>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: categoryImages } = useCategoryCoverImages();

  const isAllBookmarks = activeCategory === "All";

  // Find active category ID to filter bookmarks
  const activeCategoryId = isAllBookmarks
    ? undefined
    : (categories.find(c => (i18n.language === 'es' ? (c.name_es || c.name) : c.name) === activeCategory)?.id
      || categories.find(c => c.name === activeCategory)?.id);

  const { data: bookmarks, loading } = useBookmarks(activeCategoryId);

  // Filter bookmarks by search query
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;

    const query = searchQuery.toLowerCase();
    return bookmarks.filter(bookmark => {
      const title = (i18n.language === 'es' ? (bookmark.title_es || bookmark.title) : bookmark.title)?.toLowerCase() || "";
      const description = (i18n.language === 'es' ? (bookmark.description_es || bookmark.description) : bookmark.description)?.toLowerCase() || "";
      return title.includes(query) || description.includes(query);
    });
  }, [bookmarks, searchQuery]);

  if (!categories.length) return null;

  return (
    <section id="bookmarks" className="h-screen sticky top-0 flex w-full bg-background/60 backdrop-blur-[2px] border-t border-border overflow-hidden">
      {/* Desktop Categories Sidebar */}
      <div className="w-64 shrink-0 border-r border-border p-6 hidden lg:block h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-foreground font-semibold text-xl">{t("bookmarks.title")}</h2>
          <List size={18} className="text-muted-foreground" />
        </div>

        <div className="space-y-1">
          <button
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center mb-2 ${activeCategory === "All"
              ? "bg-muted text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            <span className="text-sm truncate mr-2">All Bookmarks</span>
            <span className="text-xs text-muted-foreground bg-muted-foreground/10 px-1.5 py-0.5 rounded-full">
              <LayoutList size={12} />
            </span>
          </button>
          <div className="h-px bg-border my-2" />

          <Accordion type="single" collapsible className="w-full">
            {categories.filter(c => !c.parentId).map((category) => {
              const children = categories.filter(c => c.parentId === category.id);
              const catName = i18n.language === 'es' ? (category.name_es || category.name) : category.name;

              if (children.length > 0) {
                return (
                  <AccordionItem key={category.id} value={category.id.toString()} className="border-b-0">
                    <AccordionTrigger className="py-2 hover:no-underline px-3 hover:bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{catName}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pt-0">
                      <div className="flex flex-col gap-1 pl-4 border-l ml-2 mt-1">
                        <button
                          onClick={() => {
                            setActiveCategory(catName);
                            setSearchQuery("");
                          }}
                          className={`text-left px-3 py-1.5 rounded-md text-xs transition-colors ${activeCategory === catName ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          {i18n.language === 'es' ? "Todos" : "All"} {catName}
                        </button>
                        {children.map(child => {
                          const childName = i18n.language === 'es' ? (child.name_es || child.name) : child.name;
                          return (
                            <button
                              key={child.id}
                              onClick={() => {
                                setActiveCategory(childName);
                                setSearchQuery("");
                              }}
                              className={`text-left px-3 py-1.5 rounded-md text-xs transition-colors flex justify-between ${activeCategory === childName ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                              <span>{childName}</span>
                              <span className="opacity-50 text-[10px]">{child.count}</span>
                            </button>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(catName);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${activeCategory === catName
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  <span className="text-sm truncate mr-2">{catName}</span>
                  <span className="text-xs text-muted-foreground bg-muted-foreground/10 px-1.5 py-0.5 rounded-full">{category.count}</span>
                </button>
              );
            })}
          </Accordion>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto overscroll-contain p-6 md:p-12">
        <div className="max-w-7xl mx-auto">

          {/* Mobile: Category Grid/List View */}
          <div className={`lg:hidden ${mobileView === 'detail' ? 'hidden' : 'block'}`}>
            <div className="flex items-center justify-between mb-4 pl-14 -mt-2 md:pl-0 md:mt-0 pr-2">
              <h2 className="text-2xl font-semibold text-foreground">Collections</h2>
            </div>

            {/* Mobile All Bookmarks Button - Compact */}
            <button
              onClick={() => {
                setActiveCategory("All");
                setMobileView('detail');
                setSearchQuery("");
              }}
              className="w-full flex items-center justify-between p-3 mb-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                  <LayoutList size={18} />
                </div>
                <span className="text-base font-medium text-foreground">All Bookmarks</span>
              </div>
              <ChevronLeft size={18} className="text-muted-foreground rotate-180" />
            </button>


            <div className="grid grid-cols-2 gap-4">
              {categories.filter(c => !c.parentId).map((category) => {
                const children = categories.filter(c => c.parentId === category.id);
                const catName = i18n.language === 'es' ? (category.name_es || category.name) : category.name;
                return (
                  <div key={category.id} className="contents">
                    <button
                      onClick={() => {
                        setActiveCategory(catName);
                        setMobileView('detail');
                        setSearchQuery("");
                      }}
                      className="p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all text-left flex flex-col gap-2 group relative overflow-hidden"
                    >
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
                          {catName}
                        </h3>
                        <span className="text-sm text-muted-foreground">{category.count} bookmarks</span>
                      </div>
                    </button>

                    {children.map(child => {
                      const childName = i18n.language === 'es' ? (child.name_es || child.name) : child.name;
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setActiveCategory(childName);
                            setMobileView('detail');
                            setSearchQuery("");
                          }}
                          className="p-6 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-all text-left flex flex-col gap-2 group relative overflow-hidden"
                        >
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
                            in {catName}
                          </div>
                          <div className="relative z-10">
                            <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                              {childName}
                            </h3>
                            <span className="text-sm text-muted-foreground">{child.count} bookmarks</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bookmarks Detail View */}
          <div className={`${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
            {/* Mobile Header with Back Button & Search */}
            <div className="flex flex-col gap-4 mb-6 lg:hidden pl-14 -mt-2 md:pl-0 md:mt-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileView('list')}
                  className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Back to collections"
                >
                  <ChevronLeft size={24} className="text-foreground" />
                </button>
                <h3 className="text-xl font-semibold text-foreground truncate">
                  {activeCategory === "All" ? "All Bookmarks" : activeCategory}
                </h3>
              </div>

              {/* Mobile Search - compact */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all font-light text-sm"
                />
              </div>
            </div>

            {/* Desktop Header with Integrated Search (No Toggle) */}
            <div className="hidden lg:flex items-center justify-between mb-8 gap-6">
              <h3 className="text-3xl font-semibold text-foreground shrink-0">
                {activeCategory === "All" ? "All Bookmarks" : activeCategory}
              </h3>

              <div className="flex items-center gap-4 flex-1 justify-end">
                {/* Search Input - Desktop Integrated */}
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    placeholder="Search bookmarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all font-light"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div>Loading bookmarks...</div>
            ) : (
              <>
                {filteredBookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Search className="size-12 mb-4 opacity-20" />
                    <p>No bookmarks found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
                    {filteredBookmarks.map((bookmark) => {
                      const title = i18n.language === 'es' ? (bookmark.title_es || bookmark.title) : bookmark.title;
                      const description = i18n.language === 'es' ? (bookmark.description_es || bookmark.description) : bookmark.description;

                      // Always Grid View Item (Masonry)
                      return (
                        <div
                          key={bookmark.id}
                          onClick={() => setMobileView({ type: 'detail-modal', item: bookmark })}
                          className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-muted-foreground/50 transition-colors cursor-pointer break-inside-avoid shadow-sm hover:shadow-md"
                        >

                          <div className="flex flex-col mb-1"> {/* wrapper for break avoidance assistance */}
                            <div className="bg-muted/30 relative overflow-hidden shrink-0 border-b border-border/50">
                              {bookmark.video ? (
                                <VideoPreview src={bookmark.video} />
                              ) : bookmark.image ? (
                                <img
                                  src={bookmark.image}
                                  alt={title}
                                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 block"
                                  style={{ minHeight: '120px' }} // prevent layout shift
                                />
                              ) : (
                                <div className="w-full h-32 flex items-center justify-center bg-muted/10 text-muted-foreground">
                                  <List opacity={0.2} size={24} />
                                </div>
                              )}
                            </div>

                            <div className="p-4 flex flex-col gap-2">
                              <h4 className="text-foreground font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{title}</h4>
                              {description && (
                                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">{description}</p>
                              )}

                              <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                                <span>{bookmark.count || 0} saves</span>
                                {bookmark.link && <ExternalLink size={12} />}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <Dialog open={typeof mobileView === 'object' && mobileView?.type === 'detail-modal'} onOpenChange={(open) => !open && setMobileView('detail')}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Bookmark Details</DialogTitle>
                    </DialogHeader>

                    {mobileView && typeof mobileView === 'object' && 'item' in mobileView && (
                      <BookmarkModalContent item={(mobileView as any).item} activeCategory={activeCategory} />
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
