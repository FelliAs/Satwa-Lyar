import { Connection } from 'mariadb';

export const tableExists = async (conn: Connection, table: string): Promise<boolean> => {
  const rows = await conn.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return Number((rows as any[])[0].total) > 0;
};

export const columnExists = async (
  conn: Connection,
  table: string,
  column: string
): Promise<boolean> => {
  const rows = await conn.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number((rows as any[])[0].total) > 0;
};

export const indexExists = async (
  conn: Connection,
  table: string,
  index: string
): Promise<boolean> => {
  const rows = await conn.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [table, index]
  );
  return Number((rows as any[])[0].total) > 0;
};

export const checkConstraintExists = async (
  conn: Connection,
  table: string,
  constraint: string
): Promise<boolean> => {
  const rows = await conn.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.TABLE_CONSTRAINTS
     WHERE CONSTRAINT_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND CONSTRAINT_NAME = ?
       AND CONSTRAINT_TYPE = 'CHECK'`,
    [table, constraint]
  );
  return Number((rows as any[])[0].total) > 0;
};

export const foreignKeyExists = async (
  conn: Connection,
  table: string,
  column: string,
  referencedTable: string
): Promise<boolean> => {
  const rows = await conn.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
       AND REFERENCED_TABLE_NAME = ?`,
    [table, column, referencedTable]
  );
  return Number((rows as any[])[0].total) > 0;
};
