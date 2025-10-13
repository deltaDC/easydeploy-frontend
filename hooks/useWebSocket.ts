import { useEffect, useRef } from "react";

export function useWebSocket(url?: string) {
	const ref = useRef<WebSocket | null>(null);

	useEffect(() => {
		if (!url) return;
		ref.current = new WebSocket(url);
		return () => {
			ref.current?.close();
		};
	}, [url]);

	return ref;
}
