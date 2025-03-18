"use strict";

// **** MODULES
import * as ModuleCPU from "./cpu.js";
import * as ModuleUtil from "./util.js";


// **** CONSTANTS
// Web page user interface

const UI_MEM_ROWS = 8;
const UI_MEM_COLS = 8;

const UI_TEXT_MEM_CELL_ID_PREFIX = "app_12bit_memcell_";
const UI_TEXT_MEM_CLASS = "memory";
const UI_TEXT_MEM_PC_CLASS = "mem_pc";
const UI_TEXT_MEM_MAR_CLASS = "mem_mar";
const UI_TEXT_CPU_CLASS = "cpu";
const UI_TEXT_HIGHLIGHT_CHANGED_CLASS = "highlight_changed";

const UI_PC_BINARY = document.getElementById("app_12bit_pc_binary");
const UI_PC_OCTAL = document.getElementById("app_12bit_pc_octal");
const UI_PC_HEX = document.getElementById("app_12bit_pc_hex");
const UI_PC_DEC = document.getElementById("app_12bit_pc_dec");

const UI_MAR_BINARY = document.getElementById("app_12bit_mar_binary");
const UI_MAR_OCTAL = document.getElementById("app_12bit_mar_octal");
const UI_MAR_HEX = document.getElementById("app_12bit_mar_hex");
const UI_MAR_DEC = document.getElementById("app_12bit_mar_dec");

const UI_IR_BINARY = document.getElementById("app_12bit_ir_binary");
const UI_IR_OCTAL = document.getElementById("app_12bit_ir_octal");
const UI_IR_HEX = document.getElementById("app_12bit_ir_hex");
const UI_IR_DEC = document.getElementById("app_12bit_ir_dec");

const UI_VAL_AT_PC = document.getElementById("app_12bit_val_at_pc");
const UI_IR_MNEMONIC = document.getElementById("app_12bit_ir_mnemonic");
const UI_M_NEXT_TYPE = document.getElementById("app_12bit_m_next_type");

const UI_A_BINARY = document.getElementById("app_12bit_a_binary");
const UI_A_OCTAL = document.getElementById("app_12bit_a_octal");
const UI_A_HEX = document.getElementById("app_12bit_a_hex");
const UI_A_DEC = document.getElementById("app_12bit_a_dec");
const UI_A_SIGNED_DEC = document.getElementById("app_12bit_a_signed_dec");

const UI_B_BINARY = document.getElementById("app_12bit_b_binary");
const UI_B_OCTAL = document.getElementById("app_12bit_b_octal");
const UI_B_HEX = document.getElementById("app_12bit_b_hex");
const UI_B_DEC = document.getElementById("app_12bit_b_dec");
const UI_B_SIGNED_DEC = document.getElementById("app_12bit_b_signed_dec");

const UI_OUT_BINARY = document.getElementById("app_12bit_out_binary");
const UI_OUT_OCTAL = document.getElementById("app_12bit_out_octal");
const UI_OUT_HEX = document.getElementById("app_12bit_out_hex");
const UI_OUT_DEC = document.getElementById("app_12bit_out_dec");
const UI_OUT_SIGNED_DEC = document.getElementById("app_12bit_out_signed_dec");

const UI_FLAG_CARRY = document.getElementById("app_12bit_flag_carry");
const UI_FLAG_ZERO = document.getElementById("app_12bit_flag_zero");

const UI_STATUS_RUNNING = document.getElementById("app_12bit_status_running");
const UI_STATUS_HALTED = document.getElementById("app_12bit_status_halted");

const UI_MEM = document.getElementById("app_12bit_memory");

const UI_RAM_IMPORT_EXPORT = document.getElementById("app_12bit_ram_import_export");

