"use strict";

// **** UTILITY FUNCTIONS
// color differences between a primary string and a secondary string
export function showDiff(string_primary, string_secondary, color) {
    // define empty output string
    let string_out = "";

    // get the length of the longest string
    let longest = Math.max(string_primary.length, string_secondary.length);

    // iterate through the strings character by character
    for (let i = 0; i < longest; i++) {
        if ((string_primary[i] != string_secondary[i]) || (i >= string_secondary.length)) {
            // if characters differ or we've passed end of secondary, then show as diff
            string_out += "<span style='color: " + color + "'>"
                + string_primary[i]
                + "</span>";
        } else {
            // else, don't show as diff
            string_out += string_primary[i];
        }
    }

    return string_out;
}

// return a decimal number assuming two's complement representation of...
//  a given number with a given bit length
export function twosComplement(number, bits) {
    if (number >= Math.pow(2, bits - 1)) {
        return (number - Math.pow(2, bits));
    } else {
        return number;
    }
}
