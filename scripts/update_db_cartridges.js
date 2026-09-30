import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('himawari.db');
db.exec(`
  UPDATE rom_library SET cartridge_art = 'ROMS/cartridges/cd_disc.svg' WHERE system_id = 'ps1';
  UPDATE rom_library SET cartridge_art = 'ROMS/cartridges/cart_snes.svg' WHERE system_id = 'snes';
  UPDATE rom_library SET cartridge_art = 'ROMS/cartridges/cart_genesis.svg' WHERE system_id = 'genesis';
  UPDATE rom_library SET cartridge_art = 'ROMS/cartridges/cart_sms.svg' WHERE system_id = 'sms';
`);

const count = db.prepare('SELECT COUNT(*) as c FROM rom_library').get().c;
console.log('Successfully updated cartridge_art for all ROMs in DB! Total ROMs:', count);