const UI_CONTROL_ON = document.getElementById("app_12bit_control_on");
const UI_CONTROL_OFF = document.getElementById("app_12bit_control_off");
const UI_CONTROL_RUN = document.getElementById("app_12bit_control_run");
const UI_CONTROL_STOP = document.getElementById("app_12bit_control_stop");
const UI_CONTROL_RESET = document.getElementById("app_12bit_control_reset");
const UI_CONTROL_M_STEP = document.getElementById("app_12bit_control_m_step");
const UI_CONTROL_I_STEP = document.getElementById("app_12bit_control_i_step");
const UI_CONTROL_RAM_IMPORT = document.getElementById("app_12bit_ram_import");
const UI_CONTROL_RAM_EXPORT = document.getElementById("app_12bit_ram_export");


// **** NON-CONSTANTS
// CPU
var cpu = new ModuleCPU.CPU();

// holders for old UI values
var old_pc = null;
var old_mar = null;
var old_ir = null;
var old_a = null;
var old_b = null;
var old_out = null;
var old_flag_carry = null;
var old_flag_zero = null;
var old_status_running = null;
var old_status_halted = null;
var old_mem = Array(UI_MEM_COLS * UI_MEM_ROWS);


// **** MAIN CODE
window.addEventListener("load", setup());


// **** FUNCTIONS
function setup() {
    // **** BUILD MEMORY BLOCK UI STRUCTURE IN HTML
    // table opener
    let memory_html = "<table class='" + UI_TEXT_MEM_CLASS + "'>";

    // empty corner at upper left
    memory_html += "<tr><td id='" + UI_TEXT_MEM_CELL_ID_PREFIX + "'>&nbsp;</td>";

    // column labels
    for (let j = 0; j < UI_MEM_COLS; j++) {
        memory_html += "<th class='"
            + UI_TEXT_MEM_CLASS
            + "'>&nbsp;xxx"
            + j
            + "&nbsp;</th>";
    }
    memory_html += "</tr>";

    // each row of memory, with a row label to the left
    for (let i = 0; i < UI_MEM_ROWS; i++) {
        // row label
        memory_html += "<tr><th class='"
            + UI_TEXT_MEM_CLASS
            + "'>"
            + (i * 8).toString(8).padStart(4, '0')
            + "</th>"

        // memory value field
        for (let j = 0; j < UI_MEM_COLS; j++) {
            memory_html += "<td class='"
                + UI_TEXT_CPU_CLASS
                + "' id='"
                + UI_TEXT_MEM_CELL_ID_PREFIX
                + (i * 8 + j).toString(10) + "'>&nbsp;</td>";
        }

        memory_html += "</tr>";
    }

    // table closer
    memory_html += "</table>";


    // **** INITIALIZE UI
    // format memory block UI with structure
    UI_MEM.innerHTML = memory_html;

    // establish initial statuses and callbacks for controls
    UI_CONTROL_ON.addEventListener("mousedown", ctrlOnDown);
    UI_CONTROL_OFF.addEventListener("mousedown", ctrlOffDown);
    UI_CONTROL_RUN.addEventListener("mousedown", ctrlRunDown);
    UI_CONTROL_STOP.addEventListener("mousedown", ctrlStopDown);
    UI_CONTROL_RESET.addEventListener("mousedown", ctrlResetDown);
    UI_CONTROL_M_STEP.addEventListener("mousedown", ctrlMstepDown);
    UI_CONTROL_I_STEP.addEventListener("mousedown", ctrlIstepDown);

    UI_CONTROL_RAM_IMPORT.addEventListener("click", ctrlRAMimport);
    UI_CONTROL_RAM_EXPORT.addEventListener("click", ctrlRAMexport);

    UI_CONTROL_ON.addEventListener("mouseup", ctrlOnUp);
    UI_CONTROL_OFF.addEventListener("mouseup", ctrlOffUp);
    UI_CONTROL_RUN.addEventListener("mouseup", ctrlRunUp);
    UI_CONTROL_STOP.addEventListener("mouseup", ctrlStopUp);
    UI_CONTROL_RESET.addEventListener("mouseup", ctrlResetUp);
    UI_CONTROL_M_STEP.addEventListener("mouseup", ctrlMstepUp);
    UI_CONTROL_I_STEP.addEventListener("mouseup", ctrlIstepUp);

    UI_CONTROL_ON.disabled = false;
    UI_CONTROL_OFF.disabled = true;
    UI_CONTROL_RUN.disabled = false;
    UI_CONTROL_STOP.disabled = true;
    UI_CONTROL_RAM_IMPORT.disabled = true;
    UI_CONTROL_RAM_EXPORT.disabled = true;


    // **** RESET UI
    resetUI();


    // **** ESTABLISH APP UPDATE CALLBACK
    requestAnimationFrame(appUpdate);
}

