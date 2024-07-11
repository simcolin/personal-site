type NumbersOnlyOptions = {
    allowNegative?: boolean,
    allowFloat?: boolean,
}

export const numbersOnly = (node: HTMLInputElement, opts: NumbersOnlyOptions = {}) => {
    const disabledKeys = ["e", "ArrowUp", "ArrowDown"];
    if (!opts.allowNegative) disabledKeys.push("-");
    if (!opts.allowFloat) disabledKeys.push(".");

    function onKeydown(event: KeyboardEvent) {
        if (disabledKeys.includes(event.key)) {
            event.preventDefault();
        }
    }

    node.addEventListener("keydown", onKeydown);
    return {
        destroy() {
            node.removeEventListener("keydown", onKeydown);
        },
    };
};