"use strict";

// **** UTILITY FUNCTIONS
// create HTML with style differences between a primary string and a secondary string
export function showDiff(string_primary, string_secondary) {
    // define empty output string
    let string_out = "";

    // iterate through the strings character by character
    for (let i = 0; i < string_primary.length; i++) {
        if (i >= string_secondary.length) {
            // passed length of secondary? show everything as diff
            string_out += "<span class='show_diff'>"
                + string_primary[i]
                + "</span>";
        } else {
            // not passed length of secondary? check for differences

            if (string_primary[i] != string_secondary[i]) {
                // if characters differ, show as diff
                string_out += "<span class='show_diff'>"
                    + string_primary[i]
                    + "</span>";
            } else {
                // else, don't show as diff
                string_out += string_primary[i];
            }
        }
    }

    return string_out;
}

// update specific HTML binary, octal, and hex elements with styled differences
export function updateHTMLwithDiff(new_val, old_val, binary, octal, hex, dec = null, signed_dec = null, bits = 12) {
    binary.innerHTML = showDiff(
        new_val.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& '),
        old_val.toString(2).padStart(12, "0").replace(/\d{3}(?=.)/g, '$& ')
    );

    octal.innerHTML = showDiff(
        new_val.toString(8).padStart(4, "0"),
        old_val.toString(8).padStart(4, "0")
    );

    hex.innerHTML = showDiff(
        new_val.toString(16).padStart(3, "0").toUpperCase(),
        old_val.toString(16).padStart(3, "0").toUpperCase()
    );

    if (dec) {
        dec.innerHTML = padSpace(
            showDiff(new_val.toString(10), old_val.toString(10)),
            4
        );
    }

    if (signed_dec) {
        signed_dec.innerHTML = padSpace(
            showDiff(asSigned(new_val, bits).toString(10), asSigned(old_val, bits).toString(10)),
            5
        );
    }
}

// front-pad a string with the HTML space character "&nbsp;"
export function padSpace(string, length) {
    let out_string = string;

    for (let i = 0; i < (length - string.length); i++) {
        out_string = "&nbsp;" + out_string;
    }

    return out_string;
}

// return a signed representation (using two's complement) of a given number with a given bit length
// this function assumes the given number fits within the given bit length!
export function asSigned(number, bits) {
    let val = number;

    if (val >= Math.pow(2, bits - 1)) {
        val -= Math.pow(2, bits);
    }

    return val;
}

// return an unsigned representation (using two's complement) of a given number with a given bit length
// this function assumes the given number fits within the given bit length!
export function asUnsigned(number, bits) {
    let val = number;

    if (val < 0) {
        val += Math.pow(2, bits);
    }

    return val;
}

// convert a list of true/false values to a number
export function boolListToNumber(bool_list) {
    let out = 0;

    // increment upward through the list, applying increasing powers of 2
    bool_list.forEach((element, index) => {
        out += Math.pow(2, index) * element;
    });

    return out;
}