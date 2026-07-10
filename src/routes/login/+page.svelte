<script lang="ts">
	import { Input } from "$lib/components/ui/input/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
</script>

<div class="flex min-h-screen items-center justify-center">
    <Card.Root class="w-full max-w-md">
        <Card.Header>
            <Card.Title>Login</Card.Title>
            <Card.Description>Enter your login credentials below to login to your account.</Card.Description>
            <Card.Action>
                <Button variant="link">No account? Sign Up!</Button>
            </Card.Action>
        </Card.Header>
        <Card.Content>
            <form>
                <div class="flex flex-col gap-6">
                    <div class="grid gap-2">
                        <Label for="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>
                    <div class="grid gap-2">
                        <div class="flex items-center">
                            <Label for="password">Password</Label>
                            <a
                                    href="##"
                                    class="ms-auto inline-block text-sm underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </a>
                        </div>
                        <Input id="password" type="password" placeholder="Password" required />
                    </div>
                </div>
            </form>
        </Card.Content>
        <Card.Footer class="flex-col gap-2">
            <Button type="submit" class="w-full">Login</Button>
            <Button variant="outline" class="w-full">Login with GutHib</Button>
        </Card.Footer>
    </Card.Root>
</div>