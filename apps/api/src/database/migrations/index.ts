import { Connection } from 'mariadb';

export interface Migration {
  version: string;
  description: string;
  up: (conn: Connection) => Promise<void>;
}

import { up as usersIdentity } from './001_users_identity';
import { up as logsActivity } from './002_logs_activity';

export const MIGRATIONS: Migration[] = [
  {
    version: '001_users_identity',
    description: 'Susun ulang tabel users (public_id, is_admin, CHECK constraint)',
    up: usersIdentity,
  },
  {
    version: '002_logs_activity',
    description: 'Buat tabel logs_activity untuk aktivitas, audit, error, dan payload quiz',
    up: logsActivity,
  },
];
