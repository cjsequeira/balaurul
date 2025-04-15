"use strict";

// **** MAIN JAVASCRIPT FILE

// **** MODULES
import * as ModuleCPU from "./cpu.js";
import * as ModuleCPUconsts from "./cpu_consts.js"
import * as ModuleUtil from "./util.js";
import * as ModuleUI from "./module_ui.js"


// **** CONSTANTS

// target CPU speed for "fast" mode, in MACHINE CYCLES PER SECOND
const FAST_TARGET = 1e6;

// iteration limit, to handle when browser window loses focus
const ITER_LIMIT = FAST_TARGET * 1 / 60;

// number of elements in LED brightness running average
const NUM_LED_AVERAGE = 3;

// front panel UI elements
const UI_TEXT_DISPLAY_BG_COLOR_OFF = "rgba(0, 0, 0, 0)";
const UI_TEXT_DISPLAY_BG_COLOR_ON = "rgba(252, 215, 215, 0.914)";

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

const UI_DISPLAY = document.getElementById("app_12bit_out_display");
const UI_NUM_DISPLAY_MAX_CHARS = 8192;

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

const UI_KEY_CONTROL_CLEAR_INPUTS = "`";
const UI_KEY_CONTROL_ON_OFF = "q";
const UI_KEY_CONTROL_RUN_STOP = "w";
const UI_KEY_CONTROL_RESET = "e";
const UI_KEY_CONTROL_M_STEP = "r";
const UI_KEY_CONTROL_I_STEP = "t";
const UI_KEY_CONTROL_EXAMINE = "y";
const UI_KEY_CONTROL_EXAMINE_NEXT = "u";
const UI_KEY_CONTROL_DEPOSIT = "i";
const UI_KEY_CONTROL_DEPOSIT_NEXT = "o";

// circuit spy UI elements
const UI_CIRCUIT_SPY_REGS_PANEL = document.getElementById("app_12bit_circuit_spy_regs");
const UI_CIRCUIT_SPY_MEMORY_PANEL = document.getElementById("app_12bit_circuit_spy_memory");

const UI_MEM_ROWS = 8;
const UI_MEM_COLS = 8;

const UI_TEXT_CIRCUIT_SPY_OPEN_LEFT = "51rem";
const UI_TEXT_CIRCUIT_SPY_CLOSED_LEFT = "23rem";
const UI_TEXT_CIRCUIT_SPY_OPEN_TOP = "28.9rem";
const UI_TEXT_CIRCUIT_SPY_CLOSED_TOP = "0rem";

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
const UI_VAL_AT_MAR = document.getElementById("app_12bit_val_at_mar");
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
var app = {
    // CPU
    cpu: {},

    // holders for old values
    old: {
        pc: 0,
        mar: 0,
        ir: 0,
        a: 0,
        b: 0,
        out: 0,
        mem: Array(UI_MEM_COLS * UI_MEM_ROWS),
    },

    // holder for prior computer timestamp
    last_time: 0,

    // holder for keyboard shortcuts
    keys: {},

    // holders for LED brightnesses
    LEDaccumulators: Array(NUM_LED_AVERAGE).fill(ModuleUI.zeroedLEDaccumulators()),

    // holder for front panel yellow input switch UI handles
    ui_input_switches: [],

    // input signal lines object
    fp_input: {
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
    },
};


// **** MAIN CODE
app.cpu = new ModuleCPU.CPU();

window.addEventListener("load", sideEffect_setup);


