/**
* Processes the command line arguments and creates an instance of
* {iCommandLineArguments}
* 1. Anything prefixed with a singe hyphen will be treated as a single character
* option/flag. If there are multiple characters then each will be an option.
* e.g. "-tpf" will be parsed as flags: [ "t", "p", "f"]
* 2. Anything prefixed with double hyphens will be treated as a named option
* with the possibility of a following option value. e.g. "--path ./mypath" will
* be parsed as "path": "./mypath"
* 3. Anything else will be treated as an option value for the preceeding named
* option unless there isn't a value for the variable last, in which case it's
* dropped.
* Named option values can be a single value, a list of values (comma seperated)
* or one or more name:value pairs (comma seperated), or a combination of the two
* e.g. name1:value1,name2,name3:value3. Do not include any spaces as that would
* cause the node process.argv to treat them as seperate command line entries. If
* spaces are required, wrap the entire option value set in double qoutes, e.g.
* "name1:value with space,name2". Since commas and colons are reserved, literal
* values must be escaped using a double backslash, e.g. name1:value\\,1
* An "ordinal" property will be added to annotate the order in which the named
* value arguments appeared in the command line
*
* @factory
* @interface iCommandLineArguments
*   @property {string} _executable
*   @property {string} _script
*   @property {string} command
*   @property {array} commands
*   @property {array} tokens
*   @property {object} options
*/
function _CmdArgs(

) {
    /**
    * A regular expression pattern
    * @field
    */
    var NAME_VALUE_PATT = /((?:[\\][,]|[\\][:]|[^,:])+)(?:[:]((?:[\\][,]|[\\][:]|[^,:])+))?/g
    /**
    * A regular expression pattern
    * @field
    */
    , ESCP_RES_PATT = /\\([,:])/g
    /**
    * A regular expression pattern
    * @field
    */
    , ESCP_COLON_PATT = /\\:/g
    /**
    * A regular expression pattern
    * @field
    */
    , ESCP_COMMA_PATT = /\\,/g
    /**
    * A regular expression pattern
    * @field
    */
    , PATH_PATT = /^(?:[A-z]:)?(?:[\/\\][^\/\\]+)+(?:[\/\\])?$/
    /**
    * A regular expression pattern to determine if a token is a flag list
    * @field
    */
    , FLAG_LIST_PATT = /^[-][A-z]{2,}$/
    /**
    * @field
    */
    , literalMap = {
        "true": true
        , "false": false
        , "undefined": undefined
        , "null": null
    }
    , last
    ;

    return CmdArgs;

    /**
    * @worker
    */
    function CmdArgs(args) {
        var cmdArgs = {
            "_executable": args.shift()
            , "_script": args.shift()
            , "tokens": args
            , "command": null
            , "commands": []
            , "flags": []
            , "options": {}
        };
        //process the argument array
        processArgs(
            args
            , cmdArgs
        );
        //
        return createInterface(
            cmdArgs
        );
    }

    /**
    * @function
    */
    function processArgs(args, cmdArgs) {
        //loop through the args
        for(let i = 0, l = args.length, val, name; i < l; i++) {
            val = args[i].trim();
            //if this is a group of flags
            if (val.match(FLAG_LIST_PATT)) {
                val
                .substring(1)
                .split("")
                .forEach(
                    function forEachFlag(flag) {
                        cmdArgs.flags.push(flag);
                    }
                );
            }
            //see if this is an argument name
            else if (val.indexOf("-") === 0) {
                name = val.indexOf("--") === 0
                    ? val.substring(2)
                    : val.substring(1)
                ;
                //is there a next value
                if (i + 1 < l) {
                    //if next token does not begin with a hyphen its a value
                    if (args[i + 1].indexOf("-") !== 0) {
                        val = args[++i].trim();
                    }
                    //otherwise if this is a single hyphen this is a flag
                    else if (val.indexOf("--") !== 0) {
                        cmdArgs.flags.push(name);
                        val = true;
                    }
                    else {
                        val = true;
                    }
                }
                else {
                    if (val.indexOf("--") !== 0) {
                        cmdArgs.flags.push(name);
                    }
                    val = true;
                }
                //set the option
                cmdArgs.options[name] = parseNameValue(
                    val
                );
            }
            //if we made it here then there is a value without a hyphened name
            else {
                if (!cmdArgs.command) {
                    cmdArgs.command = val;
                }
                cmdArgs.commands.push(val);
            }
        }
    }
    /**
    * Parses the named option value, using the name:value notation with comma
    * seperation for multiple values
    * @function
    *   @private
        * @param {string} value The option name value to be parsed
    */
    function parseNameValue(value) {
        if (typeof value !== 'string') {
            return value;
        }
        //see if this is just a value (no unescaped colons or commas)
        if (
            value.replace(ESCP_COLON_PATT, "").indexOf(":") === -1
            && value.replace(ESCP_COMMA_PATT, "").indexOf(",") === -1
        ) {
            value = value.replace(ESCP_RES_PATT, "$1");
            if (Object.keys(literalMap).indexOf(value) !== -1) {
                value = literalMap[value];
            }
            return value;
        }
        //see if this is a path (in-case the command line makes / = c:/)
        if (PATH_PATT.test(value)) {
            return value;
        }

        var optionValues = {};
        //use regex to extract the name:value pairs
        [...value.matchAll(NAME_VALUE_PATT)]
        .forEach(
            function forEachMatch(match) {
                var name = match[1].trim()
                , val = !!match[2]
                    && match[2].replace(ESCP_RES_PATT, "$1").trim()
                    || true;
                optionValues[name] = val;
            }
        );

        return optionValues;
    }
    /**
    * @function
    */
    function createInterface(cmdArgs) {
        return Object.create(
            null
            , {
                "_executable": {
                    "enumerable": true
                    , "value":  cmdArgs._executable
                }
                , "_script": {
                    "enumerable": true
                    , "value":  cmdArgs._script
                }
                , "command": {
                    "enumerable": true
                    , "value": cmdArgs.command
                }
                , "commands": {
                    "enumerable": true
                    , "value": cmdArgs.commands
                }
                , "tokens": {
                    "enumerable": true
                    , "value": cmdArgs.tokens
                }
                , "flags": {
                    "enumerable": true
                    , "value": cmdArgs.flags
                }
                , "options": {
                    "enumerable": true
                    , "value": cmdArgs.options
                }
            }
        );
    }
}