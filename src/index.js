"use strict";

// **** CONSTANTS
// Web page user interface
const UI_MEMORY = document.getElementById("app_12bit_memory");
const MEM_CELL_ID_PREFIX = "app_12bit_memcell_";
const MEMORY_ROWS = 8;
const MEMORY_COLS = 8;

// CPU constants
const CPU_RAM_WORDS = MEMORY_ROWS * MEMORY_COLS;
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
    for (let j = 0; j < MEMORY_COLS; j++) {
        memory_html += "<td class='labels'>" + "xxx" + j + "</td>";
    }
    memory_html += "</tr>"

    // each row of memory, with a row label to the left
    for (let i = 0; i < MEMORY_ROWS; i++) {
        memory_html += "<tr><td class='labels'>" + (i * 8).toString(8).padStart(4, '0') + "</td>"

        for (let j = 0; j < MEMORY_COLS; j++) {
            memory_html += "<td id='"
                + MEM_CELL_ID_PREFIX
                + (i * 8 + j).toString(10) + "'>"
                + CPU.memory[i * 8 + j].toString(8).padStart(4, '0')
                + "</td>";
        }

        memory_html += "</tr>";
    }

    // table closer
    memory_html += "</table>";

    // **** INITIALIZE UI
    // format memory block UI with structure
    UI_MEMORY.innerHTML = memory_html;

    // draw a box around the memory cell pointed to by the PC
    document.getElementById(MEM_CELL_ID_PREFIX + CPU.pc.toString(10)).classList.add("pc");


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
            document.getElementById(MEM_CELL_ID_PREFIX + CPU.old_pc.toString(10)).classList.remove("pc");

            // box new UI memory element
            document.getElementById(MEM_CELL_ID_PREFIX + CPU.pc.toString(10)).classList.add("pc");
        }


        // **** SYNCHRONIZE OLD AND NEW CPU COMPONENT VALUES
        CPU.old_pc = CPU.pc;
    }


    // **** GET BACK IN QUEUE
    requestAnimationFrame(appUpdate);
}