<script lang="ts">
	import { browser } from '$app/environment';
	import DOMPurify from 'dompurify';

	const { html }: { html: string } = $props();

	const ALLOWED_TAGS = [
		'p',
		'h1',
		'h2',
		'h3',
		'strong',
		'em',
		's',
		'code',
		'pre',
		'ul',
		'ol',
		'li',
		'blockquote',
		'hr',
		'br'
	];

	// Content is sanitized on write; re-sanitize in the browser for defense in depth.
	const safe = $derived(
		browser
			? DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [] })
			: html
	);
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized on write, re-sanitized client-side -->
{@html safe}
