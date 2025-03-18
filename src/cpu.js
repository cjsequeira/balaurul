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
        ALU: "ALU",
        OUT: "Out",
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

        // 0o02: ADD: Add value at address to accumulator using B as a temp register
        {
            name: "ADD",
            num_ops: 1,
            funcs: [CPU.m_incPC, CPU.m_storePCaddrInB, CPU.m_addBtoA, CPU.m_incPC],
            next_type: [
                CPU.M_CYCLE_NAMES.INC_PC,
                CPU.M_CYCLE_NAMES.MEM_READ,
                CPU.M_CYCLE_NAMES.ALU,
                CPU.M_CYCLE_NAMES.INC_PC
            ]
        },

        // 0o03: SUB: Subtract value at address from accumulator using B as a temp register
        {
            name: "SUB",
            num_ops: 1,
            funcs: [CPU.m_incPC, CPU.m_storePCaddrInB, CPU.m_subBfromA, CPU.m_incPC],
            next_type: [
                CPU.M_CYCLE_NAMES.INC_PC,
                CPU.M_CYCLE_NAMES.MEM_READ,
                CPU.M_CYCLE_NAMES.ALU,
                CPU.M_CYCLE_NAMES.INC_PC
            ]
        },

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

        // 0o07: JC: Jump to address if carry flag set; 1 operand
        {
            name: "JC",
            num_ops: 1,
            funcs: [CPU.m_incPC, CPU.m_ifCarryThenStorePCaddrInPC],
            next_type: [CPU.M_CYCLE_NAMES.INC_PC, CPU.M_CYCLE_NAMES.MEM_READ],
        },


        // 0o10: JZ: Jump to address if zero flag set; 1 operand
        {
            name: "JZ",
            num_ops: 1,
            funcs: [CPU.m_incPC, CPU.m_ifZeroThenStorePCaddrInPC],
            next_type: [CPU.M_CYCLE_NAMES.INC_PC, CPU.M_CYCLE_NAMES.MEM_READ],
        },

        // 0o11: OUT: Write accumulator to output
        {
            name: "OUT",
            num_ops: 0,
            funcs: [CPU.m_out, CPU.m_incPC],
            next_type: [CPU.M_CYCLE_NAMES.OUT, CPU.M_CYCLE_NAMES.INC_PC]
        },

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

        // ... equals 64 instructions (two octal digits)
    ];


    // **** STATIC MACHINE CYCLE OPERATIONS FOR EACH OPCODE
    // add B to A
    static m_addBtoA(cpu) {
        cpu.a += cpu.b;

        // set carry flag appropriately
        cpu.flags.carry = (cpu.a >= Math.pow(2, CPU.BITS));

        // restrict accumulator to only CPU.BITS in size
        cpu.a %= Math.pow(2, CPU.BITS);

        // set zero flag appropriately
        cpu.flags.zero = (cpu.a == 0);
    }

    // halt CPU
    static m_halt(cpu) {
        cpu.status.halted = true;
        cpu.status.running = false;
    }

    // if carry, then store into PC: word at address in PC
    static m_ifCarryThenStorePCaddrInPC(cpu) {
        if (cpu.flags.carry) {
            cpu.pc = cpu.getWordAt(cpu.pc);
        } else {
            cpu.incPC();
        }
    }

    // if zero, then store into PC: word at address in PC
    static m_ifZeroThenStorePCaddrInPC(cpu) {
        if (cpu.flags.zero) cpu.pc = cpu.getWordAt(cpu.pc);
    }

    // increment PC
    static m_incPC(cpu) {
        cpu.incPC();
    }

    // write accumulator to output
    static m_out(cpu) {
        cpu.out = cpu.a;
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

    // store into B: word at address in PC
    static m_storePCaddrInB(cpu) {
        cpu.b = cpu.getWordAt(cpu.pc);
    }

    // store into MAR: word at address in PC
    static m_storePCaddrInMAR(cpu) {
        cpu.mar = cpu.getWordAt(cpu.pc);
    }

    // store into PC: word at address in PC
    static m_storePCaddrInPC(cpu) {
        cpu.pc = cpu.getWordAt(cpu.pc);
    }

    // subtract B from A
    static m_subBfromA(cpu) {
        // to subtract, add the two's-complement of B to accumulator
        cpu.a += Math.pow(2, CPU.BITS) - cpu.b;

        // set carry flag appropriately
        // carry calc is inspired by the Intel 8080 Assembly Language Programmers Manual, Rev. B, 1975
        cpu.flags.carry = (cpu.a >= Math.pow(2, CPU.BITS));

        // restrict accumulator to only CPU.BITS in size
        cpu.a %= Math.pow(2, CPU.BITS);

        // set zero flag appropriately
        cpu.flags.zero = (cpu.a == 0);
    }


    // **** NON-STATIC CLASS METHODS
    // constructor
    // note that the constructor DOES NOT power on OR reset the CPU!
    constructor() {
        // **** DEFINE CPU
        // define memory, registers, output, and flags
        this.mem = [];

        this.pc = 0;
        this.ir = 0;
        this.mar = 0;
        this.a = 0;
        this.b = 0;

        this.out = 0;

        this.flags = {
            carry: false,
            zero: false,
        };

        // define and set CPU statuses
        this.status = {
            ready: false,
            doing_m_step: false,
            doing_i_step: false,
            running: false,
            halted: false,
            m_stepped: false,
            i_stepped: false,
        }

        // define and set input lines
        this.input = {
            on: false,
            run: false,
            reset: false,
            m_step: false,
            i_step: false,
        };

        // define and set machine cycle info
        this.m_cycle = 0;
        this.m_opcode = 0;
        this.m_next_type = CPU.M_CYCLE_NAMES.FETCH;
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

    // disassemble IR to a mnemonic
    disassembleIR() {
        return CPU.OPCODES[this.getOpCodeFromIR()].name;
    }

    // increment PC
    incPC() {
        // increment PC, wrapping around to zero if needed
        this.pc = (this.pc + 1) % Math.pow(2, CPU.BITS);
    }

    // power on the CPU
    // note that this DOES NOT reset the program counter!
    powerOn() {
        // set startup values for flags
        this.flags = {
            carry: false,
            zero: false,
        };

        // set startup values for statuses
        this.status = {
            ready: false,
            doing_m_step: false,
            doing_i_step: false,
            running: false,
            halted: false,
            m_stepped: false,
            i_stepped: false,
        }

        // set startup values for machine cycle info
        this.m_cycle = 0;
        this.m_opcode = 0;
        this.m_next_type = CPU.M_CYCLE_NAMES.FETCH;

        // set RAM to random contents
        this.mem = [];
        for (let i = 0; i < CPU.RAM_WORDS; i++) {
            this.mem.push(Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1)));
        }

        // set PC, IR, MAR, A, B, and OUT to random contents
        this.pc = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));
        this.ir = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));
        this.mar = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));
        this.a = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));
        this.b = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));
        this.out = Math.round(Math.random() * (Math.pow(2, CPU.BITS) - 1));

        // set CPU "ready" and "on" statuses to true
        this.status.ready = true;
        this.status.on = true;
    }

    // put word value into given address
    // this function assumes that value AND address are greater than or equal to zero!
    // only the lowest CPU.BITS number of bits will be stored!
    putWordAt(address, value) {
        // wrap around in memory if given address is higher than size of RAM
        let mod_address = address % CPU.RAM_WORDS;

        // keep only the lowest CPU.BITS number of bits in the value
        let mod_value = value % Math.pow(2, CPU.BITS);

        // store value at address
        this.mem[mod_address] = mod_value;
    }

    // reset CPU
    reset() {
        // only "reset" if CPU is on!
        if (this.status.on) {
            // clear halt status
            this.status.halted = false;

            // set program counter to zero
            this.pc = 0;

            // leave everything else alone!
        }
    }

    // scan input lines and adjust CPU status accordingly
    scanInputs() {
        if (this.input.on) {
            // if input line is "on" then...

            // ensure CPU status is "on"
            this.status.on = true;

            // power on the CPU if CPU not in "ready" status
            if (!this.status.ready) this.powerOn();

            // reset CPU if reset line is true
            if (this.input.reset) this.reset();

            if (this.input.run) {
                // if "run" input is true, then...

                // set CPU status to "running" only if CPU not halted!
                if (!this.status.halted) this.status.running = true;
            } else {
                // if "run" input is false, then... 

                // clear "running" and "halted" statuses
                this.status.running = false;
                this.status.halted = false;

                if (this.input.m_step) {
                    // if m-step input is true, then...

                    // set CPU status to "doing m step" if not in "m_stepped" status
                    if (!this.status.m_stepped) this.status.doing_m_step = true;
                } else {
                    // if m-step input is false, then clear CPU "m_stepped" status
                    this.status.m_stepped = false;
                }

                if (this.input.i_step) {
                    // if i-step input is true, then...

                    // set CPU status to "doing i step" if not in "i_stepped" status
                    if (!this.status.i_stepped) this.status.doing_i_step = true;
                } else {
                    // if i-step input is false AND not doing i step, then clear CPU "i_stepped" status
                    if (!this.status.doing_i_step) this.status.i_stepped = false;
                }
            }
        } else {
            // if "on" input line is false, clear various statuses
            this.status.on = false;
            this.status.running = false;
            this.status.halted = false;
            this.status.doing_m_step = false;
            this.status.doing_i_step = false;
            this.status.ready = false;
        }
    }

    // update
    update() {
        // scan input lines and adjust CPU status accordingly
        this.scanInputs();
        
        if (this.status.running || this.status.doing_m_step || this.status.doing_i_step) {
            // if CPU is running OR doing m step OR doing i step, then ...

            // use machine cycle counter to determine what to do
            switch (this.m_cycle) {
                // FETCH (machine cycle 0)
                case 0:
                    // Populate IR with word pointed to by PC
                    this.ir = this.getWordAt(this.pc);

                    // Next machine cycle must be a DECODE
                    this.m_next_type = CPU.M_CYCLE_NAMES.DECODE;

                    break;

                // DECODE (machine cycle 1)
                case 1:
                    // Decode IR to get opcode
                    this.m_opcode = this.getOpCodeFromIR();
                    break;

                // INSTRUCTION-SPECIFIC (machine cycles 2 and beyond)
                default:
                    // call the opcode-specific function for the current machine cycle
                    CPU.OPCODES[this.m_opcode].funcs[this.m_cycle - 2](this);
                    break;
            }

            // increment machine cycle counter
            this.m_cycle++;

            // indicate that CPU has finished a machine step
            this.status.m_stepped = true;
            this.status.doing_m_step = false;

            if (this.m_cycle > 1) {
                // if we have now passed FETCH and DECODE, then...

                if ((this.m_cycle - 2) >= CPU.OPCODES[this.m_opcode].funcs.length) {
                    // if instruction cycle is finished, then...

                    // reset machine cycle counter and "next" indicator
                    // next machine cycle will be 0, which is always a "FETCH"
                    this.m_cycle = 0;
                    this.m_next_type = CPU.M_CYCLE_NAMES.FETCH;

                    // indicate that the CPU has finished an instruction step
                    this.status.i_stepped = true;
                    this.status.doing_i_step = false;
                } else {
                    // if instruction cycle is not yet finished, then...

                    // next machine cycle type is opcode-specific
                    this.m_next_type = CPU.OPCODES[this.m_opcode].next_type[this.m_cycle - 2];
                }
            }
        }
    }


};