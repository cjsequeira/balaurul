"use strict"

// **** CPU CONSTANTS

// number of words in RAM
export const RAM_WORDS = 64;

// bit size of CPU
export const BITS = 12;

// storage location for program counter during CALL
export const CALL_ADDR = 0o77;

// machine cycle names
export const M_CYCLE_NAMES = {
    FETCH: "fetch",
    DECODE: "decode",
    MEM_READ: "mem_read",
    MEM_WRITE: "mem_write",
    INC_PC: "inc_pc",
    HALT: "halt",
    ALU: "alu",
    IN: "in",
    OUT: "out",
};

export const OPCODES = [
    // **** 0o00 - 0o07: SPECIAL INSTRUCTIONS
    // 0o00: NOP: No operation (just increment PC); 0 operands
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // 0o01: HLT: Increment PC and halt
    {
        name: "HLT",
        funcs: [m_incPC, m_halt],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.HALT],
    },

    // 0o02: OUT: Write accumulator to output
    {
        name: "OUT",
        funcs: [m_out, m_incPC],
        next_type: [M_CYCLE_NAMES.OUT, M_CYCLE_NAMES.INC_PC]
    },

    // 0o03: IN: Store input switch statuses into accumulator
    {
        name: "IN",
        funcs: [m_in, m_incPC],
        next_type: [M_CYCLE_NAMES.IN, M_CYCLE_NAMES.INC_PC],
    },

    // 0o04 - 0o07: Reserved (NOP)
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },


    // **** 0o10 - 0o17: ZERO-OPERAND INSTRUCTIONS
    // 0o10: Increment accumulator
    {
        name: "INC",
        funcs: [m_incA, m_incPC],
        next_type: [M_CYCLE_NAMES.ALU, M_CYCLE_NAMES.INC_PC]
    },

    // 0o11: Decrement accumulator
    {
        name: "DEC",
        funcs: [m_decA, m_incPC],
        next_type: [M_CYCLE_NAMES.ALU, M_CYCLE_NAMES.INC_PC]
    },

    // 12: [Rotate accumulator left]
    // 13: [Rotate accumulator left through carry]
    // 14: [Rotate accumulator right]
    // 15: [Rotate accumulator right through carry]
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // 0o16 - 0o17: Reserved (NOP)
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },


    // **** 0o20 - 0o37: IMMEDIATE-WITH-ACCUMULATOR INSTRUCTIONS
    // 0o20: LDI: Load accumulator from immediate; 1 operand
    {
        name: "LDI",
        funcs: [m_incPC, m_storePCaddrInA, m_incPC],
        next_type: [
            M_CYCLE_NAMES.INC_PC,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.INC_PC
        ],
    },

    // 21: [Add immediate value to accumulator]
    // 22: [Add immediate value plus carry to accumulator]
    // 23: [Subtract immediate value from accumulator]
    // 24: [Subtract immediate value from accumulator with borrow]
    // 25: [AND immediate value with accumulator]
    // 26: [OR immediate value with accumulator]
    // 27: [XOR immediate value with accumulator]
    // 30: [Compare immediate with accumulator]    
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // 0o31 - 0o37: Reserved (NOP)
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },


    // **** MEMORY-WITH-ACCUMULATOR INSTRUCTIONS
    // 0o40: LDA: Load accumulator from address; 1 operand
    {
        name: "LDA",
        funcs: [m_incPC, m_storePCaddrInMAR, m_storeMARaddrInA, m_incPC],
        next_type: [
            M_CYCLE_NAMES.INC_PC,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.INC_PC
        ],
    },

    // 0o41: ADD: Add value at address to accumulator using B as a temp register
    {
        name: "ADD",
        funcs: [m_incPC, m_storePCaddrInMAR, m_storeMARaddrInB, m_addBtoA, m_incPC],
        next_type: [
            M_CYCLE_NAMES.INC_PC,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.ALU,
            M_CYCLE_NAMES.INC_PC
        ]
    },

    // 0o42: To be implemented (NOP)
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // 0o43: SUB: Subtract value at address from accumulator using B as a temp register
    {
        name: "SUB",
        funcs: [m_incPC, m_storePCaddrInMAR, m_storeMARaddrInB, m_subBfromA, m_incPC],
        next_type: [
            M_CYCLE_NAMES.INC_PC,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.ALU,
            M_CYCLE_NAMES.INC_PC
        ]
    },

    // 44: [Subtract value in address from accumulator with borrow]
    // 45: [AND value in address with accumulator]
    // 46: [OR value in address with accumulator]
    // 47: [XOR value in address with accumulator]
    // 50: [Compare value in address with accumulator]    
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // 0o51: STA: Store accumulator in address; 1 operand
    {
        name: "STA",
        funcs: [m_incPC, m_storePCaddrInMAR, m_storeAatMARaddr, m_incPC],
        next_type: [
            M_CYCLE_NAMES.INC_PC,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.MEM_WRITE,
            M_CYCLE_NAMES.INC_PC
        ],
    },

    // 0o52 - 0o57: Reserved (NOP)
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },


    // **** JUMP INSTRUCTIONS
    // 0o60: JMP: Unconditionally jump to address; 1 operand
    {
        name: "JMP",
        funcs: [m_incPC, m_storePCaddrInPC],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.MEM_READ],
    },

    // 0o61: JC: Jump to address if carry flag set; 1 operand
    {
        name: "JC",
        funcs: [m_incPC, m_ifCarryThenStorePCaddrInPC],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.MEM_READ],
    },

    // 0o62: JZ: Jump to address if zero flag set; 1 operand
    {
        name: "JZ",
        funcs: [m_incPC, m_ifZeroThenStorePCaddrInPC],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.MEM_READ],
    },

    // 63: [Jump to address if not carry]
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // 64: [Jump to address if not zero]
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // 0o65: CALL: Call subroutine at address; 1 operand
    {
        name: "CALL",
        funcs: [m_incPC, m_storePCinCallAddr, m_storePCaddrInPC],
        next_type: [
            M_CYCLE_NAMES.INC_PC,
            M_CYCLE_NAMES.MEM_WRITE,
            M_CYCLE_NAMES.MEM_READ
        ],
    },

    // 66: RET: Return from subroutine
    {
        name: "RET",
        funcs: [m_getPCfromCallAddr, m_incPC],
        next_type: [
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.INC_PC,
        ],
    },

    // 67: [Load program counter from accumulator]    
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // 0o70 - 0o77: Reserved (NOP)
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
];


