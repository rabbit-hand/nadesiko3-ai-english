import assert from 'assert'
import { NakoLexer } from '../src/nako_lexer.mjs'

describe('Lexer Bracket String Test', () => {
  // Initialize the Nadesiko Lexer
  const lex = new NakoLexer()

  // --- Test case for tokenizing [] as a string literal ---
  it('should tokenize bracket [] as a valid string literal', () => {
    // 1. Basic assignment test
    const a = lex.tokenize('A=[server_logs.csv]', 0, 'test.nako3')
    // Check if it's correctly split into word(A) | eq(=) | string(server_logs.csv)
    assert.strictEqual(NakoLexer.tokensToTypeStr(a, '|'), 'word|eq|string')
    assert.strictEqual(a[2].value, 'server_logs.csv')

    // 2. English command syntax test
    const b = lex.tokenize('Switch camera to [bottom]', 0, 'test.nako3')
    // Check if it parses as word(Switch) | word(camera) | word(to) | string(bottom)
    assert.strictEqual(NakoLexer.tokensToTypeStr(b, '|'), 'word|word|word|string')
    assert.strictEqual(b[3].value, 'bottom')
  })
})
