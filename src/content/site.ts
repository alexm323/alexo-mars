// Everything on the site that's "your info" lives here. Swap the
// placeholders for the real thing whenever you're ready — nothing else
// needs to change.

export const site = {
  name: "Your Name",
  tagline: "A short line about what you do or care about.",
  avatarInitials: "YN",
  bio: [
    "Write a couple sentences about yourself here — what you do, what you're into, whatever you want a visitor to know first.",
    "A second paragraph if you want more room. Keep it short; nobody reads a wall of text on a personal site.",
  ],
  location: "Somewhere, USA",
  email: "you@example.com",
  links: [
    { label: "GitHub", url: "https://github.com/your-handle" },
    { label: "LinkedIn", url: "https://linkedin.com/in/your-handle" },
    { label: "Instagram", url: "https://instagram.com/your-handle" },
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
      "Pick any color and get a ridiculous, Home-Depot-swatch-style name for it.",
    href: "/paint-names",
    emoji: "🎨",
    status: "new",
  },
  {
    id: "date-survey",
    title: "Date Survey",
    description:
      "A quick, low-pressure feedback form to send after a date.",
    href: "/date-survey",
    emoji: "📝",
    status: "new",
  },
];
