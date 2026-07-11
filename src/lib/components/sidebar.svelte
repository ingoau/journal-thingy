<script lang="ts">
	import type { User } from 'better-auth';
	import { IconChevronUp } from '@tabler/icons-svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';

	let { user }: { user: User } = $props();

	const items = [
		{ name: 'Timeline', href: '/timeline' },
		{ name: 'Calender', href: '/calender' }
	];
</script>

<div class="top-0 left-0 p-6 fixed h-full flex flex-col gap-2">
	{#each items as item, index (index)}
		<a
			href={item.href}
			class={cn(
				'font-heading text-2xl hover:text-foreground text-muted-foreground',
				item.href === page.url.pathname && 'text-foreground'
			)}
		>
			{item.name}
		</a>
	{/each}
	<div class="grow"></div>
	<a
		href="/settings"
		class={cn(
			'font-heading text-2xl hover:text-foreground text-muted-foreground',
			page.url.pathname === '/settings' && 'text-foreground'
		)}
	>
		Settings
	</a>
	<div class="font-heading text-2xl text-foreground flex flex-row items-center gap-2">
		{user.name || user.email}
		<IconChevronUp stroke={2} />
	</div>
</div>
