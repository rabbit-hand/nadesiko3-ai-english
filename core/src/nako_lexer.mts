import { rules } from './nako_rules.mjs'
import { NakoLexerError, InternalLexerError } from './nako_errors.mjs'

// Regular expressions for English Josi (particles) and standard units
const josiRE = /^(?:about|as_if|instead_of|if_it_were|in_place_of|as_for|like|by_means_of|with|from_the_start|uniquely|regarding|for_someone|by_means_of|according_to|in_violation_of|in_accordance_with|based_on|by_the_standard_of|throughout|around|concerning|against|triggered_by|starting_with|upon|regarding|in_addition_to|prior_to|based_upon|along_with|accompanied_by|contrary_to|towards|in_response_to|answering|preparing_for|relying_on|conforming_to|mixed_with|ahead_of|matching|in_contrast_to|relying_upon|aligning_with|depending_on|falling_behind|equally|alongside|facing|caused_by|linked_with|in_line_with|attached_to|proportionally|matching|closely_related|originating_from|surpassing|leading_up_to|reaching|extending_to|conforming_to|contradicting|involved_in|deserving|lining_up|equivalent|conformed_to|conforming_to|contributing_to|based_on|along_the_lines|following|against|directed_at|responded|prepared|relied_on|matched|dependent|caused_by|proportional|similar|closely_bound|derived_from|won|reached|extended_to|arrived_at|lined_up|was_equivalent|matched|contributed|about|around|only|just|etc|until|from|than|degree|only|display|print|write|get|is|is_not|and|from|until|then|is_a|of|not|if|when|then|and|but|so|therefore|however|nonetheless|although|even_if|unless|otherwise)/
const unitRE = /^(?:[a-zA-Z%‰])/
const cssUnitRE = /^(?:px|em|rem|vh|vw|ch|ex|cm|mm|in|pt|pc|%)/
const removeJosiMap: { [key: string]: boolean } = {}

export interface Token {
  type: string
  value: any
  indent: number
  line: number
  column: number
  file: string
  josi: string
  preprocessedCodeOffset: number
  preprocessedCodeLength: number
  rawJosi?: string
}

export interface NakoLexParseResult {
  res: string
  josi: string
  numEOL: number
  src: string
}

export class NakoLexer {
  /**
   * Count indentation spaces or tabs.
   */
  countIndent (src: string): number[] {
    let len = 0
    let i = 0
    while (i < src.length) {
      const c = src.charAt(i)
      if (c === ' ') { len++; i++ }
      else if (c === '\t') { len += 4; i++ }
      else { break }
    }
    return [len, i]
  }

  /**
   * Split an expandable string with curly braces logic.
   */
  splitStringEx (str: string): string[] | null {
    const res: string[] = []
    let s = ''
    let i = 0
    let blockMode = false
    while (i < str.length) {
      const c = str.charAt(i)
      if (!blockMode) {
        if (c === '{') {
          res.push(s)
          s = ''
          blockMode = true
          i++
          continue
        }
        s += c
        i++
      } else {
        if (c === '}') {
          res.push(s)
          s = ''
          blockMode = false
          i++
          continue
        }
        s += c
        i++
      }
    }
    if (blockMode) { return null }
    res.push(s)
    return res
  }

  /**
   * Helper function to convert token types to a readable string format.
   */
  static tokensToTypeStr (tokens: Token[], separator: string = '|'): string {
    return tokens.map(t => t.type).join(separator)
  }

