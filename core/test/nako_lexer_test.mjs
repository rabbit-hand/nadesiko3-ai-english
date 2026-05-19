// Lexer string tokenizer logic to detect [] as a valid string literal

function stringTokenizer(code, index) {
  // Check if the current character starts with '['
  if (code[index] === '[') {
    let result = ''
    let i = index + 1
    let escaped = false

    while (i < code.length) {
      const char = code[i]

      if (escaped) {
        result += char
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === ']') {
        // String literal ends when the closing bracket ']' is found
        return {
          value: result,
          nextIndex: i + 1
        }
      } else {
        result += char
      }
      i++
    }
    throw new Error("Closing bracket ']' not found.")
  }
  
  return null // Return null if it doesn't start with '[' to fall back to default tokenizers ("" or 「」)
}
