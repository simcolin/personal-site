<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { scale } from "svelte/transition";
    import type { PageData } from "./$types";
    import DfpwConverter from "./DFPWConverter.svelte";

    type BDAudio = { id: number, name: string };
    type Toast = { type: "info" | "success" | "error", text: string, duration: number };
    type ToastOption = { type: "info" | "success" | "error", text: string, duration?: number };

    export let data: PageData;

    let dfpwmModal: DfpwConverter;
    let editDialog: HTMLDialogElement;

    let saving: boolean = false;
    let editedAudio: { id?: number, name: string, data: number[] | null } = { name: "", data: null };
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
        editedAudio = {
            name: "",
            data: null,
        };
        editDialog.showModal();
    }

    async function onEdit(audio: BDAudio) {
        try {
            editedAudio = {
                ...audio,
                data: null,
            }
            editDialog.showModal();
        } catch(e) {
            addToast({ text: "Unexpected Error (see console)", type: "error" });
            console.error(e);
        }
    }

    async function onDelete(script: BDAudio) {
        if (confirm("Confirm deletion ?")) {
            try {
                const response = await fetch(`/cc/api/audios/${script.id}`, { method: "DELETE" });
                const data = await response.json() as any;
                if (data.success) {
                    addToast({ text: "Success", type: "success" });
                    invalidateAll();
                }
            } catch(e) {
                addToast({ text: "Unexpected Error (see console)", type: "error" });
                console.error(e);
            }
        }
    }

    function onDownload(script: BDAudio) {
        const a = document.createElement("a");
        a.href = `/cc/api/audios/${script.id}`;
        a.download = `${script.name}.dfpwm`;
        a.click();
        a.remove();
    }

    async function onSave() {
        saving = true;
        if (!editedAudio.name) {
            addToast({ text: "Empty name", type: "error" });
            saving = false;
            return;
        }
        try {
            if (editedAudio.id) {
                const response = await fetch(`/cc/api/audios/${editedAudio.id}`, { method: "POST", body: JSON.stringify(editedAudio) });
                const data = await response.json() as any;
                if (data.success) {
                    addToast({ text: "Success", type: "success" });
                    invalidateAll();
                    editDialog.close();
                }
            } else {
                const response = await fetch("/cc/api/audios", { method: "PUT", body: JSON.stringify(editedAudio) });
                const data = await response.json() as any;
                if (data.success) {
                    addToast({ text: "Success", type: "success" });
                    invalidateAll();
                    editDialog.close();
                }
            }
        } catch(e) {
            addToast({ text: "Unexpected Error (see console)", type: "error" });
            console.error(e);
        }
        saving = false;
    }

    function onConverterData({ detail: data }: CustomEvent<Uint8Array>) {
        editedAudio.data = Array.from(data);
    }
</script>

<div class="w-full h-full flex flex-col gap-2 p-2">
    <div>
        <button class="btn btn-primary" on:click={onCreate}>New Audio</button>
    </div>
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each data.audios as audio}
                <tr>
                    <td>{audio.id}</td>
                    <td>{audio.name}</td>
                    <td>
                        <div class="flex items-center gap-2">
                            <button class="btn btn-sm btn-info" on:click={() => onDownload(audio)}>
                                <span class="material-symbols-outlined">download</span>
                            </button>
                            <button class="btn btn-sm btn-info" on:click={() => onEdit(audio)}>
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                            <button class="btn btn-sm btn-error" on:click={() => onDelete(audio)}>
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<dialog bind:this={editDialog} class="modal">
    <div class="modal-box flex flex-col gap-4 max-w-[90%]">
        <input type="text" placeholder="Name" class="input input-bordered w-full max-w-xs" bind:value={editedAudio.name} />
        <button class="btn btn-primary" on:click={dfpwmModal.open}>Import Audio</button>

        <div class="flex justify-end gap-2">
            <button class="btn btn-success" on:click={onSave}>
                {#if saving}
                    <span class="loading loading-spinner"/>
                {/if}
                <span class="material-symbols-outlined">save</span>
            </button>
            <form method="dialog">
                <button class="btn btn-error">Close</button>
            </form>
        </div>
    </div>
</dialog>

<DfpwConverter bind:this={dfpwmModal} on:data={onConverterData} />

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