import Database from 'better-sqlite3'
import path from 'path'

// Initialize database
const db = new Database(path.join(process.cwd(), 'devices.db'))

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS device_registrations (
    serial_number TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    push_token TEXT NOT NULL,
    pass_type_id TEXT NOT NULL,
    campaign TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

const insertCampaign = db.prepare(`
  INSERT INTO device_registrations (serial_number, campaign)
  VALUES (@serial_number, @campaign)
  ON CONFLICT(serial_number) DO UPDATE SET
    campaign = @campaign,
    updated_at = CURRENT_TIMESTAMP
`)

// Prepare statements
const insertRegistration = db.prepare(`
  INSERT INTO device_registrations (serial_number, device_id, push_token, pass_type_id)
  VALUES (@serialNumber, @deviceId, @pushToken, @passTypeId)
  ON CONFLICT(serial_number) DO UPDATE SET
    device_id = @deviceId,
    push_token = @pushToken,
    pass_type_id = @passTypeId,
    updated_at = CURRENT_TIMESTAMP
`)

const getRegistration = db.prepare(`
  SELECT * FROM device_registrations WHERE serial_number = ?
`)

export interface CardDetails {
  serialNumber: string
  campaign: string
  deviceId: string
  pushToken: string
  passTypeId: string
  createdAt: string
  updatedAt: string
}

export function storeCampaign(serialNumber: string, campaign: string): void {
  insertCampaign.run({
    serialNumber,
    campaign,
  })
}

export function storeRegistration(
  serialNumber: string,
  deviceId: string,
  pushToken: string,
  passTypeId: string
): void {
  insertRegistration.run({
    serialNumber,
    deviceId,
    pushToken,
    passTypeId,
  })
}

export function getCardDetails(serialNumber: string): CardDetails | null {
  const result = getRegistration.get(serialNumber)
  return result || null
} 