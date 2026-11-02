import { describe, it } from 'node:test';
import assert from 'node:assert';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, GameStatePublic, ServerToClientEvents, Card } from '../../shared/types';

describe('Multiplayer WebSocket Real-Time Integration Test', () => {
  it('should connect to server, create room, fill with bots, and deal 13 cards', async () => {
    const client: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3001', {
      auth: {
        playerId: 'test-user-1',
        playerName: 'Test Player',
        avatar: '♠️',
      },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
      client.on('connect', () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    assert.ok(client.connected, 'Socket client is connected');

    // Create room with bot fill
    const roomStatePromise = new Promise<GameStatePublic>((resolve) => {
      client.once('room_state', (state) => {
        resolve(state);
      });
    });

    client.emit('create_room', {
      roomName: 'Automated Test Table',
      playerName: 'Test Player',
      avatar: '♠️',
      fillBots: true,
    });

    try {
      const roomState = await roomStatePromise;
      console.log('Received roomState:', JSON.stringify(roomState, null, 2));
      assert.strictEqual(roomState.roomName, 'Automated Test Table');
      assert.strictEqual(roomState.players.length, 4);
      assert.strictEqual(roomState.status, 'WAITING');

      const playingStatePromise = new Promise<GameStatePublic>((resolve) => {
        client.on('room_state', (state) => {
          if (state.status === 'PLAYING') {
            resolve(state);
          }
        });
      });

      const handPromise = new Promise<Card[]>((resolve) => {
        client.once('your_hand', (hand) => {
          resolve(hand);
        });
      });

      client.emit('start_game');

      const playingState = await playingStatePromise;
      const myHand = await handPromise;

      assert.strictEqual(playingState.status, 'PLAYING');
      assert.strictEqual(myHand.length, 13, 'Player hand must have exactly 13 cards');
      assert.strictEqual(playingState.isFirstTrickOfGame, true, 'First trick of game must be marked');

      const occupiedSeats = playingState.players.filter((p) => p !== null);
      assert.strictEqual(occupiedSeats.length, 4, 'All 4 seats must be occupied');
    } catch (err) {
      console.error('TEST ERROR CAUGHT:', err);
      throw err;
    } finally {
      client.disconnect();
    }
  });
});
