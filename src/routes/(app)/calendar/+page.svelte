<!-- src/routes/(app)/calender/+page.svelte -->
<script lang="ts">
	import CustomCalendar from '$lib/components/custom-calendar.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Calendar</title>
</svelte:head>

<div class="flex flex-col gap-4 p-8">
	<CustomCalendar dayMoods={data.dayMoods} />
</div>
