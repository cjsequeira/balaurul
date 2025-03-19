"use strict";

// **** CPU

// **** MODULES
import * as ModuleCPUconsts from "./cpu_consts.js";


// **** CPU CLASS
export class CPU {
    // **** STATIC CPU PARAMETERS
    static RAM_WORDS = ModuleCPUconsts.RAM_WORDS;
    static BITS = ModuleCPUconsts.BITS;

    // machine cycle names
    static M_CYCLE_NAMES = ModuleCPUconsts.M_CYCLE_NAMES;

    // instructions and their implementation
    static OPCODES = ModuleCPUconsts.OPCODES;


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

    // export RAM as octal strings
    exportRAM() {
        let ram_string = "";

        // get number of octal digits in a CPU word, based on CPU.BITS
        // an octal digit is three bits in size
        let num_digits = Math.round(CPU.BITS / 3);

        // iterate through all words in memory, adding a line break every 8 words
        this.mem.forEach((value, i) => {
            if (((i % 8) == 0) && (i > 0)) ram_string += "\r\n";

            ram_string += value.toString(8).padStart(num_digits, "0") + " ";
        });

        return ram_string;
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
        // set program counter to zero
        this.pc = 0;

        // reset flags
        this.flags = {
            carry: false,
            zero: false,
        };

        // reset statuses
        this.status = {
            ready: false,
            doing_m_step: false,
            doing_i_step: false,
            running: false,
            halted: false,
            m_stepped: false,
            i_stepped: false,
        }

        // reset machine cycle info
        this.m_cycle = 0;
        this.m_opcode = 0;
        this.m_next_type = CPU.M_CYCLE_NAMES.FETCH;

        // set CPU "ready" to true
        this.status.ready = true;

        // leave everything else alone!
    }

    // replace RAM with contents of a text string IF CPU is on and NOT running
    // all digits are treated as octal digits
    // all characters not 0 through 7 are ignored (skipped)
    // if there are fewer words than CPU.RAM_WORDS, zeros are added to the end
    // if there are more words than CPU.RAM_WORDS, just the first CPU.RAM_WORDS are stored
    replaceRAM(in_string) {
        if ((this.status.on) && (!this.status.running)) {
            // if CPU is on AND CPU is not running, then...

            // string containing octal digits
            let octal = "01234567";

            // pointer to current CPU RAM word being populated
            let pointer = 0;

            // get number of octal digits in a CPU word, based on CPU.BITS
            // an octal digit is three bits in size
            let num_digits = Math.round(CPU.BITS / 3);
            let word_string = "";

            // convert RAM input string to array for iteration
            let input = Array.from(in_string);

            // iterate through each character of input array 
            input.forEach((char) => {
                if ((octal.indexOf(char) >= 0) && (pointer < this.mem.length)) {
                    // if character is an octal digit AND there is still RAM to replace, then...

                    // add to word string
                    word_string += char;

                    // if word string now contains enough digits, write to RAM and reset string
                    if (word_string.length == num_digits) {
                        this.mem[pointer] = parseInt(word_string, 8);

                        // reset word string and point to next word in RAM
                        word_string = "";
                        pointer++;
                    }
                }
            });
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

            if (this.input.run) {
                // if "run" input is true, then...

                // set CPU status to "running" only if CPU not halted!
                if (!this.status.halted) this.status.running = true;
            } else {
                // if "run" input is false, then... 

                // clear "running" and "halted" statuses
                this.status.running = false;
                this.status.halted = false;

                // reset CPU if reset line is true AND CPU is on
                if ((this.input.reset) && (this.status.on)) this.reset();

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