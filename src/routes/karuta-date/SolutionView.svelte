<script lang="ts">
    import { textTooltip } from "$lib/tooltip";
    import { image_map } from "./BoardView.svelte";
    import type { BoardState } from "./solver-types";

    export let solution: BoardState;

    $: actions = solution.actions.split(",").slice(1);

    function get_action_icon(action_name: string) {
        if(action_name.startsWith("activity_")) {
            return image_map.get(action_name.slice(9)) as string;
        }
        return image_map.get(action_name) as string;
    }

    function build_resource_html(solution: BoardState) {
        return `
            Fuel: ${solution.fuel}
            Food: ${solution.food}
            Drink: ${solution.drink}
            Entertainement: ${solution.entertainement}
        `;
    }
</script>

<div class="flex items-center gap-2 text-xl flex-wrap sm:text-xl" use:textTooltip={{ text: build_resource_html(solution) }}>
    {#if solution.has_home}
        <img src={image_map.get("home")} class="w-12 h-12 rounded p-2 bg-slate-800" alt="">
    {/if}
    {#if solution.has_airport}
        <img src={image_map.get("airport")} class="w-12 h-12 rounded p-2 bg-slate-800" alt="">
    {/if}
    {#if solution.has_jewelry_store}
        <img src={image_map.get("jewelry_store")} class="w-12 h-12 rounded p-2 bg-slate-800" alt="">
    {/if}
    {#if solution.has_shopping_mall}
        <img src={image_map.get("shopping_mall")} class="w-12 h-12 rounded p-2 bg-slate-800" alt="">
    {/if}
    {#if !solution.has_airport}
        <span class="rounded p-2 bg-slate-800 whitespace-nowrap">Score: {solution.score} AP</span>
    {/if}
    {#each actions as action}
        <img src={get_action_icon(action)} class="w-7 h-7" alt="">
    {/each}
</div>
<div class=" w-full border border-b-0 sm:hidden" />