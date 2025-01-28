import { useState } from "react";
import { useGoBack } from "./useGoBack";
import { useTouchOffset } from "./useTouchOffset";

// Reusable slide menu gesture handler
export function useSlideMenu() {
	const goBack = useGoBack();
	const [offsetOverride, setOffsetOverride] = useState(false);
	const { offset, onTouchStart, onTouchEnd, onTouchMove } = useTouchOffset({
		startLimit: [0, 0.1 * window.innerWidth, undefined, undefined],
		offsetLimit: [0, window.innerWidth, 0, 0],
		touchEndCallback: (offset, velocity, averageVelocity) => {
			if (offset[0] > window.innerWidth * 0.5 || (velocity && velocity[0] > 0.9) || (averageVelocity && averageVelocity[0] > 0.8)) {
				setOffsetOverride(true);
				// Slide menu transition takes .25s so we wait for that.
				setTimeout(() => goBack(), 250);
			}
		}
	});

	return { offset, offsetOverride, onTouchStart, onTouchEnd, onTouchMove };
}