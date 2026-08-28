import { Link } from "react-router-dom";
import { site, projects } from "../content/site";

// Project links can point at a real SPA route (client-side nav) or a
// standalone static file served as-is (needs a real page load).
function isStaticHref(href: string): boolean {
  return /\.\w+$/.test(href);
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {children}
    </h2>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-2xl font-semibold text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
          {site.avatarInitials}
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{site.title}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{site.tagline}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {site.links.map((link) =>
            link.url ? (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
              >
                {link.label}
              </a>
            ) : (
              <span
                key={link.label}
                className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
              >
                {link.label}: {link.handle}
              </span>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto max-w-xl space-y-3 text-center">
        <SectionHeading>About</SectionHeading>
        {site.about.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </section>

      <section>
        <SectionHeading>Projects</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const cardClassName =
              "group flex flex-col gap-2 rounded-xl border border-slate-200 p-5 text-left transition hover:border-violet-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-violet-600";
            const cardContent = (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{project.emoji}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{project.title}</span>
                  {project.status === "new" && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
                      new
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
              </>
            );

            return isStaticHref(project.href) ? (
              <a key={project.id} href={project.href} className={cardClassName}>
                {cardContent}
              </a>
            ) : (
              <Link key={project.id} to={project.href} className={cardClassName}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-xl text-center">
        <SectionHeading>Now</SectionHeading>
        <p>{site.now}</p>
      </section>

      <section className="mx-auto max-w-xl">
        <SectionHeading>Gear</SectionHeading>
        <div className="grid gap-6 sm:grid-cols-2">
          {site.gear.map((group) => (
            <div key={group.category} className="text-left">
              <h3 className="mb-2 font-medium text-slate-900 dark:text-white">{group.category}</h3>
              <ul className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-violet-400 dark:text-violet-500">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-xl text-center">
        <SectionHeading>Playlist / Sound</SectionHeading>
        <p>{site.playlist}</p>
      </section>

      <section className="mx-auto max-w-xl text-center">
        <SectionHeading>Kitchen</SectionHeading>
        <p>{site.kitchen}</p>
      </section>

      <section className="mx-auto max-w-xl text-center">
        <SectionHeading>Sidekicks</SectionHeading>
        <p>{site.sidekicks}</p>
      </section>
    </div>
  );
}
