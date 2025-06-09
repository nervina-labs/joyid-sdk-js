import { sql } from '@vercel/postgres'
import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'

// Initialize database in /tmp directory for serverless environment
const dbPath = path.join('/tmp', 'devices.db')
console.log('Attempting to create database at:', dbPath)

// Ensure /tmp directory exists and is writable
try {
  if (!fs.existsSync('/tmp')) {
    console.log('Creating /tmp directory')
    fs.mkdirSync('/tmp', { recursive: true })
  }

  // Test write permissions
  const testFile = path.join('/tmp', 'test.txt')
  fs.writeFileSync(testFile, 'test')
  fs.unlinkSync(testFile)
  console.log('Write permissions confirmed')
} catch (error) {
  console.error('Directory setup error:', error)
  throw error
}

let db: Database.Database
try {
  db = new Database(dbPath)
  console.log('Database connection successful')

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS device_registrations (
      serial_number TEXT PRIMARY KEY,
      device_id TEXT,
      push_token TEXT,
      pass_type_id TEXT,
      campaign TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('Tables created successfully')
} catch (error) {
  console.error('Database initialization error:', error)
  throw error
}

// Prepare statements
const insertCampaign = db.prepare(`
  INSERT INTO device_registrations (serial_number, campaign)
  VALUES (@serialNumber, @campaign)
  ON CONFLICT(serial_number) DO UPDATE SET
    campaign = @campaign,
    updated_at = CURRENT_TIMESTAMP
`)

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

// How to convert the interface?
export function getCardDetails(serialNumber: string): CardDetails | null {
  console.log('Searching for serial number:', serialNumber)
  const result = getRegistration.get(serialNumber)
  console.log('Query result:', result)
  if (!result) {
    //display full table contents
    const allResults = db.prepare(`
      SELECT * FROM device_registrations
    `).all()
    console.log('All records in table:', allResults)
    return null
  }

  // Map database columns to interface properties
  return {
    serialNumber: result.serial_number,
    campaign: result.campaign,
    deviceId: result.device_id,
    pushToken: result.push_token,
    passTypeId: result.pass_type_id,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}
