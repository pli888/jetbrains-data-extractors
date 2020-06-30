/*
 * Available context bindings:
 *   COLUMNS     List<DataColumn>
 *   ROWS        Iterable<DataRow>
 *   OUT         { append() }
 *   FORMATTER   { format(row, col); formatValue(Object, col) }
 *   TRANSPOSED  Boolean
 * plus ALL_COLUMNS, TABLE, DIALECT
 *
 * where:
 *   DataRow     { rowNumber(); first(); last(); data(): List<Object>; value(column): Object }
 *   DataColumn  { columnNumber(), name() }
 */

/*
 * Based on HTML-JavaScript.html.js data extractor
 */

'use strict';

var NEWLINE = "\n";
var INDENT = "    ";

function eachWithIdx(iterable, f) {
    var i = iterable.iterator();
    var idx = 0;
    while (i.hasNext()) f(i.next(), idx++);
}

function output() {
    for (var i = 0; i < arguments.length; i++) {
        OUT.append(arguments[i]);
    }
}

output("<?php", NEWLINE)
output(NEWLINE)
output("class m200529_084657_insert_data_", "dataset", "_tab extends CDbMigration", NEWLINE)
output("{", NEWLINE)
output(INDENT, "public function safeUp()", NEWLINE, "    {", NEWLINE)
output(INDENT, INDENT, "$this->insert('dataset', array(")

var colNames = [];
var ids = [];

eachWithIdx(ROWS, function (row, i) {  // work through each row
    if(row.first()) {  // Output column names into colNames array
        eachWithIdx(COLUMNS, function (col, j) {
            var value = FORMATTER.format(row, col);
            colNames.push(JSON.stringify(value));
        });
    }
    else {
        eachWithIdx(COLUMNS, function (col, j) {  // then work through cols
            var value = FORMATTER.format(row, col);
            switch (true) {
                case value.toUpperCase() == 'NULL':
                    value = null;
                    break;
                case parseInt(value).toString() == value:
                    value = parseInt(value);
                    value = value.toString();
                    break;
                case parseFloat(value).toString() == value:
                    value = parseFloat(value);
                    value = value.toString();
                    break;
            }

            // Store ids in array
            if(colNames[j] == "\"id\"") {
                ids.push(value);
            }

            output(j ? ',' : '', NEWLINE, INDENT, INDENT, INDENT, colNames[j], ' => ', JSON.stringify(value));
        });
        output(NEWLINE, INDENT, INDENT, "));");
        output(NEWLINE, INDENT, '}');
    }
});

output(NEWLINE);
output(NEWLINE, INDENT, "public function safeDown()");
output(NEWLINE, INDENT, "{");
output(NEWLINE, INDENT, INDENT, "$this->delete(")

// Create delete statements for removing rows
var x;
for (x in ids) {
    output(NEWLINE, INDENT, INDENT, INDENT, "'dataset', \"id = '", ids[x], "'\"");
}

output(NEWLINE, INDENT, INDENT, ");");
output(NEWLINE, INDENT, "}");
output(NEWLINE, '}');
