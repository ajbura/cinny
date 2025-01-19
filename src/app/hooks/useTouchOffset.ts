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

function clamp(val: number, min: number | undefined, max: number | undefined) {
	if (min === undefined && max === undefined) return val;
	if (min === undefined) return Math.min(val, max!);
	if (max === undefined) return Math.max(val, min!);
	return Math.max(Math.min(val, max), min);
}

export function useTouchOffset(options?: { limit?: Limit, touchEndCallback?: (offset: Coordinates) => any }) {
	const [startPos, setStartPos] = useState<Coordinates | null>(null);
	const [offset, setOffset] = useState<Coordinates>([0, 0]);

	const limitedSetOffset = (coords: Coordinates) => {
		if (!options?.limit) setOffset(coords);
		else setOffset(coords.map((coord, ii) => clamp(coord, options.limit![ii * 2], options.limit![ii * 2 + 1])) as Coordinates);
	};

	const onTouchStart = (event: React.TouchEvent) => {
		const coords = getTouchListAverageCoordinates(event.touches);
		if (!startPos) setStartPos(coords);
		else limitedSetOffset(coords.map((coord, ii) => coord - startPos[ii]) as Coordinates);
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