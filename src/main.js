"use strict";

// **** MAIN JAVASCRIPT FILE

// **** MODULES
import * as ModuleCPU from "./cpu.js";
import * as ModuleUtil from "./util.js";
import * as ModuleUI from "./module_ui.js"


// **** CONSTANTS

// target CPU speed for "fast" mode, in MACHINE CYCLES PER SECOND
const FAST_TARGET = 1e6;

// number of elements in LED brightness running average
const NUM_LED_AVERAGE = 3;

// front panel UI elements
const UI_TEXT_FP_LED_CLASS = "led";
const UI_TEXT_FP_LED_M_ID_PREFIX = "app_12bit_led_m_";
const UI_TEXT_FP_LED_PC_ID_PREFIX = "app_12bit_led_pc_";
const UI_TEXT_FP_LED_IR_ID_PREFIX = "app_12bit_led_ir_";
const UI_TEXT_FP_LED_MAR_ID_PREFIX = "app_12bit_led_mar_";
const UI_TEXT_FP_LED_A_ID_PREFIX = "app_12bit_led_a_";
const UI_TEXT_FP_LED_B_ID_PREFIX = "app_12bit_led_b_";
const UI_TEXT_FP_LED_OUT_ID_PREFIX = "app_12bit_led_out_";

const UI_TEXT_FP_CONTROL_INPUT_ID_PREFIX = "app_12bit_control_input_";
const UI_TEXT_FP_CONTROL_INPUT_KEYS = Array.from("=-0987654321");

const UI_NUM_FP_SLIDER_X = -20;
const UI_NUM_FP_SLIDER_Y = -17;
const UI_NUM_INPUT_SWITCHES = 12;

const UI_FP_LED_FLAG_CARRY = document.getElementById("app_12bit_led_flag_carry");
const UI_FP_LED_FLAG_ZERO = document.getElementById("app_12bit_led_flag_zero");
const UI_FP_LED_STATUS_RUNNING = document.getElementById("app_12bit_led_status_running");
const UI_FP_LED_STATUS_HALTED = document.getElementById("app_12bit_led_status_halted");

const UI_CONTROL_ON_OFF = document.getElementById("app_12bit_control_on_off");
const UI_CONTROL_RUN_STOP = document.getElementById("app_12bit_control_run_stop");
const UI_CONTROL_RESET = document.getElementById("app_12bit_control_reset");
const UI_CONTROL_M_STEP = document.getElementById("app_12bit_control_m_step");
const UI_CONTROL_I_STEP = document.getElementById("app_12bit_control_i_step");
const UI_CONTROL_EXAMINE = document.getElementById("app_12bit_control_examine");
const UI_CONTROL_EXAMINE_NEXT = document.getElementById("app_12bit_control_examine_next");
const UI_CONTROL_DEPOSIT = document.getElementById("app_12bit_control_deposit");
const UI_CONTROL_DEPOSIT_NEXT = document.getElementById("app_12bit_control_deposit_next");
const UI_CONTROL_SPEED = document.getElementById("app_12bit_control_speed");
const UI_CONTROL_CIRCUIT_SPY = document.getElementById("app_12bit_control_circuit_spy");


// circuit spy UI elements
const UI_CIRCUIT_SPY_PANEL = document.getElementById("app_12bit_circuit_spy");

const UI_MEM_ROWS = 8;
const UI_MEM_COLS = 8;

const UI_TEXT_CIRCUIT_SPY_OPEN_LEFT = "51rem";
const UI_TEXT_CIRCUIT_SPY_OPEN_HEIGHT = "46rem";
const UI_TEXT_CIRCUIT_SPY_CLOSED_LEFT = "23rem";
const UI_TEXT_CIRCUIT_SPY_CLOSED_HEIGHT = "23rem";
const UI_TEXT_CIRCUIT_SPY_OPEN_TRANSITION_DELAY = "0s, 0.3s";
const UI_TEXT_CIRCUIT_SPY_CLOSED_TRANSITION_DELAY = "0.3s, 0s";

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
const UI_PC_MNEMONIC = document.getElementById("app_12bit_pc_mnemonic");
const UI_ELAPSED_M = document.getElementById("app_12bit_elapsed_m");
const UI_ELAPSED_I = document.getElementById("app_12bit_elapsed_i");

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

const UI_MEM = document.getElementById("app_12bit_memory");

const UI_RAM_IMPORT_EXPORT = document.getElementById("app_12bit_ram_import_export");
const UI_CONTROL_RAM_IMPORT = document.getElementById("app_12bit_ram_import");
const UI_CONTROL_RAM_EXPORT = document.getElementById("app_12bit_ram_export");


