<script lang="ts">
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import * as monaco from "monaco-editor";
    import { invalidateAll } from "$app/navigation";
    import { scale } from "svelte/transition";
    import FileTree from "./file-tree/FileTree.svelte";
    import type { IDirectory } from "./file-tree/types";

    export let data: PageData;

    type Monaco = typeof import("monaco-editor");
    type BDScript = { id: number, path: string, content: string };
    type EditedScript = { id?: number, path: string, content: string };
    type Toast = { type: "info" | "success" | "error", text: string, duration: number };
    type ToastOption = { type: "info" | "success" | "error", text: string, duration?: number };

    // let monaco: Monaco;
    let meditor: monaco.editor.IStandaloneCodeEditor;
    let editorContainer: HTMLDivElement;
    let pathInput: HTMLInputElement;

    let fileTree: IDirectory = { type: "dir", name: "root", files: [] };
    let editorStates = new Map<string, monaco.editor.ICodeEditorViewState | null>();

    function buildFileTree() {
        fileTree = { type: "dir", name: "root", files: [] };
        for (const script of data.scripts) {
            let currentDir: IDirectory = fileTree;
            const splitted = script.path.split("/");
            splitted.shift();
            const fileName = splitted.pop() as string;
            for (const dirName of splitted) {
                const dir = currentDir.files.find(d => d.name === dirName);
                if (!dir || dir.type === "file") {
                    const newDir: IDirectory = {
                        type: "dir",
                        name: dirName,
                        files: [],
                    }
                    currentDir.files.push(newDir);
                    currentDir = newDir;
                } else {
                    currentDir = dir;
                }
            }
            currentDir.files.push({
                type: "file",
                name: fileName,
                onclick: () => {
                    onEdit(script);
                },
            })
        }
    }

    $: if (data.scripts) buildFileTree();

    let saving: boolean = false;
    let editedScript: EditedScript = {
        path: "/",
        content: "",
    };

    let toasts: Toast[] = [];

    function addToast(opts: ToastOption) {
        const toast = { duration: 3000, ...opts };
        toasts.push(toast);
        toasts = toasts;
        setTimeout(() => {
            const index = toasts.indexOf(toast);
            toasts.splice(index, 1);
            toasts = toasts;
        }, toast.duration);
    }

    function onCreate() {
        editedScript = {
            path: "/",
            content: "",
        };
        meditor.setValue("");
        meditor.setScrollTop(0);
        pathInput?.focus();
    }

    async function onCopyPath(script: BDScript | EditedScript) {
        try {
            navigator.clipboard.writeText(`https://scolin.pages.dev/cc/api/scripts/${script.id}`);
            addToast({ text: "Copied to clipboard", type: "info" });
        } catch(e) {
            addToast({ text: "Unexpected Error (see console)", type: "error" });
            console.error(e);
        }
    }

    async function onCopyWGET(script: BDScript | EditedScript) {
        try {
            navigator.clipboard.writeText(`wget run https://scolin.pages.dev/cc/api/scripts/${script.id}`);
            addToast({ text: "Copied to clipboard", type: "info" });
        } catch(e) {
            addToast({ text: "Unexpected Error (see console)", type: "error" });
            console.error(e);
        }
    }

    async function onEdit(script: BDScript) {
        try {
            if (editedScript.path !== "/") {
                editorStates.set(editedScript.path, meditor.saveViewState());
            }
            editedScript = {
                ...script,
            }
            meditor.setValue(script.content);
            if (editorStates.get(editedScript.path)) {
                meditor.restoreViewState(editorStates.get(editedScript.path) || null);
            } else {
                meditor.setScrollTop(0);
            }
        } catch(e) {
            addToast({ text: "Unexpected Error (see console)", type: "error" });
            console.error(e);
        }
    }

    async function onDelete(script: BDScript | EditedScript) {
        if(confirm("Confirm deletion ?")) {
            try {
                const response = await fetch(`/cc/api/scripts/${script.id}`, { method: "DELETE" });
                const data = await response.json() as any;
                if(data.success) {
                    onCreate();
                    invalidateAll();
                }
            } catch(e) {
                addToast({ text: "Unexpected Error (see console)", type: "error" });
                console.error(e);
            }
        }
    }

    async function onSave() {
        saving = true;
        if (!editedScript.path.startsWith("/")) {
            addToast({ text: "Path must start with /", type: "error" });
            saving = false;
            return;
        }
        if (!(editedScript.path.length > 1)) {
            addToast({ text: "Empty path", type: "error" });
            saving = false;
            return;
        }
        editedScript.content = meditor.getValue();
        try {
            if (editedScript.id) {
                const response = await fetch(`/cc/api/scripts/${editedScript.id}`, { method: "POST", body: JSON.stringify(editedScript) });
                const data = await response.json() as any;
                if (data.success) {
                    addToast({ text: "Success", type: "success" });
                    invalidateAll();
                }
            } else {
                const response = await fetch("/cc/api/scripts", { method: "PUT", body: JSON.stringify(editedScript) });
                const data = await response.json() as any;
                if (data.success) {
                    addToast({ text: "Success", type: "success" });
                    editorStates.set(editedScript.path, meditor.saveViewState());
                    onCreate();
                    invalidateAll();
                }
            }
        } catch(e) {
            addToast({ text: "Unexpected Error (see console)", type: "error" });
            console.error(e);
        }
        saving = false;
    }

    function initEditor() {
        meditor = monaco.editor.create(editorContainer, {
            value: "",
            language: "lua",
            automaticLayout: true,
	        theme: "vs-dark",
            fontSize: 16,
            fontFamily: "Iosevka",
        });
    }

    onMount(() => {
        initEditor();
    });

    function onWindowKeyDown(event: KeyboardEvent & { currentTarget: Window }) {
        if (event.ctrlKey && event.key === "s") {
            onSave();
            event.preventDefault();
        }
        return false;
    }
