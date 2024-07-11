<script lang="ts">
    import ContextMenu from "$lib/ContextMenu.svelte";
    import SolutionView from "./SolutionView.svelte";
    import type { BoardState, Resources, Tile, Vec2 } from "./solver-types";
    import {DOWN, LEFT, RIGHT, UP, build_default_board, filter_useless_solutions, sort_solutions } from "./solver";
    import type { GetSolutionsRequest, GetSolutionsResponse } from "./solver-worker";
    import SolverWorker from "./solver-worker?worker";
    import ImageImporter from "./ImageImporter.svelte";
    import BoardView from "./BoardView.svelte";
    import { multi_thread, show_coordinates } from "./option_store";

    // https://docs.google.com/spreadsheets/d/19d1VCDF1s0qNc8THEkITvZ-9w9fcPWYS9a7zxtx6E-4/edit#gid=1669129276

    const is_prod = true;

    let car_direction: Vec2 = LEFT;
    let car_position: Vec2 = {
        x: 5,
        y: 14,
    };

    let resources: Resources = {
        fuel: 100,
        food: 50,
        drink: 50,
        entertainement: 75,
        time: 100,
    };

    let board: Tile[][] = build_default_board();
    let hypothesis: Vec2[] = [];
    let solving: boolean = false;
    let board_file_input: HTMLInputElement;
    let solution_file_input: HTMLInputElement;
    let solutions: BoardState[] = [];
    let evaluated_path_count: number = 0;
    let valid_path_count: number = 0;

    function as_number_or(e: any, default_value: number) {
        if(e.target.value.trim() === "") return default_value;
        const parsed = Number(e.target.value);
        return isNaN(parsed) ? default_value : parsed;
    }

    function set_unfiltered_solutions(new_solutions: BoardState[]) {
        new_solutions = filter_useless_solutions(new_solutions);
        new_solutions = sort_solutions(new_solutions);
        solutions = new_solutions;
    }

    async function solve() {
        solving = true;
        const state: BoardState = {
            actions: "",
            action_count: 0,
            cooldowns: new Map(),
            car_position_x: car_position.x,
            car_position_y: car_position.y,
            car_direction_x: car_direction.x,
            car_direction_y: car_direction.y,
            fuel: resources.fuel,
            food: resources.food,
            drink: resources.drink,
            entertainement: resources.entertainement,
            time: resources.time,
            has_home: false,
            has_airport: false,
            has_jewelry_store: false,
            has_shopping_mall: false,
            score: -1,
        };
        console.time("total worker");
        if($multi_thread) {
            const worker_count = Math.ceil(navigator.hardwareConcurrency * 0.75);
            const concurrency_queue = await solve_worker("get_concurrency_queue", [state], worker_count);
            const worker_promises: Promise<SolveWorkerResult>[] = [];
            for(let worker_index = 0; worker_index < worker_count; ++worker_index) {
                const states = concurrency_queue.solutions.filter((_, i) => i % worker_count === worker_index);
                worker_promises.push(solve_worker("get_solutions", states, worker_count));
            }
            const results = await Promise.all(worker_promises);
            set_unfiltered_solutions(results.map(r => r.solutions).flat());
            evaluated_path_count = results.map(r => r.evaluated_path_count).reduce((a, b) => a + b, 0);
            valid_path_count = results.map(r => r.valid_path_count).reduce((a, b) => a + b, 0);
        } else {
            const result = await solve_worker("get_solutions", [state], 0);
            solutions = result.solutions;
            evaluated_path_count = result.evaluated_path_count;
            valid_path_count = result.valid_path_count;
        }
        console.timeEnd("total worker");
        solving = false;
    }

    type SolveWorkerResult = { solutions: BoardState[], evaluated_path_count: number, valid_path_count: number };
    function solve_worker(type: GetSolutionsRequest["type"], states: BoardState[], worker_count: number): Promise<SolveWorkerResult> {
        return new Promise(resolve => {
            const worker = new SolverWorker();
            worker.postMessage({ type, board, states, worker_count } satisfies GetSolutionsRequest);

            worker.onmessage = ({ data }: MessageEvent<GetSolutionsResponse>) => {
                resolve(data);
                worker.terminate();
            };
        });
    }

    function export_state() {
        const obj = { car_direction, car_position, resources, board };
        const download_str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
        const link = document.createElement("a");
        link.setAttribute("href", download_str);
        link.setAttribute("download", "board.json");
        link.click();
        link.remove();
    }

    function call_if_valid_json_file(e: any, fn: Function) {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const str = reader.result?.toString();
            if(!str) return;
            try {
                const obj = JSON.parse(str);
                fn(obj);
            } catch(e) { }
        }
        reader.readAsText(file);
    }

    function on_board_import(obj: any) {
        if(obj.car_direction.x === 1) car_direction = RIGHT;
        if(obj.car_direction.x === -1) car_direction = LEFT;
        if(obj.car_direction.y === 1) car_direction = DOWN;
        if(obj.car_direction.y === -1) car_direction = UP;
        car_position = obj.car_position;
        resources = obj.resources;
        board = obj.board;
    }

    function on_solutions_import(obj: any) {
        set_unfiltered_solutions(obj);
    }

    function on_setup_generated(event: CustomEvent<any>) {
        board = event.detail.board;
        car_direction = event.detail.car_direction;
        hypothesis = event.detail.hypothesis;
    }
</script>

<ContextMenu />

