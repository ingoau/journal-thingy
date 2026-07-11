<script lang="ts">
	import { DateTime } from 'luxon';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { scoreToColor } from '$lib/mood';

	let { dayScores }: { dayScores: Record<string, number> } = $props();

	const MONTHS_PER_ROW = 3;
	const INITIAL_ROWS_EACH_SIDE = 3; // generous initial buffer so there's always something to scroll
	const LOAD_THRESHOLD_PX = 800;
	const today = DateTime.now().startOf('day');

	let rows = $state(getInitialRows());
	let container: HTMLElement;

	let isPrepending = false;
	let isAppending = false;

	function makeRow(fromMonth: DateTime) {
		return Array.from({ length: MONTHS_PER_ROW }, (_, i) => fromMonth.plus({ months: i }));
	}

	function getInitialRows() {
		const centerRowStart = DateTime.now().startOf('month').minus({ months: 1 });
		const rowsList = [];
		for (let i = -INITIAL_ROWS_EACH_SIDE; i <= INITIAL_ROWS_EACH_SIDE; i++) {
			rowsList.push(makeRow(centerRowStart.plus({ months: i * MONTHS_PER_ROW })));
		}
		return rowsList;
	}

	async function prependRow() {
		if (isPrepending) return;
		isPrepending = true;

		const oldScrollHeight = container.scrollHeight;
		const firstMonthOfFirstRow = rows[0][0];
		const newRow = makeRow(firstMonthOfFirstRow.minus({ months: MONTHS_PER_ROW }));
		rows = [newRow, ...rows];

		requestAnimationFrame(() => {
			container.scrollTop += container.scrollHeight - oldScrollHeight;
			isPrepending = false;
		});
	}

	function appendRow() {
		if (isAppending) return;
		isAppending = true;

		const lastRow = rows[rows.length - 1];
		const nextMonth = lastRow[lastRow.length - 1].plus({ months: 1 });
		rows = [...rows, makeRow(nextMonth)];

		requestAnimationFrame(() => {
			isAppending = false;
		});
	}

	function handleScroll() {
		if (container.scrollTop < LOAD_THRESHOLD_PX) {
			prependRow();
		}
		const distanceFromBottom =
			container.scrollHeight - container.scrollTop - container.clientHeight;
		if (distanceFromBottom < LOAD_THRESHOLD_PX) {
			appendRow();
		}
	}

	$effect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	function daysGrid(month: DateTime) {
		const startPad = month.weekday % 7;
		const total = month.daysInMonth ?? 30;
		return { startPad, total };
	}

	function openDay(date: DateTime) {
		goto(`/?date=${date.toFormat('yyyy-MM-dd')}`);
	}

    function goToToday() {
	const todayMonth = today.startOf('month');

	const rowIndex = rows.findIndex((row) =>
		row.some((month) => month.hasSame(todayMonth, 'month'))
	);

	if (rowIndex === -1) {
		rows = getInitialRows();

		requestAnimationFrame(() => {
			container.scrollTop = container.scrollHeight / 2;
		});

		return;
	}

	const rowElement = container.querySelector(
		`[data-row="${rows[rowIndex][0].toFormat('yyyy-MM')}"]`
	);

	rowElement?.scrollIntoView({
		behavior: 'smooth',
		block: 'center'
	});
}
</script>

<div
	bind:this={container}
	onscroll={handleScroll}
	class="h-screen overflow-y-auto scroll-smooth pl-96"
>
	<div class="mx-auto w-full max-w-6xl p-8">
		{#each rows as row (row[0].toFormat('yyyy-MM'))}
			<div data-row={row[0].toFormat('yyyy-MM')} class="mb-10 grid grid-cols-3 gap-8">
				{#each row as month (month.toFormat('yyyy-MM'))}
					{@const { startPad, total } = daysGrid(month)}
					<div>
						<h2 class="mb-2 text-lg font-heading">
							{month.toFormat('MMMM yyyy')}
						</h2>
						<div class="grid grid-cols-7 gap-1">
							{#each Array(startPad) as _, padIndex (padIndex)}<div></div>{/each}
							{#each Array(total) as _, i (i)}
								{@const date = month.plus({ days: i })}
								{@const key = date.toFormat('yyyy-MM-dd')}
								{@const color = scoreToColor(dayScores[key])}
								{@const isToday = date.hasSame(today, 'day')}
								<button
									onclick={() => openDay(date)}
									class={cn(
										'aspect-square rounded-md border border-border text-xs transition hover:scale-105 hover:shadow',
										isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background font-bold'
									)}
									style:background-color={color}
								>
									{i + 1}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>
    <button
	onclick={goToToday}
	class="fixed bottom-6 right-6 z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-lg transition hover:scale-105"
>
	Today
</button>
</div>