<script lang="ts" context="module">
    import { writable } from "svelte/store";
    import { tick } from "svelte";
    import clickOutside from "./clickOutside";

    export type ContextMenuOption = {
        text: string,
        action: () => void,
    };

    let _menu = writable({
        left: 0,
        top: 0,
        opened: false,
    });

    let _options = writable<ContextMenuOption[]>([]);

    export const contextmenu = {
        open: (event: MouseEvent, options?: ContextMenuOption[]) => {
            _menu.set({
                left: event.clientX,
                top: event.clientY,
                opened: true,
            });
            if(options) _options.set(options);
        },
    };
</script>

<script lang="ts">
    let ctnMenuElem: HTMLDivElement;
    let anchorLeft: boolean = false;
    let anchorTop: boolean = false;

    $: if (ctnMenuElem) {
        tick().then(() => {
            anchorLeft = $_menu.left + ctnMenuElem.clientWidth > window.innerWidth;
            anchorTop = $_menu.top + ctnMenuElem.clientHeight > window.innerHeight;
        });
    }

    function onClickOutside() {
        if ($_menu.opened) $_menu.opened = false;
    }

    function onOptionClick(index: number) {
        $_options[index].action();
        $_menu.opened = false;
    }
</script>

<div
    bind:this={ctnMenuElem}
    class="fixed shadow-md rounded border select-none z-50 flex flex-col bg-white p-1"
    class:invisible={!$_menu.opened}
    class:-translate-x-full={anchorLeft}
    class:-translate-y-full={anchorTop}
    style:left={$_menu.left + "px"}
    style:top={$_menu.top + "px"}
    use:clickOutside
    on:clickoutside={onClickOutside}
>
    {#each $_options as option, index}
        <button class="px-2 py-1 text-sm hover:bg-slate-200 rounded-sm flex items-center" on:click={() => onOptionClick(index)}>{@html option.text}</button>
    {/each}
</div>