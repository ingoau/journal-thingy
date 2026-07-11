import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { extensionForMimeType, transcribeAndCleanup } from '$lib/server/transcription';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		error(400, 'Expected multipart form data with an audio file');
	}

	const audio = formData.get('audio');

	if (!(audio instanceof File) || audio.size === 0) {
		error(400, 'Missing audio file');
	}

	const mimeType = audio.type || 'audio/webm';
	const fileName = audio.name || `recording.${extensionForMimeType(mimeType)}`;
	const file = new File([audio], fileName, { type: mimeType });

	try {
		const transcript = await transcribeAndCleanup(file);
		return json({ transcript });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Transcription failed';
		if (message.includes('GROQ_API_KEY')) {
			error(500, 'Voice transcription is not configured');
		}
		console.error('Transcription error:', message);
		error(502, 'Failed to transcribe audio');
	}
};
