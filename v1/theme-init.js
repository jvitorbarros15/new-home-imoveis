(function () {
  var t;
  try { t = localStorage.getItem("nh-theme"); } catch (e) { t = null; }
  document.documentElement.setAttribute("data-theme", t || "dark");
})();
