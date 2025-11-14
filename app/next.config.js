/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import nextPWA from "next-pwa";

/** @type {import("next").NextConfig} */
const baseConfig = {};

const withPWA = nextPWA({
	register: true,
	skipWaiting: true,
	dest: "public",
});

export default withPWA(baseConfig);
