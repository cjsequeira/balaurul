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
        this.ir = 0;

        // define holders for old values of components
        this.old_pc = 0;
        this.old_a = 0;
        this.old_b = 0;
        this.old_ir = 0;

        // define input lines
        this.input = {
            run: false,
            step: true,
        };

        // define machine cycle and instruction cycle info
        this.m_cycle = 0;
        this.m_opcode = 0;
        this.i_cycle = 0;
        this.i_finished = false;

        // define CPU-wide internal JavaScript flag indicating whether a change has occurred
        this.changed = false;

        // define indicator for whether CPU has just advanced one machine cycle
        this.stepped = false;

        // define indicator for internal fault
        this.fault = false;

        // **** INITIALIZE CPU
        // fill memory with random contents -- must do before populating IR!
        for (let i = 0; i < CPU_RAM_WORDS; i++) {
            this.memory.push(Math.round(Math.random() * (Math.pow(2, CPU_BITS) - 1)));
        }

        // fill registers A, B, and PC with random contents
        this.a = Math.round(Math.random() * (Math.pow(2, CPU_BITS) - 1));
        this.b = Math.round(Math.random() * (Math.pow(2, CPU_BITS) - 1));
        this.pc = Math.round(Math.random() * (Math.pow(2, CPU_BITS) - 1));

        // populate IR with content pointed to by PC
        this.ir = this.getWordAt(this.getAddressFromPC());
    }

    // get address based on PC
    getAddressFromPC() {
        // wrap around in memory if PC points to address beyond bounds of RAM
        return (this.pc % CPU_RAM_WORDS);
    }

    // get address based on PC
    getAddressFromOldPC() {
        // wrap around in memory if PC points to address beyond bounds of RAM
        return (this.old_pc % CPU_RAM_WORDS);
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

    // get opcode represented by IR
    getOpCodeFromIR() {
        // use mod operator so there is never an invalid opcode!
        return (this.ir % CPU_OPCODES.length);
    }

    // translate IR value to a mnemonic
    getMnemonic() {
        // get opcode represented by IR
        let opcode = this.getOpCodeFromIR();

        // set mnemonic based on opcode and number of operands
        let mnemonic = CPU_OPCODES[opcode].name;

        for (let i = 0; i < CPU_OPCODES[opcode].num_ops; i++) {
            let operand = this.getWordAt(this.getAddressFromPC() + i + 1);

            // store operand string in octal
            mnemonic += " " + operand.toString(8).padStart(4, "0");
        }

        return mnemonic;
    }

    // increment PC
    incPC() {
        // increment PC, wrapping around to zero if needed
        this.pc = (this.pc + 1) % Math.pow(2, CPU_BITS);
    }

    // synchronize old values and new values
    syncOldAndNew() {
        this.old_pc = this.pc;
        this.old_a = this.a;
        this.old_b = this.b;
        this.old_ir = this.ir;

        // indicate that values are now synchronized
        this.changed = false;
    }

    // update
    update() {
        if (!this.fault) {
            // if there is no CPU fault, then...

            // sync old and new CPU values
            this.syncOldAndNew();

            if (this.input.run || (this.input.step && !this.stepped)) {
                // if input "run" is set or input "step" is set and CPU not yet stepped, then...

                // use machine cycle counter to determine what to do
                switch (this.m_cycle) {
                    // FETCH (machine cycle 0)
                    case 0:
                        // Populate IR with word pointed to by PC
                        this.ir = this.getWordAt(this.getAddressFromPC());



                        console.log("FETCH (Machine cycle 0)");
                        // End machine cycle 0
                        break;

                    // DECODE (machine cycle 1)
                    case 1:
                        // Decode IR to get opcode
                        this.m_opcode = this.getOpCodeFromIR();



                        console.log("DECODE (Machine cycle 1): " + this.m_opcode + ", " + CPU_OPCODES[this.m_opcode].name);
                        // End machine cycle 1
                        break;

                    // INSTRUCTION-SPECIFIC (machine cycle 2)
                    case 2:
                        switch (CPU_OPCODES[this.m_opcode].name) {
                            case "NOP":
                                // FINISH: NOP instruction: increment PC
                                this.incPC();

                                // indicate that instruction cycle is finished
                                this.i_finished = true;



                                console.log("NOP finished: Increment PC");
                                break;

                            case "LDA":
                                // LDA instruction: increment PC to point to word for A register
                                this.incPC();


                                console.log("LDA: Increment PC to point to word for A register");
                                break;

                            default:
                                // Unknown opcode for machine cycle 2? Set fault
                                this.fault = true;



                                console.log("Unknown: FAULT");
                                break;
                        }

                        console.log("(Machine cycle 2)");
                        // End machine cycle 2
                        break;

                    // INSTRUCTION-SPECIFIC (machine cycle 3)
                    case 3:
                        switch (CPU_OPCODES[this.m_opcode].name) {
                            case "LDA":
                                // LDA instruction: load word at PC into A
                                this.a = this.getWordAt(this.getAddressFromPC());




                                console.log("LDA: Load word at PC into A");
                                break;

                            default:
                                // Unknown opcode for machine cycle 3? Set fault
                                this.fault = true;



                                console.log("Unknown: FAULT");
                                break;
                        }

                        console.log("(Machine cycle 3)");
                        // End machine cycle 3
                        break;

                    // INSTRUCTION-SPECIFIC (machine cycle 4)
                    case 4:
                        switch (CPU_OPCODES[this.m_opcode].name) {
                            case "LDA":
                                // FINISH: LDA instruction: increment PC
                                this.incPC();

                                // indicate that instruction cycle is finished
                                this.i_finished = true;




                                console.log("LDA finished: Increment PC");
                                break;

                            default:
                                // Unknown opcode for machine cycle 4? Set fault
                                this.fault = true;



                                console.log("Unknown: FAULT");
                                break;
                        }

                        console.log("(Machine cycle 4)");
                        // End machine cycle 4
                        break;
                    
                    // Machine cycle number not handled? Set fault
                    default:
                        this.fault = true;



                        console.log("Machine cycle " + this.m_cycle + " unhandled: FAULT");

                        break;
                }


                if (this.i_finished) {
                    // if instruction cycle is finished, then...

                    // increment instruction cycle
                    this.i_cycle++;

                    // reset machine cycle count
                    this.m_cycle = 0;

                    // reset "instruction cycle finished" status
                    this.i_finished = false;




                    // !!!!!!! FIX THIS!
                    this.stepped = true;
                } else {
                    // if instruction cycle is not finished, then...

                    // increment machine cycle and set "stepped"
                    this.m_cycle++;





                    // !!!!!!! FIX THIS!
                    // this.stepped = true;
                }
            }

            if (!this.input.step) {
                // if input "step" is cleared, clear the CPU "stepped" status
                this.stepped = false;
            }

            // indicate that the CPU has changed
            this.changed = true;

            // end if (!this.fault)
        }
    }
};