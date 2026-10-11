/* =========================================================================
   PROJECTS DATA — edit this file to update your work section.
   -------------------------------------------------------------------------
   live:        URL of a running demo. It is shown as a live preview inside
                the card and opens full-screen in the demo modal.
   embed:       set to false if the live site can't be shown inside another
                page (it then opens in a new tab instead).
   screenshots: image paths, e.g. "assets/projects/school-php/1.webp".
                Leave [] to show a placeholder until you add them.
   ========================================================================= */
window.PROJECTS = [
  {
    id: "ceylon-serpents",
    title: "Ceylon Serpents",
    short: "Ceylon Serpents",
    year: "2026",
    tagline: "An immersive, trilingual field guide to the snakes of Sri Lanka.",
    description:
      "An educational Vue 3 site in English, Sinhala and Tamil. Visitors can search and filter a snake library, compare species, explore habitats on an island map, learn folklore and myths vs facts, and get optional AI photo suggestions powered by Google Gemini through a Cloudflare Worker. Includes a fast, image-free snakebite first-aid page and a local-only admin panel for managing content.",
    highlights: [
      "Trilingual: English, Sinhala & Tamil",
      "Searchable snake library with compare view",
      "AI photo suggestions (Gemini + Cloudflare Worker)",
      "Local admin panel for species & content"
    ],
    stack: ["Vue 3", "Vite", "GSAP", "Gemini API", "Cloudflare Workers", "GitHub Actions"],
    live: "https://kpulathisi.github.io/Ceylon-Serpents/",
    repo: "https://github.com/KPulathisi/Ceylon-Serpents",
    screenshots: [],
    accent: "#7ad7ff"
  },
  {
    id: "school-php",
    title: "School Management System",
    short: "SMS · PHP",
    year: "2025",
    tagline: "Role-based school platform. My individual HNDIT final project.",
    description:
      "Individually built end-to-end: a public homepage with events and feedback, plus dashboards for Admin, Teacher, Student and Staff. Covers user management, timetable builder, attendance, marks, term reports with downloadable report cards, and Chart.js analytics — with secure session-based login and access control.",
    highlights: [
      "4 role dashboards + public site",
      "Timetable, attendance & marks modules",
      "Term reports & report cards",
      "Chart.js analytics"
    ],
    stack: ["PHP", "MySQL", "JavaScript", "Chart.js", "HTML/CSS"],
    live: "https://leedsinternationals.free.nf/?i=1",
    embed: false, // free host blocks being shown inside another site, so it opens in a new tab
    repo: "https://github.com/KPulathisi/Final-Project2",
    screenshots: ["assets/projects/school-php/1.webp", "assets/projects/school-php/2.webp", "assets/projects/school-php/3.webp"],
    accent: "#a5b4fc"
  },
  {
    id: "isdn",
    title: "IslandLink Sales Distribution Network",
    short: "ISDN",
    year: "2026",
    tagline: "Multi-role distribution platform for wholesale & retail operations across regional centers.",
    description:
      "A production-style web app that runs the full order lifecycle — product catalog, multi-location real-time inventory, delivery tracking, payments and an analytics dashboard — with separate experiences for retail customers, RDC staff, logistics teams and head-office admins.",
    highlights: [
      "Role-based access for 4 user types",
      "Real-time Firestore inventory sync",
      "Analytics dashboard with Recharts",
      "Dark / light theme, mobile-first"
    ],
    stack: ["React 18", "TypeScript", "Firebase", "Tailwind", "Zustand", "Recharts"],
    live: "https://kpulathisi.github.io/SDN/",
    repo: "https://github.com/KPulathisi/SDN",
    screenshots: [],
    accent: "#6b94ff"
  }
];

/* Team & open-source contributions — listed under "Team contributions".
   role: what YOU did on the project (shown in the list). */
window.MORE_PROJECTS = [
  {
    title: "CEB Quotation Management System",
    note: "Built the billing section, added dynamic form dropdowns and refactored the codebase",
    stack: "PHP · Supabase",
    repo: "https://github.com/tharindi212/CEB_SYSTEM"
  },
  {
    title: "Complaint Management System",
    note: "Implemented the email-sending feature, fixed header/footer routing and seeded data",
    stack: "PHP · Supabase",
    repo: "https://github.com/Yoshan2002/Complaint-Management-System"
  },
  {
    title: "Court Case Management System",
    note: "Implemented enforced user entry / authentication flow for case management",
    stack: "PHP · MySQL",
    repo: "https://github.com/SHLiyanaarachchi/Court-Case-Management"
  },
  {
    title: "Library Management System",
    note: "Set up the initial project, React + Vite frontend with a Node server",
    stack: "React · Node · Tailwind",
    repo: "https://github.com/D-Chanmini/Library-Management-System"
  },
  {
    title: "Employee Management System",
    note: "Added new application sections to a Laravel-based HR app",
    stack: "Laravel · Blade",
    repo: "https://github.com/Shayinikawee/employee-management"
  },
  {
    title: "NIS - National Immunization System",
    note: "Designed newborn registration modules with validated vaccine data entry",
    stack: "Java Swing · MySQL",
    repo: "https://github.com/TANCodeZen/Group-Project"
  }
];
