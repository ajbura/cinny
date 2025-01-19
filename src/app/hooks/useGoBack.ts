import { useCallback } from "react";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { HOME_PATH, DIRECT_PATH, SPACE_PATH, EXPLORE_PATH, INBOX_PATH } from "../pages/paths";
import { getHomePath, getDirectPath, getSpacePath, getExplorePath, getInboxPath } from "../pages/pathUtils";

// Moved goBack from BackRouteHandler for reusabilitiy
export function useGoBack() {
	const navigate = useNavigate();
	const location = useLocation();

	const goBack = useCallback(() => {
		if (
			matchPath(
				{
					path: HOME_PATH,
					caseSensitive: true,
					end: false,
				},
				location.pathname
			)
		) {
			navigate(getHomePath());
			return;
		}
		if (
			matchPath(
				{
					path: DIRECT_PATH,
					caseSensitive: true,
					end: false,
				},
				location.pathname
			)
		) {
			navigate(getDirectPath());
			return;
		}
		const spaceMatch = matchPath(
			{
				path: SPACE_PATH,
				caseSensitive: true,
				end: false,
			},
			location.pathname
		);
		if (spaceMatch?.params.spaceIdOrAlias) {
			navigate(getSpacePath(spaceMatch.params.spaceIdOrAlias));
			return;
		}
		if (
			matchPath(
				{
					path: EXPLORE_PATH,
					caseSensitive: true,
					end: false,
				},
				location.pathname
			)
		) {
			navigate(getExplorePath());
			return;
		}
		if (
			matchPath(
				{
					path: INBOX_PATH,
					caseSensitive: true,
					end: false,
				},
				location.pathname
			)
		) {
			navigate(getInboxPath());
		}
	}, [navigate, location]);

	return goBack;
}