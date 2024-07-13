<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    let container: HTMLDivElement;

    type Project = {
        name: string,
        path: string,
        description: string,
    }

    let projects: Project[] = [
        { name: "Weird 1", path: "/projects/weird-1", description: "" },
        { name: "Weird 2", path: "/projects/weird-2", description: "" },
        { name: "Triangle Background", path: "/projects/triangle-shit", description: "" },
        { name: "Ray Tracer/Marcher", path: "/projects/ray-tracer", description: "" },
        { name: "Wave Function Collapse", path: "/projects/wave-function-collapse", description: "" },
        { name: "Triangle Image Mesher", path: "/projects/triangle-image-mesher", description: "" },
        { name: "Square Stuff", path: "/projects/square-stuff", description: "" },
        { name: "Game Of Life", path: "/projects/game-of-life", description: "" },
        { name: "GPU Pathtracer", path: "/projects/gpu-pathtracer", description: "" },
        { name: "Animated Grass", path: "/projects/animated-grass", description: "" },
    ];

    async function loadDescriptions() {
        const { marked } = await import("marked");
        const modules = import.meta.glob("./projects/**/README.md", {
            query: "?raw",
            import: "default",
        });
        for (const module in modules) {
            const importModule = modules[module];
            const content = await importModule();
            if (typeof content === "string") {
                const project = projects.find(p => module.includes(p.path));
                if (!project) continue;
                const parsed = marked.parse(content);
                if (typeof parsed === "string") {
                    project.description = parsed;
                } else {
                    project.description = await parsed;
                }
                project.description = project.description.replace('href="', 'target="_blank" href="');
            }
        }
        projects = projects;
    }

    onMount(() => {
        loadDescriptions();
    });
</script>

<div class="w-screen h-screen flex bg-[#252f3f]">
    <nav id="nav" class="flex flex-col h-full py-4 z-10">
        <a href="/fun" class="font-bold text-2xl text-center">Fun Projects</a>
        <div class="flex flex-col gap-1 px-2 mt-4">
            {#each projects as project}
                <a
                    class="nav-link px-4 py-2 whitespace-nowrap rounded-lg relative group"
                    class:active={$page.url.pathname.includes(project.path)}
                    href="/fun{project.path}">
                    <span>{project.name}</span>
                    {#if project.description}
                        <div class="absolute left-full top-1/2 -translate-y-1/2 pl-2 invisible group-hover:visible z-20">
                            <div class="marked transition-all absolute left-full top-1/2 -translate-y-1/2
                                rounded-lg bg-[#252f3f] px-4 py-2 opacity-0 tooz-shadow select-auto
                                group-hover:left-full group-hover:opacity-100">
                                {@html project.description}
                                <div class="flex justify-end">
                                    <a
                                        class="underline text-gray-400 hover:bg-none"
                                        target="_blank"
                                        href="https://github.com/simcolin/personal-site/tree/main/src/routes/fun{project.path}">
                                        source code
                                    </a>
                                </div>
                            </div>
                        </div>
                    {/if}
                </a>
            {/each}
        </div>
    </nav>
    <main class="w-full h-full grow relative flex overflow-auto py-4 pr-4 pl-2">
        <div id="project-container" class="w-full h-full rounded-lg overflow-hidden tooz-shadow" bind:this={container}>
            <slot />
        </div>
    </main>
</div>

<style lang="postcss">
    .active {
        @apply bg-[#161e2e];
    }

    .nav-link {
        @apply hover:bg-[#161e2e]/50;
    }

    :global(.marked h2) {
        font-size: 1.15rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    :global(.marked *+h2) {
        margin-top: 0.5rem;
    }

    :global(.marked p) {

    }

    :global(.marked ul) {
        padding-left: 0.5rem;
    }

    :global(.marked li) {;
        padding-left: 0.25rem;
        list-style-type: "-";
    }

    :global(.marked li+li) {;
        margin-top: 0.25rem;
    }

    :global(.marked kbd) {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 0.25rem;
        padding: 1px 2px;
    }

    :global(.marked a) {
        text-decoration: underline;
    }
</style>