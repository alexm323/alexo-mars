import { Link } from "react-router-dom";
import { site, projects } from "../content/site";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-2xl font-semibold text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
          {site.avatarInitials}
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{site.name}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{site.tagline}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {site.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-xl space-y-3 text-center">
        {site.bio.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </section>

      <section>
        <h2 className="mb-5 text-center text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Projects
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={project.href}
              className="group flex flex-col gap-2 rounded-xl border border-slate-200 p-5 text-left transition hover:border-violet-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-violet-600"
            >
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
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
