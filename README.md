# 12bit
Emulation of a custom 12-bit CPU. Written by Chris Musei-Sequeira

## Inspirations
* [Ben Eater's 8-bit CPU](https://eater.net/8bit)
* [Daniel Grießhaber's SAP-1](https://dangrie158.github.io/SAP-1/)
* [The PDP-12](https://en.wikipedia.org/wiki/PDP-12)
* [The Altair 8800](https://en.wikipedia.org/wiki/Altair_8800)

## Instructions
| Opcode (Octal) | Mnemonic | Operand (If Applicable) | Total Width (Words)
| --- | --- | --- | --- |
| 0000 | NOP | | 1
| 0001 | LDA | Address (1 word) | 2
| 0002 | ADD | Address (1 word) | 2
| 0003 | SUB | Address (1 word) | 2
| 0004 | STA | Address (1 word) | 2
| 0005 | LDI | Immediate value (1 word) | 2
| 0006 | JMP | Address (1 word) | 2
| 0007 | JC | Address (1 word) | 2
| 0010 | JZ | Address (1 word) | 2
| 0011 | OUT | | 1
| 0012 | HLT | | 1