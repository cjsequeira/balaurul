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
const UI_IR_MNEMONIC = document.getElementById("app_12bit_ir_mnemonic");

const UI_A_BINARY = document.getElementById("app_12bit_a_binary");
const UI_A_OCTAL = document.getElementById("app_12bit_a_octal");
const UI_A_HEX = document.getElementById("app_12bit_a_hex");
const UI_A_DEC = document.getElementById("app_12bit_a_dec");
const UI_A_2S_COMP_DEC = document.getElementById("app_12bit_a_2s_comp_dec");

const UI_B_BINARY = document.getElementById("app_12bit_b_binary");
const UI_B_OCTAL = document.getElementById("app_12bit_b_octal");
const UI_B_HEX = document.getElementById("app_12bit_b_hex");
const UI_B_DEC = document.getElementById("app_12bit_b_dec");
const UI_B_2S_COMP_DEC = document.getElementById("app_12bit_b_2s_comp_dec");

const UI_MEM = document.getElementById("app_12bit_memory");
const UI_MEM_CELL_ID_PREFIX = "app_12bit_memcell_";
const UI_MEM_PC_CLASS = "mem_pc";
const UI_MEM_MAR_CLASS = "mem_mar";
const UI_MEM_CHANGED_CLASS = "mem_changed";
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
    let memory_html = "<table>";

    // column labels
    memory_html += "<tr><td></td>"
    for (let j = 0; j < UI_MEM_COLS; j++) {
        memory_html += "<th>" + "xxx" + j + "</th>";
    }
    memory_html += "</tr>"

    // each row of memory, with a row label to the left
    for (let i = 0; i < UI_MEM_ROWS; i++) {
        memory_html += "<tr><th>" + (i * 8).toString(8).padStart(4, '0') + "</th>"

        for (let j = 0; j < UI_MEM_COLS; j++) {
            memory_html += "<td id='"
                + UI_MEM_CELL_ID_PREFIX
                + (i * 8 + j).toString(10) + "'>"
                + cpu.mem[i * 8 + j].toString(8).padStart(4, '0')
                + "</td>";
        }

        memory_html += "</tr>";
    }

    // table closer
    memory_html += "</table>";


    // **** INITIALIZE UI
    // show register values
    UI_PC_BINARY.innerHTML = cpu.pc.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& ');
    UI_PC_OCTAL.innerHTML = cpu.pc.toString(8).padStart(4, "0");
    UI_PC_HEX.innerHTML = cpu.pc.toString(16).padStart(3, "0").toUpperCase();
    UI_PC_DEC.innerHTML = cpu.pc.toString(10);

    UI_MAR_BINARY.innerHTML = cpu.mar.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& ');
    UI_MAR_OCTAL.innerHTML = cpu.mar.toString(8).padStart(4, "0");
    UI_MAR_HEX.innerHTML = cpu.mar.toString(16).padStart(3, "0").toUpperCase();
    UI_MAR_DEC.innerHTML = cpu.mar.toString(10);

    UI_IR_BINARY.innerHTML = cpu.ir.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& ');
    UI_IR_OCTAL.innerHTML = cpu.ir.toString(8).padStart(4, "0");
    UI_IR_HEX.innerHTML = cpu.ir.toString(16).padStart(3, "0").toUpperCase();
    UI_IR_DEC.innerHTML = cpu.ir.toString(10);
    UI_IR_MNEMONIC.innerHTML = cpu.getMnemonic();

    UI_A_BINARY.innerHTML = cpu.a.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& ');
    UI_A_OCTAL.innerHTML = cpu.a.toString(8).padStart(4, "0");
    UI_A_HEX.innerHTML = cpu.a.toString(16).padStart(3, "0").toUpperCase();
    UI_A_DEC.innerHTML = cpu.a.toString(10);
    UI_A_2S_COMP_DEC.innerHTML = ModuleUtil.twosComplement(cpu.a, 12).toString(10);

    UI_B_BINARY.innerHTML = cpu.b.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& ');
    UI_B_OCTAL.innerHTML = cpu.b.toString(8).padStart(4, "0");
    UI_B_HEX.innerHTML = cpu.b.toString(16).padStart(3, "0").toUpperCase();
    UI_B_DEC.innerHTML = cpu.b.toString(10);
    UI_B_2S_COMP_DEC.innerHTML = ModuleUtil.twosComplement(cpu.b, 12).toString(10);

    // format memory block UI with structure
    UI_MEM.innerHTML = memory_html;

    // draw a box around the memory cells pointed to by the PC and MAR
    document.getElementById(UI_MEM_CELL_ID_PREFIX + (cpu.pc % ModuleCPU.CPU.RAM_WORDS).toString(10))
        .classList
        .add(UI_MEM_PC_CLASS);
    document.getElementById(UI_MEM_CELL_ID_PREFIX + (cpu.mar % ModuleCPU.CPU.RAM_WORDS).toString(10))
        .classList
        .add(UI_MEM_MAR_CLASS);


    // **** ESTABLISH CALLBACKS FOR BUTTONS
    UI_BUTTON_RUN.addEventListener("click", btn_run);
    UI_BUTTON_STOP.addEventListener("click", btn_stop);
    UI_BUTTON_M_STEP.addEventListener("click", btn_m_step);
    UI_BUTTON_I_STEP.addEventListener("click", btn_i_step);


    // **** ESTABLISH APP UPDATE CALLBACK
    requestAnimationFrame(appUpdate);
}

