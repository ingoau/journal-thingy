<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import { Button } from "$lib/components/ui/button/";
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
    let step: 'start' | 'name' | 'tutorial' = $state('start');
    let nameInput = $state('');
</script>

{#if step === 'start'}
<div>
    blahblahblahblah
    <Button onclick={() => (step = 'name')}>Next</Button>
</div>
{:else if step === 'name'}
<div>
    <h1 class="text-3xl"> A few more things :D </h1>
    <h2 class="text-2xl">Please set your name - </h2>
    <Input type="text" placeholder="Name" bind:value={nameInput}/>
    <Button onclick={async () => {
        await authClient.updateUser({
            name: nameInput
        })
        step = 'tutorial'}}>Next</Button>
</div>
{:else if step === 'tutorial'}
<p>tutorial</p>
<Button onclick={async () => {await authClient.updateUser({ onboarded: true}); goto("/")}}>Complete</Button>
{/if}