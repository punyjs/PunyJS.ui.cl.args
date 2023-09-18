/**
* @test
*   @title PunyJS.ui.cli.args._CmdArgs
*/
function cmdArgsTest1(
    controller
    , mock_callback
) {
    var cmdArgsHelper, result1, result2, result3;

    arrange(
        async function arrangeFn() {
            cmdArgsHelper = await controller(
                [
                    ":PunyJS.ui.cl.args._CmdArgs"
                    , []
                ]
            );

        }
    );

    act(
        function actFn() {
            result1 = cmdArgsHelper(
                [
                    "executable"
                    , "script"
                    , "-t"
                    , "01"
                    , "--config"
                    , "port:3000 ,secure, url:https\\://localhost\\:3000"
                ]
            );
            result2 = cmdArgsHelper(
                [
                    "executable"
                    , "script"
                    , "command"
                    , "-tlRv"
                    , "--name"
                    , "rodger:44"
                ]
            );
            result3 = cmdArgsHelper(
                [
                    "executable"
                    , "script"
                    , "command1"
                    , "-r"
                    , "12"
                    , "--config"
                    , "port:300,secure"
                    , "-q"
                    , "-l"
                ]
            );
        }
    );

    assert(
        function assertFn(test) {
            test("result1 should be")
            .value(result1)
            .stringify()
            .equals(`{"_executable":"executable","_script":"script","command":null,"commands":[],"tokens":["-t","01","--config","port:3000 ,secure, url:https\\\\://localhost\\\\:3000"],"flags":[],"options":{"t":"01","config":{"port":"3000","secure":true,"url":"https://localhost:3000"}}}`)
            ;

            test("result2 should be")
            .value(result2)
            .stringify()
            .equals(`{"_executable":"executable","_script":"script","command":"command","commands":["command"],"tokens":["command","-tlRv","--name","rodger:44"],"flags":["t","l","R","v"],"options":{"name":{"rodger":"44"}}}`)
            ;

            test("result3 should be")
            .value(result3)
            .stringify()
            .equals(`{"_executable":"executable","_script":"script","command":"command1","commands":["command1"],"tokens":["command1","-r","12","--config","port:300,secure","-q","-l"],"flags":["q","l"],"options":{"r":"12","config":{"port":"300","secure":true},"q":true,"l":true}}`)
            ;
        }
    );
}