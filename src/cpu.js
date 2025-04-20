"use strict";

// **** CPU

// **** MODULES
import * as ModuleCPUconsts from "./cpu_consts.js";
import { boolListToNumber } from "./util.js";


// **** CPU CLASS
export class CPU {
    // constructor
    // note that the constructor DOES NOT power on OR reset the CPU!
    constructor() {
        // define memory, registers, output, and flags
        this.mem = [];

        this.pc = 0;
        this.ir = 0;
        this.mar = 0;
        this.a = 0;
        this.b = 0;

        this.out = 0;
        this.out_stamp = 0;

        this.key_pressed = 0;

        this.flags = {
            carry: false,
            zero: false,
        };

        // define CPU statuses
        this.status = {
            ready: false,
            doing_m_step: false,
            doing_i_step: false,
            running: false,
            halted: false,
        }

        // define numerical holder for input switches
        this.input_switch_value = 0;

        // define machine cycle info
        this.m_cycle = 0;
        this.m_opcode = 0;
        this.m_next_type = ModuleCPUconsts.M_CYCLE_NAMES.FETCH;

        // define machine cycle and instruction cycle counters
        this.elapsed_m = 0;
        this.elapsed_i = 0;
    }

    // export RAM as octal strings if CPU is on; else export empty string
    exportRAM() {
        let ram_string = "";

        if (this.status.on) {
            // get number of octal digits in a CPU word, based on ModuleCPUconsts.BITS
            // an octal digit is three bits in size
            let num_digits = Math.round(ModuleCPUconsts.BITS / 3);

            // iterate through all words in memory, adding a line break every 8 words
            this.mem.forEach((value, i) => {
                if (((i % 8) == 0) && (i > 0)) ram_string += "\r\n";

                ram_string += value.toString(8).padStart(num_digits, "0") + " ";
            });
        }

        return ram_string;
    }

    // get word value at given address
    // assumes that address is a positive number!
    getWordAt(address) {
        // wrap around in memory if given address is higher than size of RAM
        let mod_address = address % ModuleCPUconsts.RAM_WORDS;

        // return value at wrapped-around memory address
        return this.mem[mod_address];
    }

    // get opcode stored in IR
    getOpCodeFrom(value) {
        // use mod operator so there is never an invalid opcode!
        return (value % ModuleCPUconsts.OPCODES.length);
    }

    // disassemble value to a mnemonic
    disassemble(value) {
        return ModuleCPUconsts.OPCODES[this.getOpCodeFrom(value)].name;
    }

    // increment PC
    incPC() {
        this.setPC(this.pc + 1);
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
        }

        // reset buffer for keyboard input
        this.key_pressed = 0;

        // set startup values for machine cycle info
        this.m_cycle = 0;
        this.m_opcode = 0;
        this.m_next_type = ModuleCPUconsts.M_CYCLE_NAMES.FETCH;

        // reset machine cycle and instruction cycle counters
        this.elapsed_m = 0;
        this.elapsed_i = 0;

        // set RAM to random contents
        this.mem = [];
        for (let i = 0; i < ModuleCPUconsts.RAM_WORDS; i++) {
            this.mem.push(Math.round(Math.random() * (Math.pow(2, ModuleCPUconsts.BITS) - 1)));
        }

        // set PC, IR, MAR, A, B, and OUT to random contents
        this.pc = Math.round(Math.random() * (Math.pow(2, ModuleCPUconsts.BITS) - 1));
        this.ir = Math.round(Math.random() * (Math.pow(2, ModuleCPUconsts.BITS) - 1));
        this.mar = Math.round(Math.random() * (Math.pow(2, ModuleCPUconsts.BITS) - 1));
        this.a = Math.round(Math.random() * (Math.pow(2, ModuleCPUconsts.BITS) - 1));
        this.b = Math.round(Math.random() * (Math.pow(2, ModuleCPUconsts.BITS) - 1));
        this.out = Math.round(Math.random() * (Math.pow(2, ModuleCPUconsts.BITS) - 1));

