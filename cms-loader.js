// cms-loader.js
// Lee el contenido editado desde Decap CMS (archivos JSON en /content)
// y lo inyecta en la página. Si algún fetch falla (offline, archivo
// abierto en local, etc.) la página se queda con el contenido que ya
// tiene escrito en el HTML: nunca se rompe por falta de datos.
(function () {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function applyText(root, data) {
    root.querySelectorAll("[data-cms]").forEach(function (el) {
      var key = el.getAttribute("data-cms");
      if (data[key] !== undefined && data[key] !== "") {
        if (el.tagName === "IMG") {
          el.src = data[key];
        } else {
          el.textContent = data[key];
        }
      }
    });
  }

  function applyBg(root, data) {
    root.querySelectorAll("[data-cms-bg]").forEach(function (el) {
      var key = el.getAttribute("data-cms-bg");
      if (data[key]) {
        el.style.backgroundImage = "url(" + data[key] + ")";
      }
    });
  }

  function applyLists(root, data) {
    root.querySelectorAll("[data-cms-list]").forEach(function (el) {
      var key = el.getAttribute("data-cms-list");
      var type = el.getAttribute("data-cms-list-type") || "gallery";
      var list = data[key];
      if (!Array.isArray(list) || !list.length) return;

      if (type === "checklist") {
        el.innerHTML = list
          .map(function (item) {
            return (
              '<li class="is-visible">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
              escapeHtml(item) +
              "</li>"
            );
          })
          .join("");
      } else if (type === "img") {
        el.innerHTML = list
          .map(function (g) {
            return (
              '<img src="' + g.image + '" alt="' + escapeHtml(g.alt || "") + '">'
            );
          })
          .join("");
      } else if (type === "testi") {
        el.innerHTML = list
          .map(function (g) {
            return (
              '<div class="testi-photo-wrap is-visible"><img src="' +
              g.image +
              '" alt="' +
              escapeHtml(g.alt || "") +
              '"></div>'
            );
          })
          .join("");
      } else {
        el.innerHTML = list
          .map(function (g) {
            return (
              '<a href="#"><img src="' +
              g.image +
              '" alt="' +
              escapeHtml(g.alt || "") +
              '"></a>'
            );
          })
          .join("");
      }
    });
  }

  function applyHrefs(root, data) {
    root.querySelectorAll("[data-cms-href]").forEach(function (el) {
      var key = el.getAttribute("data-cms-href");
      if (data[key]) el.setAttribute("href", data[key]);
    });
  }

  function applyStats(root, data) {
    var el = root.querySelector('[data-cms-list="stats"]');
    if (!el || !Array.isArray(data.stats) || !data.stats.length) return;
    el.innerHTML = data.stats
      .map(function (s, i) {
        return (
          '<div class="stat reveal is-visible" style="transition-delay:' +
          (i * 0.1).toFixed(1) +
          's"><div class="stat-num">' +
          escapeHtml(s.num) +
          '</div><div class="stat-label">' +
          escapeHtml(s.label) +
          "</div></div>"
        );
      })
      .join("");
  }

  function loadJSON(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("no content file: " + url);
      return r.json();
    });
  }

  function loadCourse(slug) {
    loadJSON("content/courses/" + slug + ".json")
      .then(function (data) {
        applyText(document, data);
        applyBg(document, data);
        applyLists(document, data);
        applyHrefs(document, data);
      })
      .catch(function () {});
  }

  function loadPage(slug) {
    loadJSON("content/pages/" + slug + ".json")
      .then(function (data) {
        applyText(document, data);
        applyBg(document, data);
        applyLists(document, data);
        applyStats(document, data);
        applyHrefs(document, data);
      })
      .catch(function () {});
  }

  function loadTeam(slug, rootEl) {
    loadJSON("content/team/" + slug + ".json")
      .then(function (data) {
        applyText(rootEl || document, data);
      })
      .catch(function () {});
  }

  function loadGlobalContact() {
    loadJSON("content/site/contact.json")
      .then(function (data) {
        document.querySelectorAll("[data-cms-global]").forEach(function (el) {
          var key = el.getAttribute("data-cms-global");
          if (data[key] !== undefined && data[key] !== "") {
            el.textContent = data[key];
          }
        });
        document.querySelectorAll("[data-cms-global-href]").forEach(function (el) {
          var key = el.getAttribute("data-cms-global-href");
          if (data[key]) el.setAttribute("href", data[key]);
        });
        document.querySelectorAll("[data-cms-global-mailto]").forEach(function (el) {
          var key = el.getAttribute("data-cms-global-mailto");
          if (data[key]) el.setAttribute("href", "mailto:" + data[key]);
        });
      })
      .catch(function () {});
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadGlobalContact();

    var coursePage = document.body.getAttribute("data-cms-page");
    if (coursePage) loadCourse(coursePage);

    var siteGeneralPage = document.body.getAttribute("data-cms-general-page");
    if (siteGeneralPage) loadPage(siteGeneralPage);

    document.querySelectorAll("[data-cms-team]").forEach(function (el) {
      loadTeam(el.getAttribute("data-cms-team"), el);
    });
  });
})();