<div class="w-full min-h-full flex flex-col bg-slate-900 text-slate-100 items-center py-8 gap-8">
    <h1 class="text-2xl">Karuta Date Solver</h1>
    <div class="flex gap-8 items-center flex-wrap-reverse justify-center sm:flex-nowrap">
        <div class="flex flex-col items-center gap-2">
            <h2 class="text-xl">Board</h2>
            <BoardView {board} {car_position} {car_direction} {hypothesis} />
        </div>
    
        <div class="flex flex-col items-center gap-2">
            <h2 class="text-xl text-center">Options</h2>

            <div class="flex flex-col bg-slate-800 rounded p-4 gap-2">
                <h3>Resources</h3>
                <div class="flex items-center gap-2 text-sm">
                    <input class="p-4 py-2 w-16 bg-transparent outline-none border border-slate-200 rounded focus:ring-1 ring-slate-200" type="text" value={resources.fuel} on:change={e => resources.fuel = as_number_or(e, 100)}>
                    Fuel <span class="text-lg">⛽</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                    <input class="p-4 py-2 w-16 bg-transparent outline-none border  border-slate-200 rounded focus:ring-1 ring-slate-200" type="text" value={resources.food} on:change={e => resources.food = as_number_or(e, 50)}>
                    Food <span class="text-lg">🍔</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                    <input class="p-4 py-2 w-16 bg-transparent outline-none border  border-slate-200 rounded focus:ring-1 ring-slate-200" type="text" value={resources.drink} on:change={e => resources.drink = as_number_or(e, 50)}>
                    Drink <span class="text-lg">🥤</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                    <input class="p-4 py-2 w-16 bg-transparent outline-none border  border-slate-200 rounded focus:ring-1 ring-slate-200" type="text" value={resources.entertainement} on:change={e => resources.entertainement = as_number_or(e, 75)}>
                    Entertainement <span class="text-lg">😄</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                    <input class="p-4 py-2 w-16 bg-transparent outline-none border  border-slate-200 rounded focus:ring-1 ring-slate-200" type="text" value={resources.time} on:change={e => resources.time = as_number_or(e, 100)}>
                    Time <span class="text-lg">⌛</span>
                </div>
                <h3>Car position</h3>
                <div class="flex items-center gap-2 text-sm">
                    X
                    <input class="p-4 py-2 w-16 bg-transparent outline-none border  border-slate-200 rounded focus:ring-1 ring-slate-200" type="text" value={car_position.x} on:change={e => car_position.x = as_number_or(e, 5)}>
                    Y
                    <input class="p-4 py-2 w-16 bg-transparent outline-none border  border-slate-200 rounded focus:ring-1 ring-slate-200" type="text" value={car_position.y} on:change={e => car_position.y = as_number_or(e, 14)}>
                </div>
                <h3>Car direction</h3>
                <div class="flex gap-2 text-sm">
                    <button class="bg-slate-700 text-slate-100 p-4 py-2 rounded hover:bg-slate-600" on:click={() => car_direction = LEFT}>Left</button>
                    <button class="bg-slate-700 text-slate-100 p-4 py-2 rounded hover:bg-slate-600" on:click={() => car_direction = RIGHT}>Right</button>
                    <button class="bg-slate-700 text-slate-100 p-4 py-2 rounded hover:bg-slate-600" on:click={() => car_direction = UP}>Up</button>
                    <button class="bg-slate-700 text-slate-100 p-4 py-2 rounded hover:bg-slate-600" on:click={() => car_direction = DOWN}>Down</button>
                </div>
                <h3 class="flex items-center gap-2">Show coordinates<input class="w-4 h-4" type="checkbox" bind:checked={$show_coordinates}></h3>
                <h3 class="flex items-center gap-2">Multi Threading<input class="w-4 h-4" type="checkbox" bind:checked={$multi_thread}></h3>
                <ImageImporter on:setupgenerated={on_setup_generated} />
                <button class="bg-slate-700 text-slate-100 p-4 py-2 rounded hover:bg-slate-600 flex justify-center items-center gap-2" disabled={solving} on:click={solve}>
                    {#if solving}
                        Solving
                        <svg aria-hidden="true" class="w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-slate-200" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                    {:else}
                        Solve
                    {/if}
                </button>
                {#if !is_prod}
                    <div class="flex gap-2">
                        <input class="hidden" bind:this={board_file_input} on:change={e => call_if_valid_json_file(e, on_board_import)} type="file" accept="application/json">
                        <button class="bg-slate-700 text-slate-100 grow basis-0 p-4 py-2 rounded hover:bg-slate-600" on:click={() => board_file_input.click()}>Import</button>
                        <button class="bg-slate-700 text-slate-100 grow basis-0 p-4 py-2 rounded hover:bg-slate-600" on:click={export_state}>Export</button>
                    </div>
                    <input class="hidden" bind:this={solution_file_input} on:change={e => call_if_valid_json_file(e, on_solutions_import)} type="file" accept="application/json">
                    <button class="bg-slate-700 text-slate-100 grow basis-0 p-4 py-2 rounded hover:bg-slate-600" on:click={() => solution_file_input.click()}>Import Solutions</button>
                {/if}
            </div>
        </div>
    </div>
    {#if solutions.length > 0}
        <div class="flex flex-col gap-2 mx-16">
            <h2 class="text-xl text-center">Solutions</h2>
            <p class="text-slate-400 text-center">Showing best {solutions.length} solutions | Non-loosing paths: {valid_path_count} | Total paths evaluted: {evaluated_path_count}</p>
            {#each solutions as solution}
                <SolutionView {solution} />
            {/each}
        </div>
    {/if}
</div>