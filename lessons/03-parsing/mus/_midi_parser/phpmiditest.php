<?php

require_once 'src/Midi/bootstrap.php';

use \Midi\Parsing\FileParser;
use \Midi\Reporting\TextFormatter;
use \Midi\Reporting\Printer;

$filename = dirname(__DIR__).'/mus.midi';
if (isset($argv[1])) {
	$filename = $argv[1];
}

$parser = new FileParser();
$parser->load($filename);

$printer = new Printer(new TextFormatter(), $parser);
$printer->printAll();
