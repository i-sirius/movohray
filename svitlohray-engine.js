/* Tap Tiling mechanic adapted from i-sirius/tap_tiling f20c9039c67e8fdf00cc424b0affc42fb570e611.
 * Pure board operations. Rows first; cells are row-major bits. */
(function (root, factory) {
  var engine = factory();
  if (typeof module === "object" && module.exports) module.exports = engine;
  else root.SvitlohrayEngine = engine;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var sizes = [[3, 4], [4, 4], [5, 5]];
  function validate(board) {
    if (!board || !sizes.some(function (s) { return s[0] === board.rows && s[1] === board.cols; }) ||
        !Array.isArray(board.cells) || board.cells.length !== board.rows * board.cols ||
        !board.cells.every(function (v) { return v === 0 || v === 1; })) throw new Error("Invalid board");
    return board;
  }
  function affected(rows, cols, index) {
    var r = Math.floor(index / cols), c = index % cols, result = [index];
    if (r > 0) result.push(index - cols);
    if (r + 1 < rows) result.push(index + cols);
    if (c > 0) result.push(index - 1);
    if (c + 1 < cols) result.push(index + 1);
    return result;
  }
  function toggle(board, index) {
    validate(board);
    if (!Number.isInteger(index) || index < 0 || index >= board.cells.length) throw new Error("Invalid move");
    var cells = board.cells.slice();
    affected(board.rows, board.cols, index).forEach(function (i) { cells[i] ^= 1; });
    return { rows: board.rows, cols: board.cols, cells: cells };
  }
  function won(board) { validate(board); return board.cells.every(function (v) { return v === board.cells[0]; }); }
  function generate(rows, cols, random) {
    random = random || Math.random;
    var board = validate({ rows: rows, cols: cols, cells: Array(rows * cols).fill(1) });
    // A bounded retry also handles deterministic/adversarial RNGs without hanging.
    for (var attempt = 0; attempt < 16; attempt++) {
      board.cells.fill(1);
      for (var i = 0; i < rows * cols; i++) board = toggle(board, Math.min(board.cells.length - 1, Math.max(0, Math.floor(random() * board.cells.length))));
      if (!won(board)) return board;
    }
    return toggle(board, 0);
  }
  function solveTarget(board, target) {
    var n = board.cells.length, matrix = [], pivots = [], rank = 0;
    for (var r = 0; r < n; r++) {
      var row = Array(n + 1).fill(0);
      affected(board.rows, board.cols, r).forEach(function (c) { row[c] = 1; });
      row[n] = board.cells[r] ^ target; matrix.push(row);
    }
    // Gauss-Jordan elimination over GF(2), O(n^3), at most 25 variables.
    for (var c = 0; c < n; c++) {
      var pivot = rank;
      while (pivot < n && !matrix[pivot][c]) pivot++;
      if (pivot === n) continue;
      var swap = matrix[rank]; matrix[rank] = matrix[pivot]; matrix[pivot] = swap;
      for (r = 0; r < n; r++) if (r !== rank && matrix[r][c]) {
        for (var k = c; k <= n; k++) matrix[r][k] ^= matrix[rank][k];
      }
      pivots.push(c); rank++;
    }
    for (r = rank; r < n; r++) if (matrix[r][n]) return null;
    // Free variables = 0: a valid solution, not a claim of minimum moves.
    return pivots.filter(function (_, i) { return matrix[i][n] === 1; });
  }
  function solve(board) {
    validate(board);
    if (won(board)) return [];
    var off = solveTarget(board, 0), on = solveTarget(board, 1);
    return off === null ? on : on === null || off.length <= on.length ? off : on;
  }
  return { sizes: sizes, toggle: toggle, generate: generate, won: won, solve: solve,
    hint: function (board) { var moves = solve(board); return moves && moves.length ? moves[0] : null; },
    serialize: function (board) { return JSON.stringify(validate(board)); },
    deserialize: function (value) { return validate(JSON.parse(value)); } };
}));
