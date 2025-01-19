import React, { useEffect, useState } from "react";

type Coordinates = [number, number];
type Limit = [number | undefined, number | undefined, number | undefined, number | undefined]; // x+, x-, y+, y-

function getTouchListAverageCoordinates(list: React.TouchList) {
	return Array.from(list).map(touch => [touch.clientX, touch.clientY]).reduce((a, b) => {
		a[0] += b[0];
		a[1] += b[1];
		return a;
	}).map(coord => coord / list.length) as Coordinates;
}

function clamp(val: number, min?: number, max?: number) {
	if (min === undefined && max === undefined) return val;
	if (min === undefined) return Math.min(val, max!);
	if (max === undefined) return Math.max(val, min!);
	return Math.max(Math.min(val, max), min);
}

function isBetween(val: number, min?: number, max?: number) {
	if (min === undefined && max === undefined) return true;
	if (min === undefined) return val <= max!;
	if (max === undefined) return val >= min!;
	return val >= min && val <= max;
}

export function useTouchOffset(options?: { startLimit?: Limit, offsetLimit?: Limit, touchEndCallback?: (offset: Coordinates) => any }) {
	const [startPos, setStartPos] = useState<Coordinates | null>(null);
	const [offset, setOffset] = useState<Coordinates>([0, 0]);

	const limitedSetOffset = (coords: Coordinates) => {
		if (!options?.offsetLimit) setOffset(coords);
		else setOffset(coords.map((coord, ii) => clamp(coord, options.offsetLimit![ii * 2], options.offsetLimit![ii * 2 + 1])) as Coordinates);
	};

	const onTouchStart = (event: React.TouchEvent) => {
		const coords = getTouchListAverageCoordinates(event.touches);
		if (!startPos) {
			if (!options?.startLimit || coords.map((coord, ii) => isBetween(coord, options.startLimit![ii * 2], options.startLimit![ii * 2 + 1])).every(x => x))
				setStartPos(coords);
		} else limitedSetOffset(coords.map((coord, ii) => coord - startPos[ii]) as Coordinates);
	};

	const onTouchEnd = (event: React.TouchEvent) => {
		if (event.touches.length == 0) {
			if (options?.touchEndCallback) options.touchEndCallback(offset);
			setStartPos(null);
			setOffset([0, 0]);
		} else if (startPos) {
			const coords = getTouchListAverageCoordinates(event.touches);
			limitedSetOffset(coords.map((coord, ii) => coord - startPos[ii]) as Coordinates);
		}
	};

	const onTouchMove = (event: React.TouchEvent) => {
		const coords = getTouchListAverageCoordinates(event.touches);
		if (startPos) limitedSetOffset(coords.map((coord, ii) => coord - startPos[ii]) as Coordinates);
	};

	return { offset, onTouchStart, onTouchEnd, onTouchMove };
}