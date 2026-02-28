"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AdminStats {
	volunteerCount: number;
	userCount: number;
	coinsDistributed: number;
	tasksByStatus: Array<{ status: string; count: number }>;
	recentDistributions: Array<{
		id: string;
		amount: string;
		distributionType: string;
		distributionDate: string;
	}>;
	recentAuditLog: Array<{
		id: string;
		action: string;
		actorRole: string;
		createdAt: string;
	}>;
}

const STATUS_COLORS: Record<string, string> = {
	open: "bg-blue-100 text-blue-700",
	assigned: "bg-purple-100 text-purple-700",
	in_progress: "bg-yellow-100 text-yellow-700",
	completed: "bg-green-100 text-green-700",
	approved: "bg-emerald-100 text-emerald-700",
	rejected: "bg-red-100 text-red-700",
};

const PIPELINE_STATUSES = ["open", "assigned", "in_progress", "completed", "approved"];

export default function AdminDashboardPage() {
	const router = useRouter();
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("beacon_access_token");
		if (!token) {
			router.replace("/admin/login");
			return;
		}
		try {
			const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
			if (payload.exp * 1000 < Date.now() || payload.role !== "admin") {
				router.replace("/admin/login");
				return;
			}
		} catch {
			router.replace("/admin/login");
			return;
		}

		fetch("/api/beacon/admin/stats", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (res.status === 401 || res.status === 403) {
					router.replace("/admin/login");
					return null;
				}
				return res.json();
			})
			.then((body) => {
				if (body?.success) setStats(body.data as AdminStats);
			})
			.finally(() => setLoading(false));
	}, [router]);

	function handleLogout() {
		localStorage.removeItem("beacon_access_token");
		localStorage.removeItem("beacon_refresh_token");
		router.replace("/admin/login");
	}

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading…</p>
			</main>
		);
	}

	if (!stats) return null;

	const statusMap = Object.fromEntries(stats.tasksByStatus.map((s) => [s.status, s.count]));
	const openCount = statusMap.open ?? 0;

	return (
		<main className="min-h-screen bg-background">
			<header className="border-b px-6 py-4">
				<div className="mx-auto flex max-w-5xl items-center">
					<h1 className="flex-1 text-xl font-bold">Admin Dashboard</h1>
					<Button variant="outline" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</div>
			</header>

			<div className="mx-auto max-w-5xl space-y-8 p-6">
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Active Volunteers
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold">{stats.volunteerCount}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Beneficiaries
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold">{stats.userCount}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								O_COIN Distributed
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold">{stats.coinsDistributed.toFixed(2)}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Open Tasks
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold">{openCount}</p>
						</CardContent>
					</Card>
				</div>

				<section>
					<h2 className="mb-4 text-lg font-semibold">Task Pipeline</h2>
					<div className="flex flex-wrap gap-3">
						{PIPELINE_STATUSES.map((status) => (
							<div
								key={status}
								className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
									STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"
								}`}
							>
								<span className="capitalize">{status.replace("_", " ")}</span>
								<span className="font-bold">{statusMap[status] ?? 0}</span>
							</div>
						))}
					</div>
				</section>

				<Separator />

				<div className="grid gap-8 md:grid-cols-2">
					<section>
						<h2 className="mb-4 text-lg font-semibold">Recent Distributions</h2>
						{stats.recentDistributions.length === 0 ? (
							<p className="text-sm text-muted-foreground">No distributions yet</p>
						) : (
							<div className="space-y-3">
								{stats.recentDistributions.map((d) => (
									<div
										key={d.id}
										className="flex items-center justify-between rounded-lg border px-4 py-3"
									>
										<div>
											<p className="text-sm font-medium capitalize">
												{d.distributionType.replace(/_/g, " ")}
											</p>
											<p className="text-xs text-muted-foreground">
												{new Date(d.distributionDate).toLocaleDateString()}
											</p>
										</div>
										<p className="font-semibold">{Number(d.amount).toFixed(2)}</p>
									</div>
								))}
							</div>
						)}
					</section>

					<section>
						<h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
						{stats.recentAuditLog.length === 0 ? (
							<p className="text-sm text-muted-foreground">No activity yet</p>
						) : (
							<div className="space-y-3">
								{stats.recentAuditLog.map((entry) => (
									<div
										key={entry.id}
										className="flex items-center justify-between rounded-lg border px-4 py-3"
									>
										<div>
											<p className="text-sm font-medium capitalize">
												{entry.action.replace(/_/g, " ")}
											</p>
											<p className="text-xs text-muted-foreground capitalize">{entry.actorRole}</p>
										</div>
										<p className="text-xs text-muted-foreground">
											{new Date(entry.createdAt).toLocaleDateString()}
										</p>
									</div>
								))}
							</div>
						)}
					</section>
				</div>
			</div>
		</main>
	);
}
