import { useParams, Link } from "react-router-dom";
import { useWritings } from "@/hooks/use-db-data";
import i18n from "@/i18n";
import { ArrowLeft, Calendar, Share2, Eye } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const Article = () => {
    const { slug } = useParams();
    const { data: writings, loading } = useWritings();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const article = writings.find((w) => w.slug === slug);

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Article not found</h1>
                <Button asChild variant="outline">
                    <Link to="/">Go Home</Link>
                </Button>
            </div>
        );
    }

    const title = i18n.language === 'es' ? (article.title_es || article.title) : article.title;
    const content = i18n.language === 'es' ? (article.content_es || article.content) : article.content;

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    return (
        <>
            <SEO
                title={`${title} | Joel Barrientos`}
                description={`Read ${title} by Joel Barrientos.`}
                type="article"
            />
            <div className="min-h-screen bg-background text-foreground">
                <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
                    <Link
                        to="/#writing"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Writing
                    </Link>

                    <header className="mb-12">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                <span>{article.date}, {article.year}</span>
                            </div>
                            {/* 
                <div className="flex items-center gap-1.5">
                    <User size={14} />
                    <span>Joel Barrientos</span>
                </div>
                 */}
                            <div className="flex items-center gap-1.5">
                                <Eye size={14} />
                                <span>{article.views} views</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
                            {title}
                        </h1>

                        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                            <Share2 size={14} />
                            Share
                        </Button>
                    </header>

                    <article className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-primary prose-img:rounded-xl">
                        <Markdown>
                            {content}
                        </Markdown>
                    </article>
                </div>
            </div>
        </>
    );
};

export default Article;
