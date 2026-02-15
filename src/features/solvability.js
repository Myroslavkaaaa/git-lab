// Перевірка розв'язності конфігурації 8-пазлу
// Використовує класичне правило інверсій для 3x3.
export function countInversions(board) {
  // Ігноруємо 0 (порожню клітинку)
  const arr = board.filter((x) => x !== 0);
  let inv = 0;

  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) {
        inv++;
      }
    }
  }

  return inv;
}

export function isSolvable(board) {
  const inversions = countInversions(board);
  // Для дошки 3x3 (8-пазл) конфігурація розв'язна,
  // якщо кількість інверсій парна.
  return inversions % 2 === 0;
}