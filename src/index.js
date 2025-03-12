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
const UI_MEM_ROWS = 8;
const UI_MEM_COLS = 8;

const UI_DIFF_COLOR = "rgba(255, 0, 0, 1.0)";


// **** NON-CONSTANTS
// CPU
var cpu = new ModuleCPU.CPU();


// **** MAIN CODE
window.addEventListener("load", setup());
;


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
                + cpu.memory[i * 8 + j].toString(8).padStart(4, '0')
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
    UI_PC_DEC.innerHTML = cpu.pc.toString(10).padStart(4, "0");
    
    UI_IR_BINARY.innerHTML = cpu.ir.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& ');
    UI_IR_OCTAL.innerHTML = cpu.ir.toString(8).padStart(4, "0");
    UI_IR_HEX.innerHTML = cpu.ir.toString(16).padStart(3, "0").toUpperCase();
    UI_IR_DEC.innerHTML = cpu.ir.toString(10).padStart(4, "0");
    UI_IR_MNEMONIC.innerHTML = cpu.getMnemonic();
    
    UI_A_BINARY.innerHTML = cpu.a.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& ');
    UI_A_OCTAL.innerHTML = cpu.a.toString(8).padStart(4, "0");
    UI_A_HEX.innerHTML = cpu.a.toString(16).padStart(3, "0").toUpperCase();
    UI_A_DEC.innerHTML = cpu.a.toString(10).padStart(4, "0");
    UI_A_2S_COMP_DEC.innerHTML = ModuleUtil.twosComplement(cpu.a, 12).toString(10);

    UI_B_BINARY.innerHTML = cpu.b.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& ');
    UI_B_OCTAL.innerHTML = cpu.b.toString(8).padStart(4, "0");
    UI_B_HEX.innerHTML = cpu.b.toString(16).padStart(3, "0").toUpperCase();
    UI_B_DEC.innerHTML = cpu.b.toString(10).padStart(4, "0");
    UI_B_2S_COMP_DEC.innerHTML = ModuleUtil.twosComplement(cpu.b, 12).toString(10);

    // format memory block UI with structure
    UI_MEM.innerHTML = memory_html;

    // draw a box around the memory cell pointed to by the PC
    document.getElementById(UI_MEM_CELL_ID_PREFIX + cpu.getAddressFromPC().toString(10))
        .classList
        .add(UI_MEM_PC_CLASS);

    // **** ESTABLISH APP UPDATE CALLBACK
    requestAnimationFrame(appUpdate);
}

// app update callback for requestAnimationFrame()
function appUpdate() {
    // update CPU
    cpu.update();

    if (cpu.changed) {
        // if something in the CPU has changed, then...

        if (cpu.pc != cpu.old_pc) {
            // if the PC is now pointing to a different UI memory element from what is boxed, then...

            // unbox old UI memory element
            document.getElementById(UI_MEM_CELL_ID_PREFIX + cpu.getAddressFromOldPC().toString(10))
                .classList
                .remove(UI_MEM_PC_CLASS);

            // box new UI memory element
            document.getElementById(UI_MEM_CELL_ID_PREFIX + cpu.getAddressFromPC().toString(10))
                .classList
                .add(UI_MEM_PC_CLASS);

            // show diffs in value
            UI_PC_BINARY.innerHTML = ModuleUtil.showDiff(
                cpu.pc.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& '),
                cpu.old_pc.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& '),
                UI_DIFF_COLOR
            );
            UI_PC_OCTAL.innerHTML = ModuleUtil.showDiff(
                cpu.pc.toString(8).padStart(4, "0"),
                cpu.old_pc.toString(8).padStart(4, "0"),
                UI_DIFF_COLOR
            );
            UI_PC_HEX.innerHTML = ModuleUtil.showDiff(
                cpu.pc.toString(16).padStart(3, "0").toUpperCase(),
                cpu.old_pc.toString(16).padStart(3, "0").toUpperCase(),
                UI_DIFF_COLOR
            );
        }

        if (cpu.a != cpu.old_a) {
            // if the A register has changed, then ... show diffs in value
            UI_A_BINARY.innerHTML = ModuleUtil.showDiff(
                cpu.a.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& '),
                cpu.old_a.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& '),
                UI_DIFF_COLOR
            );
            UI_A_OCTAL.innerHTML = ModuleUtil.showDiff(
                cpu.a.toString(8).padStart(4, "0"),
                cpu.old_a.toString(8).padStart(4, "0"),
                UI_DIFF_COLOR
            );
            UI_A_HEX.innerHTML = ModuleUtil.showDiff(
                cpu.a.toString(16).padStart(3, "0").toUpperCase(),
                cpu.old_a.toString(16).padStart(3, "0").toUpperCase(),
                UI_DIFF_COLOR
            );
        }
    }


    // **** GET BACK IN QUEUE
    requestAnimationFrame(appUpdate);
}
