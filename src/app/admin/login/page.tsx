"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const res = await fetch("/api/beacon/admin/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const body = await res.json();

			if (!res.ok) {
				if (res.status === 401) {
					setError("Invalid email or password");
				} else if (res.status === 403) {
					setError("Insufficient permissions");
				} else if (res.status === 429) {
					setError("Too many attempts. Try again in a minute.");
				} else {
					setError(body?.error ?? "Something went wrong.");
				}
				return;
			}

			const { accessToken, refreshToken } = body.data.tokens;
			localStorage.setItem("beacon_access_token", accessToken);
			localStorage.setItem("beacon_refresh_token", refreshToken);
			router.push("/admin/dashboard");
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Admin Login</CardTitle>
					<CardDescription>Sign in to your admin account</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								autoComplete="current-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						{error && <p className="text-sm text-destructive">{error}</p>}
					</CardContent>
					<CardFooter className="flex flex-col gap-3">
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Signing in…" : "Sign in"}
						</Button>
						<p className="text-sm text-muted-foreground">
							Volunteer?{" "}
							<Link href="/login" className="underline underline-offset-4">
								Sign in here →
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</main>
	);
}
