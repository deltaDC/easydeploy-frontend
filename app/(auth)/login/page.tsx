"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ErrorAlert } from "@/components/ui/error-alert";
import { GithubService } from "@/services/github.service";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
	const { login } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<{ message: string; status?: number } | null>(null);
	const [isFadingOut, setIsFadingOut] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await login(formData.email, formData.password);
			// Fade out effect
			setIsFadingOut(true);
			setTimeout(() => {
				// Redirect will be handled by useAuth hook
			}, 600);
		} catch (err: any) {
			setError({
				message: err.message || "Đăng nhập thất bại",
				status: err.status,
			});
			setIsLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleGitHubLogin = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const githubUrl = await GithubService.getOAuthUrl();
			window.location.href = githubUrl;
		} catch (err: any) {
			setError({
				message: err.message || "Không thể kết nối với GitHub",
				status: err.status,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AnimatePresence>
			{!isFadingOut && (
				<motion.div
					initial={{ opacity: 1 }}
					exit={{ opacity: 0, filter: "blur(10px)" }}
					transition={{ duration: 0.6 }}
					className="min-h-screen flex items-center justify-center bg-gradient-to-br from-misty-grey/30 via-porcelain to-soft-blue/20 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden noise-texture-medium"
				>
					{/* Noise Texture */}
					<div
						className="absolute inset-0 opacity-[0.03] pointer-events-none"
						style={{
							backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
							backgroundSize: '200px 200px',
						}}
					/>

					{/* Blur Orbs - Mint and Yellow */}
					<div className="absolute inset-0 overflow-hidden pointer-events-none">
						<motion.div
							className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-[50px]"
							animate={{
								y: [0, -30, 0],
								x: [0, 20, 0],
							}}
							transition={{
								duration: 8,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
						<motion.div
							className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-[50px]"
							animate={{
								y: [0, 30, 0],
								x: [0, -20, 0],
							}}
							transition={{
								duration: 10,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 1,
							}}
						/>
						<motion.div
							className="absolute top-1/2 left-1/3 w-80 h-80 bg-misty-sage/15 rounded-full blur-[50px]"
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.3, 0.5, 0.3],
							}}
							transition={{
								duration: 12,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
					</div>

					<div className="max-w-md w-full space-y-8 relative z-10">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="text-center"
						>
							<div className="mx-auto h-12 w-12 bg-misty-sage/20 rounded-full flex items-center justify-center mb-4">
								<svg
									className="h-6 w-6 text-misty-sage"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<h1 className="text-3xl font-bold tracking-tight text-charcoal">Đăng nhập</h1>
							<p className="mt-2 text-sm text-charcoal/70">Chào mừng trở lại EasyDeploy</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1, duration: 0.5 }}
						>
							<Card className="shadow-2xl border-2 border-gray-200 bg-white backdrop-blur-xl rounded-3xl relative overflow-hidden">
								{/* Inner Glow */}
								<div className="absolute inset-0 shadow-inner-glow-soft pointer-events-none rounded-3xl" />
								<CardHeader className="space-y-1 pb-6">
									<CardTitle className="text-2xl text-center font-bold text-charcoal">
										Đăng nhập tài khoản
									</CardTitle>
									<CardDescription className="text-center text-charcoal/70">
										Nhập email và mật khẩu để đăng nhập
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6 relative z-10">
									<form onSubmit={handleSubmit} className="space-y-5">
										<div className="space-y-2">
											<Label htmlFor="email" className="text-sm font-medium text-charcoal">
												Email
											</Label>
											<Input
												id="email"
												name="email"
												type="email"
												placeholder="your@email.com"
												value={formData.email}
												onChange={handleInputChange}
												required
												disabled={isLoading}
												className="h-11 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:ring-offset-0 transition-all"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="password" className="text-sm font-medium text-charcoal">
												Mật khẩu
											</Label>
											<div className="relative">
												<Input
													id="password"
													name="password"
													type={showPassword ? "text" : "password"}
													placeholder="Nhập mật khẩu"
													value={formData.password}
													onChange={handleInputChange}
													required
													disabled={isLoading}
													className="h-11 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:ring-offset-0 transition-all pr-10"
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors"
												>
													{showPassword ? (
														<EyeOff className="h-4 w-4" strokeWidth={1.5} />
													) : (
														<Eye className="h-4 w-4" strokeWidth={1.5} />
													)}
												</button>
											</div>
										</div>
										{error && (
											<div className="p-3 rounded-lg bg-rose-soft/20 border border-rose-light/30 text-rose-soft text-sm shadow-misty-sm">
												{error.message}
											</div>
										)}
										<div className="pt-2">
											<Button
												type="submit"
												variant="success"
												className="w-full h-11 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
												disabled={isLoading}
											>
												{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
											</Button>
										</div>
									</form>
								</CardContent>
								<CardFooter className="flex flex-col space-y-4 pt-6">
									<div className="relative w-full">
										<div className="absolute inset-0 flex items-center">
											<Separator className="w-full bg-misty-grey/30" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
												<span className="bg-white px-2 text-charcoal/60">Hoặc tiếp tục với</span>
										</div>
									</div>
									<Button
										variant="outline"
											className="w-full h-11 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-full text-charcoal transition-all relative z-10"
										onClick={handleGitHubLogin}
										disabled={isLoading}
									>
										<Github className="mr-2 h-4 w-4" strokeWidth={1.5} />
										{isLoading ? "Đang kết nối..." : "Đăng nhập với GitHub"}
									</Button>
									<p className="text-center text-sm text-charcoal/70">
										Chưa có tài khoản?{" "}
										<Link
											href="/register"
											className="font-medium text-misty-sage hover:text-misty-sage/80 transition-colors"
										>
											Đăng ký ngay
										</Link>
									</p>
								</CardFooter>
							</Card>
						</motion.div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
