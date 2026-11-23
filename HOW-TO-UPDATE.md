# How to update the site

Almost everything you will want to change lives in **`js/config.js`**. Open it in any text editor (Notepad is fine), edit the values inside the quotes, save, and re-upload that one file.
Leave a value as `""` and the page shows "Coming Soon" or hides the item.

## 1. Add logos
1. Put the image files in `assets/logos/` (PNG with transparent background, or SVG).
2. In `config.js`, under `logos`, remove the `//` in front of an example line and fix the file name and link:

```js
logos: {
  header: [
    { src: "assets/logos/iitkgp.png", alt: "IIT Kharagpur", href: "https://www.iitkgp.ac.in" }
  ],
  footer: [
    { src: "assets/logos/iitkgp.png", alt: "IIT Kharagpur", href: "https://www.iitkgp.ac.in" },
    { src: "assets/logos/coe.png",    alt: "Centre of Excellence",  href: "" }
  ]
}
```
`href` is optional: leave it `""` for a logo that does not link anywhere.

## 2. Hyperlink professors, departments and institute
Each person in `leaders` (and `studentCoordinator`) has:

| Field | What it links |
|---|---|
| `url` | the person's name (faculty page) |
| `deptUrl` | the department line |
| `instituteUrl` | the "IIT Kharagpur" line |
| `photo` | optional photo, e.g. `"assets/people/sudip-misra.jpg"` (square, at least 300x300). Without it an initials badge is shown. |

Also set `links.centre.url` and `links.institute.url` to link the Centre and Institute names in the footer.

## 3. Announce workshop dates
Edit `dates` (for example `workshop1: "14 January 2027"`). The text updates in the hero, timeline, how-it-works and contact sections at once.

## 4. Announce teams
In `teams`, fill in `school`, `students` and `theme` for each team. They show up on the hero map card and the Teams section automatically.

## 5. Buttons
`programmeDetailsUrl` / `teamDetailsUrl`: paste a link (for example a PDF brochure) to make the hero buttons open it. Leave empty to scroll to the section instead.

## Text elsewhere on the page
Longer text (About, objectives, how it works and so on) is in `index.html`. Search for the sentence you want to change and edit it directly.
Colours are defined once at the top of `css/styles.css` (`:root { --clay: ...; }`).

## Preview before sending
Double-click `index.html` to open it in your browser. No server is needed.
