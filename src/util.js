"use strict";

// **** UTILITY FUNCTIONS
// create HTML with style differences between a primary string and a secondary string
export function showDiff(string_primary, string_secondary) {
    // define empty output string
    let string_out = "";

    // get the length of the longest string
    let longest = Math.max(string_primary.length, string_secondary.length);

    // iterate through the strings character by character
    for (let i = 0; i < longest; i++) {
        if ((string_primary[i] != string_secondary[i]) || (i >= string_secondary.length)) {
            // if characters differ or we've passed end of secondary, then show as diff
            string_out += "<span class='show_diff'>"
                + string_primary[i]
                + "</span>";
        } else {
            // else, don't show as diff
            string_out += string_primary[i];
        }
    }

    return string_out;
}

// update specific HTML binary, octal, and hex elements with styled differences
export function updateHTMLwithDiff(new_val, old_val, binary, octal, hex) {
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
}

// return a decimal number assuming two's complement representation of a given number with a given bit length
export function twosComplement(number, bits) {
    if (number >= Math.pow(2, bits - 1)) {
        return (number - Math.pow(2, bits));
    } else {
        return number;
    }
}
