import { Response } from 'express';
import logger from '../config/logger';

/**
 * In-memory command queue — no MongoDB involved.
 * Used for local deployments where instant relay response is needed.
 *
 * Flow:
 *   1. ESP32 connects with GET /api/device/command/wait (long-poll, 25s hold)
 *   2. Button pressed → deliverCommand() called
 *   3a. If ESP32 is waiting → respond immediately (0ms delay)
 *   3b. If ESP32 is not connected yet → queue it, deliver on next poll
 */

// Command queued but no ESP32 connected yet
const pendingCommands = new Map<string, Record<string, unknown>>();

// ESP32 connections currently held open waiting for a command
const waitingClients = new Map<string, Response>();

/**
 * Consume a queued command without waiting for a long-poll connection.
 * Used to piggyback commands onto the regular telemetry upload response.
 * Returns the command and removes it from the queue, or null if nothing pending.
 */
export function consumeCommand(probeUuid: string): Record<string, unknown> | null {
  const cmd = pendingCommands.get(probeUuid);
  if (!cmd) return null;
  pendingCommands.delete(probeUuid);
  logger.info(`Command consumed via upload piggyback for ${probeUuid}: ${JSON.stringify(cmd)}`);
  return cmd;
}

/**
 * Deliver a command to the ESP32.
 * Returns true if the ESP32 was already waiting and got it instantly.
 * Returns false if it was queued for the next poll.
 */
export function deliverCommand(probeUuid: string, command: Record<string, unknown>): boolean {
  const waiting = waitingClients.get(probeUuid);
  if (waiting) {
    logger.info(`Command delivered instantly to waiting ESP32 ${probeUuid}: ${JSON.stringify(command)}`);
    waitingClients.delete(probeUuid);
    waiting.json(command);
    return true;
  }
  logger.info(`ESP32 ${probeUuid} not connected — command queued: ${JSON.stringify(command)}`);
  pendingCommands.set(probeUuid, command);
  return false;
}

/**
 * Called by the long-poll endpoint.
 * If a command is already queued, resolves immediately.
 * Otherwise holds `res` open for up to `timeoutMs` ms, then sends 204.
 */
export function waitForCommand(
  probeUuid: string,
  res: Response,
  req: import('express').Request,
  timeoutMs = 25000
): void {
  // Command already queued — deliver immediately
  const queued = pendingCommands.get(probeUuid);
  if (queued) {
    logger.info(`Queued command delivered to ESP32 ${probeUuid} on connect: ${JSON.stringify(queued)}`);
    pendingCommands.delete(probeUuid);
    res.json(queued);
    return;
  }

  // Hold the connection open
  waitingClients.set(probeUuid, res);

  const timer = setTimeout(() => {
    if (waitingClients.get(probeUuid) === res) {
      waitingClients.delete(probeUuid);
      res.status(204).end();
    }
  }, timeoutMs);

  // Clean up if ESP32 disconnects early
  req.on('close', () => {
    clearTimeout(timer);
    if (waitingClients.get(probeUuid) === res) {
      waitingClients.delete(probeUuid);
    }
  });
}