  /**
   * Tokenize the source code into an array of tokens.
   * @param src Nadesiko source code
   * @param line Starting line number
   * @param filename Filename
   */
  tokenize ( src : string , line : number , filename : string ) : Token [ ] {
    const srcLength : number = src . length
    const result : Token [ ] = [ ]
    let columnCurrent
    let lineCurrent
    let column = 1
    let isDefTest = false
    let indent = 0

    // Count initial indentation
    const ia : number [ ] = this . countIndent ( src )
    indent = ia [ 0 ] // Number of indentations
    src = src . substring ( ia [ 1 ] ) // Skip indentation characters
    column += ia [ 1 ]

    while ( src !== '' ) {
      let ok = false

      // --- [CUSTOM ADDITION] Check for bracket string literal [] ---
      if ( src . startsWith ( '[' ) ) {
        let resultStr = ''
        let idx = 1
        let escaped = false
        let numEOL = 0

        while ( idx < src . length ) {
          const char = src [ idx ]
          if ( escaped ) {
            resultStr += char
            escaped = false
          } else if ( char === '\\' ) {
            escaped = true
          } else if ( char === ']' ) {
            break
          } else {
            if ( char === '\n' ) { numEOL ++ }
            resultStr += char
          }
          idx ++
        }

        if ( idx >= src . length ) {
          throw new NakoLexerError ( "Closing bracket ']' not found." , srcLength - src . length , srcLength , line , filename )
        }

        const totalLength = idx + 1
        const srcOffset = srcLength - src . length

        result . push ( {
          type : 'string' ,
          value : resultStr ,
          indent ,
          line ,
          column ,
          file : filename ,
          josi : '' ,
          preprocessedCodeOffset : srcOffset ,
          preprocessedCodeLength : totalLength ,
          rawJosi : ''
        } )

        src = src . substring ( totalLength )
        line += numEOL
        if ( numEOL > 0 ) { column = 1 } else { column += totalLength }
        continue
      }
      // --- [END OF CUSTOM ADDITION] ---

      // Iterate through each tokenization rule
      for ( const rule of rules ) {
        // Match with regular expression
        const m = rule . pattern . exec ( src )
        if ( ! m ) { continue }
        let ruleName = rule . name
        ok = true

        // Skip spaces
        if ( rule . name === 'space' ) {
          column += m [ 0 ] . length
          src = src . substring ( m [ 0 ] . length )
          continue
        }

        // If the matched rule has a custom parser callback
        if ( rule . cbParser ) {
          // Call the parser callback
          let rp : NakoLexParseResult
          if ( isDefTest && rule . name === 'word' ) {
            rp = rule . cbParser ( src , false )
          } else {
            try {
              rp = rule . cbParser ( src )
            } catch ( e : any ) {
              throw new NakoLexerError ( e . message , srcLength - src . length , srcLength - src . length + 1 , line , filename )
            }
          }

          // Special handling after retrieving the rule
          if ( rule . name === 'string_ex' ) {
            // Expandable string (string interpolation) -> aaa{x}bbb{x}cccc
            const list = this . splitStringEx ( rp . res )
            if ( list === null ) {
              throw new InternalLexerError ( 'String interpolation formatting error: unclosed or mismatched {...}.' , srcLength - src . length , srcLength - rp . src . length , line , filename )
            }
            if ( list . length === 1 ) {
              // Case without any interpolation
              result . push ( { type : 'string' , value : list [ 0 ] , josi : rp . josi , indent , file : filename , line , column , preprocessedCodeOffset : srcLength - src . length , preprocessedCodeLength : src . length - rp . src . length } )
              line += rp . numEOL
              column += src . length - rp . src . length
              src = rp . src
              if ( rp . numEOL > 0 ) { column = 1 }
              break
            }

            // Case with interpolation expressions
            result . push ( { type : '(' , value : '(' , josi : '' , indent , file : filename , line , column , preprocessedCodeOffset : srcLength - src . length , preprocessedCodeLength : 0 } )
            let offset = 0
            for ( let i = 0 ; i < list . length ; i ++ ) {
              if ( i % 2 === 0 ) {
                result . push ( { type : 'string' , value : list [ i ] , file : filename , josi : '' , indent , line , column , preprocessedCodeOffset : srcLength - src . length + offset , preprocessedCodeLength : list [ i ] . length + 2 } )
                offset += list [ i ] . length + 2
              } else {
                result . push ( { type : '&' , value : '&' , josi : '' , indent , file : filename , line , column , preprocessedCodeOffset : srcLength - src . length + offset , preprocessedCodeLength : 0 } )
                result . push ( { type : '(' , value : '(' , josi : '' , indent , file : filename , line , column , preprocessedCodeOffset : srcLength - src . length + offset , preprocessedCodeLength : 0 } )
                result . push ( { type : 'code' , value : list [ i ] , josi : '' , indent , file : filename , line , column , preprocessedCodeOffset : srcLength - src . length + offset , preprocessedCodeLength : list [ i ] . length } )
                result . push ( { type : ')' , value : ')' , josi : '' , indent , file : filename , line , column , preprocessedCodeOffset : srcLength - src . length + offset + list [ i ] . length , preprocessedCodeLength : 0 } )
                result . push ( { type : '&' , value : '&' , josi : '' , indent , file : filename , line , column , preprocessedCodeOffset : srcLength - src . length + offset + list [ i ] . length , preprocessedCodeLength : 0 } )
                offset += list [ i ] . length
              }
            }
            line += rp . numEOL
            column += src . length - rp . src . length
            src = rp . src
            if ( rp . numEOL > 0 ) { column = 1 }
            result . push ( { type : ')' , value : ')' , josi : rp . josi , indent , file : filename , line , column , preprocessedCodeOffset : srcLength - src . length , preprocessedCodeLength : 0 } )
            break
          }

          // Store the token result
          columnCurrent = column
          column += src . length - rp . src . length
          result . push ( { type : rule . name , value : rp . res , josi : rp . josi , indent , line , column : columnCurrent , file : filename , preprocessedCodeOffset : srcLength - src . length , preprocessedCodeLength : src . length - rp . src . length } )
          src = rp . src
          line += rp . numEOL
          if ( rp . numEOL > 0 ) { column = 1 }
          break
        }

        // Calculate position before advancing the source cursor
        const srcOffset = srcLength - src . length

        // Convert the value if a callback exists
        let value : any = m [ 0 ]
        if ( rule . cb ) { value = rule . cb ( value ) }

        // Advance the source cursor
        columnCurrent = column
        lineCurrent = line
        column += m [ 0 ] . length
        src = src . substring ( m [ 0 ] . length )

        // Handle End-Of-Line (EOL)
        if ( ( rule . name === 'eol' && value === '\n' ) || rule . name === '_eol' ) {
          value = line ++
          column = 1
        }

        // Check for numeric units
        if ( rule . name === 'number' ) {
          // Skip if there is a matching unit
          const um = unitRE . exec ( src )
          if ( um ) {
            src = src . substring ( um [ 0 ] . length )
            column += m [ 0 ] . length
          }
          // Automatically recognize CSS units as strings
          const cssUnit = cssUnitRE . exec ( src )
          if ( cssUnit ) {
            ruleName = 'string'
            src = src . substring ( cssUnit [ 0 ] . length )
            column += m [ 0 ] . length
            value += cssUnit [ 0 ]
          }
        }

        let josi = ''
        if ( rule . readJosi ) {
          // Read particle (Josi) using regular expression
          const j = josiRE . exec ( src )
          if ( j ) {
            column += j [ 0 ] . length
            josi = j [ 0 ] . replace ( / ^ \s + / , '' )
            src = src . substring ( j [ 0 ] . length )
            // Ignore trailing commas immediately after Josi
            if ( src . charAt ( 0 ) === ',' ) { src = src . substring ( 1 ) }
          }
        }

        switch ( ruleName ) {
          case 'def_test' : { isDefTest = true; break }
          case 'eol' : { isDefTest = false; break }
          default : { break }
        }

        // Handle line decrement rule
        if ( ruleName === 'dec_lineno' ) { line --; continue }

        result . push ( { type : ruleName , value , indent , line : lineCurrent , column : columnCurrent , file : filename , josi , preprocessedCodeOffset : srcOffset , preprocessedCodeLength : ( srcLength - src . length ) - srcOffset } )

        // Evaluate indentation for the next line on EOL. Column is always reset to 1 after EOL.
        if ( ruleName === 'eol' && column === 1 ) {
          const ia = this . countIndent ( src )
          indent = ia [ 0 ]
          column += ia [ 1 ]
          src = src . substring ( ia [ 1 ] ) // Skip indentation chars
        }
        break
      }

      if ( ! ok ) {
        throw new InternalLexerError ( 'Unknown token error: ' + src . substring ( 0 , 3 ) + '...' , srcLength - src . length , srcLength - srcLength + 3 , line , filename )
      }
    }
    return result
  }
}