// app update callback for requestAnimationFrame()
function appUpdate() {
    // update CPU
    cpu.update();

    if (cpu.update_ui) {
        // if a UI update is needed, then ...

        // delete old MAR box in memory UI element
        document.getElementById(UI_MEM_CELL_ID_PREFIX + (cpu.old_mar % ModuleCPU.CPU.RAM_WORDS).toString(10))
            .classList
            .remove(UI_MEM_MAR_CLASS);

        // delete old PC box in memory UI element
        document.getElementById(UI_MEM_CELL_ID_PREFIX + (cpu.old_pc % ModuleCPU.CPU.RAM_WORDS).toString(10))
            .classList
            .remove(UI_MEM_PC_CLASS);

        // delete all RAM UI element highlights
        cpu.mem.forEach((_, i) =>
            // remove the highlight style
            document.getElementById(UI_MEM_CELL_ID_PREFIX + i.toString(10))
                .classList
                .remove(UI_MEM_CHANGED_CLASS)
        );

        // iterate through any changed RAM cells, updating the values and highlights
        cpu.ram_changed.forEach((address) => {
            // update the value in the cell, in octal
            document.getElementById(UI_MEM_CELL_ID_PREFIX + address.toString(10))
                .innerHTML = cpu.mem[address].toString(8).padStart(4, "0");

            // add the highlight style
            document.getElementById(UI_MEM_CELL_ID_PREFIX + address.toString(10))
                .classList
                .add(UI_MEM_CHANGED_CLASS);

            return;
        });

        // box current MAR memory element
        document.getElementById(UI_MEM_CELL_ID_PREFIX + (cpu.mar % ModuleCPU.CPU.RAM_WORDS).toString(10))
            .classList
            .add(UI_MEM_MAR_CLASS);

        // box current PC memory element
        document.getElementById(UI_MEM_CELL_ID_PREFIX + (cpu.pc % ModuleCPU.CPU.RAM_WORDS).toString(10))
            .classList
            .add(UI_MEM_PC_CLASS);

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
        UI_IR_MNEMONIC.innerHTML = cpu.getMnemonic();

        ModuleUtil.updateHTMLwithDiff(
            cpu.a, cpu.old_a,
            UI_A_BINARY, UI_A_OCTAL, UI_A_HEX, UI_A_DEC, UI_A_2S_COMP_DEC, ModuleCPU.CPU.BITS
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.b, cpu.old_b,
            UI_B_BINARY, UI_B_OCTAL, UI_B_HEX, UI_B_DEC, UI_B_2S_COMP_DEC, ModuleCPU.CPU.BITS
        );
    }


    // **** GET BACK IN QUEUE
    requestAnimationFrame(appUpdate);
}


// **** BUTTON CALLBACK FUNCTIONS
function btn_run() {
    cpu.input.run = true;
}

function btn_stop() {
    cpu.input.run = false;
}

function btn_m_step() {
    if (!cpu.input.run) {
        cpu.input.m_step = true;
        cpu.input.i_step = false;

        cpu.m_stepped = false;
    }
}

function btn_i_step() {
    if (!cpu.input.run) {
        cpu.input.i_step = true;
        cpu.input.m_step = false;

        cpu.i_stepped = false;
    }
}