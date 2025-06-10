import axios from "axios";
import { JSDOM } from "jsdom";
import { config } from "./config";
import { setupDatabase, updateEggStatus, closeConnection } from "./database";

async function authenticate(): Promise<string> {
  try {
    const axiosInstance = axios.create({
      withCredentials: true,
      timeout: 30000,
      headers: {
        "User-Agent": "EggNetMonitor/1.0",
      },
    });

    // Login to KoL
    await axiosInstance.post(
      `${config.website}/login.php`,
      new URLSearchParams({
        loggingin: "Yup.",
        loginname: config.kol.username,
        password: config.kol.password,
        secure: "0",
        submitbutton: "Log In",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // Navigate to DNA lab
    await axiosInstance.get(
      `${config.website}/place.php?whichplace=town_right&action=townright_dna`,
    );

    // Get the choice page with egg data
    const response = await axiosInstance.get(
      `${config.website}/choice.php?forceoption=0`,
    );

    return response.data;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw new Error("Failed to authenticate with KoL");
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
  try {
    console.log("Starting EggNet update process...");

    // Validate configuration
    if (!config.kol.username || !config.kol.password) {
      throw new Error(
        "KOL_USERNAME and KOL_PASSWORD environment variables must be set",
      );
    }

    // Setup database
    await setupDatabase();
    console.log("Database setup completed");

    // Authenticate and get data
    console.log("Authenticating with KoL...");
    const html = await authenticate();

    // Process the data
    console.log("Processing egg data...");
    await processEggData(html);

    console.log("Update process completed successfully");
  } catch (error) {
    console.error("Update process failed:", error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  runUpdate()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Update failed:", error);
      process.exit(1);
    });
}

export { runUpdate };
