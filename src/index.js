"use strict";

// **** MODULES
import * as ModuleCPU from "./cpu.js";
import * as ModuleUtil from "./util.js";


// **** CONSTANTS
// Web page user interface
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
const UI_TEXT_MEM_CELL_ID_PREFIX = "app_12bit_memcell_";
const UI_TEXT_MEM_CLASS = "memory";
const UI_TEXT_MEM_PC_CLASS = "mem_pc";
const UI_TEXT_MEM_MAR_CLASS = "mem_mar";
const UI_TEXT_HIGHLIGHT_CHANGED_CLASS = "highlight_changed";
const UI_MEM_ROWS = 8;
const UI_MEM_COLS = 8;

const UI_BUTTON_RUN = document.getElementById("app_12bit_control_run");
const UI_BUTTON_STOP = document.getElementById("app_12bit_control_stop");
const UI_BUTTON_M_STEP = document.getElementById("app_12bit_control_m_step");
const UI_BUTTON_I_STEP = document.getElementById("app_12bit_control_i_step");


// **** NON-CONSTANTS
// CPU
var cpu = new ModuleCPU.CPU();


// **** MAIN CODE
window.addEventListener("load", setup());


// **** FUNCTIONS
function setup() {
    // **** BUILD MEMORY BLOCK UI STRUCTURE IN HTML
    // table opener
    let memory_html = "<table class='" + UI_TEXT_MEM_CLASS + "'>";

    // empty corner at upper left
    memory_html += "<tr><td id='"
        + UI_TEXT_MEM_CELL_ID_PREFIX
        + "'></td>";

    // column labels
    for (let j = 0; j < UI_MEM_COLS; j++) {
        memory_html += "<th class='" + UI_TEXT_MEM_CLASS
            + "'>"
            + "xxx"
            + j
            + "</th>";
    }
    memory_html += "</tr>";

    // each row of memory, with a row label to the left
    for (let i = 0; i < UI_MEM_ROWS; i++) {
        memory_html += "<tr><th class='"
            + UI_TEXT_MEM_CLASS
            + "'>"
            + (i * 8).toString(8).padStart(4, '0')
            + "</th>"

        for (let j = 0; j < UI_MEM_COLS; j++) {
            memory_html += "<td id='"
                + UI_TEXT_MEM_CELL_ID_PREFIX
                + (i * 8 + j).toString(10) + "'>"
                + ModuleUtil.padSpace("", 4)
                + "</td>";
        }

        memory_html += "</tr>";
    }

    // table closer
    memory_html += "</table>";


    // **** INITIALIZE UI
    // format memory block UI with structure
    UI_MEM.innerHTML = memory_html;


    // **** ESTABLISH CALLBACKS FOR BUTTONS
    UI_BUTTON_RUN.addEventListener("mousedown", btn_run_down);
    UI_BUTTON_STOP.addEventListener("mousedown", btn_stop_down);
    UI_BUTTON_M_STEP.addEventListener("mousedown", btn_m_step_down);
    UI_BUTTON_I_STEP.addEventListener("mousedown", btn_i_step_down);

    UI_BUTTON_RUN.addEventListener("mouseup", btn_run_up);
    UI_BUTTON_STOP.addEventListener("mouseup", btn_stop_up);
    UI_BUTTON_M_STEP.addEventListener("mouseup", btn_m_step_up);
    UI_BUTTON_I_STEP.addEventListener("mouseup", btn_i_step_up);


    // **** ESTABLISH APP UPDATE CALLBACK
    requestAnimationFrame(appUpdate);
}

