import { data } from "react-router";
import { getEggStatus } from "~/database.js";

export async function loader() {
  try {
    return await getEggStatus();
  } catch (error) {
    console.error("Error fetching egg status:", error);
    return data({ error: "Internal server error" }, 500);
  }
}
