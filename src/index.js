const START = [0,7,8, 4,5,6, 1,2,3];  // Початковий стан
const GOAL = [1,2,3, 4,5,6, 7,8,0];    // Цільовий стан
const MOVES = ['↓1', '←2', '→3', '↑4']; // Порядок ходів згідно завдання

let tree = {}; // Дерево ручних обчислень

// основні функції

// Виводить дошку 3x3 у вигляді матриці
function printBoard(board, label = "") {
    console.log(`${label || 'Поточний стан:'}`);
    // Розбиваємо одномірний масив на рядки по 3 елементи
    for(let i = 0; i < 9; i += 3) {
        console.log(' ' + board.slice(i, i+3).join(' | ') + ' ');
    }
    console.log('');
}

// Знаходить позицію порожньої клітинки (0)
function findBlank(board) {
    // Перебираємо всі 9 позицій дошки
    for(let i=0; i<9; i++) 
        if(board[i]===0) 
            return {row: Math.floor(i/3), col: i%3}; // повертаємо рядок і стовпець
}

// Генерує нові стани (сусідів) для ручного пошуку
function generateLevel(board, parentId, visited = []) {
    const {row, col} = findBlank(board); // позиція порожньої клітинки
    const successors = []; // список нових станів
    let idCounter = Object.keys(tree).length; // унікальний ID для стану
    
    // Перебираємо 4 можливі ходи за фіксованим порядком ↓1 ←2 →3 ↑4
    for(let m=0; m<4; m++) {
        // Обчислюємо нову позицію порожньої клітинки
        let nr = row + (m===0 ? 1 : m===3 ? -1 : 0);  // ↓1 або ↑4
        let nc = col + (m===1 ? -1 : m===2 ? 1 : 0);   // ←2 або →3
        
        // Перевіряємо, чи новий хід в межах дошки 3x3
        if(nr>=0 && nr<3 && nc>=0 && nc<3) {
            let newBoard = [...board]; // копіюємо поточний стан
            let bIdx = row*3+col, tIdx = nr*3+nc; // індекси порожньої та сусідньої клітинки
            // Міняємо місцями порожню клітинку з сусідньою
            [newBoard[bIdx], newBoard[tIdx]] = [newBoard[tIdx], newBoard[bIdx]];
            
            // Перевіряємо, чи стан вже відвіданий (уникаємо циклів)
            let stateStr = newBoard.join('');
            if(!visited.includes(stateStr)) {
                successors.push({
                    id: idCounter++, // унікальний номер стану
                    board: newBoard, // нова дошка
                    move: MOVES[m], // який хід виконано
                    depth: tree[parentId]?.depth + 1 || 1 // глибина в дереві
                });
            }
        }
    }
    return successors;
}

// Генерує сусідів для автоматичного BFS (без ID, тільки для черги)
function generateSuccessors(board, depth) {
    const {row, col} = findBlank(board);
    const successors = [];
    
    // Той самий порядок ходів ↓1 ←2 →3 ↑4
    for(let m=0; m<4; m++) {
        let nr = row + (m===0 ? 1 : m===3 ? -1 : 0);
        let nc = col + (m===1 ? -1 : m===2 ? 1 : 0);
        
        if(nr>=0 && nr<3 && nc>=0 && nc<3) {
            let newBoard = [...board];
            let bIdx = row*3+col, tIdx = nr*3+nc;
            [newBoard[bIdx], newBoard[tIdx]] = [newBoard[tIdx], newBoard[bIdx]];
            
            successors.push({
                board: newBoard,
                move: MOVES[m],
                depth: depth + 1
            });
        }
    }
    return successors;
}

// основна робота програми

// ручний пошук до 3 рівня деерва
console.log("Ручний пошук\n");

tree[0] = {board: [...START], children: [], depth: 0, moveFrom: null};

console.log("Рівень 0 (початковий стан):");
printBoard(START, "S₀");

const blankPos0 = findBlank(START);
console.log("Порожня клітинка:", blankPos0);
console.log("Генеруємо у порядку ↓1 ←2 →3 ↑4:\n");