// **** MACHINE CYCLE OPERATIONS FOR OPCODES - PRIVATE TO MODULE
// add B to accumulator
function m_addBtoA(cpu) {
    // add B to accumulator
    cpu.a += cpu.b;

    // set carry flag appropriately
    cpu.flags.carry = (cpu.a >= Math.pow(2, BITS));

    // restrict accumulator to only BITS in size
    cpu.a %= Math.pow(2, BITS);

    // set zero flag appropriately
    cpu.flags.zero = (cpu.a == 0);
}

// decrement accumulator
function m_decA(cpu) {
    // to decrement, add the two's-complement of 1 to accumulator
    cpu.a += Math.pow(2, BITS) - 1;

    // set carry flag appropriately
    // carry calc is inspired by the Intel 8080 Assembly Language Programmers Manual, Rev. B, 1975
    cpu.flags.carry = (cpu.a >= Math.pow(2, BITS));

    // restrict accumulator to only BITS in size
    cpu.a %= Math.pow(2, BITS);

    // set zero flag appropriately
    cpu.flags.zero = (cpu.a == 0);
}

// get PC from call storage address
function m_getPCfromCallAddr(cpu) {
    cpu.pc = cpu.getWordAt(CALL_ADDR);
}

// halt CPU
function m_halt(cpu) {
    cpu.status.halted = true;
    cpu.status.running = false;
}

// if carry, then store into PC: word at address in PC
// otherwise, just increment PC
function m_ifCarryThenStorePCaddrInPC(cpu) {
    if (cpu.flags.carry) {
        cpu.pc = cpu.getWordAt(cpu.pc);
    } else {
        cpu.incPC();
    }
}

// if zero, then store into PC: word at address in PC
// otherwise, just increment PC
function m_ifZeroThenStorePCaddrInPC(cpu) {
    if (cpu.flags.zero) {
        cpu.pc = cpu.getWordAt(cpu.pc);
    } else {
        cpu.incPC();
    }
}

// store input switch value in the accumulator
// this assumes that the latest input switch statuses have already been scanned!
function m_in(cpu) {
    cpu.a = cpu.input_switch_value;
}

// increment accumulator
function m_incA(cpu) {
    // increment accumulator
    cpu.a++;

    // set carry flag appropriately
    cpu.flags.carry = (cpu.a >= Math.pow(2, BITS));

    // restrict accumulator to only BITS in size
    cpu.a %= Math.pow(2, BITS);

    // set zero flag appropriately
    cpu.flags.zero = (cpu.a == 0);
}

// increment PC
function m_incPC(cpu) {
    cpu.incPC();
}

// write accumulator to output
function m_out(cpu) {
    cpu.out = cpu.a;
}

// store into RAM at address in MAR: value in accumulator
function m_storeAatMARaddr(cpu) {
    cpu.putWordAt(cpu.mar, cpu.a);
}

// store into accumulator: word at address in MAR
function m_storeMARaddrInA(cpu) {
    cpu.a = cpu.getWordAt(cpu.mar);
}

// store into B: word at address in MAR
function m_storeMARaddrInB(cpu) {
    cpu.b = cpu.getWordAt(cpu.mar);
}

// store PC into call storage address
function m_storePCinCallAddr(cpu) {
    cpu.putWordAt(CALL_ADDR, cpu.pc);
}

// store into accumulator: word at address in PC
function m_storePCaddrInA(cpu) {
    cpu.a = cpu.getWordAt(cpu.pc);
}

// store into MAR: word at address in PC
function m_storePCaddrInMAR(cpu) {
    cpu.mar = cpu.getWordAt(cpu.pc);
}

// store into PC: word at address in PC
function m_storePCaddrInPC(cpu) {
    cpu.pc = cpu.getWordAt(cpu.pc);
}

// subtract B from accumulator
function m_subBfromA(cpu) {
    // to subtract, add the two's-complement of B to accumulator
    cpu.a += Math.pow(2, BITS) - cpu.b;

    // set carry flag appropriately
    // carry calc is inspired by the Intel 8080 Assembly Language Programmers Manual, Rev. B, 1975
    cpu.flags.carry = (cpu.a >= Math.pow(2, BITS));

    // restrict accumulator to only BITS in size
    cpu.a %= Math.pow(2, BITS);

    // set zero flag appropriately
    cpu.flags.zero = (cpu.a == 0);
}