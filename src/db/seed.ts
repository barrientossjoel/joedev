
import { db } from "./index";
import { projects, writings, categories, bookmarks, journey } from "./schema";

async function seed() {
    console.log("🌱 Seeding database...");

    // Seed Categories
    console.log("Creating categories...");
    const categoryData = [
        { name: "Apps & Tools", count: 236 },
        { name: "Visual art", count: 132 },
        { name: "Books", count: 42 },
        { name: "Graphic Design", count: 132 },
        { name: "Frontend", count: 132 },
        { name: "Portfolio", count: 132 },
        { name: "To read", count: 132 },
        { name: "Self development", count: 236 },
        { name: "Photography", count: 236 },
        { name: "Anime & Manga", count: 236 },
        { name: "Arquitecture", count: 236 },
    ];

    for (const cat of categoryData) {
        try {
            await db.insert(categories).values(cat).onConflictDoNothing();
        } catch (e) {
            console.log(`Skipping category ${cat.name} (exists)`);
        }
    }

    // Get Category IDs map
    const allCats = await db.select().from(categories);
    const catMap = new Map(allCats.map(c => [c.name, c.id]));

    // Seed Projects
    console.log("Creating projects...");
    const projectData = [
        {
            number: "01",
            title: "Mobile app design",
            description: "Designing mobile applications has always captivated me as a freelance developer primarily focused on asdasd. The opportunity to step beyond my daily routine and assist clients.",
            image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop",
        },
        {
            number: "02",
            title: "Mobile app design",
            description: "Designing mobile applications has always captivated me as a freelance developer primarily focused on asdasd. The opportunity to step beyond my daily routine and assist clients.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        },
        {
            number: "03",
            title: "Mobile app design",
            description: "Designing mobile applications has always captivated me as a freelance developer primarily focused on asdasd. The opportunity to step beyond my daily routine and assist clients.",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        },
        {
            number: "04",
            title: "Mobile app design",
            description: "Designing mobile applications has always captivated me as a freelance developer primarily focused on asdasd. The opportunity to step beyond my daily routine and assist clients.",
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
        },
        {
            number: "05",
            title: "Mobile app design",
            description: "Designing mobile applications has always captivated me as a freelance developer primarily focused on asdasd. The opportunity to step beyond my daily routine and assist clients.",
            image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop",
        },
        {
            number: "06",
            title: "Mobile app design",
            description: "Designing mobile applications has always captivated me as a freelance developer primarily focused on asdasd. The opportunity to step beyond my daily routine and assist clients.",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
        },
    ];

    // Clear projects table first to avoid duplicates on re-run
    await db.delete(projects);
    await db.insert(projects).values(projectData);

    // Seed Writings
    console.log("Creating writings...");
    const writingData = [
        { year: "2024", date: "27/08", title: "Developing the definitive portfolio", views: "Views" },
        { year: "2024", date: "20/07", title: "Understanding React 19 Actions", views: "1.2k" },
        { year: "2023", date: "15/11", title: "Why I switched to Bun", views: "800" },
        { year: "2023", date: "01/10", title: "Minimalism in Code", views: "2.5k" },
        { year: "2023", date: "12/09", title: "The Future of Web Development", views: "3k" },
    ];

    await db.delete(writings);
    await db.insert(writings).values(writingData);

    // Seed Bookmarks
    console.log("Creating bookmarks...");
    const appsCatId = catMap.get("Apps & Tools") || 1;
    const designCatId = catMap.get("Graphic Design") || 1;

    const bookmarkData = [
        {
            title: "Curatorx.io",
            description: "The ultimate library for creative minds",
            count: 136,
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            categoryId: designCatId
        },
        // Adding generic items to fill list
        { title: "Figma", description: "Design Tool", count: 999, categoryId: appsCatId },
        { title: "Linear", description: "Issue Tracking", count: 500, categoryId: appsCatId },
        { title: "Raycast", description: "Productivity", count: 420, categoryId: appsCatId },
        { title: "Notion", description: "Notes & Docs", count: 800, categoryId: appsCatId },
        { title: "VS Code", description: "Code Editor", count: 1200, categoryId: appsCatId },
        { title: "Arc Browser", description: "Web Browser", count: 300, categoryId: appsCatId },
        { title: "Docker", description: "Containerization", count: 600, categoryId: appsCatId },
        { title: "Postman", description: "API Development", count: 400, categoryId: appsCatId },
        { title: "Obsidian", description: "Knowledge Base", count: 250, categoryId: appsCatId },
        { title: "Loom", description: "Video Messaging", count: 150, categoryId: appsCatId },
    ];

    await db.delete(bookmarks);
    await db.insert(bookmarks).values(bookmarkData);

    // Seed Journey
    console.log("Seeding journey...");
    await db.delete(journey);
    await db.insert(journey).values([
        { year: "2026", title: "Joined Sistas", description: "This is my first software related job. Feeling super lucky.", order: 1 },
        { year: "2026", title: "Graduated from institute", description: "It was a long 5 years. I worked my ass off to make it.", order: 2 },
        { year: "2025", title: "Joined Apple", description: "My first job within the best company in the universe!", order: 1 },
        { year: "2023", title: "Joined Sistas", description: "This is my first software related job. Feeling super lucky.", order: 1 },
        { year: "2022", title: "Started at Beltran Institute", description: "Being able to study to become a Systems analyst is one of the luckiest moments of my life.", order: 1 },
        { year: "2024", title: 'Completed the "Santander" 10km half marathon', description: "After crossing the line without even training for it, I realized how far I can go whit the proper mindset.", order: 1 },
        { year: "1998", title: "Born", description: "On the 16th of July", order: 1 },
    ]);

    console.log("✅ Seed completed!");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    // Let the process exit naturally with error code if thrown
    throw err;
});