// **** FUNCTIONS
// app update callback for requestAnimationFrame()
function sideEffect_appUpdate() {
    // define holders for time management
    let cur_time = 0;
    let elapsed_time = 0;
    let update_target = 0;

    // initialize display screen string
    let display_string = UI_DISPLAY.innerText;
    let last_out = app.cpu.out_stamp;


    // **** UPDATE CPU
    // get milliseconds elapsed since last app update call
    cur_time = performance.now();
    elapsed_time = cur_time - app.last_time;

    // save current time
    app.last_time = cur_time;

    // clear UI LEDs
    sideEffect_clearLEDs();

    // initialize the head and drop the tail of the LED accumulators rolling average
    app.LEDaccumulators = [
        ModuleUI.zeroedLEDaccumulators(),
        ...app.LEDaccumulators.slice(0, app.LEDaccumulators.length - 1)
    ];

    // update CPU once or multiple times based on "speed" UI switch
    if (app.fp_input.slow) {
        // slow mode?

        // update CPU just once
        app.cpu.update();

        // update display string if OUT register has been updated
        if (app.cpu.out_stamp != last_out) display_string += String.fromCharCode(app.cpu.out);

        // accumulate LED brightness
        app.LEDaccumulators[0] = ModuleUI.accumulateLEDs(app.cpu, app.LEDaccumulators[0], 1.0);
    } else {
        // fast mode? update to meet the speed target

        // calculate number of CPU updates to do
        // limit the number of cycles, to handle cases where the browser window loses focus and...
        //  ...requestAnimationFrame() is not called for long periods of time
        update_target = Math.min(FAST_TARGET * elapsed_time / 1000, ITER_LIMIT);

        for (let i = 0; i < update_target; i++) {
            // update CPU
            app.cpu.update();

            // update display string if OUT register has been updated
            if (app.cpu.out_stamp != last_out) display_string += String.fromCharCode(app.cpu.out);

            // accumulate LED brightness
            app.LEDaccumulators[0] = ModuleUI.accumulateLEDs(app.cpu, app.LEDaccumulators[0], update_target);

            // save CPU OUT stamp in prep for next CPU update
            last_out = app.cpu.out_stamp;
        }
    }


    // **** DRAW CPU INFO 
    if (app.cpu.status.on) {
        // if CPU status is "on" then ...

        if (app.fp_input.circuit_spy) {
            // if circuit spy is active, then...

            // show value at PC
            UI_VAL_AT_PC.innerHTML = app.cpu.getWordAt(app.cpu.pc).toString(8).padStart(4, "0");

            // show value at MAR
            UI_VAL_AT_MAR.innerHTML = app.cpu.getWordAt(app.cpu.mar).toString(8).padStart(4, "0");

            // show disassembly of IR and disassembly of word at PC
            UI_IR_MNEMONIC.innerHTML = app.cpu.disassemble(app.cpu.ir);
            UI_PC_MNEMONIC.innerHTML = app.cpu.disassemble(app.cpu.getWordAt(app.cpu.pc));

            // show elapsed machine cycles and instruction cycles
            UI_ELAPSED_M.innerHTML = app.cpu.elapsed_m.toLocaleString();
            UI_ELAPSED_I.innerHTML = app.cpu.elapsed_i.toLocaleString();

            // draw all RAM values; clear PC and MAR boxes
            app.cpu.mem.forEach((elem, i) => {
                // update the value in the cell, in octal
                document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + i.toString(10))
                    .innerHTML = app.cpu.mem[i].toString(8).padStart(4, "0");

                // clear PC and MAR boxes
                document.getElementById(UI_TEXT_MEM_CELL_ID_PREFIX + i.toString(10))
                    .classList
                    .remove(UI_TEXT_MEM_MAR_CLASS, UI_TEXT_MEM_PC_CLASS);

                // update highlighting
                if (app.old.mem[i] == elem) {
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
                UI_TEXT_MEM_CELL_ID_PREFIX + (app.cpu.mar % ModuleCPUconsts.RAM_WORDS).toString(10)
            ).classList.add(UI_TEXT_MEM_MAR_CLASS);

            // box current PC memory element
            document.getElementById(
                UI_TEXT_MEM_CELL_ID_PREFIX + (app.cpu.pc % ModuleCPUconsts.RAM_WORDS).toString(10)
            ).classList.add(UI_TEXT_MEM_PC_CLASS);

            // update all HTML numerical elements
            ModuleUtil.updateHTMLwithDiff(
                app.cpu.mar, app.old.mar,
                UI_MAR_BINARY, UI_MAR_OCTAL, UI_MAR_HEX, UI_MAR_DEC
            );

            ModuleUtil.updateHTMLwithDiff(
                app.cpu.pc, app.old.pc,
                UI_PC_BINARY, UI_PC_OCTAL, UI_PC_HEX, UI_PC_DEC
            );

            ModuleUtil.updateHTMLwithDiff(
                app.cpu.ir, app.old.ir,
                UI_IR_BINARY, UI_IR_OCTAL, UI_IR_HEX, UI_IR_DEC
            );

            ModuleUtil.updateHTMLwithDiff(
                app.cpu.a, app.old.a,
                UI_A_BINARY, UI_A_OCTAL, UI_A_HEX, UI_A_DEC, UI_A_SIGNED_DEC,
                ModuleCPUconsts.BITS
            );

            ModuleUtil.updateHTMLwithDiff(
                app.cpu.b, app.old.b,
                UI_B_BINARY, UI_B_OCTAL, UI_B_HEX, UI_B_DEC, UI_B_SIGNED_DEC,
                ModuleCPUconsts.BITS
            );

            ModuleUtil.updateHTMLwithDiff(
                app.cpu.out, app.old.out,
                UI_OUT_BINARY, UI_OUT_OCTAL, UI_OUT_HEX, UI_OUT_DEC, UI_OUT_SIGNED_DEC,
                ModuleCPUconsts.BITS
            );
        }

        // redraw front panel LEDs
        sideEffect_redrawLEDs(app);

        // truncate display string in prep for display in UI
        if (display_string.length > UI_NUM_DISPLAY_MAX_CHARS) {
            display_string = display_string.substring(
                display_string.length - UI_NUM_DISPLAY_MAX_CHARS,
                display_string.length
            );
        }

        // update display screen if update is needed!
        if (UI_DISPLAY.innerText != display_string) {
            UI_DISPLAY.innerText = display_string;
            UI_DISPLAY.scrollTop = UI_DISPLAY.scrollHeight;
        }

        // if CPU is running, sync old UI values
        if (app.cpu.status.running) app.old = ModuleUI.syncedUIvalues(app.cpu);
    }

    // get back in web browser draw update queue
    requestAnimationFrame(() => sideEffect_appUpdate());
}

// clear LEDs
function sideEffect_clearLEDs() {
    // reset UI LED opacity to zero
    for (let elem of Array.from(document.getElementsByClassName(UI_TEXT_FP_LED_CLASS))) {
        elem.style.opacity = 0.0;
    }
}

// redraw all LEDs based on accumulated brightness, using a rolling average
function sideEffect_redrawLEDs(app) {
    let accum_len = app.LEDaccumulators.length;

    // redraw LEDs for registers
    for (let i = 0; i < ModuleCPUconsts.BITS; i++) {
        document.getElementById(UI_TEXT_FP_LED_PC_ID_PREFIX + i.toString(10)).style.opacity =
            app.LEDaccumulators.reduce((accum, cur) => accum + cur.registers[i].pc, 0) / accum_len;
        document.getElementById(UI_TEXT_FP_LED_IR_ID_PREFIX + i.toString(10)).style.opacity =
            app.LEDaccumulators.reduce((accum, cur) => accum + cur.registers[i].ir, 0) / accum_len;
        document.getElementById(UI_TEXT_FP_LED_MAR_ID_PREFIX + i.toString(10)).style.opacity =
            app.LEDaccumulators.reduce((accum, cur) => accum + cur.registers[i].mar, 0) / accum_len;
        document.getElementById(UI_TEXT_FP_LED_A_ID_PREFIX + i.toString(10)).style.opacity =
            app.LEDaccumulators.reduce((accum, cur) => accum + cur.registers[i].a, 0) / accum_len;
        document.getElementById(UI_TEXT_FP_LED_B_ID_PREFIX + i.toString(10)).style.opacity =
            app.LEDaccumulators.reduce((accum, cur) => accum + cur.registers[i].b, 0) / accum_len;
        document.getElementById(UI_TEXT_FP_LED_OUT_ID_PREFIX + i.toString(10)).style.opacity =
            app.LEDaccumulators.reduce((accum, cur) => accum + cur.registers[i].out, 0) / accum_len;
    }

    // redraw LEDs for machine cycles
    for (let key in ModuleCPUconsts.M_CYCLE_NAMES) {
        document.getElementById(UI_TEXT_FP_LED_M_ID_PREFIX + ModuleCPUconsts.M_CYCLE_NAMES[key]).style.opacity =
            app.LEDaccumulators.reduce(
                (accum, cur) => accum + cur.m_cycle[ModuleCPUconsts.M_CYCLE_NAMES[key]]
                , 0) / accum_len;
    }

    // redraw LEDs for CPU flags and status
    UI_FP_LED_FLAG_CARRY.style.opacity =
        app.LEDaccumulators.reduce((accum, cur) => accum + cur.flags.carry, 0) / accum_len;
    UI_FP_LED_FLAG_ZERO.style.opacity =
        app.LEDaccumulators.reduce((accum, cur) => accum + cur.flags.zero, 0) / accum_len;
    UI_FP_LED_STATUS_RUNNING.style.opacity =
        app.LEDaccumulators.reduce((accum, cur) => accum + cur.status.running, 0) / accum_len;
    UI_FP_LED_STATUS_HALTED.style.opacity =
        app.LEDaccumulators.reduce((accum, cur) => accum + cur.status.halted, 0) / accum_len;
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

    // reset output display
    UI_DISPLAY.style.backgroundColor = UI_TEXT_DISPLAY_BG_COLOR_OFF;
    UI_DISPLAY.innerText = "";
}

// set up the UI
function sideEffect_setup() {
    // **** BUILD CIRCUIT SPY MEMORY BLOCK UI STRUCTURE IN HTML
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


    // **** GENERATE HANDLES FOR FRONT PANEL INPUT SWITCHES
    for (let i = 0; i < ModuleCPUconsts.BITS; i++) {
        // build each input switch UI object
        app.ui_input_switches.push(
            document.getElementById(UI_TEXT_FP_CONTROL_INPUT_ID_PREFIX + i.toString(10))
        );

        // add mouseclick event handler
        app.ui_input_switches[i].addEventListener(
            "click",
            () => {
                // toggle this UI switch
                ModuleUI.sideEffect_toggleSwitch(app.ui_input_switches[i], 0, UI_NUM_FP_SLIDER_Y);

                // invert the value of this UI switch
                app.fp_input.input_switches[i] = !app.fp_input.input_switches[i];

                // tell CPU to rescan inputs
                app.cpu.scanInputs(app.fp_input);
            });

        // build up keyboard shortcut list
        app.keys = {
            ...app.keys,
            [UI_TEXT_FP_CONTROL_INPUT_KEYS[i]]: () => {
                ModuleUI.sideEffect_toggleSwitch(app.ui_input_switches[i], 0, UI_NUM_FP_SLIDER_Y);
                app.fp_input.input_switches[i] = !app.fp_input.input_switches[i];

                app.cpu.scanInputs(app.fp_input);
            }
        };
    }


    // **** INITIALIZE UI
    // format memory block UI with structure
    UI_MEM.innerHTML = memory_html;

    // establish mouse callbacks for controls
    UI_CONTROL_ON_OFF.addEventListener("click", () => {
        sideEffect_ctrlOnOff(app.fp_input, app.cpu);
        app.old = ModuleUI.syncedUIvalues(app.cpu);
    });
    UI_CONTROL_RUN_STOP.addEventListener("click", () => sideEffect_ctrlRunStop(app.fp_input, app.cpu));
    UI_CONTROL_SPEED.addEventListener("click", () => sideEffect_ctrlSpeed(app.fp_input, app.cpu))
    UI_CONTROL_CIRCUIT_SPY.addEventListener("click", () => sideEffect_ctrlCircuitSpy(app.fp_input, app.cpu))
    UI_CONTROL_RAM_IMPORT.addEventListener("click", () => {
        app.old = ModuleUI.syncedUIvalues(app.cpu);
        sideEffect_ctrlRAMimport(app.fp_input, app.cpu);
    });
    UI_CONTROL_RAM_EXPORT.addEventListener("click", () => sideEffect_ctrlRAMexport(app.fp_input, app.cpu));

    UI_CONTROL_RESET.addEventListener("mousedown", () => UI_CONTROL_RESET.style.opacity = 1.0);
    UI_CONTROL_M_STEP.addEventListener("mousedown", () => UI_CONTROL_M_STEP.style.opacity = 1.0);
    UI_CONTROL_I_STEP.addEventListener("mousedown", () => UI_CONTROL_I_STEP.style.opacity = 1.0);
    UI_CONTROL_EXAMINE.addEventListener("mousedown", () => UI_CONTROL_EXAMINE.style.opacity = 1.0);
    UI_CONTROL_EXAMINE_NEXT.addEventListener("mousedown", () => UI_CONTROL_EXAMINE_NEXT.style.opacity = 1.0);
    UI_CONTROL_DEPOSIT.addEventListener("mousedown", () => UI_CONTROL_DEPOSIT.style.opacity = 1.0);
    UI_CONTROL_DEPOSIT_NEXT.addEventListener("mousedown", () => UI_CONTROL_DEPOSIT_NEXT.style.opacity = 1.0);

    UI_CONTROL_RESET.addEventListener("mouseup",
        () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            UI_DISPLAY.innerText = "";
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_RESET, "reset");
        });
    UI_CONTROL_M_STEP.addEventListener("mouseup",
        () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_M_STEP, "m_step");
        });
    UI_CONTROL_I_STEP.addEventListener("mouseup",
        () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_I_STEP, "i_step");
        });
    UI_CONTROL_EXAMINE.addEventListener("mouseup",
        () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_EXAMINE, "examine");
        });
    UI_CONTROL_EXAMINE_NEXT.addEventListener("mouseup",
        () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_EXAMINE_NEXT, "examine_next");
        });
    UI_CONTROL_DEPOSIT.addEventListener("mouseup",
        () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_DEPOSIT, "deposit");
        });
    UI_CONTROL_DEPOSIT_NEXT.addEventListener("mouseup",
        () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_DEPOSIT_NEXT, "deposit_next");
        });

    // establish keypress callbacks for controls
    app.keys = {
        ...app.keys,

        [UI_KEY_CONTROL_CLEAR_INPUTS]: () => {
            app.ui_input_switches.forEach((s, i) => {
                s.style.transform = "none";
                s.style.translate = "";

                app.fp_input.input_switches[i] = false;

                app.cpu.scanInputs(app.fp_input);
            });
        },

        [UI_KEY_CONTROL_ON_OFF]: () => {
            sideEffect_ctrlOnOff(app.fp_input, app.cpu);
            app.old = ModuleUI.syncedUIvalues(app.cpu);
        },

        [UI_KEY_CONTROL_RUN_STOP]: () => sideEffect_ctrlRunStop(app.fp_input, app.cpu),

        [UI_KEY_CONTROL_RESET]: () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            UI_DISPLAY.innerText = "";
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_RESET, "reset");
        },

        [UI_KEY_CONTROL_M_STEP]: () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_M_STEP, "m_step");
        },

        [UI_KEY_CONTROL_I_STEP]: () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_I_STEP, "i_step");
        },

        [UI_KEY_CONTROL_EXAMINE]: () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_EXAMINE, "examine");
        },

        [UI_KEY_CONTROL_EXAMINE_NEXT]: () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_EXAMINE_NEXT, "examine_next");
        },

        [UI_KEY_CONTROL_DEPOSIT]: () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_DEPOSIT, "deposit");
        },

        [UI_KEY_CONTROL_DEPOSIT_NEXT]: () => {
            app.old = ModuleUI.syncedUIvalues(app.cpu);
            sideEffect_ctrlButtonUp(app.fp_input, app.cpu, UI_CONTROL_DEPOSIT_NEXT, "deposit_next");
        },

    };

    document.addEventListener("keyup", (event) => ModuleUI.handleKeys(event, app.keys));


    // **** RESET UI
    // reset visual UI
    sideEffect_resetUI();

    // zero out LED accumulators
    app.LEDaccumulators = Array(NUM_LED_AVERAGE).fill(ModuleUI.zeroedLEDaccumulators());

    // change the visibility property for circuit spy 
    // note that it is intentionally underneath the front panel on startup!
    UI_CIRCUIT_SPY_REGS_PANEL.style.visibility = "visible";
    UI_CIRCUIT_SPY_MEMORY_PANEL.style.visibility = "visible";

    // initialize "last time" to current time
    app.last_time = performance.now();


    // **** ESTABLISH APP UPDATE CALLBACK
    requestAnimationFrame(() => sideEffect_appUpdate());
}


