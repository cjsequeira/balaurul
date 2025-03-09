"use strict";

// ** CONSTANTS
// Web page user interface
const UI_MEMORY = document.getElementById("app_12bit_memory");
const MEM_CELL_ID_PREFIX = "app_12bit_memcell_";
const MEMORY_ROWS = 8;
const MEMORY_COLS = 8;

// CPU constants
const CPU_RAM_WORDS = MEMORY_ROWS * MEMORY_COLS;
const CPU_BITS = 12;

// ** NON-CONSTANTS
// CPU
var CPU = {
    memory: [],
};

// App status
var ready = false;


window.addEventListener("load", setup());


// requestAnimationFrame(appUpdate);


// ***************************************************************************

function setup() {
    // ** initialize CPU
    // fill memory with random contents
    for (let i = 0; i < CPU_RAM_WORDS; i++) {
        CPU.memory.push(Math.round(Math.random() * (Math.pow(2, CPU_BITS) - 1)));
    }

    // ** build memory block UI structure
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

    // format memory block UI with structure
    UI_MEMORY.innerHTML = memory_html;

    // ** app is ready for use
    ready = true;
}

function appUpdate() {
    requestAnimationFrame(appUpdate);
}