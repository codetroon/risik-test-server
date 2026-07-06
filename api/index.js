// Vercel serverless entry point.
//
// Vercel runs this file as a single Node function and routes every request to
// it (see the rewrite in vercel.json). The Express `app` is a valid request
// handler, so we just export it — there is NO `app.listen()` here (that only
// runs for the traditional `npm start` server in src/server.ts).
//
// The app is compiled to dist/ by `npm run build` (prisma generate + tsc).
import { app } from "../dist/app.js";

export default app;
