import React, { useState } from "react";

type Vec2 = [number, number]; // x, y
type Limit = [number | undefined, number | undefined, number | undefined, number | undefined]; // min x, max x, min y, max y

// Function for calculating average touch position from multiple touches.
function getTouchListAverageCoordinates(list: React.TouchList) {
	return Array.from(list).map(touch => [touch.clientX, touch.clientY]).reduce((a, b) => {
		a[0] += b[0];
		a[1] += b[1];
		return a;
	}).map(coord => coord / list.length) as Vec2;
}

// Used for offset limits. It makes sure the offset value is within the range. Undefined means there is no limit for min/max.
function clamp(val: number, min?: number, max?: number) {
	if (min === undefined && max === undefined) return val;
	if (min === undefined) return Math.min(val, max!);
	if (max === undefined) return Math.max(val, min!);
	return Math.max(Math.min(val, max), min);
}

// Used for start limits. Returns a boolean indicating if a value is valid to be considered as a starting point.
function isBetween(val: number, min?: number, max?: number) {
	if (min === undefined && max === undefined) return true;
	if (min === undefined) return val <= max!;
	if (max === undefined) return val >= min!;
	return val >= min && val <= max;
}

// Returns the offset from start point to end point
export function useTouchOffset(options?: { startLimit?: Limit, offsetLimit?: Limit, touchEndCallback?: (offset: Vec2, velocity?: Vec2, averageVelocity?: Vec2) => any }) {
	const [startPos, setStartPos] = useState<Vec2 | null>(null);
	const [offset, setOffset] = useState<Vec2>([0, 0]);
	const [velocity, setVelocity] = useState<Vec2>([0, 0]);
	const [_, setLastTime] = useState(Date.now());
	const [startTime, setStartTime] = useState(Date.now());

	// Wrapper of setOffset and setVelocity, making sure offset is within limit
	const limitedSetOffset = (coords: Vec2) => {
		setLastTime(lt => {
			const now = Date.now();
			setVelocity(Array.from(coords).map((coord, ii) => (coord - offset[ii]) / (now - lt)) as Vec2);
			return Date.now();
		});
		if (!options?.offsetLimit) setOffset(coords);
		else setOffset(coords.map((coord, ii) => clamp(coord, options.offsetLimit![ii * 2], options.offsetLimit![ii * 2 + 1])) as Vec2);
	};

	const onTouchStart = (event: React.TouchEvent) => {
		const coords = getTouchListAverageCoordinates(event.touches);
		if (!startPos) {
			// Start if limit is not set, or the touch point is within limits
			if (!options?.startLimit || coords.map((coord, ii) => isBetween(coord, options.startLimit![ii * 2], options.startLimit![ii * 2 + 1])).every(x => x)) {
				setStartPos(coords);
				setLastTime(Date.now());
				setStartTime(Date.now());
			}
		}
		// Touches after the first one. Calculate offset using the average point.
		else limitedSetOffset(coords.map((coord, ii) => coord - startPos[ii]) as Vec2);
	};

	const onTouchEnd = (event: React.TouchEvent) => {
		// Length 0 means there are no more touching points
		if (event.touches.length == 0) {
			// A callback with offset, velocity and average velocity. Used to determine if the gesture is strong enough for actions.
			if (options?.touchEndCallback) options.touchEndCallback(offset, velocity, !startPos ? undefined : offset.map(((coord, ii) => (coord - startPos[ii]) / (Date.now() - startTime))) as Vec2);
			// Reset starting point, offset and velocity.
			setStartPos(null);
			setOffset([0, 0]);
			setVelocity([0, 0]);
		} else if (startPos) {
			// There are still point(s) being touched. Use the average of them to calculate offset.
			const coords = getTouchListAverageCoordinates(event.touches);
			limitedSetOffset(coords.map((coord, ii) => coord - startPos[ii]) as Vec2);
		}
	};

	const onTouchMove = (event: React.TouchEvent) => {
		const coords = getTouchListAverageCoordinates(event.touches);
		// Update offset according to touch point movement
		if (startPos) limitedSetOffset(coords.map((coord, ii) => coord - startPos[ii]) as Vec2);
	};

	return { offset, velocity, onTouchStart, onTouchEnd, onTouchMove };
}