import React, { useState, useEffect, useRef } from 'react';
import { GameMode, GameStatus, Player, ActiveTodState, GameLogEntry, TodCard, TodType, LADDERS, SNAKES, PLAYER_PRESETS, RoomState, drawUniqueTodCard } from '../types/game';
import { soundFX, fireVictoryConfetti, fireDareCelebrationConfetti, fireTruthSparkleConfetti } from '../utils/sound';

function createLocalLog(playerName: string, playerColor: string, message: string, type: GameLogEntry['type']): GameLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toTimeString().slice(0, 5),
    playerName,
    playerColor,
    message,
    type,
  };
}

export function useGameController() {
  const [gameMode, setGameMode] = useState<GameMode>('LOCAL');
  const [status, setStatus] = useState<GameStatus>('TITLE_MENU');
  const [localSetupPlayers, setLocalSetupPlayers] = useState([
    { name: 'Babi Pink', color: PLAYER_PRESETS[0].color, avatar: '🐷' },
    { name: 'Ular Hijau', color: PLAYER_PRESETS[1].color, avatar: '🐍' },
  ]);

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [activeTod, setActiveTod] = useState<ActiveTodState | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [customCards, setCustomCards] = useState<TodCard[]>([]);
  const [highlightedTile, setHighlightedTile] = useState<number | null>(null);
  const usedCardIdsRef = useRef<string[]>([]);
  const lastOnlineLogIdRef = useRef<string | null>(null);

  const [myPlayerId] = useState(() => `player-${Math.random().toString(36).slice(2, 9)}`);
  const [onlinePlayerName, setOnlinePlayerName] = useState('Pemain 1');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState('');
  const [onlineError, setOnlineError] = useState('');
  const [copiedRoom, setCopiedRoom] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'room:error') setOnlineError(data.message);
        if (data.type === 'room:joined') {
          setOnlineError('');
          setActiveRoomCode(data.roomId);
          setGameMode('ONLINE');
          applyServerRoomState(data.state);
        }
        if (data.type === 'room:state') applyServerRoomState(data.state);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };
    return () => ws.close();
  }, []);

  const applyServerRoomState = (room: RoomState) => {
    setStatus(room.status);
    setPlayers(room.players);
    setCurrentTurnIndex(room.currentTurnIndex);
    setDiceValue(room.diceValue);
    setIsRolling(room.isRolling);
    setActiveTod(room.activeTod);
    setWinner(room.winner);
    setLogs(room.logs);
    setCustomCards(room.customCards || []);

    const latestLog = room.logs?.[0];
    if (latestLog && latestLog.id !== lastOnlineLogIdRef.current) {
      lastOnlineLogIdRef.current = latestLog.id;
      if (latestLog.type === 'TOD_COMPLETE') {
        if (latestLog.message.includes('DARE')) {
          soundFX.playDareFanfare();
          fireDareCelebrationConfetti(latestLog.message.includes('Kepala Ular'));
        } else {
          soundFX.playLadder(true);
          fireTruthSparkleConfetti();
        }
      }
    }

    if (room.status === 'GAME_OVER' && room.winner) {
      soundFX.playVictory();
      fireVictoryConfetti();
    }
  };

  const handleStartLocalGame = () => {
    const initializedPlayers: Player[] = localSetupPlayers.map((p, idx) => ({
      id: `local-${idx + 1}`,
      name: p.name.trim() || `Pemain ${idx + 1}`,
      color: p.color,
      avatar: p.avatar,
      position: 1,
      truthCount: 0,
      dareCount: 0,
      laddersClimbed: 0,
      snakesBitten: 0,
    }));
    setGameMode('LOCAL');
    setPlayers(initializedPlayers);
    setCurrentTurnIndex(0);
    setDiceValue(6);
    setActiveTod(null);
    setWinner(null);
    setStatus('PLAYING');
    setLogs([
      createLocalLog('Sistem', '#10B981', `Permainan dimulai dengan ${initializedPlayers.length} pemain! Tangga genap = Truth or Dare, Kepala Ular = Opsi Dare (Turun 1 angka)!`, 'MOVE'),
    ]);
    soundFX.playStep();
  };

  const handleCreateOnlineRoom = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return setOnlineError('Koneksi ke server sedang disiapkan, silakan coba sesaat lagi.');
    }
    setOnlineError('');
    wsRef.current.send(JSON.stringify({ type: 'room:create', playerId: myPlayerId, playerName: onlinePlayerName.trim() || 'Pemain 1' }));
  };

  const handleJoinOnlineRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return setOnlineError('Masukkan 5 karakter Kode Room terlebih dahulu.');
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return setOnlineError('Koneksi ke server belum aktif.');
    setOnlineError('');
    wsRef.current.send(
      JSON.stringify({ type: 'room:join', roomId: roomCodeInput.trim().toUpperCase(), playerId: myPlayerId, playerName: onlinePlayerName.trim() || 'Pemain Baru' })
    );
  };

  const pickRandomCardLocal = (type: TodType): TodCard => {
    const { card, nextUsedIds } = drawUniqueTodCard(customCards, usedCardIdsRef.current, type, activeTod?.card?.id);
    usedCardIdsRef.current = nextUsedIds;
    return card;
  };

  const executeLocalPlayerMove = (roll: number) => {
    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer) return;

    const startPos = currentPlayer.position;
    let nextPos = startPos + roll;
    if (nextPos > 100) nextPos = 100 - (nextPos - 100);

    setHighlightedTile(nextPos);
    soundFX.playStep();

    const updatedPlayers = [...players];
    const targetPlayer = { ...currentPlayer, position: nextPos };
    updatedPlayers[currentTurnIndex] = targetPlayer;

    const newLogs: GameLogEntry[] = [
      createLocalLog(targetPlayer.name, targetPlayer.color, `Melempar dadu [${roll}] dan melangkah dari petak ${startPos} ke petak ${nextPos}.`, 'MOVE'),
    ];

    const ladder = LADDERS.find((l) => l.start === nextPos);
    const snake = SNAKES.find((s) => s.start === nextPos);

    if (ladder) {
      targetPlayer.position = ladder.end;
      targetPlayer.laddersClimbed += 1;
      setHighlightedTile(ladder.end);

      if (ladder.start % 2 === 0) {
        soundFX.playLadder(true);
        const modes: Array<'RANDOM_TRUTH' | 'RANDOM_DARE' | 'FREE_CHOICE'> = ['FREE_CHOICE', 'FREE_CHOICE', 'RANDOM_TRUTH', 'RANDOM_DARE'];
        const assignedMode = modes[Math.floor(Math.random() * modes.length)];
        const selectedType: TodType | null = assignedMode === 'RANDOM_TRUTH' ? 'TRUTH' : assignedMode === 'RANDOM_DARE' ? 'DARE' : null;

        newLogs.unshift(createLocalLog(targetPlayer.name, targetPlayer.color, `Mendarat di Tangga Genap #${ladder.start} (menuju #${ladder.end})! Tantangan Truth or Dare dimulai!`, 'LADDER_EVEN'));
        setPlayers(updatedPlayers);
        setLogs((prev) => [...newLogs, ...prev].slice(0, 40));
        setActiveTod({
          playerId: targetPlayer.id,
          playerName: targetPlayer.name,
          fromTile: ladder.start,
          toTile: ladder.end,
          triggerSource: 'EVEN_LADDER',
          phase: selectedType ? 'REVEALED' : 'CHOICE_UNLOCKED',
          assignedMode,
          selectedType,
          card: selectedType ? pickRandomCardLocal(selectedType) : null,
        });
        setStatus('TRUTH_OR_DARE');
        return;
      } else {
        soundFX.playLadder(false);
        newLogs.unshift(createLocalLog(targetPlayer.name, targetPlayer.color, `Naik Tangga Ganjil dari petak ${ladder.start} langsung ke petak ${ladder.end}!`, 'LADDER_ODD'));
      }
    } else if (snake) {
      soundFX.playSnake();
      targetPlayer.position = snake.start;
      targetPlayer.snakesBitten += 1;
      setHighlightedTile(snake.start);

      newLogs.unshift(
        createLocalLog(targetPlayer.name, targetPlayer.color, `Menginjak Kepala Ular di petak ${snake.start}! Pilih ambil tantangan DARE (turun 1 angka ke #${snake.start - 1}) atau meluncur ke ekor ular (#${snake.end})!`, 'SNAKE')
      );
      setPlayers(updatedPlayers);
      setLogs((prev) => [...newLogs, ...prev].slice(0, 40));
      setActiveTod({
        playerId: targetPlayer.id,
        playerName: targetPlayer.name,
        fromTile: snake.start,
        toTile: snake.start - 1,
        triggerSource: 'SNAKE_HEAD',
        snakeTailTile: snake.end,
        phase: 'CHOICE_UNLOCKED',
        assignedMode: 'RANDOM_DARE',
        selectedType: 'DARE',
        card: null,
      });
      setStatus('TRUTH_OR_DARE');
      return;
    }

    if (targetPlayer.position === 100) {
      soundFX.playVictory();
      fireVictoryConfetti();
      newLogs.unshift(createLocalLog(targetPlayer.name, targetPlayer.color, `Mencapai petak 100 dan memenangkan pertandingan!`, 'WIN'));
      setPlayers(updatedPlayers);
      setWinner(targetPlayer);
      setStatus('GAME_OVER');
      setLogs((prev) => [...newLogs, ...prev].slice(0, 40));
      return;
    }

    setPlayers(updatedPlayers);
    setLogs((prev) => [...newLogs, ...prev].slice(0, 40));
    setCurrentTurnIndex((prev) => (prev + 1) % updatedPlayers.length);
  };

  const handleRollDice = () => {
    if (status !== 'PLAYING' || isRolling) return;
    setIsRolling(true);
    soundFX.playDiceRoll();

    let ticks = 0;
    const maxTicks = gameMode === 'ONLINE' ? 8 : 10;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        setIsRolling(false);
        if (gameMode === 'ONLINE') {
          wsRef.current?.send(JSON.stringify({ type: 'game:roll' }));
        } else {
          const finalRoll = Math.floor(Math.random() * 6) + 1;
          setDiceValue(finalRoll);
          executeLocalPlayerMove(finalRoll);
        }
      }
    }, 85);
  };

  const handleSelectTodType = (type: TodType) => {
    soundFX.playTodReveal();
    if (gameMode === 'ONLINE') return wsRef.current?.send(JSON.stringify({ type: 'tod:choose', todType: type }));
    if (activeTod) setActiveTod({ ...activeTod, selectedType: type, card: pickRandomCardLocal(type), phase: 'REVEALED' });
  };

  const handleRerollTodCard = () => {
    soundFX.playTodReveal();
    if (gameMode === 'ONLINE') return wsRef.current?.send(JSON.stringify({ type: 'tod:reroll_card' }));
    if (activeTod?.selectedType) setActiveTod({ ...activeTod, card: pickRandomCardLocal(activeTod.selectedType) });
  };

  const handleResolveTod = (completed: boolean) => {
    if (gameMode === 'ONLINE') return wsRef.current?.send(JSON.stringify({ type: 'tod:resolve', completed }));
    if (!activeTod) return;

    const isSnakeRescue = activeTod.triggerSource === 'SNAKE_HEAD';
    const isDareCompleted = completed && (isSnakeRescue || activeTod.selectedType === 'DARE');
    const snakeTail = activeTod.snakeTailTile ?? activeTod.fromTile;

    const updatedPlayers = players.map((p) => {
      if (p.id !== activeTod.playerId) return p;
      if (isSnakeRescue) {
        return completed ? { ...p, position: activeTod.toTile, dareCount: p.dareCount + 1 } : { ...p, position: snakeTail };
      }
      return completed
        ? {
            ...p,
            truthCount: activeTod.selectedType === 'TRUTH' ? p.truthCount + 1 : p.truthCount,
            dareCount: activeTod.selectedType === 'DARE' ? p.dareCount + 1 : p.dareCount,
          }
        : { ...p, position: activeTod.fromTile };
    });

    const activePlayer = updatedPlayers.find((p) => p.id === activeTod.playerId);
    if (activePlayer) {
      if (isDareCompleted) {
        soundFX.playDareFanfare();
        fireDareCelebrationConfetti(isSnakeRescue || activeTod.card?.category === 'Tantangan Virtual');
      } else if (completed) {
        soundFX.playLadder(true);
        fireTruthSparkleConfetti();
      } else {
        soundFX.playSnake();
      }
      setHighlightedTile(activePlayer.position);
      const logMsg = isSnakeRescue
        ? completed
          ? `Berani menyelesaikan DARE di Kepala Ular #${activeTod.fromTile}! Hanya turun 1 angka ke petak ${activeTod.toTile}.`
          : `Menolak/menyerah DARE di Kepala Ular #${activeTod.fromTile}! Meluncur turun ke ekor ular di petak ${snakeTail}.`
        : completed
        ? `Sukses menyelesaikan ${activeTod.selectedType} di Tangga Genap #${activeTod.fromTile}! Bertahan di petak ${activeTod.toTile}.`
        : `Menyerah pada tantangan ${activeTod.selectedType}! Batal naik tangga dan kembali ke petak ${activeTod.fromTile}.`;

      setLogs((prev) => [createLocalLog(activePlayer.name, activePlayer.color, logMsg, completed ? 'TOD_COMPLETE' : 'TOD_SKIP'), ...prev].slice(0, 40));
    }

    setPlayers(updatedPlayers);
    setActiveTod(null);
    setStatus('PLAYING');
    setCurrentTurnIndex((prev) => (prev + 1) % updatedPlayers.length);
  };

  const handleResetGame = () => {
    if (gameMode === 'ONLINE') return wsRef.current?.send(JSON.stringify({ type: 'game:reset' }));
    setPlayers(players.map((p) => ({ ...p, position: 1, truthCount: 0, dareCount: 0, laddersClimbed: 0, snakesBitten: 0 })));
    setCurrentTurnIndex(0);
    setDiceValue(6);
    setActiveTod(null);
    setWinner(null);
    setHighlightedTile(1);
    setStatus('PLAYING');
    setLogs([createLocalLog('Sistem', '#10B981', 'Permainan dimulai ulang! Semua pemain kembali ke petak 1.', 'MOVE')]);
  };

  const handleAddCustomCard = (type: TodType, text: string) => {
    if (gameMode === 'ONLINE' && activeRoomCode) return wsRef.current?.send(JSON.stringify({ type: 'card:add_custom', cardType: type, text }));
    setCustomCards((prev) => [
      { id: `custom-${Date.now()}`, type, category: 'Seru', text, bonusText: 'Kartu Kustom Pemain — Selesaikan untuk bertahan di puncak tangga!' },
      ...prev,
    ]);
  };

  const handleCopyRoomCode = () => {
    if (!activeRoomCode) return;
    navigator.clipboard.writeText(activeRoomCode);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  return {
    gameMode, setGameMode, status, setStatus, localSetupPlayers, setLocalSetupPlayers,
    players, currentTurnIndex, diceValue, isRolling, activeTod, winner, logs, customCards, highlightedTile,
    myPlayerId, onlinePlayerName, setOnlinePlayerName, roomCodeInput, setRoomCodeInput,
    activeRoomCode, onlineError, copiedRoom,
    handleStartLocalGame, handleCreateOnlineRoom, handleJoinOnlineRoom, handleRollDice,
    handleSelectTodType, handleRerollTodCard, handleResolveTod, handleResetGame, handleAddCustomCard, handleCopyRoomCode,
  };
}
