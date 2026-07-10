<script lang="ts">
	const items = [
		{ name: 'Timeline', href: '/' },
		{ name: 'Calender', href: '/' }
	];

	const data = [
		{ date: 1783721820, content: 'content' },
		{ date: 1783721820, content: 'content' }
	];

	import { IconNotes, IconChevronUp } from '@tabler/icons-svelte';
</script>

<!--Sidebar-->
<div class="top-0 left-0 p-4 fixed h-full flex flex-col gap-2">
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

<div class="mx-auto max-w-3xl w-full p-4">
	{#each data as data, index (index)}
		<h1>{data.date}</h1>
		<div>{data.content}</div>
	{/each}
</div>
