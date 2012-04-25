<?php

	/**
	 * \Midi\Parsing\DeltaParser
	 *
	 * @package   Midi
	 * @copyright © 2009 Tommy Montgomery <http://phpmidiparser.com/>
	 * @since     1.0
	 */

	namespace Midi\Parsing;

	use \Midi\Delta;

	/**
	 * Class for parsing delta times
	 *
	 * @package Midi
	 * @since   1.0
	 */
	class DeltaParser extends Parser {

		/**
		 * Creates a Delta object
		 *
		 * @since 1.0
		 *
		 * @param  int $ticks The number of MIDI clock ticks
		 * @return Delta
		 */
		public function getDeltaChunk($ticks, $pos) {
			return new Delta($ticks, $pos);
		}

		/**
		 * @since 1.0
		 * @uses  getDeltaChunk()
		 * @uses  getDelta()
		 *
		 * @return Chunk
		 */
		public function parse() {
			$pos = $this->file->ftell();
			return $this->getDeltaChunk($this->getDelta(), $pos);
		}

	}

?>
