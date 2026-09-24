import {
  deliverCommand,
  consumeCommand,
  getPendingCommand,
  waitForCommand,
} from '../services/commandQueue';
import { Response } from 'express';

// Reset the queue state before each test
beforeEach(() => {
  // Command queue exports no 'clear' function, so we consume until empty
  const clearDevice = (uuid: string) => {
    while (consumeCommand(uuid)) {}
  };
  clearDevice('test-device');
  clearDevice('device-a');
  clearDevice('device-b');
});

describe('commandQueue', () => {
  it('deliverCommand enqueues when no client waiting', () => {
    const delivered = deliverCommand('test-device', { relay: 'on' });
    expect(delivered).toBe(false); // false means it was queued
    
    const pending = getPendingCommand('test-device');
    expect(pending).toEqual({ relay: 'on' });
  });

  it('consumeCommand dequeues FIFO', () => {
    deliverCommand('test-device', { relay: 'on' });
    deliverCommand('test-device', { pump: true });

    const first = consumeCommand('test-device');
    expect(first).toEqual({ relay: 'on' });

    const second = consumeCommand('test-device');
    expect(second).toEqual({ pump: true });

    const third = consumeCommand('test-device');
    expect(third).toBeNull();
  });

  it('consumeCommand returns null on empty queue', () => {
    const cmd = consumeCommand('empty-device');
    expect(cmd).toBeNull();
  });

  it('commands are per-device isolated', () => {
    deliverCommand('device-a', { relay: 'on' });
    deliverCommand('device-b', { pump: true });

    expect(consumeCommand('device-a')).toEqual({ relay: 'on' });
    expect(consumeCommand('device-a')).toBeNull();

    expect(consumeCommand('device-b')).toEqual({ pump: true });
    expect(consumeCommand('device-b')).toBeNull();
  });

  it('waitForCommand drains head if queue non-empty', () => {
    deliverCommand('test-device', { relay: 'on' });

    const mockRes = {
      json: jest.fn(),
      on: jest.fn(),
    } as unknown as Response;

    const mockReq = {
      on: jest.fn(),
    } as any;

    waitForCommand('test-device', mockRes, mockReq, 1000);

    expect(mockRes.json).toHaveBeenCalledWith({ relay: 'on' });
    expect(getPendingCommand('test-device')).toBeNull(); // consumed
  });

  it('deliverCommand responds to waiting client immediately', () => {
    const mockRes = {
      json: jest.fn(),
      on: jest.fn(),
    } as unknown as Response;

    const mockReq = {
      on: jest.fn(),
    } as any;

    // Start waiting
    waitForCommand('test-device', mockRes, mockReq, 5000);

    // Deliver command
    const delivered = deliverCommand('test-device', { relay: 'off' });
    
    expect(delivered).toBe(true); // true means delivered instantly
    expect(mockRes.json).toHaveBeenCalledWith({ relay: 'off' });
    expect(getPendingCommand('test-device')).toBeNull();
  });
});
