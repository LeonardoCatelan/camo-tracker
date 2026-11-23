/** Liveness probe for monitoring and deploy checks. */
export function GET() {
  return Response.json({ status: "ok" });
}
