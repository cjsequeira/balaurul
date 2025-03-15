"use strict";

// **** CPU CLASS
export class CPU {
    // **** STATIC CPU PARAMETERS
    static RAM_WORDS = 64;
    static BITS = 12;

    // machine cycle names
    static M_CYCLE_NAMES = {
        FETCH: "Fetch",
        DECODE: "Decode",
        MEM_READ: "Memory read",
        MEM_WRITE: "Memory write",
        INC_PC: "Increment PC",
        HALT: "Halt CPU",
    };

    // instructions and their implementation
    static OPCODES = [
        // 11 instructions ...
        // 0o00: NOP: No operation (just increment PC); 0 operands
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        // 0o01: LDA: Load accumulator from address; 1 operand
        {
            name: "LDA",
            num_ops: 1,
            funcs: [CPU.m_incPC, CPU.m_storePCaddrInMAR, CPU.m_storeMARaddrInA, CPU.m_incPC],
            next_type: [
                CPU.M_CYCLE_NAMES.INC_PC,
                CPU.M_CYCLE_NAMES.MEM_READ,
                CPU.M_CYCLE_NAMES.MEM_READ,
                CPU.M_CYCLE_NAMES.INC_PC
            ],
        },

        { name: "ADD", num_ops: 1, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "SUB", num_ops: 1, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        // 0o04: STA: Store accumulator in address; 1 operand
        {
            name: "STA",
            num_ops: 1,
            funcs: [CPU.m_incPC, CPU.m_storePCaddrInMAR, CPU.m_storeAatMARaddr, CPU.m_incPC],
            next_type: [
                CPU.M_CYCLE_NAMES.INC_PC,
                CPU.M_CYCLE_NAMES.MEM_READ,
                CPU.M_CYCLE_NAMES.MEM_WRITE,
                CPU.M_CYCLE_NAMES.INC_PC
            ],
        },

        // 0o05: LDI: Load accumulator from immediate; 1 operand
        {
            name: "LDI",
            num_ops: 1,
            funcs: [CPU.m_incPC, CPU.m_storePCaddrInA, CPU.m_incPC],
            next_type: [
                CPU.M_CYCLE_NAMES.INC_PC,
                CPU.M_CYCLE_NAMES.MEM_READ,
                CPU.M_CYCLE_NAMES.INC_PC
            ],
        },

        // 0o06: JMP: Unconditionally jump to address; 1 operand
        {
            name: "JMP",
            num_ops: 1,
            funcs: [CPU.m_incPC, CPU.m_storePCaddrInPC],
            next_type: [CPU.M_CYCLE_NAMES.INC_PC, CPU.M_CYCLE_NAMES.MEM_READ],
        },

        { name: "JC", num_ops: 1, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "JZ", num_ops: 1, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "OUT", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        // 0o12: HLT: Increment PC and halt
        {
            name: "HLT",
            num_ops: 0,
            funcs: [CPU.m_incPC, CPU.m_halt],
            next_type: [CPU.M_CYCLE_NAMES.INC_PC, CPU.M_CYCLE_NAMES.HALT],
        },

        // ... plus 53 extra NOP opcodes for padding ...
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },
        { name: "NOP", num_ops: 0, funcs: [CPU.m_incPC], next_type: [CPU.M_CYCLE_NAMES.INC_PC] },

        // ... equals 64 instructions numbered 0 through 63 (binary 111 111, or two octal digits)
    ];


    // **** STATIC MACHINE CYCLE OPERATIONS FOR EACH OPCODE
    // halt CPU
    static m_halt(cpu) {
        cpu.halted = true;
    }

    // increment PC
    static m_incPC(cpu) {
        cpu.incPC();
    }

    // store into RAM at address in MAR: value in A
    static m_storeAatMARaddr(cpu) {
        cpu.putWordAt(cpu.mar, cpu.a);
    }

    // store into A: word at address in MAR
    static m_storeMARaddrInA(cpu) {
        cpu.a = cpu.getWordAt(cpu.mar);
    }

    // store into A: word at address in PC
    static m_storePCaddrInA(cpu) {
        cpu.a = cpu.getWordAt(cpu.pc);
    }

    // store into MAR: word at address in PC
    static m_storePCaddrInMAR(cpu) {
        cpu.mar = cpu.getWordAt(cpu.pc);
    }

    // store into PC: word at address in PC
    static m_storePCaddrInPC(cpu) {
        cpu.pc = cpu.getWordAt(cpu.pc);
    }


    // **** NON-STATIC CLASS METHODS
    // constructor
    constructor() {
        // **** DEFINE CPU
        // define memory and registers
        this.mem = [];
        this.pc = 0;
        this.ir = 0;
        this.mar = 0;
        this.a = 0;
        this.b = 0;

        // define holders for old register values
        this.old_pc = 0;
        this.old_ir = 0;
        this.old_mar = 0;
        this.old_a = 0;
        this.old_b = 0;

        // define and set input lines
        this.input = {
            run: false,
            m_step: false,
            i_step: false,
        };

        // define and set machine cycle and instruction cycle info
        this.m_cycle = 0;
        this.m_opcode = 0;
        this.m_next_type = CPU.M_CYCLE_NAMES.FETCH;
        this.i_cycle = 0;

        // define and set CPU-wide internal JavaScript flag indicating whether a UI update is necessary
        this.update_ui = false;

        // define array to hold a list of changed RAM cells
        this.ram_changed = [];

        // define and set indicators for whether CPU has just advanced one machine cycle or instruction cycle
        this.m_stepped = false;
        this.i_stepped = false;

        // define and set CPU halt status
        this.halted = false;


        // **** INITIALIZE CPU
        // fill memory with random contents -- must do before populating IR!
        for (let i = 0; i < CPU.RAM_WORDS; i++) {
            // this.mem.push(Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1)));

            // !!!!!!!!!! 
            this.mem.push(0o04);
        }

        // fill registers PC, MAR, A, and B with random contents
        this.pc = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));
        this.mar = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));
        this.a = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));
        this.b = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));

        // populate IR with content pointed to by PC
        this.ir = this.getWordAt(this.pc);

        // now sync up old values
        this.syncOldAndNew();
    }

    // get word value at given address
    getWordAt(address) {
        // wrap around in memory if given address is higher than size of RAM
        let mod_address = address % CPU.RAM_WORDS;

        // initialize return value to null
        let value = null;

        if (mod_address >= 0) {
            // if address greater than zero, return value pointed to by address
            value = this.mem[mod_address];
        }

        // return value (note: null if given address was negative!)
        return value;
    }

    // get opcode stored in IR
    getOpCodeFromIR() {
        // use mod operator so there is never an invalid opcode!
        return (this.ir % CPU.OPCODES.length);
    }

    // translate IR value to a text string containing mnemonic, including operands
    getMnemonic() {
        // get opcode stored in IR
        let opcode = this.getOpCodeFromIR();

        // set mnemonic based on opcode and number of operands
        let mnemonic = CPU.OPCODES[opcode].name;

        for (let i = 0; i < CPU.OPCODES[opcode].num_ops; i++) {
            let operand = this.getWordAt(this.pc + i + 1);

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

    // put word value into given address
    // this function assumes that value AND address are greater than or equal to zero!
    // only the lowest CPU.BITS number of bits will be stored!
    putWordAt(address, value) {
        // wrap around in memory if given address is higher than size of RAM
        let mod_address = address % CPU.RAM_WORDS;

        // keep only the lowest CPU.BITS number of bits in the value
        let mod_value = value % Math.pow(2, CPU.BITS);

        if (mod_address >= 0) {
            // if address greater than zero then...

            if (this.mem[mod_address] != mod_value) {
                // if value at address is different from given value, then ...

                // add to list of changed RAM cells
                this.ram_changed.push(mod_address);

                // store value at address
                this.mem[mod_address] = mod_value;
            }
        }
    }

    // synchronize old values and new values
    syncOldAndNew() {
        this.old_pc = this.pc;
        this.old_ir = this.ir;
        this.old_mar = this.mar;
        this.old_a = this.a;
        this.old_b = this.b;

        // indicate that values are now synchronized
        this.update_ui = false;
        this.ram_changed = [];
    }

    // update
    update() {



        console.log("Next machine cycle: " + this.m_cycle + ", " + this.m_next_type);




        // sync old and new CPU values relevant to UI if needed
        if (this.update_ui) this.syncOldAndNew();

        if (
            (!this.halted)
            &&
            (
                this.input.run
                || (this.input.m_step && !this.m_stepped)
                || (this.input.i_step && !this.i_stepped)
            )

        ) {
            // if CPU not halted AND ...
            //  if input "run" is set ...
            //  or input "m_step" is set and CPU not yet machine-stepped ...
            //  or input "i_step" is set and CPU not yet instruction-stepped ...
            // then...







            // use machine cycle counter to determine what to do
            switch (this.m_cycle) {
                // FETCH (machine cycle 0)
                case 0:
                    // Populate IR with word pointed to by PC
                    this.ir = this.getWordAt(this.pc);
                    this.update_ui = true;
                    break;

                // DECODE (machine cycle 1)
                case 1:
                    // Decode IR to get opcode
                    this.m_opcode = this.getOpCodeFromIR();


                    console.log("-----> " + this.getMnemonic(this.m_opcode));



                    break;

                // INSTRUCTION-SPECIFIC (machine cycles 2 and beyond)
                default:
                    // call the opcode-specific function for the current machine cycle
                    CPU.OPCODES[this.m_opcode].funcs[this.m_cycle - 2](this);
                    this.update_ui = true;
                    break;
            }

            if ((this.m_cycle - 1) == CPU.OPCODES[this.m_opcode].funcs.length) {
                // if instruction cycle is finished, then...

                // increment instruction cycle counter
                this.i_cycle++;

                // reset machine cycle counter and "next" indicator
                // next machine cycle will be 0, which is always a "FETCH"
                this.m_cycle = 0;
                this.m_next_type = CPU.M_CYCLE_NAMES.FETCH;

                // indicate that the CPU has finished an instruction step AND a machine step
                this.i_stepped = true;
                this.m_stepped = true;
            } else {
                // if instruction cycle is not finished, then...

                if (this.m_cycle == 0) {
                    // if current machine cycle is 0, then next machine cycle type must be a DECODE
                    this.m_next_type = CPU.M_CYCLE_NAMES.DECODE;
                } else {
                    // if current machine cycle is not zero, get opcode-specific next machine cycle type
                    this.m_next_type = CPU.OPCODES[this.m_opcode].next_type[this.m_cycle - 1];
                }

                // increment machine cycle counter
                this.m_cycle++;

                // indicate that CPU has finished a machine step
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

    }
};