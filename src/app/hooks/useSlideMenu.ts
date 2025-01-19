import { useState } from "react";
import { useGoBack } from "./useGoBack";
import { useTouchOffset } from "./useTouchOffset";

export function useSlideMenu() {
	const goBack = useGoBack();
	const [offsetOverride, setOffsetOverride] = useState(false);
	const { offset, onTouchStart, onTouchEnd, onTouchMove } = useTouchOffset({
		startLimit: [0, 0.1 * window.innerWidth, undefined, undefined],
		offsetLimit: [0, window.innerWidth, 0, 0],
		touchEndCallback: (offset) => {
			if (offset[0] > window.innerWidth * 0.5) {
				setOffsetOverride(true);
				setTimeout(() => goBack(), 250);
			}
		}
	});

	return { offset, offsetOverride, onTouchStart, onTouchEnd, onTouchMove };
}