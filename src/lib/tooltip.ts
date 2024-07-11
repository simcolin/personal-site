type TextTooltipOptions = {
    text: string;
    direction?: "top" | "left" | "bottom" | "right";
};

const defaultValues = {
    text: "",
    direction: "top",
} as const;

export const textTooltip = (node: HTMLElement, options: TextTooltipOptions) => {
    const opts = { ...defaultValues, ...options };
    const tooltipElem = document.createElement("div");
    tooltipElem.classList.add("vad-tooltip");
    tooltipElem.classList.add(opts.direction);
    tooltipElem.innerHTML = opts.text + `<div class="arrow"></div>`;

    node.appendChild(tooltipElem);
    node.style.position = "relative";

    function showTooltip() {
        tooltipElem.classList.add("visible");
    }

    function hideTooltip() {
        tooltipElem.classList.remove("visible");
    }

    node.addEventListener("mouseenter", showTooltip);
    node.addEventListener("mouseleave", hideTooltip);

    return {
        destroy: () => {
            node.removeEventListener("mouseenter", showTooltip);
            node.removeEventListener("mouseleave", hideTooltip);
            node.style.position = "unset";
            tooltipElem.remove();
        }
    }
}