// app update callback for requestAnimationFrame()
function appUpdate() {
    // update CPU
    cpu.update();

    if (cpu.update_ui) {
        // if a UI update is needed, then ...

        // show value at PC, disassembly of IR, and next machine cycle type
        UI_VAL_AT_PC.innerHTML = cpu.getWordAt(cpu.pc).toString(8).padStart(4, "0");
        UI_IR_MNEMONIC.innerHTML = cpu.disassembleIR();
        UI_M_NEXT_TYPE.innerHTML = cpu.m_next_type;

        // delete old MAR box in memory UI element
        document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + (cpu.old_mar % ModuleCPU.CPU.RAM_WORDS).toString(10))
            .classList
            .remove(UI_TEXT_MEM_MAR_CLASS);

        // delete old PC box in memory UI element
        document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + (cpu.old_pc % ModuleCPU.CPU.RAM_WORDS).toString(10))
            .classList
            .remove(UI_TEXT_MEM_PC_CLASS);

        // draw all RAM values, with no highlights
        cpu.mem.forEach((_, i) => {
            // update the value in the cell, in octal
            document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + i.toString(10))
                .innerHTML = cpu.mem[i].toString(8).padStart(4, "0");

            // remove the highlight style
            document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + i.toString(10))
                .classList
                .remove(UI_TEXT_HIGHLIGHT_CHANGED_CLASS);

            return;
        });

        // iterate through any changed RAM cells, updating the highlights
        cpu.ram_changed.forEach((address) => {
            // update the value in the cell, in octal
            document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + address.toString(10))
                .innerHTML = cpu.mem[address].toString(8).padStart(4, "0");

            // add the highlight style
            document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + address.toString(10))
                .classList
                .add(UI_TEXT_HIGHLIGHT_CHANGED_CLASS);

            return;
        });

        // show CPU flags
        UI_FLAG_CARRY.innerHTML = ModuleUtil.showDiff(cpu.flags.carry.toString(), cpu.old_flags.carry.toString());
        UI_FLAG_ZERO.innerHTML = ModuleUtil.showDiff(cpu.flags.zero.toString(), cpu.old_flags.zero.toString());

        // show CPU status
        UI_STATUS_RUNNING.innerHTML = ModuleUtil.showDiff(cpu.status.running.toString(), cpu.old_status.running.toString());
        UI_STATUS_HALTED.innerHTML = ModuleUtil.showDiff(cpu.status.halted.toString(), cpu.old_status.halted.toString());

        // box current MAR memory element
        document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + (cpu.mar % ModuleCPU.CPU.RAM_WORDS).toString(10))
            .classList
            .add(UI_TEXT_MEM_MAR_CLASS);

        // box current PC memory element
        document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + (cpu.pc % ModuleCPU.CPU.RAM_WORDS).toString(10))
            .classList
            .add(UI_TEXT_MEM_PC_CLASS);

        // update all HTML numerical elements
        ModuleUtil.updateHTMLwithDiff(
            cpu.mar, cpu.old_mar,
            UI_MAR_BINARY, UI_MAR_OCTAL, UI_MAR_HEX, UI_MAR_DEC
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.pc, cpu.old_pc,
            UI_PC_BINARY, UI_PC_OCTAL, UI_PC_HEX, UI_PC_DEC
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.ir, cpu.old_ir,
            UI_IR_BINARY, UI_IR_OCTAL, UI_IR_HEX, UI_IR_DEC
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.a, cpu.old_a,
            UI_A_BINARY, UI_A_OCTAL, UI_A_HEX, UI_A_DEC, UI_A_SIGNED_DEC, ModuleCPU.CPU.BITS
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.b, cpu.old_b,
            UI_B_BINARY, UI_B_OCTAL, UI_B_HEX, UI_B_DEC, UI_B_SIGNED_DEC, ModuleCPU.CPU.BITS
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.out, cpu.old_out,
            UI_OUT_BINARY, UI_OUT_OCTAL, UI_OUT_HEX, UI_OUT_DEC, UI_OUT_SIGNED_DEC, ModuleCPU.CPU.BITS
        );

        // sync old and new CPU values relevant to UI
        cpu.syncOldAndNewForUI();
    }


    // **** GET BACK IN QUEUE
    requestAnimationFrame(appUpdate);
}


// **** BUTTON CALLBACK FUNCTIONS
function btn_run_down() {
    cpu.input.run = true;
}

function btn_stop_down() {
    cpu.input.run = false;
}

function btn_m_step_down() {
    cpu.input.m_step = true;
}

function btn_i_step_down() {
    cpu.input.i_step = true;
}

function btn_run_up() {
    
}

function btn_stop_up() {
    
}

function btn_m_step_up() {
    cpu.input.m_step = false;
}

function btn_i_step_up() {
    cpu.input.i_step = false;
}