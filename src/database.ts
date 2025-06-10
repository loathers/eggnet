import mysql from "mysql2/promise";
import { config } from "./config";

export interface EggnetMonitorRow {
  monster_id: number;
  eggs_donated: number;
  last_update: Date;
}

export interface EggnetMonitorHistoryRow {
  monster_id: number;
  eggs_donated: number;
  timestamp: Date;
}

let pool: mysql.Pool | null = null;

export function createConnectionPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: config.database.host,
      user: config.database.username,
      password: config.database.password,
      database: config.database.name,
      charset: "utf8mb4",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function setupDatabase(): Promise<void> {
  const connection = createConnectionPool();

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS \`eggnet_monitor\` (
      \`monster_id\` int(11) NOT NULL,
      \`eggs_donated\` tinyint(4) NOT NULL DEFAULT '0',
      \`last_update\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`monster_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS \`eggnet_monitor_history\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`monster_id\` int(11) NOT NULL,
      \`eggs_donated\` tinyint(4) NOT NULL DEFAULT '0',
      \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`monster_id\` (\`monster_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function getEggStatus(): Promise<{
  last_update: number;
  eggs: Record<number, number>;
}> {
  const connection = createConnectionPool();
  const [rows] = (await connection.execute(
    "SELECT * FROM `eggnet_monitor`",
  )) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

  let last_update_ts = 0;
  const data: Record<number, number> = {};

  for (const row of rows) {
    const last_update_date = new Date(row.last_update);
    last_update_ts = Math.max(
      last_update_ts,
      Math.floor(last_update_date.getTime() / 1000),
    );
    data[row.monster_id] = row.eggs_donated;
  }

  return { last_update: last_update_ts, eggs: data };
}

export async function updateEggStatus(
  monster_id: number,
  eggs_donated: number,
): Promise<void> {
  const connection = createConnectionPool();

  // Replace into monitor table (equivalent to PHP's REPLACE INTO)
  await connection.execute(
    "REPLACE INTO `eggnet_monitor` (monster_id, eggs_donated) VALUES (?, ?)",
    [monster_id, eggs_donated],
  );

  // Insert into history table
  await connection.execute(
    "INSERT INTO `eggnet_monitor_history` (monster_id, eggs_donated) VALUES (?, ?)",
    [monster_id, eggs_donated],
  );
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
