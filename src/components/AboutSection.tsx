const AboutSection = () => {
  return (
    <section id="about" className="py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="relative opacity-0 animate-fade-in">
          <div className="aspect-square max-w-md mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-border">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-5xl font-bold">
                J
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-2xl -z-10" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-600/10 rounded-2xl -z-10" />
        </div>

        {/* Content */}
        <div className="opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <p className="text-primary text-sm font-medium mb-2 uppercase tracking-wider">
            About Me
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Passionate about creating digital experiences
          </h2>
          <div className="space-y-4 text-muted-foreground text-lg">
            <p>
              I'm a web developer and UX designer with over 5 years of experience 
              crafting digital solutions that make a difference. My journey started 
              with a curiosity for how things work on the web, and it has evolved 
              into a passion for building beautiful, functional applications.
            </p>
            <p>
              I believe in the power of clean code and intuitive design. Every 
              project I work on is an opportunity to create something meaningful 
              that solves real problems and delights users.
            </p>
            <p>
              When I'm not coding, you'll find me exploring new technologies, 
              contributing to open-source projects, or sharing knowledge with 
              the developer community.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-border">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gradient">5+</p>
              <p className="text-muted-foreground">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gradient">50+</p>
              <p className="text-muted-foreground">Projects Completed</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gradient">30+</p>
              <p className="text-muted-foreground">Happy Clients</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
