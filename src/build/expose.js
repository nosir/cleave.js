Cleave.DateFormatter = DateFormatter;
Cleave.PhoneFormatter = PhoneFormatter;
Cleave.CreditCardDetector = CreditCardDetector;

if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS
    module.exports = exports = Cleave;

} else if (typeof define === 'function' && define.amd) {
    // AMD support
    define(function () {
        return Cleave;
    });

} else if (typeof window === 'object') {
    // Normal way
    window.Cleave = Cleave;
}
