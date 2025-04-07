# Balaurul Unu
A virtual 12-bit educational microcomputer. Written by Chris Musei-Sequeira

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
* SOUND? (Probably not)

## Instructions (octal)
### 0000 - 0007: Special instructions
| Opcode | Mnemonic | Description | Operand (If Any) | Width (Words) | Num. of Machine Cycles
|---|---|---|---|---|---|
| 0000 | NOP | No operation | | 1 | 3 |
| 0001 | HLT | Increment PC and halt CPU | | 1 | 4 |
| 0002 | OUT | Write accumulator to OUT | | 1 | 4 |
| 0003 | IN | Read input switches to accumulator | | 1 | 4 |
| 0004 - 0007 | | (Reserved) | | | |

### 0010 - 0017: No-operand instructions
| Opcode | Mnemonic | Description | Operand (If Any) | Width (Words) | Num. of Machine Cycles
|---|---|---|---|---|---|
| 0010 | INC | Increment accumulator | | 1 | 4 | 
| 0011 | DEC | Decrement accumulator | | 1 | 4 | 
| 0012 | ROL | Rotate accumulator left | | 1 | 4 | 
| 0013 | ROL | Rotate accumulator left through carry | | 1 | 4 | 
| 0014 | ROR | Rotate accumulator right | | 1 | 4 | 
| 0015 | RCR | Rotate accumulator right through carry | | 1 | 4 | 
| 0016 - 0017 | | (Reserved) | | | |

### 0020 - 0037: Immediate-with-accumulator instructions
| Opcode | Mnemonic | Description | Operand (If Any) | Width (Words) | Num. of Machine Cycles
|---|---|---|---|---|---|
| 0020 | LDI | Load accumulator from immediate | Immediate value | 2 | 5 | 
| 0021 | ADI | Add immediate to accumulator | Immediate value | 2 | 6 | 
| 0022 | ACI | Add immediate plus carry to accumulator | Immediate value | 2 | 6 | 

| 0023 - 0029 | | (To be implemented) | | | |
| 0030 | CMI | Compare accumulator with immediate | Immediate value | 2 | 6 | 
| 0031 - 0037 | | (Reserved) | | | |

### 0040 - 0057: Memory-with-accumulator instructions
| Opcode | Mnemonic | Description | Operand (If Any) | Width (Words) | Num. of Machine Cycles
|---|---|---|---|---|---|
| 0040 | LDA | Load accumulator from address | Address | 2 | 6 | 
| 0041 | ADA | Add value at address to accumulator | Address | 2 | 7 | 
| 0042 | | (To be implemented) |  |  |  | 
| 0043 | SBA | Subtract value at address from accumulator | Address | 2 | 7 | 
| 0044 - 0046 | | (To be implemented) | | | |
| 0047 | XOA | XOR value at address with accumulator | Address | 2 | 7 | 
| 0050 | | (To be implemented) | | | |
| 0051 | STA | Store accumulator to address | Address | 2 | 6 | 
| 0052 | LDP | Load accumulator from address in pointer | Pointer address | 2 | 8 | 
| 0053 - 0057 | | (Reserved) | | | |

### 0060 - 0077: Jump instructions
| Opcode | Mnemonic | Description | Operand (If Any) | Width (Words) | Num. of Machine Cycles
|---|---|---|---|---|---|
| 0060 | JMP | Unconditionally jump to address | Address | 2 | 4 | 
| 0061 | JC | Jump to address if carry flag set | Address | 2 | 4 | 
| 0062 | JZ | Jump to address if zero flag set | Address | 2 | 4 | 
| 0063 | JNC | Jump to address if carry flag not set | Address | 2 | 4 | 
| 0064 | JNZ | Jump to address if zero flag not set | Address | 2 | 4 | 
| 0065 | CALL | Call subroutine at address | Address | 2 | 6 | 
| 0066 | RET | Return from subroutine | | 1 | 5 | 
| 0067 | | (To be implemented) | | | |
| 0070 - 0077 | | (Reserved) | | | |

## Version history

* 1.0.0: Initial version
