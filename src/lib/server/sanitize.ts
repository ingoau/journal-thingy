import DOMPurify from 'dompurify';
import { parseHTML } from 'linkedom';

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

const { window } = parseHTML('');
const purify = DOMPurify(window as unknown as Window);

export function sanitizeEntryHtml(html: string) {
	return purify.sanitize(html, {
		ALLOWED_TAGS,
		ALLOWED_ATTR: []
	});
}
