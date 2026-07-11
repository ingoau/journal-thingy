<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import { Button } from "$lib/components/ui/button/";
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
    let step: 'start' | 'name' | 'tutorial' = $state('start');
    let nameInput = $state('');
</script>

{#if step === 'start'}
    <div class="p-4">
        <h1 class="text-2xl">Hi there :D Welcome to your new journal! Before you get engulfed beyond our help, we need to set up a few things :D</h1>
        <br>
        <Button onclick={() => (step = 'name')}>Next</Button>
    </div>
{:else if step === 'name'}
    <div class="p-4">
        <h1 class="text-3xl"> A few more things :D </h1>
        <br>
        <h2 class="text-2xl">Please set your name/Username: </h2>
        <Input type="text" placeholder="Name" bind:value={nameInput}/>
        <br><br>
        <Button onclick={async () => {
            await authClient.updateUser({
                name: nameInput
            })
            step = 'tutorial'}}>Next</Button>
    </div>
{:else if step === 'tutorial'}
    <div class="p-4">
        <h1 class="text-3xl">Features</h1>
        <h2>streaks</h2>
        <h2>tracks your mood</h2>
        <h2>UI created by famous award winning designer 
            <a href="https://ingo.au" target="_blank" rel="noreferrer" class="text-primary font-heading">Ing</a><a href="/team/Ingo" target="_blank" rel="noreferrer" class="text-primary font-heading">o</a>
            <a href="https://ingo.au" target="_blank" rel="noreferrer" class="text-primary font-heading">Wolf</a>
        </h2>
        <Button onclick={async () => {await authClient.updateUser({ onboarded: true}); goto("/")}}>Complete</Button>
    </div>
{/if}