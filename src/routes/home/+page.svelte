<script lang="ts">
	import { IconNotes, IconChevronUp, IconStar, IconStarFilled, IconPointFilled } from '@tabler/icons-svelte';
	import {DateTime} from "luxon";

	const items = [
		{ name: 'Timeline', href: '/' },
		{ name: 'Calender', href: '/' }
	];

	const data = [
		{ date: 1783834820, content: 'content', score: 3 },
		{ date: 1783721820, content: 'content', score: 4 }
	];
</script>

<!--Sidebar-->
<div class="top-0 left-0 p-6 fixed h-full flex flex-col gap-2">
	<IconNotes stroke={1} class="" />
	{#each items as item, index (index)}
		<a href={item.href} class="font-heading text-2xl hover:text-foreground text-muted-foreground">
			{item.name}
		</a>
	{/each}
	<div class="grow"></div>
	<a href="/" class="font-heading text-2xl hover:text-foreground text-muted-foreground">
		Settings
	</a>
	<div class="font-heading text-2xl text-foreground flex flex-row items-center gap-2">
		willgob <IconChevronUp stroke={2} />
	</div>
</div>


<div class="mx-auto max-w-3xl w-full p-6">
	{#each data as data, index (index)}
	<div class="flex gap-5 pb-5 outline-muted-foreground rounded-md p-2 hover:outline">
		<div class="flex flex-col items-center">
			<IconPointFilled />
			<div class="w-1 grow bg-secondary-foreground mt-2 rounded-2xl"></div>
		</div>
		<div class="flex flex-col gap-2 w-full">
			<div class="flex items-center justify-between">
			<h2 class="text-2xl font-heading">{DateTime.fromSeconds(data.date).toFormat("d MMM yyyy")}</h2>
			<div class="flex flex-row gap-1">
			{#each Array(5), index (index)}
				{#if index < data.score}
					<IconStarFilled stroke={2} />
				{:else}
					<IconStar stroke={2} />
				{/if}
			{/each}

			</div>
		</div>
		<div class="font-heading p-1">{data.content}</div>
		</div>
	</div>
	{/each}
</div>
