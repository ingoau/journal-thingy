<script lang="ts">
	import { IconStar, IconStarFilled, IconPointFilled } from '@tabler/icons-svelte';
	import {DateTime} from "luxon";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";

    const {entry}: {
        entry: {
 date: Date;
 content: string;
 score: number | null;
    }} = $props();

    const dateString = DateTime.fromJSDate(entry.date).toFormat("d MMM yyyy")

    let score = $state(entry.score || 0);
</script>

<Dialog.Root>
<Dialog.Trigger class="w-full text-left">
    {#snippet child({props})}
        <div {...props} class="flex gap-5 pb-5 outline-muted-foreground rounded-md p-2 hover:outline">
            <div class="flex flex-col items-center">
                <IconPointFilled />
                <div class="w-1 grow bg-secondary-foreground mt-2 rounded-2xl"></div>
            </div>
            <div class="flex flex-col gap-2 w-full">
                <div class="flex items-center justify-between">
                <h2 class="text-2xl font-heading">{dateString}</h2>
                <div class="flex flex-row gap-1">
                {#each Array(5), index (index)}
                    {#if index < (entry.score || 0)}
                        <IconStarFilled stroke={2} />
                    {:else}
                        <IconStar stroke={2} />
                    {/if}
                {/each}

                </div>
            </div>
            <div class="font-heading p-1">{entry.content}</div>
            </div>
        </div>
    {/snippet}
</Dialog.Trigger>
<Dialog.Content>
<Dialog.Header>
<Dialog.Title>{dateString}</Dialog.Title>
<Dialog.Description>
    <div class="flex gap-2 justify-between items-end">
        <h3 class="text-2xl font-heading">Mood</h3>
        <h4 class="font-heading text-1xl">{score}</h4>
    </div>
    <Slider type="single" bind:value={score} max={5} step={1} />
    <br>
    <Textarea placeholder="Write here"/>
</Dialog.Description>
</Dialog.Header>
</Dialog.Content>
</Dialog.Root>