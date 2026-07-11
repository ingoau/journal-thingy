<script lang="ts">
	import { sanitizeEntryHtml } from '$lib/sanitize';

	const { html }: { html: string } = $props();

	const safe = $derived(sanitizeEntryHtml(html));
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized via DOMPurify allowlist -->
{@html safe}
