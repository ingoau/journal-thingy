<script lang="ts">
    import {IconChevronUp, IconMoon, IconSun } from '@tabler/icons-svelte';
      import { Toggle } from "$lib/components/ui/toggle/index.js";

	const items = [
		{ name: 'Timeline', href: '/' },
		{ name: 'Calender', href: '/' }
	];

    let darkMode = $state(false);
    </script>

<div class="top-0 left-0 p-6 fixed h-full flex flex-col gap-2">
    <Toggle bind:pressed={darkMode} class="data-[state=on]:bg-transparent hover:bg-transparent">
        {#if darkMode}
            <IconMoon stroke={2} />
        {:else}
            <IconSun stroke={2} />
        {/if}
    </Toggle>
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
