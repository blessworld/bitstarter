#!/usr/bin/env node 
var fs = require('fs');
    program = require('commander'),
    cheerio = require('cheerio'),
    rest = require('restler'),
    HTMLFILE_DEFAULT = "index.html",
    CHECKSFILE_DEFAULT = "checks.json",
    URL_DEFAULT = "http://quiet-shore-5755.herokuapp.com/"

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if(!fs.existsSync(instr)) {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
  }
  return instr;
};

function getUrlContent(urlstr){
  rest.get(URL_DEFAULT).on('complete', function(result) {
    if (result instanceof Error) {
      console.log('Error: ' + result.message);
      this.retry(5000); // try again after 5 sec
    } else {
      return result;
    }
  });
}

function valid(htmlstr){
  var RegUrl = new RegExp(); 
  RegUrl.compile("^[A-Za-z]+://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$");
  if (!RegUrl.test(htmlstr)) { 
    return false; 
  } 
  return true; 
}

var cheerioHtmlFile = function(htmlfile) {
  if(valid(htmlfile)==='url'){
    return cheerio.load(getUrlContent(htmlfile))
  }else {
    return cheerio.load(fs.readFileSync(htmlfile));
  }
};

var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};


var checkHtmlFile = function(htmlfile, checksfile) {
  $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};


var clone = function(fn) {
  // Workaround for commander.js issue.
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
};
if(require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url_file>', 'Path to url')
    .parse(process.argv);
  var checkJson = checkHtmlFile(program.file, program.checks);
  var outJson = JSON.stringify(checkJson, null, 4);
  console.log(outJson);
} else {
  exports.checkHtmlFile = checkHtmlFile;
}
