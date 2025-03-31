"use strict"

// **** UI

// **** MODULES
import * as ModuleCPUconsts from "./cpu_consts.js";


// **** CONSTANTS
// document BODY tag
const UI_BODY_TAG = document.getElementsByTagName("body")[0];


// **** ARROW FUNCTIONS
// return LED brightnesses with accumulation
export const accumulateLEDs = (cpu, LEDaccum, divisor) => ({
     registers: LEDaccum.registers.map((val, i) => ({
        pc: (cpu.pc & Math.pow(2, i)) ? val.pc + 1.0 / divisor : val.pc,
        ir: (cpu.ir & Math.pow(2, i)) ? val.ir + 1.0 / divisor : val.ir,
        mar: (cpu.mar & Math.pow(2, i)) ? val.mar + 1.0 / divisor : val.mar,
        a: (cpu.a & Math.pow(2, i)) ? val.a + 1.0 / divisor : val.a,
        b: (cpu.b & Math.pow(2, i)) ? val.b + 1.0 / divisor : val.b,
        out: (cpu.out & Math.pow(2, i)) ? val.out + 1.0 / divisor : val.out,
    })),

    m_cycle: {
        ...LEDaccum.m_cycle,
        [cpu.m_next_type]: LEDaccum.m_cycle[cpu.m_next_type] += 1.0 / divisor,
    },

    flags: {
        carry: LEDaccum.flags.carry + (cpu.flags.carry * 1.0) / divisor,
        zero: LEDaccum.flags.zero + (cpu.flags.zero * 1.0) / divisor,
    },

    status: {
        running: LEDaccum.status.running + (cpu.status.running * 1.0) / divisor,
        halted: LEDaccum.status.halted + (cpu.status.halted * 1.0) / divisor,
    },
});

// return sync of current CPU values
export const syncedUIvalues = (cpu) => ({
    pc: cpu.pc,
    mar: cpu.mar,
    ir: cpu.ir,
    a: cpu.a,
    b: cpu.b,
    out: cpu.out,
    mem: cpu.mem.map((elem) => elem),
})

// return zeroed LED accumulators
export const zeroedLEDaccumulators = () => ({
    registers: Array(ModuleCPUconsts.BITS).fill({
        pc: 0.0,
        ir: 0.0,
        mar: 0.0,
        a: 0.0,
        b: 0.0,
        out: 0.0,
    }),

    m_cycle: {
        [ModuleCPUconsts.M_CYCLE_NAMES.FETCH]: 0.0,
        [ModuleCPUconsts.M_CYCLE_NAMES.DECODE]: 0.0,
        [ModuleCPUconsts.M_CYCLE_NAMES.MEM_READ]: 0.0,
        [ModuleCPUconsts.M_CYCLE_NAMES.MEM_WRITE]: 0.0,
        [ModuleCPUconsts.M_CYCLE_NAMES.INC_PC]: 0.0,
        [ModuleCPUconsts.M_CYCLE_NAMES.HALT]: 0.0,
        [ModuleCPUconsts.M_CYCLE_NAMES.ALU]: 0.0,
        [ModuleCPUconsts.M_CYCLE_NAMES.IN]: 0.0,
        [ModuleCPUconsts.M_CYCLE_NAMES.OUT]: 0.0,
    },

    flags: {
        carry: 0.0,
        zero: 0.0,
    },

    status: {
        running: 0.0,
        halted: 0.0
    },
});


// **** TRADITIONAL FUNCTIONS
// callback: handle keyboard keypresses
export function handleKeys(event, keys) {
    if (event.target == UI_BODY_TAG) {
        // if recipient of key-up is the main body (e.g. not the circuit spy text editor), then ...
        let key = event.key.toLowerCase();

        // execute associated callback for keypress
        if (key in keys) keys[key]();
    }
}

// UI switch visual toggle function
export function sideEffect_toggleSwitch(ui_switch, transform_x, transform_y) {
    ui_switch.style.transform = "none";

    if (ui_switch.style.translate == "") {
        ui_switch.style.translate = transform_x.toString(10)
            + "px "
            + transform_y.toString(10)
            + "px"
    } else {
        ui_switch.style.translate = "";
    }
}