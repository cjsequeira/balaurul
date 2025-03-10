"use strict";

// **** CPU CONSTANTS
export const CPU_RAM_WORDS = 64;
export const CPU_BITS = 12;
export const CPU_OPCODES = [
    // 11 opcodes (octal 13) ...
    { name: "NOP", num_ops: 0 },
    { name: "LDA", num_ops: 1 },
    { name: "ADD", num_ops: 1 },
    { name: "SUB", num_ops: 1 },
    { name: "STA", num_ops: 1 },
    { name: "LDI", num_ops: 1 },
    { name: "JMP", num_ops: 1 },
    { name: "JC", num_ops: 1 },
    { name: "JZ", num_ops: 1 },
    { name: "OUT", num_ops: 0 },
    { name: "HLT", num_ops: 0 },

    // ... plus 4 extra NOPs for padding (octal 4) ...
    { name: "NOP", num_ops: 0 },
    { name: "NOP", num_ops: 0 },
    { name: "NOP", num_ops: 0 },
    { name: "NOP", num_ops: 0 },
    { name: "NOP", num_ops: 0 },

    // ... equals 16 opcodes numbered 0 through 15 (binary 1111, or one nibble)
];

// **** CPU CLASS
export class CPU {
    // constructor
    constructor() {
        // **** DEFINE CPU
        // define components
        this.memory = [];
        this.pc = 0;
        this.a = 0;
        this.b = 0;

        // define holders for old values of components
        this.old_pc = 0;
        this.old_a = 0;
        this.old_b = 0;


        // **** INITIALIZE CPU
        // fill registers with random contents
        this.a = Math.round(Math.random() * (Math.pow(2, CPU_BITS) - 1));
        this.b = Math.round(Math.random() * (Math.pow(2, CPU_BITS) - 1));
        this.pc = Math.round(Math.random() * (CPU_RAM_WORDS - 1));

        // fill memory with random contents
        for (let i = 0; i < CPU_RAM_WORDS; i++) {
            this.memory.push(Math.round(Math.random() * (Math.pow(2, CPU_BITS) - 1)));
        }
    }

    // get word value at given address
    getWordAt(address) {
        // wrap around in memory if given address is higher than size of RAM
        let mod_address = address % CPU_RAM_WORDS;

        // initialize return value to null
        let value = null;

        if (mod_address >= 0) {
            // if address greater than zero, return value pointed to by address
            value = this.memory[mod_address];
        }

        // return value (note: null if given address was negative!)
        return value;
    }

    // get opcode at given address
    getOpCode(address) {
        // use mod operator so there is never an invalid opcode!
        return (this.getWordAt(address) % CPU_OPCODES.length);
    }

    // get mnemonic based on current PC value
    getMnemonic() {
        // get opcode as value in memory pointed to by PC
        let opcode = this.getOpCode(this.pc);

        // set mnemonic based on opcode and number of operands
        let mnemonic = CPU_OPCODES[opcode].name;

        for (let i = 0; i < CPU_OPCODES[opcode].num_ops; i++) {
            let operand = this.getWordAt(this.pc + i + 1);

            // store operand string in octal
            mnemonic += " " + operand.toString(8).padStart(4, "0");
        }

        return mnemonic;
    }
};