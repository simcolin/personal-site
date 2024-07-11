<script lang="ts">
    import "./global.css";

    function onStylesheetLoad(e: Event) {
        const target = (e.target as HTMLLinkElement);
        target.rel = "stylesheet";
    }
</script>

<svelte:head>
    <title>Karuta Date Solver</title>
    <meta name="description" content="An app to solve your karuta dates for you">
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;400;700&display=swap" rel="stylesheet preload" as="style" on:load={onStylesheetLoad} />
</svelte:head>

<slot />