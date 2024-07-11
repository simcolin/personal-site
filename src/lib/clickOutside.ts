export default (node: HTMLElement, _options = {}) => {
    const options = { include: [], ..._options };

    function detect(event: MouseEvent) {
        const target = event.target as HTMLElement;
        // if node contains or is click target, dispatch a clickoutside event
        if (!node.contains(target) || options.include.some((i) => target.isSameNode(i))) {
            node.dispatchEvent(new CustomEvent('clickoutside', { ...event }));
        }
    }
    // on click launch detect function
    document.addEventListener('click', detect, { passive: true, capture: true });
    return {
        destroy() {
            // unbind detect function to avoid errors
            document.removeEventListener('click', detect);
        },
    };
};