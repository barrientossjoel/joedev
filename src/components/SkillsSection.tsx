import { Code, Palette, Smartphone, Globe, Database, Zap } from "lucide-react";

const skills = [
  {
    icon: Code,
    title: "Frontend Development",
    description: "React, TypeScript, Next.js, and modern JavaScript frameworks",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Figma, Adobe XD, and user-centered design principles",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Mobile-first approach with seamless cross-device experiences",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Globe,
    title: "Web Performance",
    description: "Optimized loading times and smooth user interactions",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: Database,
    title: "Backend Integration",
    description: "REST APIs, GraphQL, and database management",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: Zap,
    title: "Modern Tools",
    description: "Git, CI/CD, testing frameworks, and agile methodologies",
    color: "from-indigo-500 to-violet-500",
  },
];

const SkillsSection = () => {
  return (
    <section id="skills" className="py-20">
      <div className="mb-12">
        <p className="text-primary text-sm font-medium mb-2 uppercase tracking-wider">
          What I do
        </p>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Skills & Expertise</h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          A comprehensive set of skills that I've developed over the years working on diverse projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill, index) => {
          const Icon = skill.icon;
          return (
            <div
              key={skill.title}
              className="group bg-card border border-border rounded-2xl p-6 card-hover opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{skill.title}</h3>
              <p className="text-muted-foreground">{skill.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SkillsSection;
