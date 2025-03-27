"use strict"


// **** CPU CONSTANTS
// number of words in RAM
export const RAM_WORDS = 64;

// bit size of CPU
export const BITS = 12;

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
    // 11 instructions ...
    // 0o00: NOP: No operation (just increment PC); 0 operands
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // 0o01: LDA: Load accumulator from address; 1 operand
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

    // 0o02: ADD: Add value at address to accumulator using B as a temp register
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

    // 0o03: SUB: Subtract value at address from accumulator using B as a temp register
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

    // 0o04: STA: Store accumulator in address; 1 operand
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

    // 0o05: LDI: Load accumulator from immediate; 1 operand
    {
        name: "LDI",
        funcs: [m_incPC, m_storePCaddrInA, m_incPC],
        next_type: [
            M_CYCLE_NAMES.INC_PC,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.INC_PC
        ],
    },

    // 0o06: JMP: Unconditionally jump to address; 1 operand
    {
        name: "JMP",
        funcs: [m_incPC, m_storePCaddrInPC],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.MEM_READ],
    },

    // 0o07: JC: Jump to address if carry flag set; 1 operand
    {
        name: "JC",
        funcs: [m_incPC, m_ifCarryThenStorePCaddrInPC],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.MEM_READ],
    },


    // 0o10: JZ: Jump to address if zero flag set; 1 operand
    {
        name: "JZ",
        funcs: [m_incPC, m_ifZeroThenStorePCaddrInPC],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.MEM_READ],
    },

    // 0o11: OUT: Write accumulator to output
    {
        name: "OUT",
        funcs: [m_out, m_incPC],
        next_type: [M_CYCLE_NAMES.OUT, M_CYCLE_NAMES.INC_PC]
    },

    // 0o12: HLT: Increment PC and halt
    {
        name: "HLT",
        funcs: [m_incPC, m_halt],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.HALT],
    },

    // 0o13: IN: Store input switch statuses into accumulator
    {
        name: "IN",
        funcs: [m_in, m_incPC],
        next_type: [M_CYCLE_NAMES.IN, M_CYCLE_NAMES.INC_PC],
    },

    // ... plus 52 extra NOP opcodes for padding ...
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // ... equals 64 instructions (two octal digits)
];


// **** STATIC MACHINE CYCLE OPERATIONS FOR EACH OPCODE
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