// app update callback for requestAnimationFrame()
function appUpdate() {
    // update CPU
    cpu.update();

    if (cpu.status.on) {
        // if CPU status is "on" then ...

        // show value at PC, disassembly of IR, and next machine cycle type
        UI_VAL_AT_PC.innerHTML = cpu.getWordAt(cpu.pc).toString(8).padStart(4, "0");
        UI_IR_MNEMONIC.innerHTML = cpu.disassembleIR();
        UI_M_NEXT_TYPE.innerHTML = cpu.m_next_type;

        // draw all RAM values; clear PC and MAR boxes
        cpu.mem.forEach((elem, i) => {
            // update the value in the cell, in octal
            document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + i.toString(10))
                .innerHTML = cpu.mem[i].toString(8).padStart(4, "0");

            // clear PC and MAR boxes
            document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + i.toString(10))
                .classList
                .remove(UI_TEXT_MEM_MAR_CLASS, UI_TEXT_MEM_PC_CLASS);

            // update highlighting
            if (old_mem[i] == elem) {
                document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + i.toString(10))
                    .classList
                    .remove(UI_TEXT_HIGHLIGHT_CHANGED_CLASS);
            } else {
                document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + i.toString(10))
                    .classList
                    .add(UI_TEXT_HIGHLIGHT_CHANGED_CLASS);
            }
        });

        // box current MAR memory element
        document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + (cpu.mar % ModuleCPU.CPU.RAM_WORDS).toString(10))
            .classList
            .add(UI_TEXT_MEM_MAR_CLASS);

        // box current PC memory element
        document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + (cpu.pc % ModuleCPU.CPU.RAM_WORDS).toString(10))
            .classList
            .add(UI_TEXT_MEM_PC_CLASS);

        // show CPU flags
        UI_FLAG_CARRY.innerHTML = ModuleUtil.showDiff(cpu.flags.carry.toString(), old_flag_carry.toString());
        UI_FLAG_ZERO.innerHTML = ModuleUtil.showDiff(cpu.flags.zero.toString(), old_flag_zero.toString());

        // show CPU status
        UI_STATUS_RUNNING.innerHTML = ModuleUtil.showDiff(cpu.status.running.toString(), old_status_running.toString());
        UI_STATUS_HALTED.innerHTML = ModuleUtil.showDiff(cpu.status.halted.toString(), old_status_halted.toString());

        // update all HTML numerical elements
        ModuleUtil.updateHTMLwithDiff(
            cpu.mar, old_mar,
            UI_MAR_BINARY, UI_MAR_OCTAL, UI_MAR_HEX, UI_MAR_DEC
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.pc, old_pc,
            UI_PC_BINARY, UI_PC_OCTAL, UI_PC_HEX, UI_PC_DEC
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.ir, old_ir,
            UI_IR_BINARY, UI_IR_OCTAL, UI_IR_HEX, UI_IR_DEC
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.a, old_a,
            UI_A_BINARY, UI_A_OCTAL, UI_A_HEX, UI_A_DEC, UI_A_SIGNED_DEC, ModuleCPU.CPU.BITS
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.b, old_b,
            UI_B_BINARY, UI_B_OCTAL, UI_B_HEX, UI_B_DEC, UI_B_SIGNED_DEC, ModuleCPU.CPU.BITS
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.out, old_out,
            UI_OUT_BINARY, UI_OUT_OCTAL, UI_OUT_HEX, UI_OUT_DEC, UI_OUT_SIGNED_DEC, ModuleCPU.CPU.BITS
        );

        // if CPU is running, sync old UI values
        if (cpu.status.running) syncUIvalues();
    }


    // **** GET BACK IN QUEUE
    requestAnimationFrame(appUpdate);
}