        // set CPU "ready" and "on" statuses to true
        this.status.ready = true;
        this.status.on = true;
    }

    // put word value into given address
    // this function assumes that value AND address are greater than or equal to zero!
    // only the lowest ModuleCPUconsts.BITS number of bits will be stored!
    putWordAt(address, value) {
        // wrap around in memory if given address is higher than size of RAM
        let mod_address = address % ModuleCPUconsts.RAM_WORDS;

        // keep only the lowest ModuleCPUconsts.BITS number of bits in the value
        let mod_value = value % Math.pow(2, ModuleCPUconsts.BITS);

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
        }

        // reset machine cycle info
        this.m_cycle = 0;
        this.m_opcode = 0;
        this.m_next_type = ModuleCPUconsts.M_CYCLE_NAMES.FETCH;

        // reset machine cycle and instruction cycle counters
        this.elapsed_m = 0;
        this.elapsed_i = 0;

        // set CPU "ready" to true
        this.status.ready = true;

        // leave everything else alone!
    }

    // replace RAM with contents of a text string IF CPU is on AND "run" input is false AND CPU not halted
    // all digits are treated as octal digits
    // all characters not 0 through 7 are ignored (skipped)
    // if there are fewer words than ModuleCPUconsts.RAM_WORDS, zeros are added to the end
    // if there are more words than ModuleCPUconsts.RAM_WORDS, just the first ModuleCPUconsts.RAM_WORDS are stored
    replaceRAM(in_string) {
        if ((this.status.on) && (!this.status.running) && (!this.status.halted)) {
            // if CPU is on AND CPU is not running, then...

            // string containing valid octal digits
            let octal = "01234567";

            // pointer to current CPU RAM word being populated
            let pointer = 0;

            // get number of octal digits in a CPU word, based on ModuleCPUconsts.BITS
            // an octal digit is three bits in size
            let num_digits = Math.round(ModuleCPUconsts.BITS / 3);
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
    scanInputs(input) {
        if (input.on) {
            // if "on" input line is true, then...

            // ensure CPU status is "on"
            this.status.on = true;

            // power on the CPU if CPU not in "ready" status
            if (!this.status.ready) this.powerOn();

            // store the current status of the input switches as a number
            this.input_switch_value = boolListToNumber(input.input_switches)

            // update buffer for keyboard data input if not null
            if (input.key_pressed) this.key_pressed = input.key_pressed;

            if (input.run) {
                // if "run" input is true, then...

                // set CPU status to "running" only if CPU not halted!
                if (!this.status.halted) this.status.running = true;
            } else {
                // if "run" input is false, then... 

                // clear "running" and "halted" statuses
                this.status.running = false;
                this.status.halted = false;

                // reset CPU if reset line is true AND CPU is on
                if ((input.reset) && (this.status.on)) this.reset();

                if (input.m_step) {
                    // if "m-step" input is true, then...

                    // set CPU status to "doing m step"
                    this.status.doing_m_step = true;
                }

                if (input.i_step) {
                    // if "i-step" input is true, then...

                    // set CPU status to "doing i step"
                    this.status.doing_i_step = true;
                }

                if (input.examine) {
                    // if "examine" input is true, then ...

                    // set the PC to the input word
                    this.setPC(this.input_switch_value);

                    // set "out" to show the value at the memory address pointed to by the PC
                    this.out = this.getWordAt(this.pc);
                }

                if (input.examine_next) {
                    // if "examine_next" input is true, then ...

                    // increment the PC
                    this.incPC();

                    // set "out" to show the value at the memory address pointed to by the PC
                    this.out = this.getWordAt(this.pc);
                }

                if (input.deposit) {
                    // if "deposit" input is true, then ...

                    // write input word into address pointed to by PC
                    this.putWordAt(this.pc, this.input_switch_value);

                    // set "out" to show the value at the memory address pointed to by the PC
                    this.out = this.getWordAt(this.pc);
                }

                if (input.deposit_next) {
                    // if "deposit_next" input is true, then ...

                    // FIRST increment the PC
                    this.incPC();

                    // write input word into address pointed to by PC
                    this.putWordAt(this.pc, this.input_switch_value);

                    // set "out" to show the value at the memory address pointed to by the PC
                    this.out = this.getWordAt(this.pc);
                }
            }
        } else {
            // if "on" input line is false, clear various statuses and key buffer
            this.status.on = false;
            this.status.running = false;
            this.status.halted = false;
            this.status.doing_m_step = false;
            this.status.doing_i_step = false;
            this.status.ready = false;
            this.key_pressed = 0;
        }
    }

    // set PC to the given value, wrapping around if needed based on CPU bit size
    setPC(value) {
        this.pc = value % Math.pow(2, ModuleCPUconsts.BITS);
    }

    // update
    update() {
        if (this.status.running || this.status.doing_m_step || this.status.doing_i_step) {
            // if CPU is running OR doing machine step OR doing instruction step, then ...

            // use machine cycle indicator to determine what to do
            switch (this.m_cycle) {
                // FETCH (machine cycle 0)
                case 0:
                    // Populate IR with word pointed to by PC
                    this.ir = this.getWordAt(this.pc);

                    // Next machine cycle MUST be a DECODE
                    this.m_next_type = ModuleCPUconsts.M_CYCLE_NAMES.DECODE;

                    break;

                // DECODE (machine cycle 1)
                case 1:
                    // Decode IR to get opcode
                    this.m_opcode = this.getOpCodeFrom(this.ir);
                    break;

                // INSTRUCTION-SPECIFIC (machine cycles 2 and beyond)
                default:
                    // call the opcode-specific function for the current machine cycle
                    ModuleCPUconsts.OPCODES[this.m_opcode].funcs[this.m_cycle - 2](this);
                    break;
            }

            // increment machine cycle indicator
            this.m_cycle++;

            // increment total number of elapsed machine cycles
            this.elapsed_m++;

            // indicate that CPU has finished a machine step
            this.status.doing_m_step = false;

            if (this.m_cycle > 1) {
                // if we have now passed FETCH and DECODE, then...

                if ((this.m_cycle - 2) >= ModuleCPUconsts.OPCODES[this.m_opcode].funcs.length) {
                    // if instruction cycle is finished, then...

                    // reset machine cycle indicator and "next" indicator
                    // next machine cycle will be 0, which is always a "FETCH"
                    this.m_cycle = 0;
                    this.m_next_type = ModuleCPUconsts.M_CYCLE_NAMES.FETCH;

                    // indicate that the CPU has finished an instruction step
                    this.status.doing_i_step = false;

                    // increment total number of elapsed instruction cycles
                    this.elapsed_i++;
                } else {
                    // if instruction cycle is not yet finished, then...

                    // next machine cycle type is opcode-specific
                    this.m_next_type = ModuleCPUconsts.OPCODES[this.m_opcode].next_type[this.m_cycle - 2];
                }
            }
        }
    }
};