// **** UI CONTROL CALLBACK FUNCTIONS
function sideEffect_ctrlOnOff(fp_signals, in_cpu) {
    ModuleUI.sideEffect_toggleSwitch(UI_CONTROL_ON_OFF, 0, UI_NUM_FP_SLIDER_Y);
    fp_signals.on = !fp_signals.on;
    in_cpu.scanInputs(fp_signals);

    // reset visual UI
    sideEffect_resetUI();

    // zero out LED accumulators
    app.LEDaccumulators = Array(NUM_LED_AVERAGE).fill(ModuleUI.zeroedLEDaccumulators());

    // turn on display if CPU is now on
    if (fp_signals.on) {
        UI_DISPLAY.style.backgroundColor = UI_TEXT_DISPLAY_BG_COLOR_ON;
    }
}

function sideEffect_ctrlRunStop(fp_signals, in_cpu) {
    ModuleUI.sideEffect_toggleSwitch(UI_CONTROL_RUN_STOP, 0, UI_NUM_FP_SLIDER_Y);
    fp_signals.run = !fp_signals.run;
    in_cpu.scanInputs(fp_signals);
}

function sideEffect_ctrlSpeed(fp_signals) {
    ModuleUI.sideEffect_toggleSwitch(UI_CONTROL_SPEED, UI_NUM_FP_SLIDER_X, 0);
    fp_signals.slow = !fp_signals.slow;

    // this is a special control not attached to the CPU, so we do not tell CPU to scan inputs!
}

