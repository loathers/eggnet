import { parse } from "node-html-parser";
import { Client } from "kol.js";
import * as url from "node:url";

import { db, refreshEggnetHistory } from "./database.js";

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

async function tellOaf(monsterId: number) {
  if (!process.env.OAF_TOKEN) return;
  try {
    const result = await fetch(
      `https://oaf.loathers.net/webhooks/eggnet?token=${process.env.OAF_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ monsterId }),
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

async function updateEggStatus(
  monster_id: number,
  eggs_donated: number,
): Promise<void> {
  const result = await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("EggnetMonitor")
      .values({ monster_id, eggs_donated })
      .onConflict((oc) =>
        oc
          .column("monster_id")
          .doUpdateSet({ eggs_donated, last_update: new Date() }),
      )
      .execute();

    const historyResult = await trx
      .insertInto("EggnetMonitorHistory")
      .values({ monster_id, eggs_donated })
      .onConflict((oc) =>
        oc.columns(["monster_id", "eggs_donated"]).doNothing(),
      )
      .executeTakeFirst();

    return historyResult.numInsertedOrUpdatedRows ?? 0n;
  });

  // If we just successfully inserted a 100th egg donation, and we previously had an entry for this monster, tell OAF
  if (result > 0n && eggs_donated === 100) {
    const hasHistory = await db
      .selectFrom("EggnetMonitorHistory")
      .select("id")
      .where("monster_id", "=", monster_id)
      .where("eggs_donated", "<", 100)
      .limit(1)
      .executeTakeFirst();

    if (hasHistory) await tellOaf(monster_id);
  }
}

async function processEggData(html: string): Promise<void> {
  try {
    const root = parse(html);

    const form = root.querySelector("form");
    if (!form) {
      console.error("Received HTML:", html);
      throw new Error("No forms found in the page");
    }

    const options = form.querySelectorAll("option");

    const updates: Array<{ monster_id: number; eggs_donated: number }> = [];

    for (const option of options) {
      const value = option.getAttribute("value");

      if (!value || value === "") {
        continue;
      }

      const monster_id = parseInt(value, 10);
      if (isNaN(monster_id)) {
        console.error(`Invalid monster id value (${value}), skipping`);
        continue;
      }

      const isCompleted = !option.hasAttribute("disabled");

      if (isCompleted) {
        updates.push({ monster_id, eggs_donated: 100 });
        continue;
      }

      const optionText = option.textContent || "";
      const lastBracketPos = optionText.lastIndexOf("(");

      if (lastBracketPos < 0) {
        console.error(
          `Monster ${monster_id} is formatted weirdly (no bracket), skipping`,
        );
        continue;
      }

      const bracketContent = optionText.substring(lastBracketPos);
      const numberMatch = bracketContent.match(/(\d+)/);

      if (!numberMatch) {
        console.error(
          `Monster ${monster_id} is formatted weirdly (no number), skipping`,
        );
        continue;
      }

      const remainingEggs = parseInt(numberMatch[1], 10);
      updates.push({ monster_id, eggs_donated: 100 - remainingEggs });
    }

    console.log(`Found ${updates.length} monsters to update`);

    // Update database
    for (const update of updates) {
      await updateEggStatus(update.monster_id, update.eggs_donated);
    }

    // Refresh the materialized view after updates
    console.log("Refreshing materialized view...");
    await refreshEggnetHistory();

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
