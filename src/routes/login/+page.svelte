<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { Input } from '$lib/components/ui/input';

	import { authClient } from '$lib/auth-client';

  import { goto } from '$app/navigation';

  import { fly } from 'svelte/transition';

	let step: 'email' | 'otp' = $state('email');

	let email = $state('');
	let otp = $state('');
	let loading = $state(false);
	let error = $state('');

	async function submitEmail(event: { preventDefault: () => void }) {
		event.preventDefault();
		loading = true;
		error = '';

		const { error: err } = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: 'sign-in'
		});

		if (err) {
			error = err.message!;
			loading = false;
			return;
		}

		step = 'otp';
		loading = false;
	}

	async function submitOtp(eventOrCode?: SubmitEvent | string) {
		if (typeof eventOrCode !== 'string') {
			eventOrCode?.preventDefault();
		}

		const code = typeof eventOrCode === 'string' ? eventOrCode : otp;
		if (loading || code.length !== 6) return;

		loading = true;
		error = '';

		const { error: err } = await authClient.signIn.emailOtp({
			email,
			otp: code
		});

		if (err) {
			error = err.message!;
			loading = false;
			return;
		}

		await goto("/")
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
    <div class="relative w-full max-w-md h-80">
        {#if step === 'email'}
            <div
              class="absolute inset-0"
              in:fly={{ x: 50, duration: 250 }}
              out:fly={{ x: -50, duration: 250 }}
            >
                <Card.Root class="w-full max-w-md">
                    <Card.Header>
                        <Card.Title>Login</Card.Title>
                        <Card.Description>Enter your email below to be emailed a sign-in code.</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <form onsubmit={submitEmail} class="space-y-4">
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              bind:value={email}
                              required
                            />

                            <Button type="submit" class="w-full" disabled={loading}>
                                {loading ? "Sending..." : "Continue"}
                            </Button>
                        </form>
                        {#if error}
                            <p class="mt-4 text-sm text-destructive">
                                {error}
                            </p>
                        {/if}
                    </Card.Content>
                </Card.Root>
            </div>
        {:else if step === 'otp'}
            <div
              class="absolute inset-0"
              in:fly={{ x: 50, duration: 250 }}
              out:fly={{ x: -50, duration: 250 }}
            >
                <Card.Root class="w-full max-w-md">
                    <Card.Header>
                        <Card.Title>Login</Card.Title>
                        <Card.Description>Enter the 6-digit code we sent to your email.</Card.Description>
                        <Card.Action>
                            <Button variant="link" onclick={() => {step = "email"; otp = "";}}>Not you? Go back.</Button>
                        </Card.Action>
                    </Card.Header>
                    <Card.Content>
                        <form class="space-y-4" onsubmit={submitOtp}>
                            <InputOTP.Root
                              maxlength={6}
                              bind:value={otp}
                            >
                                {#snippet children({ cells })}
                                    <InputOTP.Group>
                                        {#each cells.slice(0, 3) as cell, index (index)}
                                            <InputOTP.Slot {cell} />
                                        {/each}
                                    </InputOTP.Group>
                                    <InputOTP.Separator />
                                    <InputOTP.Group>
                                        {#each cells.slice(3, 6) as cell, index (index)}
                                            <InputOTP.Slot {cell} />
                                        {/each}
                                    </InputOTP.Group>
                                {/snippet}
                            </InputOTP.Root>

                            <Button
                              class="w-full"
                              type="submit"
                              disabled={loading || otp.length !== 6}
                            >
                                {loading ? "Checking..." : "Verify"}
                            </Button>
                        </form>

                        {#if error}
                            <p class="mt-4 text-sm text-destructive">
                                {error}
                            </p>
                        {/if}
                    </Card.Content>
                </Card.Root>
            </div>
        {/if}
    </div>
</div>