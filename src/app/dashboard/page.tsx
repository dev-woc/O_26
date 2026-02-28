"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VolunteerData {
	volunteer: {
		name: string;
		volunteerId: string;
		organization: string | null;
		email: string;
	};
	stats: {
		tasksCompleted: number;
		hoursWorked: number;
		coinsEarned: number;
	};
	activeTasks: Array<{
		id: string;
		title: string;
		category: string | null;
		priority: string;
		dueDate: string | null;
		status: string;
	}>;
}

const PRIORITY_COLORS: Record<string, string> = {
	high: "bg-red-100 text-red-700",
	medium: "bg-yellow-100 text-yellow-700",
	low: "bg-green-100 text-green-700",
};

export default function DashboardPage() {
	const router = useRouter();
	const [data, setData] = useState<VolunteerData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("beacon_access_token");
		if (!token) {
			router.replace("/login");
			return;
		}
		try {
			const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
			if (payload.exp * 1000 < Date.now()) {
				router.replace("/login");
				return;
			}
		} catch {
			router.replace("/login");
			return;
		}

		fetch("/api/beacon/volunteers/me", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (res.status === 401) {
					router.replace("/login");
					return null;
				}
				return res.json();
			})
			.then((body) => {
				if (body?.success) setData(body.data as VolunteerData);
			})
			.finally(() => setLoading(false));
	}, [router]);

	function handleLogout() {
		localStorage.removeItem("beacon_access_token");
		localStorage.removeItem("beacon_refresh_token");
		router.replace("/login");
	}

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading…</p>
			</main>
		);
	}

	if (!data) return null;

	const { volunteer, stats, activeTasks } = data;
	const initials = volunteer.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<main className="min-h-screen bg-background">
			<header className="border-b px-6 py-4">
				<div className="mx-auto flex max-w-4xl items-center gap-4">
					<Avatar size="lg">
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div className="flex-1">
						<p className="font-semibold">{volunteer.name}</p>
						<p className="text-sm text-muted-foreground">
							{volunteer.volunteerId}
							{volunteer.organization ? ` · ${volunteer.organization}` : ""}
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</div>
			</header>

			<div className="mx-auto max-w-4xl space-y-8 p-6">
				<div className="grid grid-cols-3 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Tasks Completed
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold">{stats.tasksCompleted}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Hours Worked
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold">{stats.hoursWorked.toFixed(1)}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								O_COIN Earned
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold">{stats.coinsEarned.toFixed(2)}</p>
						</CardContent>
					</Card>
				</div>

				<section>
					<h2 className="mb-4 text-lg font-semibold">Active Tasks</h2>
					{activeTasks.length === 0 ? (
						<p className="text-sm text-muted-foreground">No tasks assigned yet</p>
					) : (
						<div className="space-y-3">
							{activeTasks.map((task) => (
								<div key={task.id} className="flex items-center gap-4 rounded-lg border px-4 py-3">
									<div className="flex-1">
										<p className="font-medium">{task.title}</p>
										{task.category && (
											<p className="text-sm text-muted-foreground capitalize">{task.category}</p>
										)}
									</div>
									<span
										className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
											PRIORITY_COLORS[task.priority] ?? "bg-muted text-muted-foreground"
										}`}
									>
										{task.priority}
									</span>
									{task.dueDate && (
										<p className="text-sm text-muted-foreground">
											{new Date(task.dueDate).toLocaleDateString()}
										</p>
									)}
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
