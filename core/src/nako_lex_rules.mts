export const rules : NakoLexRule [ ] = [
  // 上から順にマッチさせていく
  { name: 'ここまで' , pattern: / ^ ; ; ; / } , // #925
  { name: 'eol' , pattern: / ^ \n / } ,
  { name: 'eol' , pattern: / ^ ; / } , // eslint-disable-next-line no-control-regex
  { name: 'space' , pattern: / ^ ( \x20 | \t | 　 | ・ | ⎿ | └ | ｜ ) + / } , // #877,#1015
  { name: 'comma' , pattern: / ^ , / } ,
  { name: 'line_comment' , pattern: / ^ # [ ^ \n ] * / } ,
  { name: 'line_comment' , pattern: / ^ \/ \/ [ ^ \n ] * / } ,
  { name: 'range_comment' , pattern: / ^ \/ \* / , cbParser : cbRangeComment } ,
  { name: 'def_test' , pattern: / ^ ● Test : /i } ,
  { name: 'def_func' , pattern: / ^ ● / } ,
  { name: '…' , pattern: / ^ … / } , // 範囲オブジェクト(#1704)
  { name: '…' , pattern: / ^ \. { 2 , 3 } / } , // 範囲オブジェクト(#1704)
  // 多倍長整数リテラルの判定。整数の末尾に「n」がついているだけな為、数値判定より上に書かないとただの整数にされる
  { name: 'bigint' , pattern: / ^ 0 [ x X ] [ 0 - 9 a - f A - F ] + ( _ [ 0 - 9 a - f A - F ] + ) * n / , readJosi : true } ,
  { name: 'bigint' , pattern: / ^ 0 [ o O ] [ 0 - 7 ] + ( _ [ 0 - 7 ] + ) * n / , readJosi : true } ,
  { name: 'bigint' , pattern: / ^ 0 [ b B ] [ 0 - 1 ] + ( _ [ 0 - 1 ] + ) * n / , readJosi : true } ,
  { name: 'bigint' , pattern: / ^ \d + ( _ \d + ) * ? n / , readJosi : true } , // 16進/8進/2進法の数値判定 --- この後nako_lexerにて単位を読む処理が入る(#994)
  { name: 'number' , pattern: / ^ 0 [ x X ] [ 0 - 9 a - f A - F ] + ( _ [ 0 - 9 a - f A - F ] + ) * / , readJosi : true , cb : parseNumber } ,
  { name: 'number' , pattern: / ^ 0 [ o O ] [ 0 - 7 ] + ( _ [ 0 - 7 ] + ) * / , readJosi : true , cb : parseNumber } ,
  { name: 'number' , pattern: / ^ 0 [ b B ] [ 0 - 1 ] + ( _ [ 0 - 1 ] + ) * / , readJosi : true , cb : parseNumber } , // 下の三つは小数点が挟まっている場合、小数点から始まっている場合、小数点がない場合の十進法の数値にマッチする
  { name: 'number' , pattern: / ^ \d + ( _ \d + ) * \. ( \d + ( _ \d + ) * ) ? ( [ e E ] [ + | - ] ? \d + ( _ \d + ) * ) ? / , readJosi : true , cb : parseNumber } ,
  { name: 'number' , pattern: / ^ \. \d + ( _ \d + ) * ( [ e E ] [ + | - ] ? \d + ( _ \d + ) * ) ? / , readJosi : true , cb : parseNumber } ,
  { name: 'number' , pattern: / ^ \d + ( _ \d + ) * ( [ e E ] [ + | - ] ? \d + ( _ \d + ) * ) ? / , readJosi : true , cb : parseNumber } ,
  { name: 'ここから' , pattern: / ^ ( ここから | begin ) , ? /i } ,
  { name: 'ここまで' , pattern: / ^ ( ここまで | 💧 | koko | end ) /i } ,
  { name: 'もし' , pattern: / ^ ( もしも ? | if ) /i } , // 「ならば」は助詞として定義している
  { name: '違えば' , pattern: / ^ ( 違 ( えば ) ? | else ) /i } , // 「回」「間」「繰返」「反復」「抜」「続」「戻」「代入」「条件分岐」などは NakoLexer._replaceWord で word から変換
  // @see nako_reserved_words.js
  { name: 'shift_r0' , pattern: / ^ > > > / } ,
  { name: 'shift_r' , pattern: / ^ > > / } ,
  { name: 'shift_l' , pattern: / ^ < < / } ,
  { name: '===' , pattern: / ^ = = = / } , // #999
  { name: '!==' , pattern: / ^ ! = = / } , // #999
  { name: 'gteq' , pattern: / ^ ( ≧ | > = | = > ) / } ,
  { name: 'lteq' , pattern: / ^ ( ≦ | < = | = < ) / } ,
  { name: 'noteq' , pattern: / ^ ( ≠ | < > | ! = ) / } ,
  { name: '←' , pattern: / ^ ( ← | < - - ) / } , // 矢印 --- ただし(core#140)で廃止された演算子(#891,#899)
  { name: 'eq' , pattern: / ^ ( = = | 🟰 🟰 ) / } ,
  { name: 'eq' , pattern: / ^ ( = | 🟰 ) / } ,
  { name: 'line_comment' , pattern: / ^ ( ! | 💡 ) ( インデント構文 | ここまでだるい | DNCLモード | DNCL2モード | DNCL2 )[ ^ \n ] * / } , // #1184
  { name: 'not' , pattern: / ^ ( ! | 💡 ) / } , // #1184 #1457
  { name: 'gt' , pattern: / ^ > / } ,
  { name: 'lt' , pattern: / ^ < / } ,
  { name: 'and' , pattern: / ^ ( かつ | & & | and \s ) /i } ,
  { name: 'or' , pattern: / ^ ( または | 或いは | あるいは | or \s | \| \| ) /i } ,
  { name: '@' , pattern: / ^ @ / } ,
  { name: '+' , pattern: / ^ \+ / } ,
  { name: '-' , pattern: / ^ - / } ,
  { name: '**' , pattern: / ^ ( × × | \* \* ) / } , // Python風べき乗演算子
  { name: '*' , pattern: / ^ ( × | \* ) / } ,
  { name: '÷÷' , pattern: / ^ ÷ ÷ / } , // 整数の割り算
  { name: '÷' , pattern: / ^ ( ÷ | \/ ) / } , // 普通の割り算
  { name: '%' , pattern: / ^ % / } ,
  { name: '^' , pattern: / ^ \^ / } ,
  { name: '&' , pattern: / ^ & / } ,
  { name: '[' , pattern: / ^ \[ / } ,
  { name: ']' , pattern: / ^ ] / , readJosi : true } ,
  { name: '(' , pattern: / ^ \( / } ,
  { name: ')' , pattern: / ^ \) / , readJosi : true } ,
  { name: '|' , pattern: / ^ \| / } ,
  { name: '??' , pattern: / ^ \? \? / } , // 「表示」のエイリアス #1745
  { name: 'word' , pattern: / ^ \$ \{ . + ? \} / , cbParser : src => cbExtWord ( src ) } , // 特別名前トークン(#1836)(#672)
  { name: '$' , pattern: / ^ ( \$ | \. ) / } , // プロパティアクセス (#1793)(#1807)
  { name: 'string' , pattern: / ^ 🌿 / , cbParser : src => cbString ( '🌿' , '🌿' , src ) } ,
  { name: 'string_ex' , pattern: / ^ 🌴 / , cbParser : src => cbString ( '🌴' , '🌴' , src ) } ,
  { name: 'string_ex' , pattern: / ^ 「 / , cbParser : src => cbString ( '「' , '」' , src ) } ,
  { name: 'string' , pattern: / ^ 『 / , cbParser : src => cbString ( '『' , '』' , src ) } ,
  { name: 'string_ex' , pattern: / ^ “ / , cbParser : src => cbString ( '“' , '”' , src ) } ,
  { name: 'string_ex' , pattern: / ^ " / , cbParser : src => cbString ( '"' , '"' , src ) } ,
  { name: 'string' , pattern: / ^ ' / , cbParser : src => cbString ( '\'' , '\'' , src ) } ,
  { name: '」' , pattern: / ^ 」 / , cbParser : errorRead ( '」' ) } , // error
  { name: '』' , pattern: / ^ 』 / , cbParser : errorRead ( '』' ) } , // error
  { name: 'func' , pattern: / ^ \{ ( 関数 | function ) \} , ? /i } ,
  { name: '{' , pattern: / ^ \{ / } ,
  { name: '}' , pattern: / ^ \} / , readJosi : true } ,
  { name: ':' , pattern: / ^ : / } ,
  { name: '_eol' , pattern: / ^ _ \s * \n / } ,
  { name: 'dec_lineno' , pattern: / ^ ‰ / } , // 絵文字変数 = (絵文字)英数字*
  { name: 'word' , pattern: / ^ [ \uD800 - \uDBFF ] [ \uDC00 - \uDFFF ] [ _ a - z A - Z 0 - 9 ] * / , readJosi : true } ,
  { name: 'word' , pattern: / ^ [ \u1F60 - \u1F6F ] [ _ a - z A - Z 0 - 9 ] * / , readJosi : true } , // 絵文字
  { name: 'word' , pattern: / ^ 《 . + ? 》 / , readJosi : true } , // 《特別名前トークン》(#672)
  // 単語句
  { name: 'word' , pattern: / ^ [ _ a - z A - Z \u3005 \u4E00 - \u9FCF ぁ - ん ァ - ヶ \u2460 - \u24FF \u2776 - \u277F \u3251 - \u32BF ] / , cbParser : cbWordParser }
]
