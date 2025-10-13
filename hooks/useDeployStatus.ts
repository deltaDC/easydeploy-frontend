import { useEffect, useState } from "react";
import DeployService from "@/services/deploy.service";

export function useDeployStatus(appId?: string) {
	const [status, setStatus] = useState<string | null>(null);

	useEffect(() => {
		if (!appId) return;
		let mounted = true;
		const interval = setInterval(async () => {
			try {
				const { data } = await DeployService.getApp(appId);
				if (mounted) setStatus(data?.status ?? null);
			} catch {}
		}, 4000);
		return () => {
			mounted = false;
			clearInterval(interval);
		};
	}, [appId]);

	return { status };
}