// **** NON-CONSTANTS
// CPU
var cpu = new ModuleCPU.CPU();

// holders for old values
var old = {
    pc: 0,
    mar: 0,
    ir: 0,
    a: 0,
    b: 0,
    out: 0,
    mem: Array(UI_MEM_COLS * UI_MEM_ROWS),
};

var last_time = 0;

// holder for keyboard shortcuts
var keys = {};

// holders for LED brightnesses
var LEDaccumulators = Array(NUM_LED_AVERAGE);
var LEDindex = 0;

// holder for front panel yellow input switch UI handles
var ui_input_switches = [];

// input signal lines object
var fp_input = {
    on: false,
    run: false,
    reset: false,

    m_step: false,
    i_step: false,

    examine: false,
    examine_next: false,

    deposit: false,
    deposit_next: false,

    slow: false,
    circuit_spy: false,

    input_switches: Array(UI_NUM_INPUT_SWITCHES).fill(false),
};


// **** MAIN CODE
window.addEventListener("load", sideEffect_setup());


// **** FUNCTIONS
function sideEffect_setup() {
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


    // **** GENERATE HANDLES FOR INPUT SWITCHES
    for (let i = 0; i < ModuleCPU.CPU.BITS; i++) {
        // build each input switch UI object
        ui_input_switches.push(
            document.getElementById(UI_TEXT_FP_CONTROL_INPUT_ID_PREFIX + i.toString(10))
        );

        // add mouseclick event handler
        ui_input_switches[i].addEventListener(
            "click",
            () => {
                // toggle this UI switch
                toggleSwitch(ui_input_switches[i], 0, UI_NUM_FP_SLIDER_Y);

                // invert the value of this UI switch
                fp_input.input_switches[i] = !fp_input.input_switches[i];

                // tell CPU to rescan inputs
                cpu.scanInputs(fp_input);
            });

        // build up keyboard shortcut list
        keys = {
            ...keys,
            [UI_TEXT_FP_CONTROL_INPUT_KEYS[i]]: () => {
                toggleSwitch(ui_input_switches[i], 0, UI_NUM_FP_SLIDER_Y);
                fp_input.input_switches[i] = !fp_input.input_switches[i];
            }
        };
    }


    // **** INITIALIZE UI
    // format memory block UI with structure
    UI_MEM.innerHTML = memory_html;

    // establish mouse callbacks for controls
    UI_CONTROL_ON_OFF.addEventListener("click", ctrlOnOff);
    UI_CONTROL_RUN_STOP.addEventListener("click", ctrlRunStop);

    UI_CONTROL_RESET.addEventListener("mousedown",
        () => UI_CONTROL_RESET.style.opacity = 1.0);
    UI_CONTROL_M_STEP.addEventListener("mousedown",
        () => UI_CONTROL_M_STEP.style.opacity = 1.0);
    UI_CONTROL_I_STEP.addEventListener("mousedown",
        () => UI_CONTROL_I_STEP.style.opacity = 1.0);
    UI_CONTROL_EXAMINE.addEventListener("mousedown",
        () => UI_CONTROL_EXAMINE.style.opacity = 1.0);
    UI_CONTROL_EXAMINE_NEXT.addEventListener("mousedown",
        () => UI_CONTROL_EXAMINE_NEXT.style.opacity = 1.0);
    UI_CONTROL_DEPOSIT.addEventListener("mousedown",
        () => UI_CONTROL_DEPOSIT.style.opacity = 1.0);
    UI_CONTROL_DEPOSIT_NEXT.addEventListener("mousedown",
        () => UI_CONTROL_DEPOSIT_NEXT.style.opacity = 1.0);

    UI_CONTROL_RAM_IMPORT.addEventListener("click", ctrlRAMimport);
    UI_CONTROL_RAM_EXPORT.addEventListener("click", ctrlRAMexport);

    UI_CONTROL_RESET.addEventListener("mouseup",
        () => ctrlButtonUp(UI_CONTROL_RESET, "reset"));
    UI_CONTROL_M_STEP.addEventListener("mouseup",
        () => ctrlButtonUp(UI_CONTROL_M_STEP, "m_step"));
    UI_CONTROL_I_STEP.addEventListener("mouseup",
        () => ctrlButtonUp(UI_CONTROL_I_STEP, "i_step"));
    UI_CONTROL_EXAMINE.addEventListener("mouseup",
        () => ctrlButtonUp(UI_CONTROL_EXAMINE, "examine"));
    UI_CONTROL_EXAMINE_NEXT.addEventListener("mouseup",
        () => ctrlButtonUp(UI_CONTROL_EXAMINE_NEXT, "examine_next"));
    UI_CONTROL_DEPOSIT.addEventListener("mouseup",
        () => ctrlButtonUp(UI_CONTROL_DEPOSIT, "deposit"));
    UI_CONTROL_DEPOSIT_NEXT.addEventListener("mouseup",
        () => ctrlButtonUp(UI_CONTROL_DEPOSIT_NEXT, "deposit_next"));

    UI_CONTROL_SPEED.addEventListener("click", ctrlSpeed)
    UI_CONTROL_CIRCUIT_SPY.addEventListener("click", ctrlCircuitSpy)

    // establish keypress callbacks for controls
    keys = {
        ...keys,
        "q": ctrlOnOff,
        "w": ctrlRunStop,
        "e": () => ctrlButtonUp(UI_CONTROL_RESET, "reset"),
        "r": () => ctrlButtonUp(UI_CONTROL_M_STEP, "m_step"),
        "t": () => ctrlButtonUp(UI_CONTROL_I_STEP, "i_step"),
        "y": () => ctrlButtonUp(UI_CONTROL_EXAMINE, "examine"),
        "u": () => ctrlButtonUp(UI_CONTROL_EXAMINE_NEXT, "examine_next"),
        "i": () => ctrlButtonUp(UI_CONTROL_DEPOSIT, "deposit"),
        "o": () => ctrlButtonUp(UI_CONTROL_DEPOSIT_NEXT, "deposit_next"),
    };

    document.addEventListener("keyup", (event) => handleKeys(event));


    // **** RESET UI
    sideEffect_resetUI();

    // change the visibility property for circuit spy 
    // note that it is intentionally underneath the front panel on startup!
    UI_CIRCUIT_SPY_PANEL.style.visibility = "visible";

    // initialize "last time" to current time
    last_time = performance.now();

    // **** ESTABLISH APP UPDATE CALLBACK
    requestAnimationFrame(sideEffect_appUpdate);
}


