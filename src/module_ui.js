"use strict"

// **** UI

// **** MODULES
import * as ModuleCPUconsts from "./cpu_consts.js";


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

// return updated display string
export const updatedDisplayString = (char_code, string) =>
    (char_code == 8)
        // if OUT register is backspace (ASCII code 8), remove one char from tail
        ? string.substring(0, string.length - 1)

        // otherwise...
        : (char_code == 27)
            // if OUT register is escape (ASCII code 27), return empty string
            ? ""

            // otherwise, return string with appended character
            : string + String.fromCharCode(char_code)

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