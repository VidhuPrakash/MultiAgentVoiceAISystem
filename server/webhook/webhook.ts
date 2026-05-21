import { eq } from "drizzle-orm";
import { Request, Response, Router } from "express";
import { db } from "../db";
import { calls, users } from "../db/schema";

const router = Router();

router.post("/vapi", async (req: Request, res: Response) => {
  const { message } = req.body;

  if (message.type === "call-started") {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.vapiPhoneNumberId, message.call.phoneNumberId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found for this phone number" });
      return;
    }

    await db.insert(calls).values({
      userId: user.id,
      vapiCallId: message.call.id,
      callerNumber: message.call.customer?.number,
      status: "in-progress",
      startedAt: new Date(),
    });
  }

  if (message.type === "end-of-call-report") {
    await db
      .update(calls)
      .set({
        status: "completed",
        duration: message.durationSeconds,
        transcript: message.transcript,
        recordingUrl: message.recordingUrl,
        endedAt: new Date(),
      })
      .where(eq(calls.vapiCallId, message.call.id));
  }

  res.json({ ok: true });
});

export default router;
