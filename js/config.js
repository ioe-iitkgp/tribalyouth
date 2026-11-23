/* ==========================================================================
   SITE CONFIG — the ONLY file you need to edit for day-to-day updates.
   --------------------------------------------------------------------------
   • Leave a value as "" (empty) and the page shows "Coming Soon" / hides it.
   • Logos      : drop image files into  assets/logos/  and list them below.
   • Hyperlinks : paste the full URL (https://...) next to the name.
   • Teams      : fill in school / students / theme once they are announced.
   • After editing, just save + re-upload this file. No build step needed.
   ========================================================================== */

window.SITE_CONFIG = {

  /* ---------- LOGOS ------------------------------------------------------
     Shown in the top bar and in the footer. Add as many as you like, e.g.
       { src: "assets/logos/iitkgp.png", alt: "IIT Kharagpur", href: "https://www.iitkgp.ac.in" }
     Tip: transparent PNG or SVG, ideally in a single light colour or with its own
     background, around 200px tall.                                            */
  logos: {
    header: [
      { src: "assets/logos/iitkgp.svg", alt: "IIT Kharagpur", href: "https://www.iitkgp.ac.in" },
      { src: "assets/logos/cxa.svg",    alt: "Centre of Excellence for Unified AI-Enabled Craft Ecosystem Platform (CXA)", href: "https://aicraft.iitkgp.ac.in/" }
    ],
    footer: [
      // { src: "assets/logos/iitkgp.png", alt: "IIT Kharagpur", href: "https://www.iitkgp.ac.in" },
      // { src: "assets/logos/coe.png",    alt: "CoE Unified AI-Enabled Craft Ecosystem Platform", href: "" },
    ]
  },

  /* ---------- BUTTONS ----------------------------------------------------
     "Programme details" button: if you set a URL (e.g. a PDF brochure) it opens
     that; if left empty it simply scrolls to the About section.              */
  programmeDetailsUrl: "",
  teamDetailsUrl: "",

  /* ---------- LINKS used in the footer ------------------------------ */
  links: {
    centre:    { label: "Centre of Excellence for Unified AI-Enabled Craft Ecosystem Platform", url: "https://aicraft.iitkgp.ac.in/" },
    institute: { label: "Indian Institute of Technology Kharagpur", url: "https://www.iitkgp.ac.in" }
  },

  /* ---------- DATES (shown in several places on the page) ---------------- */
  dates: {
    communityVisits:  "Coming Soon",
    teamAnnouncement: "Coming Soon",
    workshop1:        "Coming Soon",
    workshop2:        "Coming Soon"
  },

  /* ---------- PROGRAMME LEADERSHIP ---------------------------------------
     name        : shown as the card title
     url         : personal / faculty page (name becomes a link when set)
     role        : small line above the name
     department  : second line. deptUrl makes it a link.
     institute   : third line. instituteUrl makes it a link.
     photo       : optional, e.g. "assets/people/sudip-misra.jpg"
                   (without a photo, an initials badge is shown)             */
  leaders: [
    {
      name: "Prof. Sudip Misra",
      role: "Main Coordinator",
      url: "https://cse.iitkgp.ac.in/~smisra/",
      department: "Department of Computer Science and Engineering",
      deptUrl: "",
      institute: "IIT Kharagpur",
      instituteUrl: "",
      photo: ""
    },
    {
      name: "Prof. Priyadarshi Patnaik",
      role: "Main Coordinator",
      url: "https://www.iitkgp.ac.in/department/HS/faculty/hs-bapi",
      department: "",
      deptUrl: "",
      institute: "IIT Kharagpur",
      instituteUrl: "",
      photo: ""
    },
    {
      name: "Prof. Jenia Mukherjee",
      role: "Main Coordinator",
      url: "",
      department: "",
      deptUrl: "",
      institute: "IIT Kharagpur",
      instituteUrl: "",
      photo: ""
    }
  ],

  studentCoordinator: {
    name: "Mr. Kumarjit Ray",
    role: "Student Coordinator",
    url: "https://kumarjitray.github.io/",
    department: "Future-Ready Tribal Youth Programme",
    deptUrl: "",
    institute: "Centre of Excellence for Unified AI-Enabled Craft Ecosystem Platform, IIT Kharagpur",
    instituteUrl: "",
    photo: ""
  },

  /* ---------- FIVE TEAMS --------------------------------------------------
     Fill in school / students / theme when announced. Leave "" for "Coming Soon".
     "location" is only shown for the two teams near Kharagpur.               */
  teams: [
    {
      id: 1, short: "Tripura", title: "Tripura", region: "Tripura",
      blurb: "A team from a remote/tribal community in Tripura.",
      location: null, school: "", students: "", theme: ""
    },
    {
      id: 2, short: "Buxa", title: "Buxa Region", region: "West Bengal",
      blurb: "A student team representing a remote community from the Buxa region.",
      location: null, school: "", students: "", theme: ""
    },
    {
      id: 3, short: "Sundarban", title: "Sundarban Region", region: "West Bengal",
      blurb: "A student team from a remote community in the Sundarban region, where connectivity, ecology and livelihood challenges provide an important context for grounded innovation.",
      location: null, school: "", students: "", theme: ""
    },
    {
      id: 4, short: "Near Kharagpur 1", title: "Near Kharagpur — Location 1", region: "Tribal community",
      blurb: "A student team from a selected tribal community in the vicinity of IIT Kharagpur.",
      location: "", school: "", students: "", theme: ""
    },
    {
      id: 5, short: "Near Kharagpur 2", title: "Near Kharagpur — Location 2", region: "Tribal community",
      blurb: "A second student team from a selected tribal community near IIT Kharagpur.",
      location: "", school: "", students: "", theme: ""
    }
  ]
};
