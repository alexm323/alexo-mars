// Everything on the site that's "your info" lives here. Edit the values
// below to update copy — nothing else needs to change.

export const site = {
  title: "Building Mars",
  tagline: "Reinvention, one silly project at a time.",
  avatarInitials: "AM",
  email: "alejandromartinezjr42@gmail.com",
  about: [
    "Senior frontend engineer based in LA. Dad of three. Currently looking for my one. This is where I dump the fun side projects and half-baked ideas that don't belong on a resume.",
  ],
  now: "Currently playing XCOM 2 for the first time — turns out the strategy layer is harder than the tactical missions.",
  gear: [
    {
      category: "Photography",
      items: ["iPhone 17 Pro Max", "SANDMARC Pro tripod"],
    },
    {
      category: "Home Gym",
      items: [
        "Titan T-3 power rack",
        "Rogue Ohio Bar",
        "bumper plates",
        "adjustable dumbbells",
      ],
    },
  ],
  playlist:
    "Alt rock roots: My Chemical Romance, Paramore, Blink-182, System of a Down",
  kitchen: "High-protein meal prep, powered by a crockpot and an air fryer.",
  sidekicks: "Charlotte and Dante — two cats, one rescue crew.",
  links: [
    { label: "Instagram", url: "https://instagram.com/lexam323" },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/alejandro-martinez-jr/",
    },
    { label: "Discord", handle: "alexm323" },
  ],
};

export type Project = {
  id: string;
  title: string;
  description: string;
  href: string;
  emoji: string;
  status?: "new" | "wip";
};

export const projects: Project[] = [
  {
    id: "paint-names",
    title: "Paint Name Generator",
    description:
      'A tool that generates fun, made-up paint swatch names, Home Depot-style ("Whispering Almond," "Rogue Basil," etc.)',
    href: "/paint-names",
    emoji: "🎨",
    status: "new",
  },
  {
    id: "mission-debrief",
    title: "Mission Debrief",
    description:
      "A lighthearted post-date debrief — tap a few tags, share the verdict.",
    href: "/mission-debrief.html",
    emoji: "📝",
    status: "new",
  },
  {
    id: "humbleshot",
    title: "Humbleshot",
    description:
      "A pool shot calculator — place the cue ball, the object ball, and a pocket to see the aim line, ghost-ball spot, suggested power, and a bank-shot option.",
    href: "/humbleshot",
    emoji: "🎱",
    status: "new",
  },
];
