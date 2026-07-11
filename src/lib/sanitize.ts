import DOMPurify from 'isomorphic-dompurify';

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

export function sanitizeEntryHtml(html: string) {
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS,
		ALLOWED_ATTR: []
	});
}
