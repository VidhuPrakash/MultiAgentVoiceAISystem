import "dotenv/config";

import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../db";
import { agents, calls, leads, users } from "../db/schema";

export async function seedDummyData() {
  const seedEmail = process.env.SEED_USER_EMAIL;

  if (!seedEmail) {
    throw new Error("SEED_USER_EMAIL missing in .env");
  }

  console.log(`Finding user: ${seedEmail}`);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, seedEmail))
    .limit(1);

  if (!user) {
    throw new Error(`User not found: ${seedEmail}`);
  }

  console.log(`Found user: ${user.name}`);

  // Optional: clear old seeded data
  const existingAgents = await db
    .select({ id: agents.id })
    .from(agents)
    .where(eq(agents.userId, user.id));

  const agentIds = existingAgents.map((a) => a.id);

  if (agentIds.length) {
    await db.delete(leads);
    await db.delete(calls);
    await db.delete(agents).where(eq(agents.userId, user.id));
  }

  // --------------------------------------------------
  // AGENTS
  // --------------------------------------------------

  const insertedAgents = await db
    .insert(agents)
    .values([
      {
        userId: user.id,
        vapiAssistantId: randomUUID(),
        name: "Clinic Receptionist",
        type: "receptionist",
        systemPrompt: "Handle clinic calls",
        firstMessage: "Welcome to our clinic",
      },
      {
        userId: user.id,
        vapiAssistantId: randomUUID(),
        name: "Appointment Assistant",
        type: "appointment",
        systemPrompt: "Schedule appointments",
        firstMessage: "How may I help you today?",
      },
      {
        userId: user.id,
        vapiAssistantId: randomUUID(),
        name: "FAQ Assistant",
        type: "faq",
        systemPrompt: "Answer FAQs",
        firstMessage: "Ask me anything",
      },
    ])
    .returning();

  console.log(`Inserted ${insertedAgents.length} agents`);

  // --------------------------------------------------
  // CALLS
  // --------------------------------------------------

  const insertedCalls = await db
    .insert(calls)
    .values([
      {
        userId: user.id,
        agentId: insertedAgents[0].id,
        vapiCallId: randomUUID(),
        status: "completed",
        callerNumber: "+15551234567",
        duration: 183,
        recordingUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        transcript: "Agent: Hello\nCaller: Need appointment tomorrow",
        startedAt: new Date(),
        endedAt: new Date(),
      },

      {
        userId: user.id,
        agentId: insertedAgents[1].id,
        vapiCallId: randomUUID(),
        status: "missed",
        callerNumber: "+15559876543",
        duration: 0,
        startedAt: new Date(),
      },

      {
        userId: user.id,
        agentId: insertedAgents[2].id,
        vapiCallId: randomUUID(),
        status: "failed",
        callerNumber: "+15557778888",
        duration: 0,
        startedAt: new Date(),
      },

      {
        userId: user.id,
        agentId: insertedAgents[0].id,
        vapiCallId: randomUUID(),
        status: "completed",
        callerNumber: "+15554445555",
        duration: 220,
        recordingUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        transcript: "Agent: Welcome\nCaller: I need consultation",
        startedAt: new Date(),
        endedAt: new Date(),
      },
    ])
    .returning();

  console.log(`Inserted ${insertedCalls.length} calls`);

  // --------------------------------------------------
  // LEADS
  // --------------------------------------------------

  await db.insert(leads).values([
    {
      userId: user.id,
      callId: insertedCalls[0].id,
      name: "John Smith",
      phone: "+15551234567",
      purpose: "appointment booking",
      service: "general consultation",
      appointmentDate: "Friday morning",
    },

    {
      userId: user.id,
      callId: insertedCalls[1].id,
      name: "Sarah Johnson",
      phone: "+15559876543",
      purpose: "support request",
      service: "customer support",
      appointmentDate: null,
    },

    {
      userId: user.id,
      callId: insertedCalls[2].id,
      name: "Michael Brown",
      phone: "+15557778888",
      purpose: "faq inquiry",
      service: "pricing",
      appointmentDate: null,
    },

    {
      userId: user.id,
      callId: insertedCalls[3].id,
      name: "Emma Wilson",
      phone: "+15554445555",
      purpose: "appointment booking",
      service: "specialist consultation",
      appointmentDate: "Monday afternoon",
    },
  ]);

  console.log("Leads inserted");
  console.log("Seed complete");
}
