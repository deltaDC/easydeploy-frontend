"use client";

import { useState, useEffect } from "react";

export function useFadeOut(callback: () => void, delay: number = 600) {
	const [isFadingOut, setIsFadingOut] = useState(false);

	const startFadeOut = () => {
		setIsFadingOut(true);
		setTimeout(() => {
			callback();
		}, delay);
	};

	return { isFadingOut, startFadeOut };
}