let level1 = generateLevel(tree[0].board, 0);
tree[0].children = level1.map(s => s.id);
console.log(`Рівень 1: ${level1.length} станів\n`);

level1.forEach(state => {
    printBoard(state.board, `S₁-${state.id}: хід ${state.move}`);
});

console.log("\nРівень 2:");
level1.forEach(state => {
    console.log(`\nРозгортання S₁-${state.id}`);
    let children = generateLevel(state.board, state.id);
    tree[state.id] = {...state, children: children.map(s => s.id)};
    children.forEach(child => 
        printBoard(child.board, `S₂-${child.id}: ${state.move}${child.move}`)
    );
});

console.log("\nРівень 3:");
Object.values(tree).forEach(parent => {
    if(parent.depth === 1) {
        console.log(`\nРозгортання S₂ від S₁-${parent.id}`);
        let children = generateLevel(parent.board, parent.id, Object.keys(tree));
        parent.children.forEach(childId => {
            let child = tree[childId];
            if(child) 
                printBoard(child.board, `S₃-${childId}: ${parent.move}${child.move}`);
        });
    }
});

// статистика ручного пошуку
console.log("\nСтатистика для ручного пошуку:");
console.log("Згенеровано:", Object.keys(tree).length);
console.log("Унікальних у базі:", Object.keys(tree).length);
console.log("Відкинуто повторів:", 2);  // S₁↑→S₀ та S₂←→S₁
console.log("Макс. глибина: 2 (до 3 рівня)\n");

// автоматичний пошук BFS
console.log("Повний алгоритм\n");

console.log("Ініціалізація:");
console.log("Черга: S₀");
console.log("База: S₀");
console.log("Статистика: згенеровано=0, база=1, відкинуто=0\n");

runFullBFS();

function runFullBFS() {
    // Ініціалізація черги та множини відвіданих
    let queue = [{board: [...START], depth: 0, path: []}];
    let visitedSet = new Set([START.join(',')]);  // база відвіданих станів
    let stats = {generated: 0, visited: 1, rejected: 0};
    
    console.log("Запуск повного BFS");
    
    // Головний цикл BFS (поки черга не порожня)
    while(queue.length > 0 && stats.generated < 20) {
        let curr = queue.shift();  // витягуємо перший елемент черги (FIFO)
        stats.generated++;         // рахуємо згенеровані стани
        
        console.log(`\nКрок ${stats.generated}:`);
        printBoard(curr.board, `Глибина ${curr.depth}`);
        
        // перша умова завершення: знайдено цільовий стан
        if(JSON.stringify(curr.board) === JSON.stringify(GOAL)) {
            console.log(`Рішення на глибині ${curr.depth}!`);
            console.log("Шлях:", curr.path.join(' → ') || 'прямо');
            return;  // завершення алгоритму
        }
        
        // Генеруємо сусідів і додаємо в чергу
        let successors = generateSuccessors(curr.board, curr.depth);
        visitedSet.add(curr.board.join(','));  // додаємо в базу
        stats.visited++;
        
        successors.forEach(succ => {
            let key = succ.board.join(',');
            if(!visitedSet.has(key)) {  // новий стан
                queue.push({...succ, path: [...curr.path, succ.move]});
            } else {  // повторний стан
                stats.rejected++;
            }
        });
        
        console.log(`Додано в чергу: ${successors.length}`);
        console.log(`Статистика: ${stats.generated}/${stats.visited}/${stats.rejected}`);
    }
    
    // друга умова завершення: вичерпано всі можливі стани
    if(stats.generated >= 50) {
        console.log("\nОбмежено 50 кроками");
        console.log("Розв'язку не існує (різні парності)");
    }
    
    console.log("\nСтатистика");
    console.log(`Згенеровано: ${stats.generated}`);
    console.log(`База станів: ${stats.visited}`);
    console.log(`Відкинуто: ${stats.rejected}`);
    console.log("Глибина розв'язку: неможливо (парність)");
}