<script lang="ts">
    import { enhance } from "$app/forms";
    import { slide } from "svelte/transition";
    import "../ui.css";
    import type { ActionData } from "./$types";

    export let form: ActionData;
</script>

<div class="w-full h-full flex">
    <form use:enhance action="?/login" method="POST" class="flex flex-col gap-2 m-auto">
        <input name="password" type="password" placeholder="Password" class="input input-bordered w-full max-w-xs"  />
        {#if form?.incorrect}
            <p in:slide class="text-error text-center">Wrong password</p>
        {/if}
        <button class="btn btn-primary">Login</button>
    </form>
</div>