</script>

<svelte:window on:keydown={onWindowKeyDown} on:keypress={onWindowKeyDown} />

<div class="flex gap-2 p-2 w-full h-full">
    <div class="flex flex-col gap-2">
        <div class="grow min-w-[16rem]">
            <FileTree directory={fileTree} />
        </div>
        <button class="btn btn-sm btn-primary" on:click={onCreate}>New File</button>
    </div>
    <div class="grow flex flex-col gap-2">
        <div class="flex justify-between items-center gap-4">
            <input bind:this={pathInput} type="text" placeholder="Path" spellcheck="false" class="input input-bordered w-full font-monaspace" bind:value={editedScript.path} />
            <div class="flex items-center gap-2">
                {#if editedScript.id}
                    <button class="btn btn-sm btn-info" on:click={() => onCopyPath(editedScript)}>
                        <span class="material-symbols-outlined">link</span>
                    </button>
                    <button class="btn btn-sm btn-info" on:click={() => onCopyWGET(editedScript)}>
                        <span class="material-symbols-outlined">rocket_launch</span>
                    </button>
                    <button class="btn btn-sm btn-error" on:click={() => onDelete(editedScript)}>
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                {/if}
                <button class="btn btn-sm btn-success" on:click={onSave}>
                    {#if saving}
                        <span class="loading loading-spinner"/>
                    {/if}
                    <span class="material-symbols-outlined">save</span>
                </button>
            </div>
        </div>
        <div bind:this={editorContainer} class="grow rounded-lg overflow-hidden"/>
    </div>
</div>

<div class="toast toast-center">
    {#each toasts as toast (toast)}
        <div
            in:scale={{ start: 0.8, delay: 0, duration: 200 }}
            out:scale={{ start: 0.8, delay: 0, duration: 200 }}
            class="alert"
            class:alert-error={toast.type === "error"}
            class:alert-info={toast.type === "info"}
            class:alert-success={toast.type === "success"}
        >
            <span>{toast.text}</span>
        </div>
    {/each}
</div>