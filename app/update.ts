import { JSDOM } from "jsdom";
import { Client } from "kol.js";
import * as url from "node:url";

import { prisma } from "./database.js";

async function fetchDnaLab(): Promise<string> {
  const client = new Client(
    process.env.KOL_USERNAME!,
    process.env.KOL_PASSWORD!,
  );
  await client.fetchText(
    "place.php?whichplace=town_right&action=townright_dna",
  );
  return await client.fetchText("choice.php?forceoption=0");
}

async function updateEggStatus(monster_id: number, eggs_donated: number): Promise<void> {
  await prisma.$transaction([
    prisma.eggnetMonitor.upsert({
      where: { monster_id },
      update: { eggs_donated },
      create: {
        monster_id,
        eggs_donated,
      },
    }),
    prisma.eggnetMonitorHistory.create({
      data: {
        monster_id,
        eggs_donated,
      },
    }),
  ]);

  if (eggs_donated === 100) {
    const previous = await prisma.eggnetMonitorHistory.findFirst({
      where: { monster_id },
      orderBy: { timestamp: "desc" },
      skip: 1,
    });

    if (!previous) {
      // Technically discovered but highly suspicious, probable data wipe
      return;
    }

    if (previous?.eggs_donated === 100) {
      // Was already complete before this scan
      return;
    }

    try {
      const result = await fetch(
        `https://oaf.loathers.net/webhooks/eggnet?token=${process.env.OAF_TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ monsterId: monster_id }),
        },
      );
      if (!result.ok) {
        console.warn(
          "OAF webhook error",
          result.status,
          ":",
          result.statusText,
          await result.text(),
        );
      }
    } catch (error) {
      console.warn("OAF webhook error", error);
    }
  }
}

async function processEggData(html: string): Promise<void> {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const forms = document.getElementsByTagName("form");
    if (forms.length === 0) {
      throw new Error("No forms found in the page");
    }

    const form = forms[0];
    const options = form.getElementsByTagName("option");

    const updates: Array<{ monster_id: number; eggs_donated: number }> = [];

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const value = option.getAttribute("value");

      if (!value || value === "") {
        continue;
      }

      const monster_id = parseInt(value, 10);
      if (isNaN(monster_id)) {
        continue;
      }

      const isCompleted = !option.hasAttribute("disabled");
      let eggs_donated = 100;

      if (!isCompleted) {
        const optionText = option.textContent || "";
        const lastBracketPos = optionText.lastIndexOf("(");

        if (lastBracketPos !== -1) {
          const bracketContent = optionText.substring(lastBracketPos);
          const numberMatch = bracketContent.match(/(\d+)/);
          if (numberMatch) {
            const remainingEggs = parseInt(numberMatch[1], 10);
            eggs_donated = 100 - remainingEggs;
          }
        }
      }

      updates.push({ monster_id, eggs_donated });
    }

    console.log(`Found ${updates.length} monsters to update`);

    // Update database
    for (const update of updates) {
      await updateEggStatus(update.monster_id, update.eggs_donated);
    }

    console.log("Database update completed successfully");
  } catch (error) {
    console.error("Error processing egg data:", error);
    throw error;
  }
}

async function runUpdate(): Promise<void> {
  console.log("Starting EggNet update process...");

  // Validate configuration
  if (!process.env.KOL_USERNAME || !process.env.KOL_PASSWORD) {
    throw new Error(
      "KOL_USERNAME and KOL_PASSWORD environment variables must be set",
    );
  }

  // Authenticate and get data
  console.log("Authenticating with KoL...");
  const html = await fetchDnaLab();

  // Process the data
  console.log("Processing egg data...");
  await processEggData(html);

  console.log("Update process completed successfully");
}

// Run the update if this script is executed directly
if (import.meta.url.startsWith("file:")) {
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    runUpdate();
  }
}
