function showLoading(show) {
  let loader = document.getElementById("loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loader";
    loader.style.position = "fixed";
    loader.style.top = "0";
    loader.style.left = "0";
    loader.style.width = "100%";
    loader.style.height = "100%";
    loader.style.background = "rgba(255,255,255,0.7) url('/src/img/loader.svg') no-repeat center center";
    loader.style.zIndex = "1000";
    document.body.appendChild(loader);
  }
  loader.style.display = show ? "block" : "none";
}
