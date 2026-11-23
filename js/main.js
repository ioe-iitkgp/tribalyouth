/* ==========================================================================
   Future-Ready Tribal Youth — behaviour
   Plain JavaScript, no libraries, no build step. Content that is likely to
   change (logos, links, teams, people, contact) comes from js/config.js.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }
  function soon(v) { return !v || /coming soon/i.test(v); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function safeUrl(u) { return /^(https?:|mailto:|tel:|\/|\.\/|\.\.\/|#|assets\/)/i.test(u || '') ? u : ''; }
  function link(url, text, extra) {
    url = safeUrl(url);
    return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener"' + (extra || '') + '>' + esc(text) + '</a>' : esc(text);
  }

  /* ------------------------------------------------------------------ config binding */
  function bindConfig() {
    $$('[data-cfg]').forEach(function (el) {
      var v = get(CFG, el.getAttribute('data-cfg'));
      if (v) el.textContent = v;
      el.classList.toggle('is-soon', soon(el.textContent));
    });

    function logos(list, box) {
      if (!box) return;
      box.innerHTML = (list || []).map(function (l) {
        if (!l || !l.src) return '';
        var img = '<img src="' + esc(l.src) + '" alt="' + esc(l.alt || '') + '" loading="lazy">';
        return l.href && safeUrl(l.href) ? '<a href="' + esc(l.href) + '" target="_blank" rel="noopener">' + img + '</a>' : img;
      }).join('');
    }
    logos(CFG.logos && CFG.logos.header, $('#headerLogos'));
    logos(CFG.logos && CFG.logos.footer, $('#footerLogos'));

    [['#ctaProgramme', CFG.programmeDetailsUrl], ['#ctaTeams', CFG.teamDetailsUrl]].forEach(function (p) {
      var el = $(p[0]);
      if (el && safeUrl(p[1])) { el.href = p[1]; el.target = '_blank'; el.rel = 'noopener'; }
    });

    var L = CFG.links || {};
    var c = L.centre || {}, i = L.institute || {};
    var org = $('#orgName');
    if (org) org.innerHTML = '<strong>' + link(c.url, c.label || 'Centre of Excellence for Unified AI-Enabled Craft Ecosystem Platform') + '</strong><br>' + link(i.url, i.label || 'Indian Institute of Technology Kharagpur');
    var fo = $('#footOrg');
    if (fo) fo.innerHTML = link(c.url, c.label || 'Centre of Excellence for Unified AI-Enabled Craft Ecosystem Platform') + '<br>' + link(i.url, 'IIT Kharagpur');

    var ct = CFG.contact || {};
    var em = $('#contactEmail'), ph = $('#contactPhone'), cp = $('#copyEmail');
    if (ct.email && em) {
      em.classList.remove('is-soon');
      em.innerHTML = '<a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + '</a>';
      if (cp) {
        cp.hidden = false;
        cp.addEventListener('click', function () {
          if (navigator.clipboard) navigator.clipboard.writeText(ct.email).then(function () {
            cp.textContent = 'Copied ✓'; setTimeout(function () { cp.textContent = 'Copy'; }, 1800);
          });
        });
      }
    }
    if (ct.phone && ph) {
      ph.classList.remove('is-soon');
      ph.innerHTML = '<a href="tel:' + esc(ct.phone.replace(/[^\d+]/g, '')) + '">' + esc(ct.phone) + '</a>';
    }
  }

  /* ------------------------------------------------------------------ people */
  function initials(name) {
    var parts = String(name).replace(/^(prof|dr|mr|ms|mrs)\.?\s+/i, '').split(/\s+/).filter(Boolean);
    return ((parts[0] || '')[0] || '') + ((parts[1] || '')[0] || '');
  }
  function person(p) {
    var av = p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy">' : esc(initials(p.name));
    var aff = [];
    if (p.department) aff.push(link(p.deptUrl, p.department));
    if (p.institute) aff.push(link(p.instituteUrl, p.institute));
    return '<article class="person reveal"><div class="avatar" aria-hidden="' + (p.photo ? 'false' : 'true') + '">' + av + '</div><div>' +
      '<p class="role">' + esc(p.role) + '</p><h4>' + link(p.url, p.name) + '</h4><p class="aff">' + aff.join('<br>') + '</p></div></article>';
  }
  function renderPeople() {
    var l = $('#leaders'), s = $('#studentCoord');
    if (l) l.innerHTML = (CFG.leaders || []).map(person).join('');
    if (s && CFG.studentCoordinator) s.innerHTML = person(CFG.studentCoordinator);
  }

  /* ------------------------------------------------------------------ hero map + teams */
  var TEAMS = CFG.teams || [];
  /* two schematic layouts: a wide one for desktop/tablet and a tall one for phones.
     l = [label dx, label dy, text-anchor]; bend = which side the dashed route curves to */
  /* ---- zoomed map of eastern India behind the radar ------------------------------------
     GEO = outline of India (Natural Earth, India point-of-view boundaries), clipped to the region around
     West Bengal and the North-East and simplified. Each ring is a flat [lon, lat, lon, lat, ...] list.
     The hub sits on IIT Kharagpur and Tripura, Buxa and Sundarban are projected from their real
     coordinates (Agartala, Buxa Tiger Reserve, Sundarban) with the same scale as the outline.
     The two 'near Kharagpur' teams have no fixed site yet, so they are placed beside the hub. */
  var GEO = [[81.5,17.0,81.5,28.05,81.62,27.98,81.69,27.96,81.86,27.85,81.88,27.85,81.98,27.92,82.05,27.91,82.4,27.68,82.44,27.67,82.65,27.7,82.68,27.69,82.73,27.52,82.75,27.49,82.88,27.49,83.01,27.44,83.13,27.44,83.28,27.33,83.32,27.34,83.36,27.39,83.36,27.45,83.39,27.47,83.59,27.46,83.85,27.35,83.88,27.37,83.83,27.43,83.92,27.45,84.01,27.44,84.08,27.51,84.12,27.51,84.19,27.44,84.23,27.44,84.29,27.38,84.58,27.33,84.61,27.31,84.66,27.2,84.65,27.13,84.62,27.06,84.64,27.03,84.76,27.0,84.82,27.01,84.92,26.96,84.95,26.9,85.02,26.87,85.02,26.85,85.12,26.87,85.16,26.85,85.17,26.79,85.19,26.76,85.29,26.74,85.34,26.75,85.39,26.79,85.44,26.79,85.61,26.85,85.7,26.8,85.71,26.65,85.78,26.6,85.81,26.6,85.83,26.57,85.95,26.64,86.01,26.65,86.2,26.58,86.28,26.61,86.32,26.58,86.35,26.58,86.49,26.53,86.71,26.41,86.74,26.44,86.82,26.44,86.88,26.49,87.04,26.58,87.07,26.47,87.11,26.4,87.22,26.41,87.25,26.37,87.3,26.35,87.33,26.35,87.36,26.4,87.42,26.43,87.48,26.42,87.59,26.38,87.68,26.42,87.73,26.4,87.77,26.45,87.82,26.44,87.87,26.46,87.98,26.37,88.01,26.37,88.07,26.45,88.1,26.58,88.17,26.73,88.15,26.86,88.08,26.99,88.01,27.05,87.97,27.11,87.99,27.22,88.04,27.32,88.01,27.38,88.04,27.44,88.02,27.49,88.11,27.64,88.16,27.77,88.16,27.85,88.12,27.86,88.1,27.9,88.12,27.95,88.38,27.98,88.46,28.03,88.5,28.03,88.59,28.11,88.65,28.07,88.74,28.06,88.82,27.99,88.81,27.93,88.85,27.88,88.85,27.84,88.81,27.66,88.74,27.53,88.77,27.41,88.89,27.32,88.86,27.27,88.78,27.24,88.73,27.15,88.83,27.1,88.85,26.95,88.91,26.98,88.93,26.92,89.02,26.91,89.1,26.82,89.21,26.81,89.34,26.85,89.44,26.8,89.51,26.8,89.59,26.78,89.61,26.77,89.6,26.72,89.61,26.71,89.69,26.72,89.81,26.7,89.83,26.73,89.89,26.71,90.13,26.75,90.18,26.83,90.28,26.86,90.35,26.9,90.59,26.78,90.72,26.77,91.01,26.78,91.06,26.8,91.2,26.8,91.3,26.77,91.35,26.79,91.39,26.86,91.42,26.87,91.48,26.87,91.52,26.8,91.7,26.8,91.83,26.86,91.88,26.8,91.87,26.84,91.9,26.85,91.89,26.88,91.98,26.85,92.04,26.85,92.07,26.89,92.08,26.94,92.07,26.99,92.0,27.07,91.99,27.12,92.04,27.24,92.09,27.29,92.02,27.45,91.98,27.47,91.73,27.46,91.66,27.48,91.6,27.53,91.57,27.62,91.58,27.66,91.63,27.72,91.64,27.78,91.57,27.82,91.56,27.85,91.68,27.85,91.73,27.8,91.83,27.81,91.86,27.73,91.95,27.72,91.99,27.77,92.06,27.76,92.13,27.81,92.24,27.87,92.3,27.79,92.33,27.83,92.37,27.8,92.39,27.86,92.43,27.82,92.48,27.85,92.57,27.85,92.68,27.91,92.74,27.99,92.69,28.05,92.64,28.06,92.68,28.13,92.78,28.2,92.79,28.18,92.83,28.18,92.9,28.25,92.97,28.28,93.21,28.34,93.22,28.39,93.19,28.43,93.29,28.52,93.32,28.6,93.45,28.67,93.63,28.67,93.72,28.7,93.78,28.68,93.86,28.7,93.93,28.68,93.98,28.77,93.99,28.84,94.14,28.9,94.17,28.93,94.25,28.93,94.35,29.02,94.27,29.1,94.29,29.15,94.34,29.15,94.4,29.21,94.51,29.22,94.6,29.32,94.7,29.28,94.77,29.21,94.76,29.17,94.78,29.17,94.99,29.15,95.2,29.09,95.22,29.06,95.37,29.04,95.49,29.07,95.52,29.14,95.52,29.21,95.55,29.21,95.56,29.25,95.72,29.22,95.75,29.27,95.74,29.34,95.8,29.35,95.86,29.32,95.95,29.36,96.14,29.37,96.18,29.29,96.24,29.24,96.34,29.28,96.37,29.26,96.32,29.17,96.21,29.15,96.17,29.11,96.2,28.94,96.25,28.95,96.37,29.04,96.46,28.99,96.45,28.97,96.49,28.95,96.51,28.89,96.58,28.81,96.59,28.76,96.6,28.71,96.5,28.69,96.5,28.64,96.34,28.48,96.3,28.42,96.37,28.38,96.56,28.45,96.72,28.44,96.97,28.33,97.08,28.38,97.21,28.31,97.23,28.27,97.32,28.22,97.29,28.1,97.36,27.99,97.33,27.89,97.29,27.88,97.28,27.91,97.22,27.9,97.07,27.77,97.06,27.75,96.99,27.73,96.86,27.6,96.89,27.51,96.88,27.44,97.1,27.18,97.13,27.13,97.12,27.09,97.04,27.09,96.87,27.17,96.84,27.19,96.85,27.25,96.78,27.33,96.71,27.36,96.65,27.34,96.59,27.35,96.51,27.29,96.41,27.3,96.14,27.26,96.01,27.19,95.92,27.05,95.86,27.01,95.78,27.0,95.7,26.9,95.62,26.88,95.57,26.82,95.49,26.81,95.41,26.7,95.26,26.65,95.2,26.67,95.12,26.61,95.11,26.55,95.04,26.48,95.07,26.41,95.04,26.29,95.06,26.22,95.09,26.2,95.08,26.17,95.09,26.1,95.14,26.08,95.15,26.05,95.07,25.95,95.0,25.92,95.01,25.74,94.96,25.72,94.85,25.59,94.86,25.57,94.82,25.56,94.76,25.49,94.66,25.46,94.61,25.39,94.55,25.25,94.55,25.2,94.58,25.17,94.69,25.14,94.71,25.11,94.71,25.03,94.67,24.97,94.65,24.89,94.6,24.81,94.58,24.73,94.52,24.7,94.47,24.6,94.42,24.56,94.4,24.5,94.36,24.47,94.36,24.43,94.33,24.39,94.33,24.36,94.3,24.33,94.19,24.0,94.14,23.92,94.13,23.86,94.1,23.84,94.06,23.89,93.91,23.94,93.8,23.94,93.71,24.01,93.61,24.01,93.57,23.97,93.54,23.98,93.46,23.96,93.37,24.08,93.35,24.09,93.31,24.06,93.3,24.0,93.36,23.91,93.37,23.74,93.43,23.68,93.4,23.45,93.41,23.35,93.38,23.3,93.37,23.13,93.33,23.05,93.3,23.02,93.25,23.0,93.2,23.05,93.15,23.05,93.14,23.01,93.18,22.88,93.08,22.77,93.07,22.67,93.11,22.6,93.1,22.51,93.17,22.39,93.17,22.26,93.12,22.23,93.14,22.19,93.02,22.2,93.03,22.11,92.99,22.1,92.97,22.06,92.98,22.0,92.96,21.99,92.91,22.02,92.88,21.96,92.84,22.05,92.68,22.15,92.65,22.02,92.58,21.98,92.54,22.13,92.58,22.14,92.58,22.17,92.5,22.56,92.5,22.7,92.44,22.76,92.43,22.87,92.36,22.93,92.33,23.17,92.36,23.28,92.35,23.35,92.3,23.45,92.25,23.61,92.26,23.71,92.24,23.72,92.19,23.65,92.15,23.73,92.11,23.72,92.06,23.66,92.02,23.64,91.92,23.72,91.92,23.65,91.94,23.5,91.91,23.45,91.82,23.4,91.76,23.32,91.75,23.23,91.8,23.09,91.71,23.0,91.62,22.98,91.59,22.94,91.58,22.97,91.54,22.98,91.46,23.18,91.39,23.26,91.37,23.26,91.36,23.22,91.37,23.06,91.31,23.1,91.27,23.33,91.29,23.36,91.26,23.37,91.23,23.47,91.2,23.5,91.14,23.63,91.14,23.65,91.18,23.67,91.13,23.72,91.14,23.74,91.19,23.76,91.23,23.83,91.22,23.91,91.27,23.99,91.34,24.0,91.36,24.1,91.52,24.09,91.6,24.1,91.63,24.22,91.67,24.16,91.7,24.14,91.73,24.16,91.73,24.23,91.81,24.22,91.81,24.18,91.86,24.15,91.91,24.26,91.9,24.34,91.92,24.34,91.97,24.32,91.95,24.38,92.06,24.37,92.11,24.41,92.11,24.51,92.16,24.56,92.23,24.78,92.22,24.89,92.29,24.89,92.38,24.84,92.48,24.86,92.49,24.88,92.48,24.93,92.39,25.0,92.38,25.02,92.3,25.07,92.23,25.08,92.17,25.13,92.12,25.14,92.03,25.18,91.73,25.17,91.71,25.14,91.68,25.15,91.64,25.12,91.6,25.13,91.57,25.16,91.43,25.14,91.24,25.2,90.82,25.14,90.75,25.17,90.71,25.15,90.62,25.17,90.36,25.15,90.13,25.21,89.91,25.3,89.82,25.28,89.8,25.37,89.83,25.63,89.78,25.81,89.83,25.93,89.79,25.95,89.83,25.98,89.81,26.0,89.79,25.99,89.76,26.03,89.72,26.15,89.66,26.16,89.65,26.22,89.61,26.22,89.61,26.16,89.59,26.17,89.56,26.14,89.6,26.12,89.57,26.09,89.61,26.07,89.56,26.02,89.54,25.96,89.49,26.0,89.41,25.99,89.39,26.02,89.34,26.0,89.24,26.06,89.21,26.1,89.12,26.15,89.07,26.29,89.07,26.31,89.09,26.31,89.1,26.33,89.06,26.35,89.04,26.38,88.94,26.44,88.89,26.39,88.91,26.35,88.97,26.33,88.98,26.29,89.01,26.3,89.0,26.28,89.04,26.25,89.02,26.23,88.98,26.22,88.88,26.28,88.82,26.23,88.78,26.28,88.75,26.29,88.66,26.26,88.65,26.28,88.71,26.33,88.65,26.39,88.66,26.42,88.41,26.55,88.39,26.62,88.32,26.47,88.34,26.45,88.35,26.48,88.46,26.45,88.5,26.35,88.43,26.36,88.34,26.28,88.33,26.22,88.22,26.18,88.16,26.14,88.14,26.09,88.15,26.03,88.07,25.91,88.09,25.83,88.13,25.77,88.23,25.8,88.26,25.79,88.42,25.65,88.42,25.59,88.53,25.5,88.67,25.46,88.74,25.5,88.74,25.51,88.77,25.5,88.81,25.46,88.8,25.4,88.84,25.33,88.9,25.3,88.98,25.3,88.98,25.28,88.93,25.23,88.93,25.19,88.91,25.19,88.92,25.17,88.82,25.2,88.78,25.16,88.63,25.19,88.56,25.17,88.44,25.19,88.43,25.05,88.32,24.87,88.24,24.88,88.2,24.95,88.11,24.92,88.14,24.84,88.09,24.8,88.08,24.76,88.05,24.75,88.02,24.65,88.06,24.63,88.08,24.6,88.09,24.54,88.11,24.5,88.4,24.37,88.48,24.32,88.63,24.29,88.66,24.34,88.74,24.29,88.75,24.21,88.68,24.15,88.67,24.08,88.73,24.04,88.7,24.0,88.71,23.93,88.65,23.87,88.58,23.86,88.54,23.65,88.57,23.63,88.56,23.6,88.61,23.59,88.72,23.47,88.76,23.5,88.77,23.49,88.69,23.29,88.7,23.25,88.78,23.22,88.82,23.24,88.96,23.2,88.85,23.08,88.84,22.98,88.89,22.88,88.94,22.85,88.94,22.78,88.91,22.74,88.96,22.58,88.93,22.55,88.97,22.53,89.0,22.43,88.99,22.4,89.0,22.33,89.02,22.29,89.01,22.29,89.06,22.21,89.08,22.15,89.06,22.13,89.04,22.14,89.04,22.09,89.06,21.94,89.01,21.93,89.01,21.9,88.94,21.94,88.93,21.99,88.91,21.97,88.92,21.93,89.02,21.85,89.04,21.73,89.09,21.67,89.08,21.62,89.05,21.61,89.03,21.63,89.0,21.6,88.89,21.65,88.86,21.77,88.84,21.7,88.86,21.64,88.81,21.62,88.81,21.69,88.78,21.64,88.79,21.57,88.73,21.56,88.71,21.58,88.72,21.61,88.68,21.7,88.69,21.84,88.72,21.97,88.76,22.02,88.71,22.07,88.76,22.13,88.73,22.12,88.69,22.08,88.7,22.05,88.73,22.04,88.69,21.95,88.63,21.95,88.65,22.02,88.64,22.11,88.68,22.18,88.68,22.2,88.66,22.21,88.62,22.11,88.63,22.05,88.57,21.85,88.56,21.77,88.62,21.78,88.63,21.75,88.61,21.7,88.59,21.71,88.6,21.64,88.6,21.61,88.58,21.62,88.57,21.56,88.54,21.58,88.54,21.53,88.51,21.52,88.49,21.56,88.53,21.66,88.5,21.74,88.53,21.8,88.5,21.88,88.51,21.94,88.5,21.95,88.47,21.89,88.49,21.81,88.47,21.8,88.45,21.74,88.47,21.66,88.46,21.62,88.39,21.6,88.39,21.7,88.36,21.68,88.33,21.72,88.35,21.65,88.34,21.62,88.31,21.61,88.3,21.76,88.26,21.8,88.3,21.68,88.28,21.61,88.31,21.57,88.25,21.55,88.24,21.6,88.21,21.6,88.18,21.67,88.21,21.79,88.15,21.89,88.15,21.96,88.22,22.08,88.2,22.17,88.08,22.22,88.08,22.24,88.04,22.22,88.01,22.24,87.97,22.28,87.94,22.41,87.91,22.42,87.97,22.24,88.01,22.2,88.13,22.18,88.16,22.16,88.16,22.09,88.11,22.03,88.04,22.02,88.05,21.99,87.98,21.85,87.83,21.73,87.7,21.66,87.47,21.61,87.34,21.56,87.2,21.55,87.06,21.48,86.92,21.33,86.84,21.17,86.84,21.08,86.97,20.81,86.95,20.78,86.88,20.78,86.91,20.76,86.99,20.75,87.0,20.71,86.94,20.7,86.99,20.67,87.04,20.7,86.75,20.49,86.72,20.37,86.77,20.4,86.79,20.39,86.8,20.44,86.81,20.42,86.77,20.34,86.69,20.29,86.75,20.31,86.63,20.24,86.5,20.18,86.47,20.09,86.39,20.02,86.43,20.0,86.4,19.98,86.28,20.07,86.21,20.07,86.15,20.14,86.17,20.07,86.23,20.04,86.29,20.03,86.31,19.99,86.37,19.96,86.09,19.84,86.06,19.86,85.79,19.77,85.61,19.73,85.46,19.66,85.43,19.7,85.52,19.74,85.51,19.71,85.58,19.75,85.56,19.76,85.57,19.88,85.44,19.9,85.22,19.74,85.21,19.68,85.14,19.6,85.15,19.56,85.1,19.53,85.11,19.51,85.13,19.51,85.12,19.48,85.2,19.52,85.2,19.55,85.23,19.55,85.19,19.58,85.25,19.61,85.23,19.63,85.25,19.66,85.31,19.64,85.39,19.69,85.41,19.65,85.38,19.61,85.34,19.6,85.32,19.62,85.31,19.6,85.29,19.6,85.3,19.57,85.33,19.58,85.58,19.69,85.34,19.58,85.18,19.48,84.87,19.22,84.79,19.12,84.74,19.15,84.72,19.1,84.74,19.07,84.76,19.1,84.78,19.1,84.74,19.03,84.67,18.93,84.63,18.92,84.42,18.64,84.33,18.55,84.25,18.53,84.24,18.51,84.27,18.5,84.35,18.55,84.14,18.37,84.11,18.3,83.78,18.14,83.61,18.05,83.47,17.9,83.45,17.92,83.45,17.87,83.34,17.72,83.3,17.69,83.25,17.72,83.25,17.7,83.3,17.66,83.21,17.63,83.24,17.59,83.09,17.53,82.9,17.41,82.88,17.42,82.72,17.35,82.47,17.21,82.31,17.05,82.29,17.0],[88.87,21.6,88.89,21.59,88.9,21.58,88.91,21.57,88.91,21.55,88.91,21.53,88.9,21.53,88.88,21.53,88.86,21.52,88.84,21.53,88.83,21.58,88.84,21.61],[88.05,21.71,88.12,21.86,88.15,21.87,88.17,21.77,88.16,21.71,88.13,21.68,88.14,21.63,88.05,21.64],[88.64,21.92,88.67,21.91,88.64,21.79,88.59,21.8,88.58,21.84],[88.08,21.85,88.07,21.86,88.07,21.87,88.07,21.89,88.08,21.9,88.08,21.92,88.09,21.94,88.11,21.95,88.12,21.95,88.13,21.92,88.13,21.89,88.1,21.86]];
  var KGP = [87.31, 22.32], PLACES = { 1: [91.28, 23.83], 2: [89.58, 26.68], 3: [88.85, 21.95] };
  function proj(L, lon, lat) {
    var k = L.geo.k;
    return { x: L.hub.x + (lon - KGP[0]) * k * 0.9205, y: L.hub.y - (lat - KGP[1]) * k };
  }

  var LAYOUTS = {
    wide: {
      vb: '0 0 900 560', geo: { k: 80 }, hub: { x: 300, y: 410 }, rings: [85, 170, 265, 375, 500], R: 560, hubDy: 42,
      pos: {
        1: { x: 820, y: 205, l: [0, -40, 'middle'], bend: -1 },
        2: { x: 470, y: 66,  l: [34, 8, 'start'],   bend: -1 },
        3: { x: 440, y: 492, l: [0, 52, 'middle'],  bend: 1 },
        4: { x: 205, y: 335, l: [0, -40, 'middle'], bend: 1 },
        5: { x: 190, y: 468, l: [0, 52, 'middle'],  bend: -1 }
      }
    },
    tall: {
      vb: '0 0 420 640', geo: { k: 55 }, hub: { x: 170, y: 380 }, rings: [60, 125, 200, 285, 380], R: 480, hubDy: 44,
      pos: {
        1: { x: 350, y: 262, l: [0, -36, 'middle'],  bend: -1 },
        2: { x: 262, y: 76,  l: [32, 8, 'start'],    bend: -1 },
        3: { x: 300, y: 556, l: [24, 8, 'start'],   bend: 1 },
        4: { x: 88,  y: 318, l: [-22, -36, 'start'], bend: 1 },
        5: { x: 88,  y: 446, l: [-22, 50, 'start'],  bend: -1 }
      }
    }
  };
  Object.keys(LAYOUTS).forEach(function (n) {
    var L = LAYOUTS[n];
    [1, 2, 3].forEach(function (id) { var p = proj(L, PLACES[id][0], PLACES[id][1]); L.pos[id].x = Math.round(p.x); L.pos[id].y = Math.round(p.y); });
  });
  var tallMQ = window.matchMedia ? matchMedia('(max-width: 640px)') : { matches: false };
  var LAYOUT = LAYOUTS.wide, HUB = LAYOUT.hub, POS = LAYOUT.pos;
  var selected = null, userTouched = false, heroVisible = true, hovering = false;
  var routes = {}, nodes = {};

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function buildMap() {
    var svg = $('#mapSvg'); if (!svg || !TEAMS.length) return;
    LAYOUT = tallMQ.matches ? LAYOUTS.tall : LAYOUTS.wide; HUB = LAYOUT.hub; POS = LAYOUT.pos;
    svg.setAttribute('viewBox', LAYOUT.vb);
    svg.setAttribute('class', tallMQ.matches ? 'tall' : 'wide');
    routes = {}; nodes = {};
    var h = '';
    h += '<defs><linearGradient id="sweepG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f8f0e3" stop-opacity="0"/><stop offset="1" stop-color="#f8f0e3" stop-opacity=".16"/></linearGradient></defs>';
    var land = GEO.map(function (r) {
      var s = '';
      for (var i = 0; i < r.length; i += 2) { var q = proj(LAYOUT, r[i], r[i + 1]); s += (i ? 'L' : 'M') + q.x.toFixed(1) + ' ' + q.y.toFixed(1); }
      return s + 'Z';
    }).join('');
    h += '<path class="geo" aria-hidden="true" d="' + land + '"/>';
    var bd = proj(LAYOUT, 89.9, 24.45);
    if (!tallMQ.matches) h += '<text class="geo-label" aria-hidden="true" x="' + bd.x.toFixed(0) + '" y="' + bd.y.toFixed(0) + '">BANGLADESH</text>';
    h += '<g>' + LAYOUT.rings.map(function (r) { return '<circle class="ring" cx="' + HUB.x + '" cy="' + HUB.y + '" r="' + r + '"/>'; }).join('') + '</g>';
    var R = LAYOUT.R, a1 = -38 * Math.PI / 180;
    var p1 = [HUB.x + R * Math.cos(a1), HUB.y + R * Math.sin(a1)], p2 = [HUB.x + R, HUB.y];
    h += '<g class="sweep" style="transform-origin:' + HUB.x + 'px ' + HUB.y + 'px"><path d="M' + HUB.x + ' ' + HUB.y + ' L' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + p2[0] + ' ' + p2[1] + ' Z" fill="url(#sweepG)"/><line x1="' + HUB.x + '" y1="' + HUB.y + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="#f8f0e3" stroke-opacity=".3" stroke-width="1.5"/></g>';

    TEAMS.forEach(function (t) {
      var p = POS[t.id]; if (!p) return;
      var vx = p.x - HUB.x, vy = p.y - HUB.y, len = Math.hypot(vx, vy);
      var nx = -vy / len, ny = vx / len;
      var cx = (HUB.x + p.x) / 2 + nx * len * 0.24 * p.bend, cy = (HUB.y + p.y) / 2 + ny * len * 0.24 * p.bend;
      h += '<path class="route" data-id="' + t.id + '" d="M' + HUB.x + ' ' + HUB.y + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + p.x + ' ' + p.y + '"/>';
    });

    h += '<g class="hub"><circle class="pulse" cx="' + HUB.x + '" cy="' + HUB.y + '" r="14"/><circle class="pulse p2" cx="' + HUB.x + '" cy="' + HUB.y + '" r="14"/><circle class="core" cx="' + HUB.x + '" cy="' + HUB.y + '" r="10"/><text x="' + HUB.x + '" y="' + (HUB.y + LAYOUT.hubDy) + '" text-anchor="middle" style="paint-order:stroke;stroke:rgba(100,22,10,.9);stroke-width:5px;stroke-linejoin:round">IIT KHARAGPUR</text></g>';

    TEAMS.forEach(function (t) {
      var p = POS[t.id]; if (!p) return;
      var lx = p.l[0], ly = p.l[1], anchor = p.l[2];
      h +='<g class="node" data-id="' + t.id + '" tabindex="0" role="button" aria-label="Team ' + t.id + ': ' + esc(t.short) + '" transform="translate(' + p.x + ' ' + p.y + ')">' +
        '<circle r="38" fill="transparent"/><circle class="halo" r="26"/><circle class="disc" r="17"/><text class="no">' + t.id + '</text>' +
        '<text class="name" x="' + lx + '" y="' + ly + '" text-anchor="' + anchor + '">' + esc(t.short) + '</text></g>';
    });
    h += '<circle class="packet-dot" id="mapPacket" r="6.5" cx="-20" cy="-20" opacity="0"/>';
    svg.innerHTML = h;

    $$('.route', svg).forEach(function (r) { routes[r.getAttribute('data-id')] = r; });
    $$('.node', svg).forEach(function (n) {
      var id = +n.getAttribute('data-id'); nodes[id] = n;
      n.addEventListener('click', function () { selectTeam(id, true); });
      n.addEventListener('mouseenter', function () { hovering = true; selectTeam(id, true); });
      n.addEventListener('mouseleave', function () { hovering = false; });
      n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTeam(id, true); } });
    });
  }

  function buildList() {
    var ol = $('#teamList'); if (!ol) return;
    ol.innerHTML = TEAMS.map(function (t) {
      return '<li><button type="button" data-id="' + t.id + '" aria-pressed="false"><span class="num">' + t.id + '</span><span>' + esc(t.short) + '</span></button></li>';
    }).join('');
    $$('button', ol).forEach(function (b) {
      var id = +b.getAttribute('data-id');
      b.addEventListener('click', function () { selectTeam(id, true); });
      b.addEventListener('mouseenter', function () { selectTeam(id, true); });
    });
  }

  function val(v) { return v ? esc(v) : '<span class="is-soon">Coming Soon</span>'; }

  function selectTeam(id, fromUser) {
    if (fromUser) userTouched = true;
    var t = TEAMS.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    selected = id;
    $$('#teamList button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-id') === id)); });
    Object.keys(nodes).forEach(function (k) { nodes[k].classList.toggle('on', +k === id); });
    Object.keys(routes).forEach(function (k) { routes[k].classList.toggle('on', +k === id); });
    var nd = nodes[id]; if (nd && nd.parentNode) nd.parentNode.appendChild(nd);   // bring to front
    var pk = $('#mapPacket'); if (pk && pk.parentNode) pk.parentNode.appendChild(pk);
    pktStart = performance.now();

    var rows = '';
    if (t.location !== null && t.location !== undefined) rows += '<div><dt>Location</dt><dd>' + val(t.location) + '</dd></div>';
    rows += '<div><dt>School / community</dt><dd>' + val(t.school) + '</dd></div>' +
            '<div><dt>Student team</dt><dd>' + val(t.students) + '</dd></div>' +
            '<div><dt>Project theme</dt><dd>' + val(t.theme) + '</dd></div>';
    var info = $('#mapInfo');
    if (info) info.innerHTML = '<p class="k">Team ' + pad(t.id) + ' · ' + esc(t.region) + '</p><h3>' + esc(t.title) + '</h3><p class="b">' + esc(t.blurb) + '</p><dl>' + rows + '</dl>';
  }

  /* travelling signal dot on the selected route */
  var pktStart = 0;
  function packetLoop(now) {
    var pk = $('#mapPacket'), r = routes[selected];
    if (pk && r && heroVisible && !reduce) {
      var cycle = 3400, run = 2300, t = (now - pktStart) % cycle;
      if (t < run) {
        var f = t / run; f = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
        var pt = r.getPointAtLength(f * r.getTotalLength());
        pk.setAttribute('cx', pt.x); pk.setAttribute('cy', pt.y); pk.setAttribute('opacity', '1');
      } else pk.setAttribute('opacity', '0');
    }
    requestAnimationFrame(packetLoop);
  }

  function initHeroCycle() {
    var hero = $('.hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }, { threshold: 0.05 }).observe(hero);
    }
    var map = $('.hero-stage');
    if (map) { map.addEventListener('mouseenter', function () { hovering = true; }); map.addEventListener('mouseleave', function () { hovering = false; }); }
    if (reduce) return;
    setInterval(function () {
      if (userTouched || hovering || !heroVisible || document.hidden || !TEAMS.length) return;
      var i = TEAMS.map(function (t) { return t.id; }).indexOf(selected);
      selectTeam(TEAMS[(i + 1) % TEAMS.length].id, false);
    }, 4200);
  }

  /* team cards in the Teams section */
  function buildCards() {
    var box = $('#teamCards'); if (!box) return;
    box.innerHTML = TEAMS.map(function (t) {
      var rows = '';
      if (t.location !== null && t.location !== undefined) rows += '<div><dt>Location</dt><dd>' + val(t.location) + '</dd></div>';
      rows += '<div><dt>School / community</dt><dd>' + val(t.school) + '</dd></div><div><dt>Student team</dt><dd>' + val(t.students) + '</dd></div><div><dt>Project theme</dt><dd>' + val(t.theme) + '</dd></div>';
      return '<article class="tcard reveal"><span class="no" aria-hidden="true">' + pad(t.id) + '</span>' +
        '<p class="k">Team ' + pad(t.id) + '</p><h3>' + esc(t.title) + '</h3><p class="reg">' + esc(t.region) + '</p>' +
        '<p class="bl">' + esc(t.blurb) + '</p><dl>' + rows + '</dl>' +
        '<div class="foot"><span class="roster" role="img" aria-label="5 students and 1 coordinating teacher"><i></i><i></i><i></i><i></i><i></i><b></b></span>' +
        '<a href="#top" data-team="' + t.id + '">See on map ↑</a></div></article>';
    }).join('');
    $$('a[data-team]', box).forEach(function (a) {
      a.addEventListener('click', function () { selectTeam(+a.getAttribute('data-team'), true); });
    });
  }

  /* ------------------------------------------------------------------ nav + scroll */
  function initNav() {
    var nav = $('#nav'), toggle = $('#navToggle'), links = $('#navLinks'), bar = $('#progress');
    var spy = [['#about', 'about'], ['#teams', 'teams'], ['#how', 'how'], ['#learning', 'learning'], ['#network', 'network'], ['#participate', 'support'], ['#timeline', 'timeline'], ['#contact', 'contact']]
      .map(function (p) { return { a: $('.nav-links a[href="' + p[0] + '"]'), el: document.getElementById(p[1]) }; })
      .filter(function (x) { return x.a && x.el; });
    var tl = $$('#tl li');

    function close() { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); }
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('a', links).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    var ticking = false;
    function update() {
      ticking = false;
      var y = window.pageYOffset, max = document.documentElement.scrollHeight - window.innerHeight;
      nav.classList.toggle('solid', y > 30);
      bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
      var probe = y + window.innerHeight * 0.32, cur = null;
      spy.forEach(function (s) { if (s.el.offsetTop <= probe) cur = s; });
      spy.forEach(function (s) { s.a.classList.toggle('active', s === cur); if (s === cur) s.a.setAttribute('aria-current', 'true'); else s.a.removeAttribute('aria-current'); });
      var line = window.innerHeight * 0.64;
      tl.forEach(function (li) { var r = li.getBoundingClientRect(); li.classList.toggle('in', r.top + r.height / 2 < line); });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------------------------ reveal + counters */
  function initReveal() {
    var els = $$('.reveal, #rootedTitle');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in'); io.unobserve(en.target);
        if (en.target.classList.contains('counters')) countUp(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e, i) {
      if (e.classList.contains('tcard') || e.classList.contains('person') || e.classList.contains('lcard') || e.classList.contains('sup')) {
        e.style.transitionDelay = ((i % 3) * 90) + 'ms';
      }
      io.observe(e);
    });
  }
  function countUp(box) {
    $$('b[data-count]', box).forEach(function (b) {
      var to = +b.getAttribute('data-count');
      if (reduce) { b.textContent = to; return; }
      var t0 = performance.now(), d = 1300;
      (function step(now) {
        var f = clamp((now - t0) / d, 0, 1); f = 1 - Math.pow(1 - f, 3);
        b.textContent = Math.round(to * f);
        if (f < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* ------------------------------------------------------------------ venn slider */
  function initVenn() {
    var v = $('#venn'), r = $('#vennRange'); if (!v || !r) return;
    var verbs = $$('#verbs li');
    function set() {
      var t = r.value / 100;
      v.style.setProperty('--t', t);
      verbs.forEach(function (li, i) { li.classList.toggle('on', t >= 0.6 + i * 0.065); });
    }
    r.addEventListener('input', set); set();
  }

  /* ------------------------------------------------------------------ objectives filter */
  function initFilters() {
    var box = $('#objFilters'); if (!box) return;
    var items = $$('#objectives li');
    $$('button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', box).forEach(function (x) { x.classList.toggle('on', x === b); });
        var f = b.getAttribute('data-f');
        items.forEach(function (li) { li.classList.toggle('dim', f !== 'all' && li.getAttribute('data-g') !== f); });
      });
    });
  }

  /* ------------------------------------------------------------------ how-it-works tabs */
  function initHow() {
    var tabs = $$('#how-tabs [role="tab"]'), panels = $$('#how-tabs [role="tabpanel"]');
    var bar = $('#howBar'), prev = $('#howPrev'), next = $('#howNext'), cur = 0;
    function go(i, focus, user) {
      cur = clamp(i, 0, tabs.length - 1);
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === cur)); t.tabIndex = k === cur ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== cur; });
      if (bar) bar.style.width = ((cur + 1) / tabs.length * 100) + '%';
      if (prev) prev.style.visibility = cur === 0 ? 'hidden' : 'visible';
      if (next) next.style.visibility = cur === tabs.length - 1 ? 'hidden' : 'visible';
      if (focus) tabs[cur].focus();
      // on phones the steps form a horizontal strip: slide the strip (never the page) to keep the active step in view
      var strip = tabs[cur].parentNode;
      if (window.innerWidth <= 900 && strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({ left: tabs[cur].offsetLeft - (strip.clientWidth - tabs[cur].offsetWidth) / 2, behavior: reduce || !user ? 'auto' : 'smooth' });
      }
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { go(k, false, true); });
      t.addEventListener('keydown', function (e) {
        var key = e.key;
        if (key === 'ArrowDown' || key === 'ArrowRight') { e.preventDefault(); go((cur + 1) % tabs.length, true, true); }
        else if (key === 'ArrowUp' || key === 'ArrowLeft') { e.preventDefault(); go((cur - 1 + tabs.length) % tabs.length, true, true); }
        else if (key === 'Home') { e.preventDefault(); go(0, true, true); }
        else if (key === 'End') { e.preventDefault(); go(tabs.length - 1, true, true); }
      });
    });
    if (prev) prev.addEventListener('click', function () { go(cur - 1, false, true); });
    if (next) next.addEventListener('click', function () { go(cur + 1, false, true); });
    go(0);
  }

  /* ------------------------------------------------------------------ grounded plant */
  function initPlant() {
    var btns = $$('#principles button'), svg = $('#plant svg'), g = $('#leaves'), stem = $('#stem'), msg = $('#plantMsg'), sun = $('#plant .sun');
    if (!btns.length || !g) return;
    var N = btns.length, len = stem.getTotalLength();
    stem.style.strokeDasharray = len; stem.style.strokeDashoffset = len;

    var ys = [336, 296, 256, 218, 180, 142, 106, 74], leaves = [];
    ys.forEach(function (sy, i) {
      var side = i % 2 === 0 ? 1 : -1, ang = -26 * 1, k = 1 - i * 0.055, sx = 200;
      function P(x, y) {
        var a = ang * Math.PI / 180, rx = x * Math.cos(a) - y * Math.sin(a), ry = x * Math.sin(a) + y * Math.cos(a);
        return (sx + side * rx * k).toFixed(1) + ' ' + (sy + ry * k).toFixed(1);
      }
      var d = 'M' + P(0, 0) + ' C' + P(26, -28) + ' ' + P(74, -34) + ' ' + P(112, -8) + ' C' + P(76, 16) + ' ' + P(30, 18) + ' ' + P(0, 0) + 'Z';
      var vein = 'M' + P(6, 0) + ' L' + P(96, -9);
      var grp = document.createElementNS(NS, 'g');
      grp.setAttribute('class', 'leafy');
      grp.style.setProperty('transform-box', 'view-box');
      grp.style.transformOrigin = sx + 'px ' + sy + 'px';
      grp.innerHTML = '<path d="' + d + '"/><path class="vein" d="' + vein + '"/>';
      g.appendChild(grp); leaves.push(grp);
    });
    // flower at the top
    var bloom = document.createElementNS(NS, 'g'); bloom.setAttribute('class', 'bloom');
    var petals = '';
    for (var a = 0; a < 360; a += 60) petals += '<ellipse cx="200" cy="22" rx="9" ry="17" fill="#e3a53b" stroke="#10261a" stroke-width="1.5" transform="rotate(' + a + ' 200 46)"/>';
    bloom.innerHTML = petals + '<circle cx="200" cy="46" r="9" fill="#b9361f" stroke="#10261a" stroke-width="1.5"/>';
    g.appendChild(bloom);

    function update() {
      var n = btns.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).length;
      leaves.forEach(function (l, i) { l.classList.toggle('on', i < n); });
      bloom.classList.toggle('on', n === N);
      stem.style.strokeDashoffset = len * (1 - (n === 0 ? 0.1 : 0.16 + 0.84 * n / N));
      if (sun) sun.style.opacity = n / N;
      msg.textContent = n === 0 ? 'Tap a principle to plant it.' : n === N ? 'That is grounded technology.' : n + ' of ' + N + ' grounded';
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); update(); });
    });
    update();
  }

  /* ------------------------------------------------------------------ LoRa message demo */
  function initNet() {
    var svg = $('#netSvg'), btn = $('#sendMsg'), cap = $('#netCaption'), pk = $('#packet');
    if (!svg || !btn) return;
    var wavesBox = $('.waves', svg), wg = wavesBox ? $$(':scope > g', wavesBox) : [];
    // order in markup: solar right, solar left, relay right, relay left, community, village
    var W = { village: [5], solar: [0, 1], relay: [2, 3], community: [4] };
    var legs = [$('#l1'), $('#l2'), $('#l3')];
    var steps = [
      { on: 'village', text: '<b>1 · Village.</b> A simple device sends a short text. No SIM card, no tower.' },
      { on: 'solar', text: '<b>2 · Solar node.</b> Powered by the sun, it picks up the LoRa signal and passes it on.' },
      { on: 'relay', text: '<b>3 · Relay node.</b> On higher ground, it carries the message across the valley.' },
      { on: 'community', text: '<b>4 · Delivered.</b> The community node receives it. Low bandwidth, but it gets through.' }
    ];
    var busy = false;
    function lit(key) { wg.forEach(function (g, i) { g.classList.toggle('on', key && W[key].indexOf(i) > -1); }); }
    function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? Math.min(ms, 200) : ms); }); }
    function travel(path, ms) {
      return new Promise(function (res) {
        var L = path.getTotalLength(), t0 = performance.now();
        (function frame(now) {
          var f = clamp((now - t0) / ms, 0, 1), e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
          var p = path.getPointAtLength(e * L);
          pk.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ')');
          if (f < 1) requestAnimationFrame(frame); else res();
        })(t0);
      });
    }
    btn.addEventListener('click', async function () {
      if (busy) return; busy = true; btn.disabled = true; btn.style.opacity = .6;
      pk.setAttribute('opacity', '1');
      var s0 = legs[0].getPointAtLength(0); pk.setAttribute('transform', 'translate(' + s0.x + ' ' + s0.y + ')');
      for (var i = 0; i < steps.length; i++) {
        lit(steps[i].on); cap.innerHTML = steps[i].text;
        await wait(1100);
        if (legs[i]) await travel(legs[i], reduce ? 200 : 1500);
      }
      await wait(2200);
      lit(null); pk.setAttribute('opacity', '0');
      busy = false; btn.disabled = false; btn.style.opacity = 1; btn.textContent = 'Send another ▸';
    });

    // hover a component name to highlight it in the diagram
    $$('#partsList li').forEach(function (li) {
      var part = li.getAttribute('data-p');
      function on() { $$('[data-part="' + part + '"]', svg).forEach(function (n) { n.classList.add('hl'); }); }
      function off() { $$('.hl', svg).forEach(function (n) { n.classList.remove('hl'); }); }
      li.addEventListener('mouseenter', on); li.addEventListener('mouseleave', off);
      li.addEventListener('focus', on); li.addEventListener('blur', off);
    });
  }

  /* ------------------------------------------------------------------ "does this sound like you?" */
  function initChecks() {
    var boxes = $$('#checks input'), msg = $('#checkMsg'); if (!boxes.length) return;
    function upd() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      msg.textContent = n === 0 ? 'Tick what applies to you.'
        : n < 3 ? 'A good start. Curiosity is all it takes.'
        : n < 6 ? 'You are sounding like a future-ready innovator.'
        : 'This sounds like you. You would fit right in.';
    }
    boxes.forEach(function (b) { b.addEventListener('change', upd); });
  }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    bindConfig();
    renderPeople();
    buildMap(); buildList(); buildCards();
    if (TEAMS.length) selectTeam(TEAMS[0].id, false);
    requestAnimationFrame(packetLoop);
    // switch between the wide and tall map layouts when the screen crosses the phone breakpoint
    var lastTall = tallMQ.matches;
    window.addEventListener('resize', function () {
      if (tallMQ.matches === lastTall) return;
      lastTall = tallMQ.matches;
      var keep = selected; buildMap(); if (keep) selectTeam(keep, false);
    });
    initHeroCycle();
    initNav();
    initVenn(); initFilters(); initHow(); initPlant(); initNet(); initChecks();
    initReveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
