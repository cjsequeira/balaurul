"use strict";

// **** CONSTANTS
// Web page user interface
const UI_MEMORY = document.getElementById("app_12bit_memory");
const UI_PC_BINARY = document.getElementById("app_12bit_pc_binary");
const UI_PC_OCTAL = document.getElementById("app_12bit_pc_octal");
const UI_PC_HEX = document.getElementById("app_12bit_pc_hex");

const UI_MEM_CELL_ID_PREFIX = "app_12bit_memcell_";
const UI_MEM_PC_CLASS = "mem_pc";
const UI_MEM_ROWS = 8;
const UI_MEM_COLS = 8;

const UI_DIFF_COLOR = "rgba(255, 0, 0, 1.0)";

// CPU constants
const CPU_RAM_WORDS = UI_MEM_ROWS * UI_MEM_COLS;
const CPU_BITS = 12;

// **** NON-CONSTANTS
// CPU
var CPU = {
    // components
    memory: [],
    pc: 0,

    // old values of components
    old_pc: 0,
};

// App and UI status
var ready = false;


// **** MAIN CODE
window.addEventListener("load", setup());
requestAnimationFrame(appUpdate);


// **** FUNCTIONS
function setup() {
    // **** INITIALIZE CPU
    // fill registers with random contents
    CPU.pc = Math.round(Math.random() * (CPU_RAM_WORDS - 1));

    // fill memory with random contents
    for (let i = 0; i < CPU_RAM_WORDS; i++) {
        CPU.memory.push(Math.round(Math.random() * (Math.pow(2, CPU_BITS) - 1)));
    }


    // **** BUILD MEMORY BLOCK UI STRUCTURE
    // table opener
    let memory_html = "<table>";

    // column labels
    memory_html += "<tr><td></td>"
    for (let j = 0; j < UI_MEM_COLS; j++) {
        memory_html += "<td class='labels'>" + "xxx" + j + "</td>";
    }
    memory_html += "</tr>"

    // each row of memory, with a row label to the left
    for (let i = 0; i < UI_MEM_ROWS; i++) {
        memory_html += "<tr><td class='labels'>" + (i * 8).toString(8).padStart(4, '0') + "</td>"

        for (let j = 0; j < UI_MEM_COLS; j++) {
            memory_html += "<td id='"
                + UI_MEM_CELL_ID_PREFIX
                + (i * 8 + j).toString(10) + "'>"
                + CPU.memory[i * 8 + j].toString(8).padStart(4, '0')
                + "</td>";
        }

        memory_html += "</tr>";
    }

    // table closer
    memory_html += "</table>";


    // **** INITIALIZE UI
    // show register values
    UI_PC_BINARY.innerHTML = CPU.pc.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& ');
    UI_PC_OCTAL.innerHTML = CPU.pc.toString(8).padStart(4, "0");
    UI_PC_HEX.innerHTML = CPU.pc.toString(16).padStart(3, "0").toUpperCase();

    // format memory block UI with structure
    UI_MEMORY.innerHTML = memory_html;

    // draw a box around the memory cell pointed to by the PC
    document.getElementById(UI_MEM_CELL_ID_PREFIX + CPU.pc.toString(10)).classList.add("pc");


    // **** MARK APP READY FOR USE
    ready = true;
}

function appUpdate() {
    // if app is ready for use...
    if (ready) {
        // **** UPDATE UI ELEMENTS NEEDING UPDATE
        // is the PC now pointing to a different UI memory element from what is boxed?
        if (CPU.pc != CPU.old_pc) {
            // unbox old UI memory element
            document.getElementById(UI_MEM_CELL_ID_PREFIX + CPU.old_pc.toString(10))
                .classList
                .remove(UI_MEM_PC_CLASS);

            // box new UI memory element
            document.getElementById(UI_MEM_CELL_ID_PREFIX + CPU.pc.toString(10))
                .classList
                .add(UI_MEM_PC_CLASS);

            // **** SYNCHRONIZE OLD AND NEW CPU COMPONENT VALUES
            CPU.old_pc = CPU.pc;
        }
    }


    // **** GET BACK IN QUEUE
    requestAnimationFrame(appUpdate);
}

function showDiff(string_primary, string_secondary) {
    // define empty output string
    let string_out = "";

    // get the length of the longest string
    let longest = Math.max(string_primary.length, string_secondary.length);

    // iterate through the strings character by character
    for (let i = 0; i < longest; i++) {
        if ((string_primary[i] != string_secondary[i]) || (i >= string_secondary.length)) {
            // if characters differ or we've passed end of secondary, then show as diff
            string_out += "<span style='color: " + UI_DIFF_COLOR + "'>"
                + string_primary[i]
                + "</span>";
        } else {
            // else, don't show as diff
            string_out += string_primary[i];
        }
    }

    return string_out;
}