import { useEffect } from "react";

export function MetaTheme() {
	useEffect(() => {
		// Query the meta tag once instead of inside the function
		const metaThemeColor = document.querySelector("meta[name=theme-color]");

		const updateThemeColor = () => {
			// Get the background color of the body
			const bgColor = window.getComputedStyle(document.body).backgroundColor;

			if (metaThemeColor) {
				metaThemeColor.setAttribute("content", bgColor);
			}
		};

		// 1. Run immediately on mount to catch the initial theme
		updateThemeColor();

		// 2. Watch for theme class changes (e.g., 'dark' class added to <html> or <body>)
		const observer = new MutationObserver(updateThemeColor);

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"]
		});

		// Clean up
		return () => observer.disconnect();
	}, []);

	return null;
}
