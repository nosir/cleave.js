DOM.select('.btn-demos').addEventListener('click', function () {
    Animate.scrollTo(document, DOM.offset(DOM.select('.demos')).top, 500);
});

DOM.select('.btn-try-in').addEventListener('click', function () {
    Animate.scrollTo(document, DOM.offset(DOM.select('.section-playground')).top, 500);
});

var selectedCardIcon = null;
// credit card
var cleaveCreditCard = new Cleave('.input-credit-card', {
    creditCard:              true,
    onCreditCardTypeChanged: function (type) {
        if (selectedCardIcon) {
            DOM.removeClass(selectedCardIcon, 'active');
        }

        selectedCardIcon = DOM.select('.icon-' + type);

        if (selectedCardIcon) {
            DOM.addClass(selectedCardIcon, 'active');
        }
    }
});

var btnClear = DOM.select('.btn-clear');
var creditCardInput = DOM.select('.input-credit-card');
creditCardInput.addEventListener('focus', function () {
    DOM.removeClass(btnClear, 'hidden-right');
});
btnClear.addEventListener('click', function () {
    cleaveCreditCard.setRawValue('');
    DOM.addClass(btnClear, 'hidden-right');
    creditCardInput.focus();
});

// phone
var countries = ['', 'AC', 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GT', 'GU', 'GW', 'GY', 'HK', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TA', 'TC', 'TD', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'];
var selectCountryWrapper = DOM.select('.region-selector .select-box-wrapper');
var selectCountryCoverTitle = DOM.select('.region-selector .select-cover .title');
var codePhone = DOM.select('.code-phone');
var inputPhone = DOM.select('.input-phone');

for (var i = 0, html = '<select class="select-box">', iMax = countries.length; i < iMax; i++) {
    var now = countries[i];

    html += '<option value="' + now + '">' + now + '</option>';
}

html += '</select>';

selectCountryWrapper.innerHTML = html;

var selectCountry = DOM.select('.region-selector .select-box-wrapper .select-box');

var cleavePhone = new Cleave('.input-phone', {
    phone:           true,
    phoneRegionCode: 'US'
});

selectCountry.addEventListener('change', function () {
    cleavePhone.setPhoneRegionCode(this.value);
    cleavePhone.setRawValue('');
    DOM.html(selectCountryCoverTitle, 'Region code: ' + this.value);
    DOM.html(codePhone, DOM.html(codePhone).replace(/(\{country\})|(<span class="code-country">\D\D<\/span>)/g, '<span class="code-country">' + this.value + '</span>'));
    inputPhone.focus();
});

// date
var cleaveDateA = new Cleave('.input-date-a', {
    date:        true,
    datePattern: ['Y', 'm', 'd']
});

var cleaveDateB = new Cleave('.input-date-b', {
    date:        true,
    datePattern: ['m', 'y']
});

// numeral
var selectNumeral = DOM.select('.numeral-selector .select-box');
var selectNumeralCoverTitle = DOM.select('.numeral-selector .select-cover .title');
var codeNumeral = DOM.select('.code-numeral');
var inputNumeral = DOM.select('.input-numeral');

var cleaveNumeral = new Cleave(inputNumeral, {
    numeral: true
});

selectNumeral.addEventListener('change', function () {
    cleaveNumeral = new Cleave(inputNumeral, {
        numeral:                    true,
        numeralThousandsGroupStyle: this.value
    });

    DOM.html(selectNumeralCoverTitle, 'Style: ' + this.value);
    DOM.html(codeNumeral, DOM.html(codeNumeral).replace(/(<span class="code-grouping-style">(wan|thousand|lakh)<\/span>)|(thousand)/g, '<span class="code-grouping-style">' + this.value + '</span>'));
    inputNumeral.focus();
});


// delimiter
var cleaveDelimeter = new Cleave('.input-delimiter', {
    delimiter: '·',
    uppercase: true,
    blocks:    [3, 3, 3, 3]
});

// blocks
var cleaveBlocks = new Cleave('.input-blocks', {
    blocks:    [2, 3, 3, 3],
    uppercase: true
});

// prefix
var cleavePrefix = new Cleave('.input-prefix', {
    prefix:    'PREFIX',
    blocks:    [6, 4, 4, 4],
    delimiter: '-',
    uppercase: true
});
