# Balaurul, version Unu
A virtual, custom 12-bit CPU. Written by Chris Musei-Sequeira

Live at https://cjsequeira.github.io/balaurul/

## Inspirations
* The [Altair 8800](https://en.wikipedia.org/wiki/Altair_8800) and [s2js Altair 8800 online simulator](https://s2js.com/altair/)
* [Baulari](https://en.wikipedia.org/wiki/Balaur) in Romanian folklore
* [Ben Eater's 8-bit CPU](https://eater.net/8bit)
* [Daniel Grießhaber's SAP-1](https://dangrie158.github.io/SAP-1/)
* The [Intel 8080 Microcomputer System User's Manual published September 1975](https://archive.ph/GFz3V)
* [Marco Schweighauser's Simple 8-Bit Assembler Simulator](https://schweigi.github.io/assembler-simulator/)
* The [PDP-11](https://en.wikipedia.org/wiki/PDP-11) and [PDP-12](https://en.wikipedia.org/wiki/PDP-12) minicomputers

## Coming next?
* Keyboard shortcuts
* New instruction set! (Hooray for breaking changes!)
* SOUND? (Probably not)

## Instructions
| Opcode (Octal) | Description | Mnemonic | Operand (If Applicable) | Total Width (Words)
| --- | --- | --- | --- | --- |
| 0000 | NOP | No operation | | 1
| 0001 | LDA | Load accumulator from address | Address (1 word) | 2
| 0002 | ADD | Add word in address to accumulator | Address (1 word) | 2
| 0003 | SUB | Subtract word in address from accumulator | Address (1 word) | 2
| 0004 | STA | Store accumulator at address | Address (1 word) | 2
| 0005 | LDI | Load immediate value to accumulator | Immediate value (1 word) | 2
| 0006 | JMP | Unconditionally jump to address | Address (1 word) | 2
| 0007 | JC | Jump to addres if carry flag is set | Address (1 word) | 2
| 0010 | JZ | Jump to address if zero flag is set | Address (1 word) | 2
| 0011 | OUT | Write accumulator to output | | 1
| 0012 | HLT | Increment program counter and halt | | 1
| 0013 to 0077 | NOP | No operation | | 1

## Version history

* 1.0.0: Initial version