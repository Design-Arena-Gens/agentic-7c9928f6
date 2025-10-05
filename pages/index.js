import { useCallback, useMemo, useState } from 'react';
import styles from '../styles/Home.module.css';

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const EMPTY_BOARD = Array(9).fill(null);

const createHistoryId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function calculateWinner(squares) {
  for (const [a, b, c] of WINNING_COMBOS) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

export default function HomePage() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [isXNext, setIsXNext] = useState(true);
  const [startingPlayer, setStartingPlayer] = useState('X');
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });
  const [history, setHistory] = useState([]);

  const winner = useMemo(() => calculateWinner(board), [board]);
  const movesPlayed = useMemo(() => board.filter(Boolean).length, [board]);
  const isDraw = !winner && movesPlayed === 9;
  const gameOver = Boolean(winner) || isDraw;

  const statusMessage = useMemo(() => {
    if (winner) {
      return `Player ${winner.player} wins the round!`;
    }
    if (isDraw) {
      return "It's a draw!";
    }
    return `Player ${isXNext ? 'X' : 'O'} — your move`;
  }, [winner, isDraw, isXNext]);

  const handleSquareClick = useCallback(
    (index) => {
      if (board[index] || gameOver) {
        return;
      }

      const nextBoard = board.slice();
      const nextPlayer = isXNext ? 'X' : 'O';
      nextBoard[index] = nextPlayer;

      const nextWinner = calculateWinner(nextBoard);
      const totalMoves = nextBoard.filter(Boolean).length;
      const nextIsDraw = !nextWinner && totalMoves === 9;

      setBoard(nextBoard);

      if (nextWinner || nextIsDraw) {
        setHistory((prev) => [
          ...prev,
          {
            id: createHistoryId(),
            round,
            starter: startingPlayer,
            outcome: nextWinner ? `${nextWinner.player} wins` : 'Draw',
            moves: totalMoves,
          },
        ]);

        setScores((prev) => {
          if (nextWinner) {
            return { ...prev, [nextWinner.player]: prev[nextWinner.player] + 1 };
          }
          return { ...prev, ties: prev.ties + 1 };
        });
      } else {
        setIsXNext((prev) => !prev);
      }
    },
    [board, gameOver, isXNext, round, startingPlayer]
  );

  const handleNextRound = useCallback(() => {
    const nextStarter = startingPlayer === 'X' ? 'O' : 'X';
    setStartingPlayer(nextStarter);
    setBoard(EMPTY_BOARD);
    setIsXNext(nextStarter === 'X');
    setRound((prev) => prev + 1);
  }, [startingPlayer]);

  const handleResetMatch = useCallback(() => {
    setBoard(EMPTY_BOARD);
    setIsXNext(true);
    setStartingPlayer('X');
    setRound(1);
    setScores({ X: 0, O: 0, ties: 0 });
    setHistory([]);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.turnBadge}>Round {round}</div>
        <h1 className={styles.title}>Galactic Tic Tac Toe</h1>
        <p className={styles.subtitle}>
          Challenge a friend, track your victories, and watch the board glow when you claim the win.
        </p>
      </header>

      <main className={styles.gameLayout}>
        <section className={styles.card}>
          <div className={styles.status}>{statusMessage}</div>

          <div className={styles.board}>
            {board.map((value, index) => {
              const classNames = [styles.square];
              if (value === 'O') classNames.push(styles.squareO);
              if (value) classNames.push(styles.disabled);
              if (winner?.line.includes(index)) classNames.push(styles.winner);
              if (gameOver) classNames.push(styles.disabled);

              return (
                <button
                  key={index}
                  type="button"
                  className={classNames.join(' ')}
                  onClick={() => handleSquareClick(index)}
                  disabled={gameOver}
                >
                  {value}
                </button>
              );
            })}
          </div>

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.button}
              onClick={gameOver ? handleNextRound : handleResetMatch}
            >
              {gameOver ? 'Start Next Round' : 'Reset Match'}
            </button>
            {gameOver && (
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={handleResetMatch}
              >
                Reset Match
              </button>
            )}
          </div>
        </section>

        <aside className={styles.card}>
          <h2 className={styles.status}>Scoreboard</h2>
          <div className={styles.scoreboard}>
            <div className={styles.scoreCard}>
              <span className={styles.scoreLabel}>Player X</span>
              <span className={styles.scoreValue}>{scores.X}</span>
            </div>
            <div className={styles.scoreCard}>
              <span className={styles.scoreLabel}>Player O</span>
              <span className={styles.scoreValue}>{scores.O}</span>
            </div>
            <div className={styles.scoreCard}>
              <span className={styles.scoreLabel}>Draws</span>
              <span className={styles.scoreValue}>{scores.ties}</span>
            </div>
          </div>

          <div>
            <div className={styles.badge}>Match History</div>
            <div className={styles.historyList}>
              {history.length === 0 ? (
                <p className={styles.subtitle}>Play a round to build your legend.</p>
              ) : (
                history
                  .slice()
                  .reverse()
                  .map((item) => (
                    <div key={item.id} className={styles.historyItem}>
                      <span>Round {item.round}</span>
                      <span>{item.outcome}</span>
                    </div>
                  ))
              )}
            </div>
          </div>

          <p className={styles.footerNote}>
            Starting player alternates each round for a balanced rivalry.
          </p>
        </aside>
      </main>
    </div>
  );
}
