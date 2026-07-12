<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button/';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	let step: 'start' | 'name' | 'tutorial' = $state('start');
	let nameInput = $state('');
</script>

<svelte:head>
	<title>Onboarding</title>
</svelte:head>

{#if step === 'start'}
	<div class="p-4">
		<h1 class="text-2xl">
			Hi there :D Welcome to your new journal! Before you get engulfed beyond our help, we need to
			set up a few things :D
		</h1>
		<br />
		<Button onclick={() => (step = 'name')}>Next</Button>
	</div>
{:else if step === 'name'}
	<div class="p-4">
		<h1 class="text-3xl">A few more things :D</h1>
		<br />
		<h2 class="text-2xl">Please set your name/Username:</h2>
		<Input type="text" placeholder="Name" bind:value={nameInput} />
		<br /><br />
		<Button
			onclick={async () => {
				await authClient.updateUser({
					name: nameInput
				});
				step = 'tutorial';
			}}>Next</Button
		>
	</div>
{:else if step === 'tutorial'}
	<div class="p-4 flex flex-col gap-4 max-w-2xl">
		<h1 class="text-3xl font-heading">Features</h1>
		<p class="text-muted-foreground">Here is what you can do in your journal:</p>
		<ul class="flex flex-col gap-3 text-lg">
			<li>
				<span class="font-heading">Timeline</span> - write entries that you can look back on
			</li>
			<li>
				<span class="font-heading">Mood tracking</span> - log how you are feeling on each entry
			</li>
			<li>
				<span class="font-heading">Calendar</span> - browse days color-coded by mood
			</li>
			<li>
				<span class="font-heading">Photos</span> - attach images to your entries
			</li>
			<li>
				<span class="font-heading">Rich text</span> - use headings and basic formatting while you write
			</li>
		</ul>
		<Button
			onclick={async () => {
				await authClient.updateUser({ onboarded: true });
				goto('/');
			}}>Complete</Button
		>
	</div>
{/if}