// reset UI
function resetUI() {
    // for each CPU UI text field on the web page: clear all text; remove boxing and highlighting
    for (let elem of Array.from(document.getElementsByClassName(UI_TEXT_CPU_CLASS))) {
        elem.innerHTML = "&nbsp;";
        elem.classList.remove(
            UI_TEXT_HIGHLIGHT_CHANGED_CLASS,
            UI_TEXT_MEM_MAR_CLASS,
            UI_TEXT_MEM_PC_CLASS
        );
    };
}

// sync "old" UI values to current CPU values
function syncUIvalues() {
    old_pc = cpu.pc;
    old_mar = cpu.mar;
    old_ir = cpu.ir;
    old_a = cpu.a;
    old_b = cpu.b;
    old_out = cpu.out;
    old_flag_carry = cpu.flags.carry
    old_flag_zero = cpu.flags.zero;
    old_status_running = cpu.status.running;
    old_status_halted = cpu.status.halted;

    cpu.mem.forEach((elem, i) => (old_mem[i] = elem));
}

// **** UI CONTROL CALLBACK FUNCTIONS
// after each button press, make CPU rescan inputs right away so as not to miss anything
function ctrlOnDown() {
    UI_CONTROL_ON.disabled = true;
    UI_CONTROL_OFF.disabled = false;
    UI_CONTROL_RAM_IMPORT.disabled = false;
    UI_CONTROL_RAM_EXPORT.disabled = false;

    cpu.input.on = true;
    cpu.scanInputs();
    syncUIvalues();
}

function ctrlOffDown() {
    UI_CONTROL_ON.disabled = false;
    UI_CONTROL_OFF.disabled = true;
    UI_CONTROL_RAM_IMPORT.disabled = true;
    UI_CONTROL_RAM_EXPORT.disabled = true;

    cpu.input.on = false;
    cpu.scanInputs();
    resetUI();
}

function ctrlRunDown() {
    UI_CONTROL_RUN.disabled = true;
    UI_CONTROL_STOP.disabled = false;

    cpu.input.run = true;
    cpu.scanInputs();
}

function ctrlStopDown() {
    UI_CONTROL_RUN.disabled = false;
    UI_CONTROL_STOP.disabled = true;
    
    cpu.input.run = false;
    cpu.scanInputs();
    syncUIvalues();
}

function ctrlResetDown() {
    cpu.input.reset = true;
    cpu.scanInputs();
    syncUIvalues();
}

function ctrlMstepDown() {
    cpu.input.m_step = true;
    cpu.scanInputs();
    syncUIvalues();
}

function ctrlIstepDown() {
    cpu.input.i_step = true;
    cpu.scanInputs();
    syncUIvalues();
}

function ctrlOnUp() {

}

function ctrlOffUp() {

}

function ctrlRunUp() {

}

function ctrlStopUp() {

}

function ctrlResetUp() {
    cpu.input.reset = false;
    cpu.scanInputs();
}

function ctrlMstepUp() {
    cpu.input.m_step = false;
    cpu.scanInputs();
}

function ctrlIstepUp() {
    cpu.input.i_step = false;
    cpu.scanInputs();
}

function ctrlRAMimport() {
    // sync UI values BEFORE RAM replacement
    syncUIvalues();

    cpu.replaceRAM(UI_RAM_IMPORT_EXPORT.value);
}

function ctrlRAMexport() {
    UI_RAM_IMPORT_EXPORT.value = cpu.exportRAM();
}