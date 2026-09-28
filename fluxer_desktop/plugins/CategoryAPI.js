(function () {

    if (window.__AVIA_CATEGORY_FLUXER__) return;
    window.__AVIA_CATEGORY_FLUXER__ = true;

    const categoryRegisteredItems = [];

    const ACCOUNT_PATH = "M152,80a8,8,0,0,1,8-8h88a8,8,0,0,1,0,16H160A8,8,0,0,1,152,80Zm96,40H160a8,8,0,0,0,0,16h88a8,8,0,0,0,0-16Zm0,48H184a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16ZM109.29,142a48,48,0,1,0-58.58,0c-20.62,8.73-36.87,26.3-42.46,48A8,8,0,0,0,16,200H144a8,8,0,0,0,7.75-10C146.16,168.29,129.91,150.72,109.29,142Z";

    function findAccountButton() {
        const paths = document.querySelectorAll("path");

        for (const path of paths) {
            if (path.getAttribute("d") !== ACCOUNT_PATH) continue;

            const button = path.closest(
                '[data-flx="app.settings-modal-layout.settings-modal-sidebar-item.button"]'
            );

            if (button) {
                return button;
            }
        }

        return null;
    }

    function findAccountCategory() {
        const button = findAccountButton();

        if (!button) return null;

        return button.closest(
            '[data-flx="app.settings-modal-layout.settings-modal-sidebar-category.sidebar-category"]'
        );
    }

    function inject() {
        if (document.getElementById("avia-fluxer-category")) return;

        const accountCategory = findAccountCategory();

        if (!accountCategory || !accountCategory.parentElement) return;

        const category = accountCategory.cloneNode(true);

        category.id = "avia-fluxer-category";

        const title = category.querySelector(
            '[data-flx="app.settings-modal-layout.settings-modal-sidebar-category-title.sidebar-category-title"]'
        );

        if (title) {
            title.textContent = "Avia Client";
        }

        category.querySelectorAll(
            '[data-flx="app.settings-modal-layout.settings-modal-sidebar-item.button"]'
        ).forEach(button => {
            button.remove();
        });

        category.querySelectorAll(
            '[data-flx="app.settings-modal-layout.settings-modal-sidebar-sub-items.sidebar-sub-items-wrap"]'
        ).forEach(subItems => {
            subItems.remove();
        });

        accountCategory.parentElement.insertBefore(
            category,
            accountCategory
        );

        renderItems();
    }

    function buildButton(item) {
        const accountButton = findAccountButton();

        if (!accountButton) return null;

        const button = accountButton.cloneNode(true);

        button.removeAttribute("id");
        button.removeAttribute("aria-selected");
        button.removeAttribute("aria-expanded");
        button.removeAttribute("aria-controls");
        button.removeAttribute("aria-keyshortcuts");
        button.removeAttribute("data-tab-id");
        button.removeAttribute("data-expandable");
        button.removeAttribute("data-focus-ring-managed");

        delete button.dataset.settingsTab;

        button.dataset.aviaCategoryId = item.id;

        const label = button.querySelector(
            '[data-flx="app.desktop-settings-view.span"]'
        );

        if (label) {
            label.textContent = item.name;
        }

        const icon = button.querySelector(
            '[data-flx="app.settings-modal-layout.settings-modal-sidebar-item.sidebar-item-icon"]'
        );

        if (icon) {
            if (item.icon) {
                const filled = item.icon.endsWith("_fill");

                const iconSpan = document.createElement("span");

                iconSpan.className = "material-symbols-outlined";
                iconSpan.textContent = filled
                    ? item.icon.slice(0, -5)
                    : item.icon;

                iconSpan.style.cssText =
                    "flex-shrink:0;display:block;" +
                    "font-variation-settings:'FILL' " +
                    (filled ? "1" : "0") +
                    ",'wght' 400,'GRAD' 0;" +
                    "font-size:1.25rem;" +
                    "width:1.25rem;height:1.25rem;";

                icon.replaceWith(iconSpan);
            } else {
                icon.remove();
            }
        }

        const chevron = button.querySelector(
            '[data-flx="app.settings-modal-layout.settings-modal-sidebar-item.sidebar-item-chevron"]'
        );

        if (chevron) {
            chevron.remove();
        }

        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            try {
                item.onClick();
            } catch (error) {
                console.error("[AviaCategory]", error);
            }
        });

        return button;
    }

    function renderItems() {
        const category = document.getElementById("avia-fluxer-category");

        if (!category) return;

        for (const item of categoryRegisteredItems) {
            if (
                category.querySelector(
                    `[data-avia-category-id="${CSS.escape(item.id)}"]`
                )
            ) {
                continue;
            }

            const button = buildButton(item);

            if (button) {
                category.appendChild(button);
            }
        }
    }

    window.AviaCategory = {
        register(item) {
            if (!item || typeof item !== "object") {
                console.error(
                    "[AviaCategory] register: item must be an object, got",
                    typeof item
                );
                return;
            }

            if (typeof item.id !== "string" || !item.id.trim()) {
                console.error(
                    "[AviaCategory] register: item.id must be a non-empty string, got",
                    item.id
                );
                return;
            }

            if (typeof item.name !== "string" || !item.name.trim()) {
                console.error(
                    "[AviaCategory] register: item.name must be a non-empty string, got",
                    item.name
                );
                return;
            }

            if (typeof item.onClick !== "function") {
                console.error(
                    "[AviaCategory] register: item.onClick must be a function, got",
                    typeof item.onClick
                );
                return;
            }

            const id = item.id.trim();

            if (categoryRegisteredItems.some(i => i.id === id)) {
                console.error(
                    "[AviaCategory] register: id '%s' is already registered",
                    id
                );
                return;
            }

            categoryRegisteredItems.push({
                id,
                name: item.name,
                icon:
                    typeof item.icon === "string" && item.icon.trim()
                        ? item.icon.trim()
                        : null,
                onClick: item.onClick
            });

            inject();
            renderItems();
        },

        unregister(item) {
            if (!item || typeof item.id !== "string") {
                return;
            }

            const id = item.id.trim();

            const index = categoryRegisteredItems.findIndex(
                i => i.id === id
            );

            if (index === -1) {
                return;
            }

            categoryRegisteredItems.splice(index, 1);

            const category = document.getElementById(
                "avia-fluxer-category"
            );

            if (!category) return;

            const button = category.querySelector(
                `[data-avia-category-id="${CSS.escape(id)}"]`
            );

            if (button) {
                button.remove();
            }
        }
    };

    new MutationObserver(() => {
        inject();
        renderItems();
    }).observe(document.body, {
        childList: true,
        subtree: true
    });

    inject();

})();
