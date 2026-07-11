<script lang="ts">
	import type { User } from 'better-auth';
	import { IconBook2, IconChevronRight, IconChevronUp, IconLogout } from '@tabler/icons-svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Button from './ui/button/button.svelte';

	let isOpen = $state(true);

	let { user }: { user: User } = $props();

	const items = [
		{ name: 'Timeline', href: '/' },
		{ name: 'Calender', href: '/calender' }
	];

	async function logout() {
		await authClient.signOut();
		await goto('/login');
	}
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

<Button
	variant="ghost"
	size="icon"
	class={cn(
		'size-12 fixed group top-8 left-8 z-20 bg-background',
		!isOpen && 'top-4 left-4 scale-75'
	)}
	onclick={() => (isOpen = !isOpen)}
>
	<IconBook2
		size={32}
		class="absolute size-10 group-hover:opacity-25 group-hover:scale-90 duration-200"
	/>
	<IconChevronRight
		size={32}
		class={cn(
			'absolute size-8 opacity-0 group-hover:opacity-100 group-hover:scale-95 duration-200 scale-x-100',
			isOpen && '-scale-x-100'
		)}
	/>
</Button>

<div
	class={cn(
		'top-0 left-0 p-8 fixed h-full flex flex-col gap-4 w-sm overflow-hidden duration-200 bg-background z-10 shadow-2xl xl:shadow-none',
		!isOpen && '-translate-x-full'
	)}
>
	<div class="h-12"></div>
	{#each items as item, index (index)}
		{@render navLink(item.href, item.name)}
	{/each}
	<div class="grow"></div>
	{@render navLink('/settings', 'Settings')}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="font-heading text-2xl text-foreground flex flex-row items-center gap-2 w-full"
		>
			<p class="truncate w-full">{user?.name || user?.email}</p>
			<IconChevronUp stroke={2} />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item onclick={logout}>
				<IconLogout stroke={2} />
				Logout
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
