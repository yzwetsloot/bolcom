import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

export const readLines = (path: string): string[] => {
  return fs
    .readFileSync(path, 'utf8')
    .toString()
    .split('\n')
    .filter((line) => line)
}

export const delay = async (ms: number = 1000) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const getRandomEntry = (items: any[]): any => {
  return items[(items.length * Math.random()) | 0]
}

export const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

export const round = (value: number): number => {
  // round to 2 decimal places
  return Math.round(value * 100) / 100
}

const tempDir = os.tmpdir()

export const getTempPath = (filename): string => {
  const tempPath = path.join(tempDir, filename)
  return tempPath
}

export const generateUUID = (): string => {
  return crypto.randomUUID()
}
