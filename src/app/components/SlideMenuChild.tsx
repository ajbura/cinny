import { ReactNode } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { HOME_PATH, DIRECT_PATH, SPACE_PATH, EXPLORE_PATH, INBOX_PATH } from "../pages/paths";
import React from "react";
import { Direct } from "../pages/client/direct";
import { Explore } from "../pages/client/explore";
import { Home } from "../pages/client/home";
import { Inbox } from "../pages/client/inbox";
import { Space } from "../pages/client/space";

// A component to match path and return the corresponding slide menu parent.
export function SlideMenuChild() {
	const location = useLocation();

	let previousComponent: ReactNode;
	if (matchPath({ path: HOME_PATH, caseSensitive: true, end: false, }, location.pathname)) previousComponent = <Home />;
	else if (matchPath({ path: DIRECT_PATH, caseSensitive: true, end: false, }, location.pathname)) previousComponent = <Direct />;
	else if (matchPath({ path: EXPLORE_PATH, caseSensitive: true, end: false, }, location.pathname)) previousComponent = <Explore />;
	else if (matchPath({ path: INBOX_PATH, caseSensitive: true, end: false, }, location.pathname)) previousComponent = <Inbox />;
	else if (matchPath({ path: SPACE_PATH, caseSensitive: true, end: false, }, location.pathname)) previousComponent = <Space />;

	return previousComponent;
}