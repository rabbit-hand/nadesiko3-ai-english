# Nadesiko3 AI-English Edition: Core Command Reference (By Function)

Welcome to the beginner-friendly command guide! Here is the list of essential commands you can use in this English version, organized by what you want to achieve.

---

## 📺 1. Screen Output & Display (画面出力)

| English Command | Original Japanese | Description & Example |
| :--- | :--- | :--- |
| `print(value)` / `to_print` | `表示` | Displays text or numbers on the screen.<br>`print("Hello World!")`<br>`"Welcome!" to_print.` |
| `alert(value)` / `to_alert` | `警告` | Pops up a browser alert dialog.<br>`alert("Danger!")` |
| `confirm(message)` | `二択` | Shows a Yes/No dialog. Returns true/false.<br>`let result = confirm("Do you want to retry?")` |

---

## 🧮 2. Math & Arithmetic (計算・算術)

| English Command | Original Japanese | Description & Example |
| :--- | :--- | :--- |
| `+` , `-` , `*` , `/` | `+`, `-`, `*`, `/` | Standard mathematical operations.<br>`let total = 10 * 5` |
| `round(value)` | `四捨五入` | Rounds a number to the nearest integer.<br>`print(round(3.6))` (Result: 4) |
| `floor(value)` | `切り捨て` | Rounds a number down.<br>`print(floor(3.9))` (Result: 3) |
| `random(max)` | `乱数` | Generates a random number between 0 and (max - 1).<br>`let dice = random(6) + 1` |

---

## 🔤 3. Text & String Manipulation (文字列操作)

| English Command | Original Japanese | Description & Example |
| :--- | :--- | :--- |
| `&` | `&` | Joins two pieces of text together.<br>`print("Hello " & "Cats 🐱")` |
| `length_of(text)` | `文字数` | Counts the number of characters in a text.<br>`print(length_of("koko"))` (Result: 4) |
| `replace(text, old, new)`| `置換` | Replaces specific words inside a text.<br>`replace("I love apples", "apples", "oranges")` |

---

## ⚙️ 4. Control Flow & Blocks (条件分岐・繰り返し)

| English Keyword | Original Japanese | Usage Guide |
| :--- | :--- | :--- |
| `if` ... `then` | `もし` ... `ならば` | Starts a conditional block.<br>`if score >= 80 then` |
| `else` | `違えば` | Executes if the `if` condition is false. |
| `while` | `間` | Loops as long as the condition is true.<br>`while count < 3` |
| `koko` / `end` | `ここまで` | **CRITICAL:** Closes your `if`, `else`, or `while` blocks! |

---

## 💡 Quick Syntax Example for Kids

```text
# Let's count from 1 to 3!
let count = 1

while count <= 3
    print("Count is: " & count)
    count = count + 1
koko  # Your custom block end!

print("Finished! 🎉")
