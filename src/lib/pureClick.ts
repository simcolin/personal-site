export default (node: HTMLElement) => {
    const delta = 6;
    let startX = -delta;
    let startY = -delta;

    function mousedown(event: MouseEvent) {
        startX = event.pageX;
        startY = event.pageY;
    }

    function mouseup(event: MouseEvent) {
        const diffX = Math.abs(event.pageX - startX);
        const diffY = Math.abs(event.pageY - startY);

        if (diffX < delta && diffY < delta) {
            node.dispatchEvent(new MouseEvent('pureclick', { ...event }));
        }
    }

    node.addEventListener("pointerdown", mousedown);
    node.addEventListener("pointerup", mouseup);

    return {
        destroy() {
            node.removeEventListener("pointerdown", mousedown);
            node.removeEventListener("pointerup", mouseup);
        },
    };
};