(function () {
    if (window.__titlebarRefresh) return;
    window.__titlebarRefresh = true;

    function inject() {
        if (document.querySelector(".avia-refresh-button")) return;

        const path = document.querySelector(
            'svg path[d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z"]'
        );

        if (!path) return;

        const minimizeBtn = path.closest("button");

        if (!minimizeBtn) return;

        const button = minimizeBtn.cloneNode(true);

        button.classList.add("avia-refresh-button");
        button.setAttribute("aria-label", "Refresh");

        const svg = button.querySelector("svg");

        if (svg) {
            svg.setAttribute("viewBox", "0 -960 960 960");
            svg.innerHTML = '<path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"></path>';
        }

        button.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            location.reload();
        });

        minimizeBtn.parentElement.insertBefore(button, minimizeBtn);
    }

    inject();

    new MutationObserver(inject).observe(document.body, {
        childList: true,
        subtree: true
    });
})();
