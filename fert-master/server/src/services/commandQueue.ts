import { Request, Response } from 'express';
import logger from '../config/logger';

/**
 * In-memory command queue — no MongoDB involved.
 * Used for local deployments where instant relay response is needed.
 *
 * Flow:
 *   1. ESP32 connects with GET /api/device/command/wait (long-poll, 25s hold)
 *   2. Button pressed → deliverCommand() called
 *   3a. If ESP32 is waiting → respond immediately (0ms delay)
 *   3b. If ESP32 is not connected yet → enqueue it, deliver on next poll
 *
 * Commands are held in a FIFO per device so rapid presses don't drop each other.
 */

type Command = Record<string, unknown>;

// Queued commands waiting for an ESP32 to connect (FIFO per device).
const pendingCommands = new Map<string, Command[]>();

// ESP32 connections currently held open waiting for a command (one per device).
const waitingClients = new Map<string, Response>();

/**
 * Consume the head of a device's queue without waiting for a long-poll.
 * Used to piggyback commands onto the regular telemetry upload response.
 * Returns the command and removes it from the queue, or null if empty.
 */
export function consumeCommand(probeUuid: string): Command | null {
  const queue = pendingCommands.get(probeUuid);
  if (!queue || queue.length === 0) return null;
  const cmd = queue.shift()!;
  if (queue.length === 0) pendingCommands.delete(probeUuid);
  logger.info(`Command consumed via upload piggyback for ${probeUuid}: ${JSON.stringify(cmd)}`);
  return cmd;
}

/**
 * Returns the head of the device's queue without removing it, or null.
 */
export function getPendingCommand(probeUuid: string): Command | null {
  const queue = pendingCommands.get(probeUuid);
  return queue && queue.length > 0 ? queue[0] : null;
}

/**
 * Deliver a command to the ESP32.
 * Returns true if the ESP32 was already waiting and got it instantly.
 * Returns false if it was queued for the next poll.
 */
export function deliverCommand(probeUuid: string, command: Command): boolean {
  const waiting = waitingClients.get(probeUuid);
  if (waiting) {
    logger.info(`Command delivered instantly to waiting ESP32 ${probeUuid}: ${JSON.stringify(command)}`);
    waitingClients.delete(probeUuid);
    waiting.json(command);
    return true;
  }
  logger.info(`ESP32 ${probeUuid} not connected — command queued: ${JSON.stringify(command)}`);
  const queue = pendingCommands.get(probeUuid);
  if (queue) queue.push(command);
  else pendingCommands.set(probeUuid, [command]);
  return false;
}

/**
 * Called by the long-poll endpoint.
 * If a command is already queued, resolves immediately with the head.
 * Otherwise holds `res` open for up to `timeoutMs` ms, then sends 204.
 *
 * If this device already had a long-poll open, that previous response is ended
 * with 204 so its socket isn't left hanging for the full timeout.
 */
export function waitForCommand(
  probeUuid: string,
  res: Response,
  req: Request,
  timeoutMs = 25000
): void {
  // Command already queued — deliver the head immediately, leave the rest queued.
  const queued = consumeCommand(probeUuid);
  if (queued) {
    logger.info(`Queued command delivered to ESP32 ${probeUuid} on connect: ${JSON.stringify(queued)}`);
    res.json(queued);
    return;
  }

  // If a previous long-poll is still held open, release it before we take the slot.
  const previous = waitingClients.get(probeUuid);
  if (previous) {
    waitingClients.delete(probeUuid);
    if (!previous.headersSent) previous.status(204).end();
  }

  // Hold the connection open for the next command.
  waitingClients.set(probeUuid, res);

  const timer = setTimeout(() => {
    if (waitingClients.get(probeUuid) === res) {
      waitingClients.delete(probeUuid);
      res.status(204).end();
    }
  }, timeoutMs);

  // Clean up if ESP32 disconnects early.
  req.on('close', () => {
    clearTimeout(timer);
    if (waitingClients.get(probeUuid) === res) {
      waitingClients.delete(probeUuid);
    }
  });
}