function sideEffect_ctrlCircuitSpy(fp_signals) {
    ModuleUI.sideEffect_toggleSwitch(UI_CONTROL_CIRCUIT_SPY, UI_NUM_FP_SLIDER_X, 0);

    fp_signals.circuit_spy = !fp_signals.circuit_spy;

    if (fp_signals.circuit_spy) {
        UI_CIRCUIT_SPY_MEMORY_PANEL.style.left = UI_TEXT_CIRCUIT_SPY_OPEN_LEFT;
        UI_CIRCUIT_SPY_REGS_PANEL.style.top = UI_TEXT_CIRCUIT_SPY_OPEN_TOP;
    } else {
        UI_CIRCUIT_SPY_MEMORY_PANEL.style.left = UI_TEXT_CIRCUIT_SPY_CLOSED_LEFT;
        UI_CIRCUIT_SPY_REGS_PANEL.style.top = UI_TEXT_CIRCUIT_SPY_CLOSED_TOP;
    }

    // this is a special control not attached to the CPU, so we do not tell CPU to scan inputs!
}

// handle front panel button releases
function sideEffect_ctrlButtonUp(fp_signals, in_cpu, ui_button, input_key) {
    // clear UI "depressed button" element
    ui_button.style.opacity = 0.0;

    // set line indicated by input_key to high and scan
    fp_signals[input_key] = true;
    in_cpu.scanInputs(fp_signals);

    // set line indicated by input_key back to low and scan
    fp_signals[input_key] = false;
    in_cpu.scanInputs(fp_signals);
}

// handle click of "IMPORT RAM"
function sideEffect_ctrlRAMimport(_, in_cpu) {
    in_cpu.replaceRAM(UI_RAM_IMPORT_EXPORT.value);
}

// handle click of "EXPORT RAM"
function sideEffect_ctrlRAMexport(_, in_cpu) {
    UI_RAM_IMPORT_EXPORT.value = in_cpu.exportRAM();
}