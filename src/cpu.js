"use strict";

// **** CPU CLASS
export class CPU {
    // **** STATIC CPU PARAMETERS
    static RAM_WORDS = 64;
    static BITS = 12;

    static OPCODES = [
        // 11 opcodes ...
        { name: "NOP", num_ops: 0, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "LDA", num_ops: 1, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "ADD", num_ops: 1, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "SUB", num_ops: 1, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "STA", num_ops: 1, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },

        {
            name: "LDI",
            num_ops: 1,
            funcs: [CPU.m_incPC, CPU.m_storePCinA, CPU.m_finishIcycle],
            next_type: ["INC_PC", "MEM_READ", "INC_PC", "FETCH"]
        },

        { name: "JMP", num_ops: 1, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "JC", num_ops: 1, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "JZ", num_ops: 1, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "OUT", num_ops: 0, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "HLT", num_ops: 0, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },

        // ... plus 5 extra NOP opcodes for padding ...
        { name: "NOP", num_ops: 0, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_finishIcycle], next_type: ["INC_PC", "FETCH"] },

        // ... equals 16 opcodes numbered 0 through 15 (binary 1111, or one nibble)
    ];

    // **** STATIC MACHINE CYCLE OPERATIONS FOR EACH OPCODE
    // finish instruction cycle
    static m_finishIcycle(cpu) {
        // increment PC
        cpu.incPC();

        // indicate that instruction cycle is finished
        cpu.i_finished = true;
    }

    // increment PC
    static m_incPC(cpu) {
        cpu.incPC();
    }

    // store into A: word at address in PC
    static m_storePCinA(cpu) {
        cpu.a = cpu.getWordAt(cpu.getAddressFromPC());
    }

    // **** NON-STATIC CLASS METHODS
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
            m_step: false,
            i_step: true,
        };

        // define machine cycle and instruction cycle info
        this.m_cycle = 0;
        this.m_opcode = 0;
        this.m_next_type = "FETCH";
        this.i_cycle = 0;
        this.i_finished = false;

        // define CPU-wide internal JavaScript flag indicating whether a change has occurred
        this.changed = false;

        // define indicator for whether CPU has just advanced one machine cycle or instruction cycle
        this.m_stepped = false;
        this.i_stepped = false;

        // **** INITIALIZE CPU
        // fill memory with random contents -- must do before populating IR!
        for (let i = 0; i < CPU.RAM_WORDS; i++) {
            this.memory.push(Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1)));
        }

        // fill registers A, B, and PC with random contents
        this.a = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));
        this.b = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));
        this.pc = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));

        // populate IR with content pointed to by PC
        this.ir = this.getWordAt(this.getAddressFromPC());
    }

    // get address based on PC
    getAddressFromPC() {
        // wrap around in memory if PC points to address beyond bounds of RAM
        return (this.pc % CPU.RAM_WORDS);
    }

    // get address based on PC
    getAddressFromOldPC() {
        // wrap around in memory if PC points to address beyond bounds of RAM
        return (this.old_pc % CPU.RAM_WORDS);
    }

    // get word value at given address
    getWordAt(address) {
        // wrap around in memory if given address is higher than size of RAM
        let mod_address = address % CPU.RAM_WORDS;

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
        return (this.ir % CPU.OPCODES.length);
    }

    // translate IR value to a mnemonic
    getMnemonic() {
        // get opcode represented by IR
        let opcode = this.getOpCodeFromIR();

        // set mnemonic based on opcode and number of operands
        let mnemonic = CPU.OPCODES[opcode].name;

        for (let i = 0; i < CPU.OPCODES[opcode].num_ops; i++) {
            let operand = this.getWordAt(this.getAddressFromPC() + i + 1);

            // store operand string in octal
            mnemonic += " " + operand.toString(8).padStart(4, "0");
        }

        return mnemonic;
    }

    // increment PC
    incPC() {
        // increment PC, wrapping around to zero if needed
        this.pc = (this.pc + 1) % Math.pow(2, CPU.BITS);
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

        // sync old and new CPU values
        this.syncOldAndNew();

        if (
            this.input.run
            || (this.input.m_step && !this.m_stepped)
            || (this.input.i_step && !this.i_stepped)
        ) {
            // if input "run" is set ...
            // or input "m_step" is set and CPU not yet machine-stepped ...
            // or input "i_step" is set and CPU not yet instruction-stepped, then...

            // use machine cycle counter to determine what to do
            switch (this.m_cycle) {
                // FETCH (machine cycle 0)
                case 0:
                    // Populate IR with word pointed to by PC
                    this.ir = this.getWordAt(this.getAddressFromPC());

                    // Indicate that next machine cycle will be a decode
                    this.m_next_type = "DECODE";



                    console.log("FETCH (Machine cycle 0). Next is DECODE");
                    // End machine cycle 0
                    break;

                // DECODE (machine cycle 1)
                case 1:
                    // Decode IR to get opcode
                    this.m_opcode = this.getOpCodeFromIR();

                    // Indicate the next machine cycle type based on the op-code
                    this.m_next_type = CPU.OPCODES[this.m_opcode].next_type[0];


                    console.log("DECODE (Machine cycle 1): "
                        + this.m_opcode
                        + ", "
                        + CPU.OPCODES[this.m_opcode].name
                        + ". Next is " + this.m_next_type
                    );
                    // End machine cycle 1
                    break;



                // INSTRUCTION-SPECIFIC (machine cycles 2 and beyond)
                default:
                    // call the opcode-specific function for the current machine cycle
                    CPU.OPCODES[this.m_opcode].funcs[this.m_cycle - 2](this);

                    // Indicate the next machine cycle type based on the op-code
                    this.m_next_type = CPU.OPCODES[this.m_opcode].next_type[this.m_cycle - 1];


                    console.log("(Machine cycle "
                        + this.m_cycle
                        + "). Next is "
                        + this.m_next_type
                    );
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

                // indicate that the CPU has finished an instruction step AND a machine step
                this.i_stepped = true;
                this.m_stepped = true;
            } else {
                // if instruction cycle is not finished, then...

                // increment machine cycle and indicate that CPU has machine-stepped
                this.m_cycle++;
                this.m_stepped = true;
            }
        }

        if (!this.input.m_step) {
            // if input "machine step" is cleared, clear the CPU "machine-stepped" status
            this.m_stepped = false;
        }

        if (!this.input.i_step) {
            // if input "instruction step" is cleared, clear the CPU "instruction-stepped" status
            this.i_stepped = false;
        }

        // indicate that something has changed in the CPU
        this.changed = true;
    }



};