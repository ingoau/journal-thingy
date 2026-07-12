<script lang="ts">
	import type { User } from 'better-auth';
	import { IconBook2, IconChevronRight, IconChevronUp, IconLogout, IconX } from '@tabler/icons-svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { MediaQuery } from 'svelte/reactivity';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Button from './ui/button/button.svelte';
	import { fade } from 'svelte/transition';

	const isDesktop = new MediaQuery('min-width: 1280px');

	/** Mobile drawer starts closed; desktop panel starts open. */
	let mobileOpen = $state(false);
	let desktopOpen = $state(true);

	let isOpen = $derived(isDesktop.current ? desktopOpen : mobileOpen);

	let { user }: { user: User } = $props();

	const items = [
		{ name: 'Timeline', href: '/' },
		{ name: 'Calendar', href: '/calendar' }
	];

	$effect(() => {
		if (typeof document === 'undefined') return;
		const shouldLock = isOpen && !isDesktop.current;
		document.body.style.overflow = shouldLock ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	afterNavigate(() => {
		mobileOpen = false;
	});

	function closeMobile() {
		mobileOpen = false;
	}

	function toggle() {
		if (isDesktop.current) {
			desktopOpen = !desktopOpen;
		} else {
			mobileOpen = !mobileOpen;
		}
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && mobileOpen) {
			mobileOpen = false;
		}
	}

	async function logout() {
		await authClient.signOut();
		await goto('/login');
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#snippet navLink(href: string, name: string)}
	<a
		{href}
		onclick={closeMobile}
		class={cn(
			'font-heading origin-left rounded-lg py-1.5 text-2xl text-muted-foreground duration-200 hover:text-foreground active:scale-97',
			href === page.url.pathname && 'text-foreground'
		)}
	>
		{name}
	</a>
{/snippet}

{#if mobileOpen}
	<button
		type="button"
		class="fixed inset-0 z-10 bg-foreground/25 backdrop-blur-[1px]"
		aria-label="Close navigation"
		transition:fade={{ duration: 180 }}
		onclick={closeMobile}
	></button>
{/if}

<Button
	variant="ghost"
	size="icon"
	class={cn(
		'group fixed top-4 left-4 z-30 size-11 bg-background/90 shadow-sm ring-1 ring-border/60 backdrop-blur-md transition-all duration-200 xl:top-8 xl:left-8 xl:size-12 xl:bg-background xl:shadow-none xl:ring-0 xl:backdrop-blur-none',
		!isOpen && 'xl:top-4 xl:left-4 xl:scale-75'
	)}
	aria-expanded={isOpen}
	aria-controls="app-sidebar"
	aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
	onclick={toggle}
>
	{#if mobileOpen}
		<IconX size={28} class="size-7" />
	{:else}
		<IconBook2
			size={32}
			class={cn(
				'absolute size-9 duration-200 xl:size-10',
				'xl:group-hover:scale-90 xl:group-hover:opacity-25',
				isOpen && 'opacity-0 scale-90 xl:opacity-100'
			)}
		/>
		<IconChevronRight
			size={32}
			class={cn(
				'absolute size-7 scale-x-100 opacity-0 duration-200 xl:size-8 xl:group-hover:scale-95 xl:group-hover:opacity-100',
				isOpen && '-scale-x-100 opacity-0 xl:opacity-100'
			)}
		/>
	{/if}
</Button>

<nav
	id="app-sidebar"
	aria-label="Main"
	aria-hidden={!isOpen}
	inert={!isOpen}
	class={cn(
		'fixed top-0 left-0 z-20 flex h-dvh w-[min(100%,24rem)] max-w-[85vw] flex-col gap-4 overflow-y-auto overscroll-contain bg-background p-6 pt-[4.5rem] transition-[transform,box-shadow] duration-200 ease-out xl:h-full xl:w-sm xl:max-w-none xl:p-8 xl:pt-8',
		isOpen ? 'translate-x-0 shadow-2xl xl:shadow-none' : 'pointer-events-none -translate-x-full shadow-none'
	)}
>
	<div class="hidden h-12 shrink-0 xl:block" aria-hidden="true"></div>
	{#each items as item, index (index)}
		{@render navLink(item.href, item.name)}
	{/each}
	<div class="grow"></div>
	{@render navLink('/settings', 'Settings')}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="font-heading flex w-full flex-row items-center gap-2 text-2xl text-foreground"
		>
			<p class="w-full truncate text-start">{user?.name || user?.email}</p>
			<IconChevronUp stroke={2} />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-fit" align="end">
			<DropdownMenu.Item onclick={logout}>
				<IconLogout stroke={2} />
				Logout
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</nav>
