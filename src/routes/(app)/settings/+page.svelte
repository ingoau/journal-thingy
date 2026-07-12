<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { authClient } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import { cn } from '$lib/utils';

	const { data } = $props();

	let name = $derived(data.user.name ?? '');
	let savingName = $state(false);
	let nameMessage = $state<string | null>(null);
	let nameError = $state(false);

	let deleteOpen = $state(false);
	let deleting = $state(false);
	let deleteError = $state<string | null>(null);

	const themes = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	] as const;

	async function saveName() {
		const trimmed = name.trim();
		if (!trimmed) {
			nameError = true;
			nameMessage = 'Name cannot be empty.';
			return;
		}

		savingName = true;
		nameMessage = null;
		nameError = false;

		const { error } = await authClient.updateUser({ name: trimmed });

		savingName = false;

		if (error) {
			nameError = true;
			nameMessage = error.message ?? 'Could not update name.';
			return;
		}

		name = trimmed;
		nameMessage = 'Saved.';
		await invalidateAll();
	}

	async function deleteAccount() {
		deleting = true;
		deleteError = null;

		const { error } = await authClient.deleteUser();

		if (error) {
			deleting = false;
			deleteError = error.message ?? 'Could not delete account. Try signing in again, then retry.';
			return;
		}

		deleteOpen = false;
		await goto('/login');
	}
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl space-y-10 p-6">
	<div>
		<h1 class="font-heading text-3xl">Settings</h1>
		<p class="text-muted-foreground mt-1 text-sm">Manage your account and appearance.</p>
	</div>

	<section class="space-y-4">
		<h2 class="font-heading text-xl">Account</h2>

		<div class="space-y-2">
			<Label for="display-name">Display name</Label>
			<div class="flex flex-col gap-2 sm:flex-row">
				<Input
					id="display-name"
					type="text"
					autocomplete="nickname"
					bind:value={name}
					disabled={savingName}
					class="sm:flex-1"
				/>
				<Button onclick={saveName} disabled={savingName || !name.trim()}>
					{savingName ? 'Saving…' : 'Save'}
				</Button>
			</div>
			{#if nameMessage}
				<p class={cn('text-sm', nameError ? 'text-destructive' : 'text-muted-foreground')}>
					{nameMessage}
				</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="email">Email</Label>
			<Input id="email" type="email" value={data.user.email} readonly disabled />
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="font-heading text-xl">Appearance</h2>
		<div class="space-y-2">
			<Label>Theme</Label>
			<div class="bg-muted/60 flex w-fit flex-wrap gap-1 rounded-4xl p-1">
				{#each themes as theme (theme.value)}
					<Button
						type="button"
						size="sm"
						variant={userPrefersMode.current === theme.value ? 'default' : 'ghost'}
						onclick={() => setMode(theme.value)}
					>
						{theme.label}
					</Button>
				{/each}
			</div>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="font-heading text-xl text-destructive">Danger zone</h2>
		<p class="text-muted-foreground text-sm">
			Permanently delete your account and all journal entries. This cannot be undone.
		</p>
		<Dialog.Root
			bind:open={deleteOpen}
			onOpenChange={(open) => {
				if (open) {
					deleteError = null;
					deleting = false;
				}
			}}
		>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button variant="destructive" {...props}>Delete account</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Delete account?</Dialog.Title>
					<Dialog.Description>
						This will permanently delete your account and all of your journal entries.
					</Dialog.Description>
				</Dialog.Header>
				{#if deleteError}
					<p class="text-destructive text-sm">{deleteError}</p>
				{/if}
				<Dialog.Footer>
					<Dialog.Close>
						{#snippet child({ props })}
							<Button variant="outline" disabled={deleting} {...props}>Cancel</Button>
						{/snippet}
					</Dialog.Close>
					<Button variant="destructive" onclick={deleteAccount} disabled={deleting}>
						{deleting ? 'Deleting…' : 'Delete forever'}
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</section>
</div>
