<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import "../app.css";

    onNavigate(navigation => {
        if(!(document as any).startViewTransition) return;

        return new Promise(resolve => {
            (document as any).startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
</svelte:head>

<slot />