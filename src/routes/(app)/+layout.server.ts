import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(303, '/login');
    }
    if (!((locals.user as { onboarded?: boolean }).onboarded === true)) {
        redirect(303, '/onboarding');
    }
    return {
        user: locals.user
    };
};