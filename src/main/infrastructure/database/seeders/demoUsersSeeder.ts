import bcrypt from 'bcryptjs';
import type { Database } from 'better-sqlite3';
import { logger } from '../../logging/SafeLogger';

const PASSWORD_SALT_ROUNDS = 10;
const DEMO_PASSWORD = '123456';

const demoUsers = [
  {
    rfc: 'MORV900101AA1',
    firstName: 'Valeria',
    lastName: 'Morales',
    maternalLastName: 'Ruiz',
    employeeId: 'V-001',
    employeeKey: 'V-001',
    initials: 'VMR',
    address: 'Av. Central 100, Veracruz, Veracruz',
    email: 'valeria.morales@simar.com'
  },
  {
    rfc: 'HELV900202BB2',
    firstName: 'Victor',
    lastName: 'Hernandez',
    maternalLastName: 'Lopez',
    employeeId: 'V-002',
    employeeKey: 'V-002',
    initials: 'VHL',
    address: 'Calle Norte 205, Boca del Rio, Veracruz',
    email: 'victor.hernandez@simar.com'
  },
  {
    rfc: 'OEDV900303CC3',
    firstName: 'Vanessa',
    lastName: 'Ortega',
    maternalLastName: 'Diaz',
    employeeId: 'V-003',
    employeeKey: 'V-003',
    initials: 'VOD',
    address: 'Blvd. Comercial 330, Xalapa, Veracruz',
    email: 'vanessa.ortega@simar.com'
  }
];

export const runDemoUsersSeeder = (db: Database) => {
  const insertUser = db.prepare(`
    INSERT INTO users (
      rfc, first_name, last_name, maternal_last_name, full_name, central_id,
      employee_key, initials, address, email, password_hash, role, is_active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sales', 1)
  `);

  const exists = db.prepare(`SELECT id FROM users WHERE central_id = ? OR email = ? LIMIT 1`);
  let insertedCount = 0;

  demoUsers.forEach((user) => {
    if (exists.get(user.employeeId, user.email)) return;

    const fullName = [user.firstName, user.lastName, user.maternalLastName].join(' ');
    const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, PASSWORD_SALT_ROUNDS);

    insertUser.run(
      user.rfc,
      user.firstName,
      user.lastName,
      user.maternalLastName,
      fullName,
      user.employeeId,
      user.employeeKey,
      user.initials,
      user.address,
      user.email,
      passwordHash
    );
    insertedCount += 1;
  });

  if (insertedCount > 0) {
    logger.warn('Sembrando usuarios demo de ventas', { insertedCount });
  }
};
