"use strict"

// **** UI

// **** MODULES
import * as ModuleCPUconsts from "./cpu_consts.js";


// **** FUNCTIONS
// return LED brightnesses with accumulation
export const accumulateLEDs = (cpu, accum, scale) => ({
    pc: accum.pc.map(
        (val, i) => (cpu.pc & Math.pow(2, i)) ? val + 1.0 / scale : val
    ),

    ir: accum.ir.map(
        (val, i) => (cpu.ir & Math.pow(2, i)) ? val + 1.0 / scale : val
    ),

    mar: accum.mar.map(
        (val, i) => (cpu.mar & Math.pow(2, i)) ? val + 1.0 / scale : val
    ),

    a: accum.a.map(
        (val, i) => (cpu.a & Math.pow(2, i)) ? val + 1.0 / scale : val
    ),

    b: accum.b.map(
        (val, i) => (cpu.pc & Math.pow(2, i)) ? val + 1.0 / scale : val
    ),

    out: accum.out.map(
        (val, i) => (cpu.out & Math.pow(2, i)) ? val + 1.0 / scale : val
    ),

    m_cycle: {
        ...accum.m_cycle,
        [cpu.m_next_type]: accum.m_cycle[cpu.m_next_type] += 1.0 / scale,
    },

    flags: {
        carry: accum.flags.carry + (cpu.flags.carry * 1.0) / scale,
        zero: accum.flags.zero + (cpu.flags.zero * 1.0) / scale,
    },

    status: {
        running: accum.status.running + (cpu.status.running * 1.0) / scale,
        halted: accum.status.halted + (cpu.status.halted * 1.0) / scale,
    },
})

// return sync of current CPU values
export const syncedUIvalues = (cpu) => ({
    pc: cpu.pc,
    mar: cpu.mar,
    ir: cpu.ir,
    a: cpu.a,
    b: cpu.b,
    out: cpu.out,
    mem: cpu.mem.map((elem) => elem)
})

// return zeroed LED accumulators
export const zeroedLEDaccumulators = () => ({
    pc: Array(12).fill(0.0),
    mar: Array(12).fill(0.0),
    ir: Array(12).fill(0.0),
    a: Array(12).fill(0.0),
    b: Array(12).fill(0.0),
    out: Array(12).fill(0.0),

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