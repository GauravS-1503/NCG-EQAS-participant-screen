// /assets/include.js
async function inject(targetSelector, url) {
  const host = document.querySelector(targetSelector);
  if (!host) return;

  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    host.innerHTML = await res.text();
  } catch (err) {
    console.error("Include failed:", url, err);
  }
}

function markActive() {
  // folder just before index.html, e.g. "Dashboard"
  const folder = location.pathname.split("/").slice(-2, -1)[0].toLowerCase();
  document.querySelectorAll("#sidebarMenu a[data-link]").forEach((a) => {
    const key = a.getAttribute("data-link");
    if (folder.includes(key)) {
      a.classList.add("text-primary");
      a.classList.remove("text-white");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // pages are one folder deep → components are one level up
  await inject("#header",  "../components/header.html");
  await inject("#sidebar", "../components/sidebar.html");
  markActive();
});
