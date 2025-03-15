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
export function updateHTMLwithDiff(new_val, old_val, binary, octal, hex, dec = null, twoscomp = null, bits = 0) {
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
        dec.innerHTML = showDiff(
            new_val.toString(10),
            old_val.toString(10)
        );
    }

    if (twoscomp) {
        twoscomp.innerHTML = showDiff(
            twosComplement(new_val, bits).toString(10),
            twosComplement(old_val, bits).toString(10)
        );
    }
}

// return a decimal number assuming two's complement representation of a given number with a given bit length
export function twosComplement(number, bits) {
    if (number >= Math.pow(2, bits - 1)) {
        return (number - Math.pow(2, bits));
    } else {
        return number;
    }
}