// app update callback for requestAnimationFrame()
function sideEffect_appUpdate() {
    // define holders
    let cur_time = 0;
    let elapsed_time = 0;
    let update_target = 0;


    // **** UPDATE CPU
    // get milliseconds elapsed since last app update call
    cur_time = performance.now();
    elapsed_time = cur_time - last_time;

    // save current time
    last_time = cur_time;

    // clear LEDs and the accumulators for the current rolling average index
    sideEffect_clearLEDs();
    LEDaccumulators[LEDindex] = ModuleUI.zeroedLEDaccumulators();

    // update CPU once or multiple times based on "speed" UI switch
    if (fp_input.slow) {
        // slow mode? update CPU just once
        cpu.update();
        LEDaccumulators[LEDindex] = ModuleUI.accumulateLEDs(cpu, LEDaccumulators[LEDindex], 1.0);
    } else {
        // fast mode? update to meet the speed target

        // calculate number of CPU updates to do
        update_target = FAST_TARGET * elapsed_time / 1000;

        // update CPU to meet the speed target
        for (let i = 0; i < update_target; i++) {
            cpu.update();
            LEDaccumulators[LEDindex] = ModuleUI.accumulateLEDs(cpu, LEDaccumulators[LEDindex], update_target);
        }
    }

    // rotate the LED accumulator index for a rolling average
    LEDindex++;
    if (LEDindex >= NUM_LED_AVERAGE) LEDindex = 0;


    // **** DRAW CPU INFO 
    if (cpu.status.on) {
        // if CPU status is "on" then ...

        // update LEDs
        sideEffect_redrawLEDs();

        // show value at PC
        UI_VAL_AT_PC.innerHTML = cpu.getWordAt(cpu.pc).toString(8).padStart(4, "0");

        // show disassembly of IR and disassembly of word at PC
        UI_IR_MNEMONIC.innerHTML = cpu.disassemble(cpu.ir);
        UI_PC_MNEMONIC.innerHTML = cpu.disassemble(cpu.getWordAt(cpu.pc));

        // show elapsed machine cycles and instruction cycles
        UI_ELAPSED_M.innerHTML = cpu.elapsed_m.toLocaleString();
        UI_ELAPSED_I.innerHTML = cpu.elapsed_i.toLocaleString();

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
            if (old.mem[i] == elem) {
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
        document.getElementById(
            UI_TEXT_MEM_CELL_ID_PREFIX + (cpu.mar % ModuleCPU.CPU.RAM_WORDS).toString(10)
        ).classList.add(UI_TEXT_MEM_MAR_CLASS);

        // box current PC memory element
        document.getElementById(
            UI_TEXT_MEM_CELL_ID_PREFIX + (cpu.pc % ModuleCPU.CPU.RAM_WORDS).toString(10)
        ).classList.add(UI_TEXT_MEM_PC_CLASS);

        // update all HTML numerical elements
        ModuleUtil.updateHTMLwithDiff(
            cpu.mar, old.mar,
            UI_MAR_BINARY, UI_MAR_OCTAL, UI_MAR_HEX, UI_MAR_DEC
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.pc, old.pc,
            UI_PC_BINARY, UI_PC_OCTAL, UI_PC_HEX, UI_PC_DEC
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.ir, old.ir,
            UI_IR_BINARY, UI_IR_OCTAL, UI_IR_HEX, UI_IR_DEC
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.a, old.a,
            UI_A_BINARY, UI_A_OCTAL, UI_A_HEX, UI_A_DEC, UI_A_SIGNED_DEC,
            ModuleCPU.CPU.BITS
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.b, old.b,
            UI_B_BINARY, UI_B_OCTAL, UI_B_HEX, UI_B_DEC, UI_B_SIGNED_DEC,
            ModuleCPU.CPU.BITS
        );

        ModuleUtil.updateHTMLwithDiff(
            cpu.out, old.out,
            UI_OUT_BINARY, UI_OUT_OCTAL, UI_OUT_HEX, UI_OUT_DEC, UI_OUT_SIGNED_DEC,
            ModuleCPU.CPU.BITS
        );

        // if CPU is running, sync old UI values
        if (cpu.status.running) old = ModuleUI.syncedUIvalues(cpu);
    }


    // **** GET BACK IN QUEUE
    requestAnimationFrame(sideEffect_appUpdate);
}

// reset UI
function sideEffect_resetUI() {
    // for each CPU UI text field on web page: clear all text; remove boxing and highlighting
    for (let elem of Array.from(document.getElementsByClassName(UI_TEXT_CPU_CLASS))) {
        elem.innerHTML = "&nbsp;";
        elem.classList.remove(
            UI_TEXT_HIGHLIGHT_CHANGED_CLASS,
            UI_TEXT_MEM_MAR_CLASS,
            UI_TEXT_MEM_PC_CLASS
        );
    };

    // clear all LEDs
    sideEffect_clearLEDs();

    // zero out LED accumulators
    LEDaccumulators = Array(NUM_LED_AVERAGE).fill(ModuleUI.zeroedLEDaccumulators());
}

// redraw all LEDs based on accumulated brightness, using a rolling average
function sideEffect_redrawLEDs() {
    // redraw LEDs for registers
    for (let i = 0; i < ModuleCPU.CPU.BITS; i++) {
        document.getElementById(UI_TEXT_FP_LED_PC_ID_PREFIX + i.toString(10)).style.opacity =
            LEDaccumulators.reduce((a, cur) => a + cur.pc[i], 0) / LEDaccumulators.length;
        document.getElementById(UI_TEXT_FP_LED_IR_ID_PREFIX + i.toString(10)).style.opacity =
            LEDaccumulators.reduce((a, cur) => a + cur.ir[i], 0) / LEDaccumulators.length;
        document.getElementById(UI_TEXT_FP_LED_MAR_ID_PREFIX + i.toString(10)).style.opacity =
            LEDaccumulators.reduce((a, cur) => a + cur.mar[i], 0) / LEDaccumulators.length;
        document.getElementById(UI_TEXT_FP_LED_A_ID_PREFIX + i.toString(10)).style.opacity =
            LEDaccumulators.reduce((a, cur) => a + cur.a[i], 0) / LEDaccumulators.length;
        document.getElementById(UI_TEXT_FP_LED_B_ID_PREFIX + i.toString(10)).style.opacity =
            LEDaccumulators.reduce((a, cur) => a + cur.b[i], 0) / LEDaccumulators.length;
        document.getElementById(UI_TEXT_FP_LED_OUT_ID_PREFIX + i.toString(10)).style.opacity =
            LEDaccumulators.reduce((a, cur) => a + cur.out[i], 0) / LEDaccumulators.length;
    }

    // redraw LEDs for machine cycles
    for (let key in ModuleCPU.CPU.M_CYCLE_NAMES) {
        document.getElementById(UI_TEXT_FP_LED_M_ID_PREFIX + ModuleCPU.CPU.M_CYCLE_NAMES[key])
            .style.opacity =
            LEDaccumulators.reduce((a, cur) => a + cur.m_cycle[ModuleCPU.CPU.M_CYCLE_NAMES[key]], 0)
            / LEDaccumulators.length;
    }

    // redraw LEDs for CPU flags and status
    UI_FP_LED_FLAG_CARRY.style.opacity =
        LEDaccumulators.reduce((a, cur) => a + cur.flags.carry, 0) / LEDaccumulators.length;
    UI_FP_LED_FLAG_ZERO.style.opacity =
        LEDaccumulators.reduce((a, cur) => a + cur.flags.zero, 0) / LEDaccumulators.length;
    UI_FP_LED_STATUS_RUNNING.style.opacity =
        LEDaccumulators.reduce((a, cur) => a + cur.status.running, 0) / LEDaccumulators.length;
    UI_FP_LED_STATUS_HALTED.style.opacity =
        LEDaccumulators.reduce((a, cur) => a + cur.status.halted, 0) / LEDaccumulators.length;
}

// clear LEDs
function sideEffect_clearLEDs() {
    // reset UI LED opacity to zero
    for (let elem of Array.from(document.getElementsByClassName(UI_TEXT_FP_LED_CLASS))) {
        elem.style.opacity = 0.0;
    }
}


// **** UI CONTROL CALLBACK FUNCTIONS
function handleKeys(event) {
    if (event.target == document.getElementsByTagName("body")[0]) {
        // if recipient of key-up is the main body (e.g. not the circuit spy text editor), then ...
        let key = event.key.toLowerCase();

        // execute associated callback for keypress
        if (key in keys) keys[key]();
    }
}

function ctrlOnOff() {
    toggleSwitch(UI_CONTROL_ON_OFF, 0, UI_NUM_FP_SLIDER_Y);

    if (!fp_input.on) {
        fp_input.on = true;
        cpu.scanInputs(fp_input);
    } else {
        fp_input.on = false;
        cpu.scanInputs(fp_input);

    }

    sideEffect_resetUI();
    old = ModuleUI.syncedUIvalues(cpu);
}

function ctrlRunStop() {
    toggleSwitch(UI_CONTROL_RUN_STOP, 0, UI_NUM_FP_SLIDER_Y);

    if (!fp_input.run) {
        fp_input.run = true;
        cpu.scanInputs(fp_input);
    } else {
        fp_input.run = false;
        cpu.scanInputs(fp_input);
    }
}

function ctrlSpeed() {
    toggleSwitch(UI_CONTROL_SPEED, UI_NUM_FP_SLIDER_X, 0);

    fp_input.slow = !fp_input.slow;

    // this is a special control not attached to the CPU, so we do not tell CPU to scan inputs!
}

function ctrlCircuitSpy() {
    toggleSwitch(UI_CONTROL_CIRCUIT_SPY, UI_NUM_FP_SLIDER_X, 0);

    fp_input.circuit_spy = !fp_input.circuit_spy;

    if (fp_input.circuit_spy) {
        UI_CIRCUIT_SPY_PANEL.style.transitionDelay = UI_TEXT_CIRCUIT_SPY_OPEN_TRANSITION_DELAY;
        UI_CIRCUIT_SPY_PANEL.style.left = UI_TEXT_CIRCUIT_SPY_OPEN_LEFT;
        UI_CIRCUIT_SPY_PANEL.style.height = UI_TEXT_CIRCUIT_SPY_OPEN_HEIGHT;
    } else {
        UI_CIRCUIT_SPY_PANEL.style.transitionDelay = UI_TEXT_CIRCUIT_SPY_CLOSED_TRANSITION_DELAY;
        UI_CIRCUIT_SPY_PANEL.style.left = UI_TEXT_CIRCUIT_SPY_CLOSED_LEFT;
        UI_CIRCUIT_SPY_PANEL.style.height = UI_TEXT_CIRCUIT_SPY_CLOSED_HEIGHT;
    }

    // this is a special control not attached to the CPU, so we do not tell CPU to scan inputs!
}

function ctrlButtonUp(ui_button, input_key) {
    // sync UI
    old = ModuleUI.syncedUIvalues(cpu);

    ui_button.style.opacity = 0.0;

    // set line indicated by input_key to high and scan
    fp_input[input_key] = true;
    cpu.scanInputs(fp_input);

    // set line indicated by input_key back to low and scan
    fp_input[input_key] = false;
    cpu.scanInputs(fp_input);
}

function ctrlRAMimport() {
    // sync UI
    old = ModuleUI.syncedUIvalues(cpu);

    cpu.replaceRAM(UI_RAM_IMPORT_EXPORT.value);
}

function ctrlRAMexport() {
    UI_RAM_IMPORT_EXPORT.value = cpu.exportRAM();
}


// **** UI SWITCH VISUAL TOGGLE FUNCTION
function toggleSwitch(ui_switch, transform_x, transform_y) {
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
