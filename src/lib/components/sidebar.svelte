<script lang="ts">
	import type { User } from 'better-auth';
	import { IconBook2, IconChevronUp, IconLogout } from '@tabler/icons-svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	let { user }: { user: User } = $props();

	const items = [
		{ name: 'Timeline', href: '/' },
		{ name: 'Calender', href: '/calender' }
	];
</script>

{#snippet navLink(href: string, name: string)}
	<a
		{href}
		class={cn(
			'font-heading text-2xl hover:text-foreground text-muted-foreground active:scale-97 duration-200  origin-left',
			href === page.url.pathname && 'text-foreground'
		)}
	>
		{name}
	</a>
{/snippet}

<div class="top-0 left-0 p-8 fixed h-full flex flex-col gap-4">
	<IconBook2 size={32} />
	{#each items as item, index (index)}
		{@render navLink(item.href, item.name)}
	{/each}
	<div class="grow"></div>
	{@render navLink('/settings', 'Settings')}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="font-heading text-2xl text-foreground flex flex-row items-center gap-2"
		>
			{user?.name || user?.email}
			<IconChevronUp stroke={2} />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item>
				<IconLogout stroke={2} />
				Logout
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
