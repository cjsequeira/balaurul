"use strict"


// **** CPU CONSTANTS
// number of words in RAM
export const RAM_WORDS = 64;

// bit size of CPU
export const BITS = 12;

// machine cycle names
export const M_CYCLE_NAMES = {
    FETCH: "Fetch",
    DECODE: "Decode",
    MEM_READ: "Memory read",
    MEM_WRITE: "Memory write",
    INC_PC: "Increment PC",
    HALT: "Halt CPU",
    ALU: "ALU",
    OUT: "Out",
};

export const OPCODES = [
    // 11 instructions ...
    // 0o00: NOP: No operation (just increment PC); 0 operands
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // 0o01: LDA: Load accumulator from address; 1 operand
    {
        name: "LDA",
        num_ops: 1,
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
        num_ops: 1,
        funcs: [m_incPC, m_storePCaddrInB, m_addBtoA, m_incPC],
        next_type: [
            M_CYCLE_NAMES.INC_PC,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.ALU,
            M_CYCLE_NAMES.INC_PC
        ]
    },

    // 0o03: SUB: Subtract value at address from accumulator using B as a temp register
    {
        name: "SUB",
        num_ops: 1,
        funcs: [m_incPC, m_storePCaddrInB, m_subBfromA, m_incPC],
        next_type: [
            M_CYCLE_NAMES.INC_PC,
            M_CYCLE_NAMES.MEM_READ,
            M_CYCLE_NAMES.ALU,
            M_CYCLE_NAMES.INC_PC
        ]
    },

    // 0o04: STA: Store accumulator in address; 1 operand
    {
        name: "STA",
        num_ops: 1,
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
        num_ops: 1,
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
        num_ops: 1,
        funcs: [m_incPC, m_storePCaddrInPC],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.MEM_READ],
    },

    // 0o07: JC: Jump to address if carry flag set; 1 operand
    {
        name: "JC",
        num_ops: 1,
        funcs: [m_incPC, m_ifCarryThenStorePCaddrInPC],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.MEM_READ],
    },


    // 0o10: JZ: Jump to address if zero flag set; 1 operand
    {
        name: "JZ",
        num_ops: 1,
        funcs: [m_incPC, m_ifZeroThenStorePCaddrInPC],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.MEM_READ],
    },

    // 0o11: OUT: Write accumulator to output
    {
        name: "OUT",
        num_ops: 0,
        funcs: [m_out, m_incPC],
        next_type: [M_CYCLE_NAMES.OUT, M_CYCLE_NAMES.INC_PC]
    },

    // 0o12: HLT: Increment PC and halt
    {
        name: "HLT",
        num_ops: 0,
        funcs: [m_incPC, m_halt],
        next_type: [M_CYCLE_NAMES.INC_PC, M_CYCLE_NAMES.HALT],
    },

    // ... plus 53 extra NOP opcodes for padding ...
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },
    { name: "NOP", num_ops: 0, funcs: [m_incPC], next_type: [M_CYCLE_NAMES.INC_PC] },

    // ... equals 64 instructions (two octal digits)
];


// **** STATIC MACHINE CYCLE OPERATIONS FOR EACH OPCODE
// add B to A
function m_addBtoA(cpu) {
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
function m_ifCarryThenStorePCaddrInPC(cpu) {
    if (cpu.flags.carry) {
        cpu.pc = cpu.getWordAt(cpu.pc);
    } else {
        cpu.incPC();
    }
}

// if zero, then store into PC: word at address in PC
function m_ifZeroThenStorePCaddrInPC(cpu) {
    if (cpu.flags.zero) cpu.pc = cpu.getWordAt(cpu.pc);
}

// increment PC
function m_incPC(cpu) {
    cpu.incPC();
}

// write accumulator to output
function m_out(cpu) {
    cpu.out = cpu.a;
}

// store into RAM at address in MAR: value in A
function m_storeAatMARaddr(cpu) {
    cpu.putWordAt(cpu.mar, cpu.a);
}

// store into A: word at address in MAR
function m_storeMARaddrInA(cpu) {
    cpu.a = cpu.getWordAt(cpu.mar);
}

// store into A: word at address in PC
function m_storePCaddrInA(cpu) {
    cpu.a = cpu.getWordAt(cpu.pc);
}

// store into B: word at address in PC
function m_storePCaddrInB(cpu) {
    cpu.b = cpu.getWordAt(cpu.pc);
}

// store into MAR: word at address in PC
function m_storePCaddrInMAR(cpu) {
    cpu.mar = cpu.getWordAt(cpu.pc);
}

// store into PC: word at address in PC
function m_storePCaddrInPC(cpu) {
    cpu.pc = cpu.getWordAt(cpu.pc);
}

// subtract B from A
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