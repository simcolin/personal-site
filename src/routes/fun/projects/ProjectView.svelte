<script lang="ts">
    export let title: string;
    export let id: string;
</script>

<main class="w-screen h-screen flex flex-col bg-slate-800 text-white p-0 m-0">
    <header style:view-transition-name="header-{id}" class="flex items-center justify-between px-4 py-2 border-b">
        <h1 style:view-transition-name="title-{id}" class="text-xl">{title}</h1>
        <a class="rounded p-1 hover:bg-slate-600" href="/fun">
            <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"><path fill="currentColor" d="M15.125 21.1L6.7 12.7q-.15-.15-.213-.325T6.425 12q0-.2.062-.375T6.7 11.3l8.425-8.425q.35-.35.875-.35t.9.375q.375.375.375.875t-.375.875L9.55 12l7.35 7.35q.35.35.35.863t-.375.887q-.375.375-.875.375t-.875-.375Z"></path></svg>
        </a>
    </header>
    <div class="relative grow">
        <div class="absolute top-0 left-0 w-full h-full p-0 m-0 flex">
            <slot />
        </div>
    </div>
</main>